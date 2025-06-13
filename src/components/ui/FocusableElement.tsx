import React, { useState, useRef, useEffect } from 'react';

interface FocusableElementProps {
  children: React.ReactNode;
  className?: string;
  focusClassName?: string;
  tabIndex?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const FocusableElement: React.FC<FocusableElementProps> = ({
  children,
  className = '',
  focusClassName = 'ring-2 ring-teal-500 ring-offset-2',
  tabIndex = 0,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick();
    }
    
    if (onKeyDown) onKeyDown(e);
  };

  // Focus management
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      // Add any custom key handling here
    };

    element.addEventListener('keyup', handleKeyUp);
    return () => {
      element.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={elementRef}
      tabIndex={tabIndex}
      role="button"
      className={`outline-none transition-all duration-150 ${className} ${isFocused ? focusClassName : ''}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};