import React, { useState, useEffect } from 'react';

interface TransitionWrapperProps {
  children: React.ReactNode;
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
  className?: string;
  unmountOnExit?: boolean;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  show,
  enter = 'transition-all ease-in-out duration-300',
  enterFrom = 'opacity-0',
  enterTo = 'opacity-100',
  leave = 'transition-all ease-in-out duration-300',
  leaveFrom = 'opacity-100',
  leaveTo = 'opacity-0',
  duration = 300,
  className = '',
  unmountOnExit = true,
  onEnter,
  onEntered,
  onExit,
  onExited,
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [stage, setStage] = useState<'enter-from' | 'enter-to' | 'leave-from' | 'leave-to' | null>(
    show ? 'enter-from' : null
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (show) {
      setShouldRender(true);
      setStage('enter-from');
      
      if (onEnter) onEnter();
      
      // Start enter animation
      timeoutId = setTimeout(() => {
        setStage('enter-to');
        
        // Animation complete
        timeoutId = setTimeout(() => {
          if (onEntered) onEntered();
        }, duration);
      }, 10); // Small delay to ensure enterFrom is applied
    } else {
      if (shouldRender) {
        setStage('leave-from');
        
        if (onExit) onExit();
        
        // Start leave animation
        timeoutId = setTimeout(() => {
          setStage('leave-to');
          
          // Animation complete
          timeoutId = setTimeout(() => {
            if (unmountOnExit) {
              setShouldRender(false);
            }
            if (onExited) onExited();
          }, duration);
        }, 10); // Small delay to ensure leaveFrom is applied
      }
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [show, duration, unmountOnExit, onEnter, onEntered, onExit, onExited]);

  if (!shouldRender) {
    return null;
  }

  let stageClasses = '';
  if (stage === 'enter-from') stageClasses = `${enter} ${enterFrom}`;
  if (stage === 'enter-to') stageClasses = `${enter} ${enterTo}`;
  if (stage === 'leave-from') stageClasses = `${leave} ${leaveFrom}`;
  if (stage === 'leave-to') stageClasses = `${leave} ${leaveTo}`;

  return (
    <div className={`${stageClasses} ${className}`}>
      {children}
    </div>
  );
};