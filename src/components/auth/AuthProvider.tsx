import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authHelpers, dbHelpers, SupabaseError } from '../../lib/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, companyInfo?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if Supabase is properly configured
  const checkConfiguration = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const configured = !!(
      supabaseUrl && 
      supabaseAnonKey && 
      supabaseUrl !== 'https://your-project-ref.supabase.co' && 
      supabaseAnonKey !== 'your-anon-key-here' &&
      supabaseUrl.includes('supabase.co')
    );
    
    setIsConfigured(configured);
    return configured;
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        const configured = checkConfiguration();
        
        if (!configured) {
          console.warn('Supabase not configured. Running in demo mode.');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setError(`Authentication error: ${sessionError.message}`);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              console.log('User signed in, loading profile for:', session.user.id);
              await loadUserProfile(session.user.id, session.user.email);
              
              // Redirect to onboarding if needed
              const currentPath = location.pathname;
              if (currentPath === '/auth/login' || currentPath === '/auth/signup' || currentPath === '/') {
                navigate('/welcome');
              }
            } catch (profileError) {
              console.warn('Could not load user profile:', profileError);
              // Don't fail the auth flow if profile loading fails
            }
          }
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (!mounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              try {
                console.log('User signed in, loading profile for:', session.user.id);
                await loadUserProfile(session.user.id, session.user.email);
                
                // Redirect to onboarding if needed
                const currentPath = location.pathname;
                if (currentPath === '/auth/login' || currentPath === '/auth/signup' || currentPath === '/') {
                  navigate('/welcome');
                }
              } catch (profileError) {
                console.warn('Could not load user profile after sign in:', profileError);
              }
            } else if (event === 'SIGNED_OUT') {
              setUserProfile(null);
              navigate('/');
            }
          }
        );

        authSubscription = subscription;

      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Authentication initialization failed');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout');
        setLoading(false);
        setError('Authentication initialization timed out');
      }
    }, 10000); // 10 second timeout

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  const loadUserProfile = async (userId: string, userEmail?: string) => {
    console.log('loadUserProfile called for userId:', userId, 'email:', userEmail);
    
    try {
      console.log('Attempting to get user profile from database...');
      const profile = await dbHelpers.getUserProfile(userId);
      console.log('User profile retrieved:', profile);
      
      if (profile) {
        setUserProfile(profile);
        console.log('User profile set in state successfully');
        return;
      }
      
      // If profile is null, create a new one
      console.log('User profile not found, creating new profile...');
      
      try {
        const email = userEmail || '';
        if (!email) {
          throw new Error('User email is required to create profile');
        }
        
        const companyInfo = {};
        console.log('Creating new user profile with email:', email);
        
        const newProfile = await dbHelpers.createUserProfile(userId, email, companyInfo);
        console.log('New profile created:', newProfile);
        setUserProfile(newProfile);
        console.log('Created new user profile successfully');
      } catch (createError) {
        console.error('Failed to create user profile:', createError);
        // This is a critical error as it will prevent thread creation
        throw new Error('Failed to create user profile. Please try signing in again.');
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
      
      // Create a basic user profile if it doesn't exist
      try {
        const email = userEmail || '';
        if (!email) {
          throw new Error('User email is required to create profile');
        }
        
        const companyInfo = {};
        console.log('Creating new user profile with email:', email);
        
        const newProfile = await dbHelpers.createUserProfile(userId, email, companyInfo);
        console.log('New profile created:', newProfile);
        setUserProfile(newProfile);
        console.log('Created new user profile successfully');
      } catch (createError) {
        console.error('Failed to create user profile:', createError);
        // This is a critical error as it will prevent thread creation
        throw new Error('Failed to create user profile. Please try signing in again.');
      }
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setLoading(true);
      setError(null);
      await authHelpers.signIn(email, password, rememberMe);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, companyInfo?: any) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await authHelpers.signUp(email, password, companyInfo);
      
      // Create user profile if signup was successful
      if (result.user) {
        try {
          await dbHelpers.createUserProfile(result.user.id, email, companyInfo || {});
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw here as the user was created successfully
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setLoading(true);
      setError(null);
      await authHelpers.signOut();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setError(null);
      await authHelpers.resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setError(null);
      await authHelpers.updatePassword(newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      setError(errorMessage);
      throw error;
    }
  };

  const updateProfile = async (updates: any) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    try {
      setError(null);
      
      if (user) {
        // Update auth profile
        await authHelpers.updateProfile(updates);
        
        // Update user profile in database
        console.log('Calling dbHelpers.updateUserProfile with updates:', updates);
        if (userProfile) {
          const updatedProfile = await dbHelpers.updateUserProfile(user.id, updates);
          setUserProfile(updatedProfile);
        } else {
          // Create profile if it doesn't exist
          const email = user.email || '';
          if (!email) {
            throw new Error('User email is required to create profile');
          }
          
          const newProfile = await dbHelpers.createUserProfile(user.id, email, updates.company_info || {});
          setUserProfile(newProfile);
        }
        console.log('userProfile state after update:', userProfile);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};