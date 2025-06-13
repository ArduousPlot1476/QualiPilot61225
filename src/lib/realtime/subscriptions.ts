import { supabase, SupabaseError } from '../supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Thread, Message, Document } from '../supabase/types';

interface SubscriptionCallbacks {
  onThreadChange?: (payload: RealtimePostgresChangesPayload<Thread>) => void;
  onMessageChange?: (payload: RealtimePostgresChangesPayload<Message>) => void;
  onDocumentChange?: (payload: RealtimePostgresChangesPayload<Document>) => void;
  onPresenceChange?: (presence: any) => void;
  onError?: (error: Error) => void;
}

interface PresenceState {
  user_id: string;
  username: string;
  online_at: string;
}

export class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private messageQueue: Array<{ type: string; payload: any }> = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Subscribe to thread changes for the current user
   */
  subscribeToThreads(callbacks: SubscriptionCallbacks): string {
    const channelName = 'threads-subscription';
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'threads',
            filter: `user_id=eq.${this.getCurrentUserId()}`
          },
          (payload) => {
            console.log('Thread change received:', payload);
            callbacks.onThreadChange?.(payload as RealtimePostgresChangesPayload<Thread>);
          }
        )
        .subscribe((status) => {
          console.log('Thread subscription status:', status);
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0; // Reset on successful connection
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.(new Error('Thread subscription failed'));
            this.handleReconnection(channelName, () => this.subscribeToThreads(callbacks));
          }
        });

      this.channels.set(channelName, channel);
      return channelName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(new SupabaseError(`Failed to subscribe to threads: ${errorMessage}`));
      throw error;
    }
  }

  /**
   * Subscribe to message changes for a specific thread
   */
  subscribeToMessages(threadId: string, callbacks: SubscriptionCallbacks): string {
    const channelName = `messages-${threadId}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `thread_id=eq.${threadId}`
          },
          (payload) => {
            console.log('Message change received:', payload);
            callbacks.onMessageChange?.(payload as RealtimePostgresChangesPayload<Message>);
          }
        )
        .subscribe((status) => {
          console.log('Message subscription status:', status);
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0;
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.(new Error('Message subscription failed'));
            this.handleReconnection(channelName, () => this.subscribeToMessages(threadId, callbacks));
          }
        });

      this.channels.set(channelName, channel);
      return channelName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(new SupabaseError(`Failed to subscribe to messages: ${errorMessage}`));
      throw error;
    }
  }

  /**
   * Subscribe to document changes for the current user
   */
  subscribeToDocuments(callbacks: SubscriptionCallbacks): string {
    const channelName = 'documents-subscription';
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
            filter: `user_id=eq.${this.getCurrentUserId()}`
          },
          (payload) => {
            console.log('Document change received:', payload);
            callbacks.onDocumentChange?.(payload as RealtimePostgresChangesPayload<Document>);
          }
        )
        .subscribe((status) => {
          console.log('Document subscription status:', status);
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0;
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.(new Error('Document subscription failed'));
            this.handleReconnection(channelName, () => this.subscribeToDocuments(callbacks));
          }
        });

      this.channels.set(channelName, channel);
      return channelName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(new SupabaseError(`Failed to subscribe to documents: ${errorMessage}`));
      throw error;
    }
  }

  /**
   * Subscribe to presence for a specific thread (who's online)
   */
  subscribeToPresence(threadId: string, callbacks: SubscriptionCallbacks): string {
    const channelName = `presence-${threadId}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Presence sync:', state);
          callbacks.onPresenceChange?.(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
          callbacks.onPresenceChange?.({ type: 'join', key, newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
          callbacks.onPresenceChange?.({ type: 'leave', key, leftPresences });
        })
        .subscribe(async (status) => {
          console.log('Presence subscription status:', status);
          if (status === 'SUBSCRIBED') {
            const user = await this.getCurrentUser();
            if (user) {
              await channel.track({
                user_id: user.id,
                username: user.email?.split('@')[0] || 'Anonymous',
                online_at: new Date().toISOString()
              } as PresenceState);
            }
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.(new Error('Presence subscription failed'));
          }
        });

      this.channels.set(channelName, channel);
      return channelName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(new SupabaseError(`Failed to subscribe to presence: ${errorMessage}`));
      throw error;
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnection(channelName: string, resubscribeFunction: () => void): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${channelName}`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect ${channelName} in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.isOnline) {
        this.unsubscribe(channelName);
        resubscribeFunction();
      }
    }, delay);
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('Connection restored, processing queued messages');
    this.isOnline = true;
    this.processMessageQueue();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('Connection lost, entering offline mode');
    this.isOnline = false;
  }

  /**
   * Add message to queue when offline
   */
  queueMessage(type: string, payload: any): void {
    if (!this.isOnline) {
      this.messageQueue.push({ type, payload });
      console.log('Message queued for offline processing');
    }
  }

  /**
   * Process queued messages when back online
   */
  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          // Process the queued message based on type
          await this.processQueuedMessage(message);
        } catch (error) {
          console.error('Error processing queued message:', error);
        }
      }
    }
  }

  /**
   * Process individual queued message
   */
  private async processQueuedMessage(message: { type: string; payload: any }): Promise<void> {
    switch (message.type) {
      case 'create_message':
        await supabase.from('messages').insert(message.payload);
        break;
      case 'update_thread':
        await supabase.from('threads').update(message.payload.updates).eq('id', message.payload.id);
        break;
      case 'create_document':
        await supabase.from('documents').insert(message.payload);
        break;
      default:
        console.warn('Unknown message type in queue:', message.type);
    }
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    // This should be implemented to get the current user ID
    // For now, we'll use a placeholder
    return 'current-user-id';
  }

  /**
   * Get current user
   */
  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    this.channels.forEach((channel, name) => {
      status[name] = channel.state;
    });
    return status;
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Get queued message count
   */
  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }
}