import React, { useEffect, useState } from 'react';
import { Keyboard, X, Search, Info } from 'lucide-react';

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const KEYBOARD_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Alt', 'H'], description: 'Go to home/dashboard' },
      { keys: ['Alt', 'C'], description: 'Go to chat' },
      { keys: ['Alt', 'D'], description: 'Go to documents' },
      { keys: ['Alt', 'R'], description: 'Go to regulatory intelligence' },
      { keys: ['Alt', 'S'], description: 'Go to settings' },
    ]
  },
  {
    name: 'Chat',
    shortcuts: [
      { keys: ['Ctrl', '/'], description: 'Focus search' },
      { keys: ['Ctrl', 'N'], description: 'New conversation' },
      { keys: ['Ctrl', 'Enter'], description: 'Send message' },
      { keys: ['Esc'], description: 'Cancel current response' },
      { keys: ['Alt', 'P'], description: 'Toggle context panel' },
    ]
  },
  {
    name: 'Documents',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save document' },
      { keys: ['Ctrl', 'P'], description: 'Print document' },
      { keys: ['Ctrl', 'D'], description: 'Download document' },
      { keys: ['Ctrl', 'F'], description: 'Find in document' },
      { keys: ['Alt', 'G'], description: 'Generate new document' },
    ]
  },
  {
    name: 'Accessibility',
    shortcuts: [
      { keys: ['Tab'], description: 'Navigate between elements' },
      { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
      { keys: ['Space'], description: 'Activate button/control' },
      { keys: ['Alt', 'Z'], description: 'Toggle high contrast mode' },
      { keys: ['?'], description: 'Show this help dialog' },
    ]
  }
];

export const KeyboardShortcutButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-lg hover:bg-slate-100 transition-colors focus-ring ${className}`}
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5 text-slate-600" />
      </button>
      
      {isOpen && <KeyboardShortcutsModal onClose={() => setIsOpen(false)} />}
    </>
  );
};

export const KeyboardShortcutsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent scrolling of background
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slide-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-full">
              <Keyboard className="h-5 w-5 text-teal-600" />
            </div>
            <h2 id="keyboard-shortcuts-title" className="text-xl font-semibold text-slate-900">
              Keyboard Shortcuts
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {KEYBOARD_SHORTCUTS.map((category) => (
              <div key={category.name}>
                <h3 className="text-lg font-medium text-slate-900 mb-4">{category.name}</h3>
                <div className="space-y-3">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-slate-700">{shortcut.description}</span>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-800 shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-slate-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Tip: Quick Access</h4>
                <p className="text-sm text-blue-700">
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-semibold text-blue-800">?</kbd> anywhere in the application to open this shortcuts panel.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700">Esc</kbd> to close
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to register global keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Check for shortcuts
      for (const [key, callback] of Object.entries(shortcuts)) {
        const parts = key.toLowerCase().split('+');
        
        const modifiersMatch = 
          (parts.includes('ctrl') === e.ctrlKey) &&
          (parts.includes('alt') === e.altKey) &&
          (parts.includes('shift') === e.shiftKey) &&
          (parts.includes('meta') === e.metaKey);
        
        const keyMatch = parts.some(part => 
          !['ctrl', 'alt', 'shift', 'meta'].includes(part) && 
          e.key.toLowerCase() === part
        );
        
        if (modifiersMatch && keyMatch) {
          e.preventDefault();
          callback();
          break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}