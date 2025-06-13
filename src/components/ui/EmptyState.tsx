import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-full p-6 mb-6 shadow-inner">
        <Icon className="h-12 w-12 text-teal-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      
      <p className="text-slate-600 mb-6 max-w-md">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-ring hover-scale"
          >
            {actionLabel}
          </button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors focus-ring"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};