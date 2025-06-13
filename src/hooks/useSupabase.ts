import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authHelpers, dbHelpers, SupabaseError } from '../lib/supabase/client';
import { RealtimeSubscriptionManager } from '../lib/realtime/subscriptions';
import { DataMigrationService } from '../lib/migration/dataMigration';
import { Thread, Message, Document } from '../lib/supabase/types';

interface UseSupabaseReturn {
  // Auth state
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Data methods
  threads: Thread[];
  messages: Message[];
  documents: Document[];
  
  // CRUD operations
  createThread: (title: string) => Promise<Thread>;
  createMessage: (threadId: string, content: string, role: 'user' | 'assistant') => Promise<Message>;
  createDocument: (title: string, type: string, content?: string) => Promise<Document>;
  
  // Real-time subscriptions
  subscribeToThreads: () => void;
  subscribeToMessages: (threadId: string) => void;
  subscribeToDocuments: () => void;
  unsubscribeAll: () => void;
  
  // Migration
  migrateData: () => Promise<void>;
  migrationStatus: 'idle' | 'migrating' | 'completed' | 'error';
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useSupabase = (): UseSupabaseReturn => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Migration state
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle');
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Realtime subscription manager
  const [subscriptionManager] = useState(() => new RealtimeSubscriptionManager());

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Load user data after sign in
              await loadUserData();
              
              // Check if migration is needed
              if (DataMigrationService.isMigrationNeeded()) {
                setMigrationStatus('idle');
              }
            } else if (event === 'SIGNED_OUT') {
              // Clear data on sign out
              setThreads([]);
              setMessages([]);
              setDocuments([]);
              subscriptionManager.unsubscribeAll();
            }
          }
        );

        // Load initial data if user is signed in
        if (session?.user) {
          await loadUserData();
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load user data
  const loadUserData = useCallback(async () => {
    try {
      const [threadsData, documentsData] = await Promise.all([
        dbHelpers.getThreads(),
        dbHelpers.getDocuments()
      ]);
      
      setThreads(threadsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    }
  }, []);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authHelpers.signIn(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authHelpers.signUp(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authHelpers.signOut();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD operations
  const createThread = useCallback(async (title: string): Promise<Thread> => {
    try {
      const thread = await dbHelpers.createThread(title);
      setThreads(prev => [thread, ...prev]);
      return thread;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create thread');
      throw error;
    }
  }, []);

  const createMessage = useCallback(async (threadId: string, content: string, role: 'user' | 'assistant'): Promise<Message> => {
    try {
      const message = await dbHelpers.createMessage(threadId, content, role);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create message');
      throw error;
    }
  }, []);

  const createDocument = useCallback(async (title: string, type: string, content?: string): Promise<Document> => {
    try {
      const document = await dbHelpers.createDocument(title, type, content);
      setDocuments(prev => [document, ...prev]);
      return document;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create document');
      throw error;
    }
  }, []);

  // Real-time subscriptions
  const subscribeToThreads = useCallback(() => {
    if (!user) return;
    
    subscriptionManager.subscribeToThreads({
      onThreadChange: (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              setThreads(prev => [newRecord as Thread, ...prev]);
            }
            break;
          case 'UPDATE':
            if (newRecord) {
              setThreads(prev => prev.map(thread => 
                thread.id === newRecord.id ? newRecord as Thread : thread
              ));
            }
            break;
          case 'DELETE':
            if (oldRecord) {
              setThreads(prev => prev.filter(thread => thread.id !== oldRecord.id));
            }
            break;
        }
      },
      onError: (error) => setError(error.message)
    });
  }, [user, subscriptionManager]);

  const subscribeToMessages = useCallback((threadId: string) => {
    if (!user) return;
    
    subscriptionManager.subscribeToMessages(threadId, {
      onMessageChange: (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              setMessages(prev => [...prev, newRecord as Message]);
            }
            break;
          case 'UPDATE':
            if (newRecord) {
              setMessages(prev => prev.map(message => 
                message.id === newRecord.id ? newRecord as Message : message
              ));
            }
            break;
          case 'DELETE':
            if (oldRecord) {
              setMessages(prev => prev.filter(message => message.id !== oldRecord.id));
            }
            break;
        }
      },
      onError: (error) => setError(error.message)
    });
  }, [user, subscriptionManager]);

  const subscribeToDocuments = useCallback(() => {
    if (!user) return;
    
    subscriptionManager.subscribeToDocuments({
      onDocumentChange: (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              setDocuments(prev => [newRecord as Document, ...prev]);
            }
            break;
          case 'UPDATE':
            if (newRecord) {
              setDocuments(prev => prev.map(doc => 
                doc.id === newRecord.id ? newRecord as Document : doc
              ));
            }
            break;
          case 'DELETE':
            if (oldRecord) {
              setDocuments(prev => prev.filter(doc => doc.id !== oldRecord.id));
            }
            break;
        }
      },
      onError: (error) => setError(error.message)
    });
  }, [user, subscriptionManager]);

  const unsubscribeAll = useCallback(() => {
    subscriptionManager.unsubscribeAll();
  }, [subscriptionManager]);

  // Migration
  const migrateData = useCallback(async () => {
    try {
      setMigrationStatus('migrating');
      setError(null);
      
      const result = await DataMigrationService.migrateToSupabase();
      
      if (result.success) {
        setMigrationStatus('completed');
        // Reload data after migration
        await loadUserData();
      } else {
        setMigrationStatus('error');
        setError(`Migration failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      setMigrationStatus('error');
      setError(error instanceof Error ? error.message : 'Migration failed');
    }
  }, [loadUserData]);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionManager.unsubscribeAll();
    };
  }, [subscriptionManager]);

  return {
    // Auth state
    user,
    session,
    loading,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    
    // Data
    threads,
    messages,
    documents,
    
    // CRUD operations
    createThread,
    createMessage,
    createDocument,
    
    // Real-time subscriptions
    subscribeToThreads,
    subscribeToMessages,
    subscribeToDocuments,
    unsubscribeAll,
    
    // Migration
    migrateData,
    migrationStatus,
    
    // Error handling
    error,
    clearError
  };
};