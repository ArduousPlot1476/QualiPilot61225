import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here';

let supabase: any = null;

if (isSupabaseConfigured) {
  // Create a singleton Supabase client
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
} else {
  console.warn('Supabase not configured. Please add your credentials to .env file.');
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
      updateUser: () => Promise.reject(new Error('Supabase not configured')),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    },
    from: () => ({
      insert: () => Promise.reject(new Error('Supabase not configured')),
      select: () => Promise.reject(new Error('Supabase not configured')),
      update: () => Promise.reject(new Error('Supabase not configured')),
      delete: () => Promise.reject(new Error('Supabase not configured'))
    }),
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured')),
        download: () => Promise.reject(new Error('Supabase not configured')),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
}

export { supabase };

// Error boundary for Supabase operations
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Helper function to handle Supabase responses
export const handleSupabaseResponse = <T>(
  response: { data: T | null; error: any }
): T => {
  if (response.error) {
    throw new SupabaseError(
      response.error.message,
      response.error.code,
      response.error.details
    );
  }
  
  if (response.data === null) {
    throw new SupabaseError('No data returned from Supabase');
  }
  
  return response.data;
};

// Helper function to handle Supabase responses that may return null
export const handleSupabaseResponseMaybeNull = <T>(
  response: { data: T | null; error: any }
): T | null => {
  if (response.error) {
    throw new SupabaseError(
      response.error.message,
      response.error.code,
      response.error.details
    );
  }
  
  return response.data;
};

// Authentication helpers
export const authHelpers = {
  signUp: async (email: string, password: string, companyInfo?: any) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          company_info: companyInfo || {}
        }
      }
    });
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }
    
    return response.data;
  },

  signIn: async (email: string, password: string, rememberMe: boolean = false) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }

    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('qualipilot_remember_me', 'true');
    } else {
      localStorage.removeItem('qualipilot_remember_me');
    }
    
    return response.data;
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.signOut();
    localStorage.removeItem('qualipilot_remember_me');
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }
    
    return response;
  },

  resetPassword: async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }
    
    return response.data;
  },

  updatePassword: async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }
    
    return response.data;
  },

  updateProfile: async (updates: { email?: string; data?: any }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase.auth.updateUser(updates);
    
    if (response.error) {
      throw new SupabaseError(response.error.message);
    }
    
    return response.data;
  },

  getCurrentUser: () => {
    if (!isSupabaseConfigured) {
      return Promise.resolve({ data: { user: null }, error: null });
    }
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database operation helpers with error handling
export const dbHelpers = {
  // User operations
  createUserProfile: async (userId: string, email: string, companyInfo?: any) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        company_info: companyInfo || {}
      })
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  getUserProfile: async (userId: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return handleSupabaseResponseMaybeNull(response);
  },

  updateUserProfile: async (userId: string, updates: any) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    // If updates contains company_info, merge it with existing company_info
    if (updates.company_info) {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('company_info')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        updates.company_info = {
          ...existingProfile.company_info,
          ...updates.company_info
        };
      }
    }

    const response = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  // Thread operations
  createThread: async (title: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new SupabaseError('User not authenticated');

    const response = await supabase
      .from('threads')
      .insert({ title, user_id: user.id })
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  getThreads: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('threads')
      .select('*')
      .order('updated_at', { ascending: false });

    return handleSupabaseResponse(response);
  },

  updateThread: async (id: string, updates: { title?: string }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('threads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  deleteThread: async (id: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('threads')
      .delete()
      .eq('id', id);

    return handleSupabaseResponse(response);
  },

  // Message operations
  createMessage: async (threadId: string, content: string, role: 'user' | 'assistant' | 'system', citations?: any[]) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        content,
        role,
        citations: citations || []
      })
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  getMessages: async (threadId: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    return handleSupabaseResponse(response);
  },

  updateMessage: async (id: string, updates: { content?: string; citations?: any[] }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  deleteMessage: async (id: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    return handleSupabaseResponse(response);
  },

  // Document operations
  createDocument: async (title: string, type: string, content?: string, metadata?: any) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new SupabaseError('User not authenticated');

    const response = await supabase
      .from('documents')
      .insert({
        title,
        type,
        content,
        metadata: metadata || {},
        user_id: user.id
      })
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  getDocuments: async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    return handleSupabaseResponse(response);
  },

  updateDocument: async (id: string, updates: { title?: string; content?: string; status?: string; metadata?: any }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return handleSupabaseResponse(response);
  },

  deleteDocument: async (id: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }

    const response = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    return handleSupabaseResponse(response);
  },
  
  // File storage operations
  uploadFile: async (bucket: string, path: string, file: File) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw new SupabaseError(error.message, error.code, error.details);
    }
    
    return data;
  },
  
  getFileUrl: (bucket: string, path: string) => {
    if (!isSupabaseConfigured) {
      return '';
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  },
  
  deleteFile: async (bucket: string, path: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your Supabase credentials to the .env file.');
    }
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      throw new SupabaseError(error.message, error.code, error.details);
    }
    
    return true;
  }
};