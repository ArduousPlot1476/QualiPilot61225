import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onReport?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call onReport if provided
    if (this.props.onReport) {
      this.props.onReport(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReport = (): void => {
    const { error, errorInfo } = this.state;
    if (this.props.onReport && error) {
      this.props.onReport(error, errorInfo || { componentStack: '' });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800 shadow-md animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Something went wrong</h2>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-4">
            <p className="text-slate-700 dark:text-slate-300 mb-2">
              We encountered an unexpected error. Here's what you can do:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
          
          {this.state.error && (
            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg mb-4 overflow-auto max-h-32">
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {this.state.error.toString()}
              </p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 focus-ring"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={this.handleReport}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 focus-ring"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WithErrorBoundary;
};