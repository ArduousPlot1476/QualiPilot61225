import React from 'react';
import { Loader2, MessageCircle, FileText, Users } from 'lucide-react';

// Skeleton loader for message list with animation
export const MessageListSkeleton: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex space-x-3 animate-pulse ${i % 2 === 0 ? 'justify-end flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2 max-w-md">
            <div className={`h-4 ${i % 2 === 0 ? 'bg-teal-200' : 'bg-slate-200'} rounded w-3/4`}></div>
            <div className={`h-4 ${i % 2 === 0 ? 'bg-teal-200' : 'bg-slate-200'} rounded w-1/2`}></div>
            <div className={`h-3 ${i % 2 === 0 ? 'bg-teal-200' : 'bg-slate-200'} rounded w-1/4`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for thread list with animation
export const ThreadListSkeleton: React.FC = () => {
  return (
    <div className="space-y-1 p-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-lg animate-pulse">
          <div className="flex items-start justify-between mb-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-8"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for document cards with animation
export const DocumentCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 w-4 bg-slate-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-5 bg-slate-200 rounded-full w-12"></div>
            <div className="h-5 bg-slate-200 rounded-full w-16"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};

// Skeleton loader for source cards with animation
export const SourceCardSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-50 rounded-lg p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 w-4 bg-slate-200 rounded"></div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-5 bg-slate-200 rounded-full w-12"></div>
            <div className="h-5 bg-slate-200 rounded-full w-16"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};

// Loading spinner with message and animation
interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center space-x-2 animate-fade-in">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-teal-600`} />
      <span className="text-slate-600 text-sm">{message}</span>
    </div>
  );
};

// Progress bar for long operations with animation
interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label, 
  showPercentage = true 
}) => {
  return (
    <div className="w-full animate-fade-in">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-teal-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

// Empty state component with animation
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="bg-slate-100 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium focus-ring hover-scale"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Message status indicator with animation
interface MessageStatusProps {
  status: 'sending' | 'sent' | 'failed' | 'syncing';
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center space-x-1 text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Sending...</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center space-x-1 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs">Sent</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs">Failed</span>
          </div>
        );
      case 'syncing':
        return (
          <div className="flex items-center space-x-1 text-blue-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Syncing...</span>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="mt-1 animate-fade-in">{getStatusDisplay()}</div>;
};

// Sync status indicator for the header with animation
interface SyncStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isOnline,
  isSyncing,
  pendingCount
}) => {
  if (!isOnline) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span className="text-xs font-medium text-amber-700">Offline</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full animate-fade-in">
        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        <span className="text-xs font-medium text-blue-700">Syncing...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full animate-fade-in">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-xs font-medium text-yellow-700">
          {pendingCount} pending
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full animate-fade-in">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-xs font-medium text-green-700">Synced</span>
    </div>
  );
};

// Branded skeleton loader with animation
export const BrandedSkeleton: React.FC<{
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}> = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '', 
  rounded = 'rounded'
}) => {
  return (
    <div className={`${width} ${height} ${rounded} bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-shimmer ${className}`}></div>
  );
};

// Profile card skeleton with animation
export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-8 bg-slate-200 rounded w-2/5"></div>
        <div className="h-8 bg-slate-200 rounded w-2/5"></div>
      </div>
    </div>
  );
};

// Data table skeleton with animation
export const DataTableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-slate-50 p-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-4 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4 animate-pulse">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className="h-3 bg-slate-200 rounded"
                  style={{ 
                    width: `${Math.floor(Math.random() * 40) + 60}%` 
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};