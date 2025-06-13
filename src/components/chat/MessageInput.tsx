import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isStreaming?: boolean;
  onStop?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Ask about FDA regulations, generate QMS documents, or get compliance guidance...",
  isStreaming = false,
  onStop
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !disabled && !isStreaming) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) {
        handleSendMessage();
      }
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
    }
  };

  return (
    <div className="p-6 bg-white border-t border-slate-200 animate-fade-in">
      <div className="flex space-x-3">
        <div className={`flex-1 relative transition-all duration-200 ${isFocused ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`w-full p-4 border border-slate-200 rounded-lg focus:outline-none resize-none transition-all duration-200 ${
              disabled ? 'bg-slate-50 text-slate-400' : ''
            }`}
            rows={1}
            disabled={disabled}
            maxLength={4000}
            aria-label="Message input"
          />
          
          {/* Character count */}
          <div className="absolute bottom-3 left-3 text-xs text-slate-400">
            {inputMessage.length}/4000
          </div>
          
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <button 
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring"
              disabled={disabled}
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4 text-slate-500" />
            </button>
            <button 
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring"
              disabled={disabled}
              title="Voice input"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4 text-slate-500" />
            </button>
            <button 
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 focus-ring"
              disabled={disabled}
              title="Insert emoji"
              aria-label="Insert emoji"
            >
              <Smile className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
        
        {/* Send/Stop button */}
        <button
          onClick={isStreaming ? handleStop : handleSendMessage}
          disabled={(!inputMessage.trim() && !isStreaming) || disabled}
          className={`self-end h-fit px-6 py-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl focus-ring ${
            isStreaming 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
          aria-label={isStreaming ? "Stop response" : "Send message"}
        >
          {isStreaming ? (
            <>
              <Square className="h-5 w-5" />
              <span className="hidden sm:inline">Stop</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
      
      {/* Input hints */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          Press Enter to send, Shift+Enter for new line
        </span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          Max 4000 characters
        </span>
      </div>
    </div>
  );
};