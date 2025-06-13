import React from 'react';
import { Bot, Square } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TransitionWrapper } from '../ui/TransitionWrapper';

interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
  onStop?: () => void;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  content,
  isStreaming,
  onStop
}) => {
  return (
    <TransitionWrapper
      show={true}
      enter="transition-all duration-300"
      enterFrom="opacity-0 transform -translate-y-4"
      enterTo="opacity-100 transform translate-y-0"
      className="max-w-3xl flex justify-start"
    >
      <div className="flex max-w-full">
        {/* Avatar */}
        <div className="mr-3">
          <div className="bg-teal-600 rounded-full p-2 hover-scale transition-transform-150">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-3 max-w-full">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm hover-lift transition-all-300">
            <div className="message-content">
              <MarkdownRenderer content={content} />
              
              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">AI is responding...</span>
                  </div>
                  
                  {onStop && (
                    <button
                      onClick={onStop}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors focus-ring"
                      aria-label="Stop AI response"
                    >
                      <Square className="h-3 w-3" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
};