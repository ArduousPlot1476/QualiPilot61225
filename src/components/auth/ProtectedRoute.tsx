import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2, Shield, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, error, isConfigured, userProfile } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);

  // Add a timeout to prevent infinite loading state for profile
  useEffect(() => {
    if (user && !userProfile) {
      const timer = setTimeout(() => {
        setProfileLoading(false);
      }, 5000); // 5 second timeout for profile loading
      
      return () => clearTimeout(timer);
    } else {
      setProfileLoading(false);
    }
  }, [user, userProfile]);

  // Show loading state with timeout protection
  if (loading || (user && !userProfile && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-blue-600 dark:bg-blue-700 rounded-full p-4 mx-auto mb-6 w-16 h-16 flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading QualiPilot</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">Initializing your medical device compliance platform</p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
              <span>Connecting to secure servers...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show configuration screen if Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Setup Required</h2>
              <p className="text-slate-600 dark:text-slate-300">
                QualiPilot needs to be connected to Supabase to enable authentication and data storage.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">1</span>
                  Create a Supabase Project
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Sign up for a free Supabase account and create a new project.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Go to Supabase Dashboard
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">2</span>
                  Get Your Credentials
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  From your Supabase project dashboard, go to Settings → API to find your credentials.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">3</span>
                  Add Environment Variables
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Create a <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">.env</code> file in your project root with:
                </p>
                <div className="bg-slate-900 dark:bg-black rounded-lg p-3 text-sm font-mono text-green-400 dark:text-green-300 overflow-x-auto">
                  <div>VITE_SUPABASE_URL=https://your-project-ref.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Configuration
                </button>
                <a
                  href="https://supabase.com/docs/guides/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-center"
                >
                  View Docs
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Why Supabase?</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Supabase provides secure authentication, real-time database, and compliance-ready infrastructure 
                    for your medical device regulatory data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for other configuration issues
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-900/20 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Connection Error</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Retry Connection
              </button>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};