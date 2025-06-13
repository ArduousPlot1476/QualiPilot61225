import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Eye, EyeOff, Mail, Lock, Bot, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const { signIn, error, clearError, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to welcome page
  const from = location.state?.from?.pathname || '/welcome';

  // Check if we should redirect to landing page
  useEffect(() => {
    // If we're on the login page directly (not via redirect), show the landing page first
    if (location.key === 'default' && location.pathname === '/auth/login') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await signIn(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show configuration required message
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-amber-600 dark:bg-amber-700 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Setup Required
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Supabase configuration is required to use authentication
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <div className="text-center space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                  <strong>Configuration needed:</strong>
                </p>
                <div className="text-xs text-amber-700 dark:text-amber-400 text-left space-y-1">
                  <div>1. Create a Supabase project</div>
                  <div>2. Add your credentials to .env file</div>
                  <div>3. Restart the development server</div>
                </div>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Supabase Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center mb-6">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to QualiPilot
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Sign in to your medical device compliance platform
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Sign in failed</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                    validationErrors.email 
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                    validationErrors.password 
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isConfigured}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
              >
                Sign up for QualiPilot
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure medical device regulatory compliance platform
          </p>
        </div>
      </div>
    </div>
  );
};