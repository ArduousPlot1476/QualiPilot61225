import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Bot, Send, Square, Info } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { MessageInput } from '../chat/MessageInput';
import { QuickReplies } from '../chat/QuickReplies';
import { StreamingMessage } from '../chat/StreamingMessage';
import { useAIChat } from '../../hooks/useAIChat';
import { ChatService } from '../../lib/ai/chatService';
import { useToast } from '../ui/Toast';
import { MessageListSkeleton } from '../ui/LoadingStates';
import { ContextualHelp } from '../ui/ContextualHelp';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { TransitionWrapper } from '../ui/TransitionWrapper';

// Lazy load the MessageList component
const MessageList = lazy(() => 
  import('../chat/MessageList').then(module => ({ default: module.MessageList }))
);

export const ChatArea: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    conversationThreads, 
    selectedThreadId,
    setSelectedThread,
    toggleContextDrawer 
  } = useAppStore();

  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [showHelpTip, setShowHelpTip] = useState(false);
  const { showToast } = useToast();

  const selectedThread = conversationThreads.find(t => t.id === selectedThreadId);

  // AI Chat integration
  const { 
    isStreaming, 
    streamingContent, 
    sendMessage, 
    stopStreaming, 
    error: aiError,
    clearError: clearAIError 
  } = useAIChat({
    onMessageComplete: (response) => {
      // Add the complete AI response to the message store
      addChatMessage({
        content: response.fullContent || response.content || '',
        sender: 'assistant',
        type: 'text',
        citations: response.citations
      });
    }
  });

  // Show help tip for new users
  useEffect(() => {
    if (chatMessages.length === 0) {
      const timer = setTimeout(() => {
        setShowHelpTip(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [chatMessages.length]);

  // Create a new thread if needed and return the thread ID
  const ensureThread = async (): Promise<string> => {
    if (!selectedThreadId || selectedThreadId === '1') {
      setIsCreatingThread(true);
      try {
        // Create a default thread title
        const defaultTitle = "New Conversation";
        
        // Create the thread in Supabase
        const newThread = await ChatService.createThread(defaultTitle);
        
        // Update the global state with the new thread ID
        setSelectedThread(newThread.id);
        
        showToast({
          type: 'success',
          title: 'New Conversation',
          message: 'Created new conversation thread',
          duration: 2000
        });
        
        return newThread.id;
      } catch (error) {
        console.error('Failed to create thread:', error);
        showToast({
          type: 'error',
          title: 'Thread Creation Failed',
          message: 'Could not create new conversation. Please try again.',
          duration: 5000
        });
        throw error;
      } finally {
        setIsCreatingThread(false);
      }
    }
    return selectedThreadId;
  };

  const handleSendMessage = async (message: string) => {
    if (isStreaming) {
      return;
    }

    try {
      // Ensure we have a valid thread and get the thread ID
      const threadId = await ensureThread();

      // Add user message to UI immediately with animation
      addChatMessage({
        content: message,
        sender: 'user',
        type: 'text'
      });

      // Hide help tip after first message
      setShowHelpTip(false);

      // Send to AI service with the confirmed thread ID
      await sendMessage(message, threadId);
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast({
        type: 'error',
        title: 'Message Failed',
        message: 'Could not send message. Please try again.',
        duration: 5000
      });
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  // Clear AI errors when they occur
  useEffect(() => {
    if (aiError) {
      const timer = setTimeout(clearAIError, 5000);
      return () => clearTimeout(timer);
    }
  }, [aiError, clearAIError]);

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 relative">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-600 dark:bg-teal-700 rounded-full p-2 hover-scale transition-transform-150">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedThread?.title || 'QualiPilot Assistant'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Medical Device Regulatory Expert • AI-Powered Compliance Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Streaming status */}
              <TransitionWrapper
                show={isStreaming}
                enter="transition-all duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition-all duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Responding</span>
                </div>
              </TransitionWrapper>
              
              <ContextualHelp
                title="Context Panel"
                content={
                  <div className="text-white">
                    <p className="mb-2">The context panel shows:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Regulatory sources used by the AI</li>
                      <li>Generated documents</li>
                      <li>Important regulatory alerts</li>
                    </ul>
                  </div>
                }
                position="bottom"
              >
                <button
                  onClick={toggleContextDrawer}
                  className="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800/30 transition-colors duration-200 focus-ring hover-scale"
                >
                  View Context
                </button>
              </ContextualHelp>
            </div>
          </div>
        </div>

        {/* Messages - FIXED: Changed overflow-hidden to overflow-auto */}
        <div className="flex-1 overflow-auto relative">
          <ErrorBoundary
            fallback={
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">There was an error loading messages.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg"
                >
                  Reload
                </button>
              </div>
            }
          >
            <Suspense fallback={<MessageListSkeleton />}>
              <MessageList 
                messages={chatMessages} 
                loading={isCreatingThread} 
              />
            </Suspense>
          </ErrorBoundary>
          
          {/* Streaming message */}
          <TransitionWrapper
            show={isStreaming && !!streamingContent}
            enter="transition-all duration-300"
            enterFrom="opacity-0 transform translate-y-4"
            enterTo="opacity-100 transform translate-y-0"
            leave="transition-all duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="px-6 pb-6">
              <StreamingMessage
                content={streamingContent}
                isStreaming={isStreaming}
                onStop={stopStreaming}
              />
            </div>
          </TransitionWrapper>
          
          {/* Help tip for new users */}
          <TransitionWrapper
            show={showHelpTip && chatMessages.length === 0 && !isStreaming}
            enter="transition-all duration-500"
            enterFrom="opacity-0 transform translate-y-4"
            enterTo="opacity-100 transform translate-y-0"
            leave="transition-all duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4 shadow-lg max-w-md">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-1">Ask me anything about FDA regulations</h4>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    I can help with device classification, 510(k) requirements, QMS documentation, and more.
                  </p>
                  <button 
                    onClick={() => setShowHelpTip(false)}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </TransitionWrapper>
        </div>

        {/* Quick Replies */}
        <TransitionWrapper
          show={chatMessages.length === 0 && !isStreaming}
          enter="transition-all duration-300"
          enterFrom="opacity-0 transform translate-y-4"
          enterTo="opacity-100 transform translate-y-0"
          leave="transition-all duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <QuickReplies 
            onQuickReply={handleQuickReply} 
          />
        </TransitionWrapper>

        {/* Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isStreaming || isCreatingThread}
          placeholder={
            isStreaming 
              ? "AI is responding..." 
              : isCreatingThread 
              ? "Setting up conversation..."
              : "Ask about FDA regulations, generate QMS documents, or get compliance guidance..."
          }
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />

        {/* Error display */}
        <TransitionWrapper
          show={!!aiError}
          enter="transition-all duration-300"
          enterFrom="opacity-0 transform translate-y-4"
          enterTo="opacity-100 transform translate-y-0"
          leave="transition-all duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700 dark:text-red-300">{aiError}</p>
              <button
                onClick={clearAIError}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium focus-ring rounded-lg px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </ErrorBoundary>
  );
};