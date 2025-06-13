import React, { useCallback, useRef, useState } from 'react';
import { ExternalLink, FileText, Bot, User, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../../types';
import { MessageStatus, MessageListSkeleton } from '../ui/LoadingStates';
import { useOptimisticUpdates } from '../../hooks/useOptimisticUpdates';
import { CitationRenderer } from './CitationRenderer';
import { ResponseMetadata } from './ConfidenceIndicator';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';
import { EmptyState } from '../ui/EmptyState';
import { TransitionWrapper } from '../ui/TransitionWrapper';

interface VirtualMessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
  itemHeight?: number;
  onLoadMore?: () => void;
}

export const VirtualMessageList: React.FC<VirtualMessageListProps> = ({ 
  messages, 
  loading = false,
  itemHeight = 150,
  onLoadMore
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: optimisticMessages, isOptimistic, isPending } = useOptimisticUpdates(messages, 'messages');
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Calculate the initial scroll index to show the latest messages
  const initialScrollIndex = messages.length > 0 ? Math.max(0, messages.length - 1) : 0;

  const {
    virtualItems,
    totalHeight,
    scrollToIndex,
    isScrolling
  } = useVirtualScroll({
    itemCount: optimisticMessages.length,
    itemHeight,
    overscan: 10,
    loadMoreThreshold: 5,
    onLoadMore,
    initialScrollIndex
  });

  // Auto-scroll to bottom on new messages
  const prevMessagesLengthRef = useRef(messages.length);
  React.useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current && !hasScrolled) {
      scrollToIndex(messages.length - 1, 'smooth');
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToIndex, hasScrolled]);

  // After initial render, mark initial load as complete
  React.useEffect(() => {
    if (initialLoad && messages.length > 0) {
      setInitialLoad(false);
    }
  }, [messages.length, initialLoad]);

  // Track user scrolling
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // If user scrolls up, mark as scrolled
      if (container.scrollTop < container.scrollHeight - container.clientHeight - 100) {
        setHasScrolled(true);
      }
      
      // If user scrolls to bottom, reset scrolled state
      if (container.scrollTop >= container.scrollHeight - container.clientHeight - 10) {
        setHasScrolled(false);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  const getMessageStatus = useCallback((message: ChatMessage) => {
    if (isOptimistic(message.id)) {
      return 'sending';
    }
    if (isPending(message.id)) {
      return 'syncing';
    }
    return 'sent';
  }, [isOptimistic, isPending]);

  if (loading) {
    return <MessageListSkeleton />;
  }

  if (optimisticMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={containerRef}>
        <EmptyState
          icon={MessageSquare}
          title="Welcome to QualiPilot FDA Assistant"
          description="I'm your AI-powered regulatory compliance assistant. Ask me about FDA regulations, medical device requirements, or compliance guidance."
          actionLabel="Start a Conversation"
          onAction={() => {
            const input = document.querySelector('textarea') as HTMLTextAreaElement;
            if (input) {
              input.focus();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-6 scroll-smooth relative" 
      ref={containerRef}
      style={{ height: '100%' }}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Virtualized items */}
        {virtualItems.map(virtualItem => {
          const message = optimisticMessages[virtualItem.index];
          const isUser = message.sender === 'user';
          const messageStatus = getMessageStatus(message);
          const isOptimisticMessage = isOptimistic(message.id);
          
          return (
            <div
              key={message.id}
              className={`max-w-4xl flex ${isUser ? 'justify-end' : 'justify-start'} absolute w-full`}
              style={{
                top: virtualItem.start,
                height: virtualItem.size,
              }}
            >
              <TransitionWrapper
                show={true}
                enter="transition-all duration-300"
                enterFrom={isUser ? "opacity-0 transform translate-x-4" : "opacity-0 transform -translate-x-4"}
                enterTo="opacity-100 transform translate-x-0"
                className="flex max-w-full"
              >
                <div className={`flex max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
                    {isUser ? (
                      <div className="bg-slate-300 rounded-full p-2 hover-scale transition-transform-150">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                    ) : (
                      <div className="bg-teal-600 rounded-full p-2 hover-scale transition-transform-150">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="space-y-3 max-w-full">
                    <div
                      className={`
                        ${isUser 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-white border border-slate-200'
                        } 
                        rounded-lg px-4 py-3 shadow-sm
                        ${isOptimisticMessage ? 'opacity-75 border-dashed' : ''}
                        hover-lift transition-all-300
                      `}
                    >
                      <div className="message-content">
                        {isUser ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <MarkdownRenderer content={message.content} />
                        )}
                        
                        <div className={`text-xs mt-2 flex items-center justify-between ${
                          isUser ? 'text-teal-200' : 'text-slate-400'
                        }`}>
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {isUser && (
                            <MessageStatus status={messageStatus} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Response Metadata */}
                    {!isUser && message.metadata && (
                      <ResponseMetadata
                        confidence={message.metadata.confidence || 'Medium'}
                        retrievedDocs={message.metadata.retrievedDocs || 0}
                        processingTime={message.metadata.processingTime}
                      />
                    )}

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <CitationRenderer citations={message.citations} />
                    )}

                    {/* Generated Document Card */}
                    {message.documentCard && (
                      <div className="p-3 bg-lime-50 border border-lime-200 rounded-lg hover-lift transition-all-300">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-lime-600" />
                          <span className="font-medium text-slate-900">
                            {message.documentCard.title}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            message.documentCard.status === 'ready' 
                              ? 'bg-green-100 text-green-800' 
                              : message.documentCard.status === 'generating'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.documentCard.status === 'ready' ? 'Ready' : 
                             message.documentCard.status === 'generating' ? 'Generating...' : 'Error'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {message.documentCard.description}
                        </p>
                        {message.documentCard.status === 'ready' && (
                          <button className="block mt-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200 focus-ring rounded-lg px-2 py-1">
                            View Document →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TransitionWrapper>
            </div>
          );
        })}
      </div>

      {/* Scroll to bottom button */}
      <TransitionWrapper
        show={hasScrolled && optimisticMessages.length > 5}
        enter="transition-all duration-300"
        enterFrom="opacity-0 transform translate-y-4"
        enterTo="opacity-100 transform translate-y-0"
        leave="transition-all duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <button
          onClick={() => {
            scrollToIndex(optimisticMessages.length - 1, 'smooth');
            setHasScrolled(false);
          }}
          className="fixed bottom-24 right-8 bg-teal-600 text-white rounded-full p-3 shadow-lg hover:bg-teal-700 transition-colors focus-ring z-10"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </TransitionWrapper>

      {/* Scrolling indicator */}
      {isScrolling && !initialLoad && (
        <div className="fixed bottom-24 left-8 bg-slate-800 bg-opacity-80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg animate-fade-in">
          Scrolling...
        </div>
      )}
    </div>
  );
};

export default VirtualMessageList;