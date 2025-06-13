import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ContextualHelpProps {
  content: React.ReactNode;
  title?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: string;
  children: React.ReactNode;
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  title,
  position = 'top',
  width = 'w-64',
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 transform -translate-y-1/2';
      case 'bottom':
        return 'top-full mt-2 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 transform -translate-y-1/2';
      default:
        return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2';
    }
  };

  // Arrow position classes
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'right':
        return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-y-full -translate-x-1/2 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent';
      default:
        return 'bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help inline-flex"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 ${width} ${getPositionClasses()} animate-fade-in`}
        >
          <div className="bg-slate-800 text-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with title */}
            {title && (
              <div className="flex items-center justify-between p-3 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-teal-400" />
                  <h3 className="text-sm font-medium text-white">{title}</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Close help tooltip"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-3 text-sm">
              {content}
            </div>
          </div>

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-solid border-8 ${getArrowClasses()}`}
          ></div>
        </div>
      )}
    </div>
  );
};