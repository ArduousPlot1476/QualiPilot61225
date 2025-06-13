import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in ${className}`}>
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 rounded-full p-6 mb-6 shadow-inner">
        <Icon className="h-12 w-12 text-teal-600 dark:text-teal-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="px-5 py-2.5 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors focus-ring hover-scale"
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outline"
            onClick={onSecondaryAction}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};