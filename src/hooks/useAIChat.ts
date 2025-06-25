import { useState, useCallback, useRef } from 'react';
import { ChatService, ChatStreamResponse } from '../lib/ai/chatService';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../components/auth/AuthProvider';

interface UseAIChatOptions {
  onMessageComplete?: (response: ChatStreamResponse) => void;
}

interface UseAIChatReturn {
  isStreaming: boolean;
  streamingContent: string;
  sendMessage: (message: string, threadId: string) => Promise<void>;
  stopStreaming: () => void;
  error: string | null;
  clearError: () => void;
  confidence: string | null;
  retrievedDocs: number;
}

export const useAIChat = ({ onMessageComplete }: UseAIChatOptions): UseAIChatReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [retrievedDocs, setRetrievedDocs] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showToast } = useToast();
  const { userProfile } = useAuth();

  const sendMessage = useCallback(async (message: string, threadId: string) => {
    // If already streaming, don't allow sending another message
    if (isStreaming) {
      console.warn('Already streaming a message');
      return;
    }

    setIsStreaming(true);
    setStreamingContent('');
    setError(null);
    setConfidence(null);
    setRetrievedDocs(0);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // For the default mock thread, use a different approach
      if (threadId === '1') {
        // Simulate streaming for the mock thread
        let simulatedContent = '';
        const interval = setInterval(() => {
          const chunks = [
            "I'm analyzing your question about FDA regulations. ",
            "Based on the current FDA guidelines, ",
            "medical device manufacturers must comply with Quality System Regulations (QSR) as outlined in 21 CFR Part 820. ",
            "This includes requirements for design controls, document controls, and risk management. ",
            "For more specific guidance, please provide details about your device classification and intended use."
          ];
          
          const currentIndex = simulatedContent.length > 0 ? 
            Math.floor(simulatedContent.length / 20) % chunks.length : 0;
            
          if (currentIndex < chunks.length) {
            const newChunk = chunks[currentIndex];
            simulatedContent += newChunk;
            setStreamingContent(simulatedContent);
          } else {
            clearInterval(interval);
            setIsStreaming(false);
            
            if (onMessageComplete) {
              onMessageComplete({
                type: 'complete',
                content: simulatedContent,
                fullContent: simulatedContent,
                confidence: 'High',
                retrievedDocs: 3
              });
            }
          }
        }, 300);
        
        // Clean up interval on abort
        abortControllerRef.current.signal.addEventListener('abort', () => {
          clearInterval(interval);
        });
        
        return;
      }

      // Extract roadmap data from user profile if available
      const roadmapData = userProfile?.company_info?.roadmap_data;
      
      // For real threads, use the ChatService
      await ChatService.sendMessage(threadId, message, {
        signal: abortControllerRef.current.signal,
        roadmapData, // Pass roadmap data to the chat service
        
        onChunk: (chunk: ChatStreamResponse) => {
          if (chunk.type === 'content' && chunk.content) {
            setStreamingContent(prev => prev + chunk.content);
          }
        },

        onComplete: (response: ChatStreamResponse) => {
          setIsStreaming(false);
          setStreamingContent('');
          setConfidence(response.confidence || null);
          setRetrievedDocs(response.retrievedDocs || 0);
          
          if (onMessageComplete) {
            onMessageComplete(response);
          }

          // Show completion toast with metadata
          const toastMessage = response.confidence 
            ? `Response complete (${response.confidence} confidence, ${response.retrievedDocs || 0} sources)`
            : 'AI assistant has finished responding';

          showToast({
            type: 'success',
            title: 'Response Complete',
            message: toastMessage,
            duration: 3000
          });
        },

        onError: (errorMessage: string) => {
          setIsStreaming(false);
          setStreamingContent('');
          setError(errorMessage);
          
          showToast({
            type: 'error',
            title: 'AI Response Failed',
            message: errorMessage,
            duration: 5000
          });
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setIsStreaming(false);
      setStreamingContent('');
      setError(errorMessage);

      if (!abortControllerRef.current?.signal.aborted) {
        showToast({
          type: 'error',
          title: 'Message Failed',
          message: errorMessage,
          duration: 5000
        });
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [isStreaming, onMessageComplete, showToast, userProfile]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent('');
    
    showToast({
      type: 'info',
      title: 'Response Stopped',
      message: 'AI response was cancelled',
      duration: 3000
    });
  }, [showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStreaming,
    streamingContent,
    sendMessage,
    stopStreaming,
    error,
    clearError,
    confidence,
    retrievedDocs
  };
};