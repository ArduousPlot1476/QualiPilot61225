import { supabase } from '../supabase/client';

export interface ChatStreamResponse {
  type: 'content' | 'complete' | 'error';
  content?: string;
  fullContent?: string;
  citations?: any[];
  confidence?: string;
  retrievedDocs?: number;
  messageId?: string;
  error?: string;
  metadata?: {
    processingTime?: number;
    searchType?: 'semantic' | 'keyword' | 'hybrid';
  };
}

export interface ChatServiceOptions {
  onChunk?: (chunk: ChatStreamResponse) => void;
  onComplete?: (response: ChatStreamResponse) => void;
  onError?: (error: string) => void;
  signal?: AbortSignal;
  roadmapData?: any; // Add roadmap data parameter
}

export class ChatService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regulatory-chat`;

  static async sendMessage(
    threadId: string,
    message: string,
    options: ChatServiceOptions = {}
  ): Promise<void> {
    const { onChunk, onComplete, onError, signal, roadmapData } = options;

    // Wrap the entire function in a Promise to ensure it always resolves or rejects
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        // Check if thread exists before sending message
        if (threadId !== '1') { // Skip check for default mock thread
          const { data: thread, error: threadError } = await supabase
            .from('threads')
            .select('id')
            .eq('id', threadId)
            .single();
            
          if (threadError) {
            console.error('Thread check error:', threadError);
            throw new Error('Thread not found or access denied');
          }
        }

        const response = await fetch(this.FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            threadId,
            message,
            roadmapData, // Include roadmap data in the request
          }),
          signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        // Process Server-Sent Events stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'content' && onChunk) {
                    onChunk(data);
                  } else if (data.type === 'complete' && onComplete) {
                    onComplete(data);
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
          
          // Stream completed successfully
          resolve();
        } catch (streamError) {
          // Handle stream processing errors
          reject(streamError);
        } finally {
          reader.releaseLock();
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Chat service error:', errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        // Ensure the promise is rejected with the error
        reject(error);
      }
    });
  }

  static async getConversationHistory(threadId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch conversation history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  static async createThread(title: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('threads')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Create thread error:', error);
        throw new Error(`Failed to create thread: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  static async updateThreadTitle(threadId: string, title: string) {
    try {
      const { data, error } = await supabase
        .from('threads')
        .update({ title })
        .eq('id', threadId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update thread title: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating thread title:', error);
      throw error;
    }
  }

  static async updateThreadSaved(threadId: string, isSaved: boolean) {
    try {
      const { data, error } = await supabase
        .from('threads')
        .update({ is_saved: isSaved })
        .eq('id', threadId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update thread saved status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating thread saved status:', error);
      throw error;
    }
  }

  static async deleteThread(threadId: string) {
    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        throw new Error(`Failed to delete thread: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }

  /**
   * Search regulatory documents using RAG
   */
  static async searchRegulations(query: string, options: {
    maxResults?: number;
    similarityThreshold?: number;
  } = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('search-regulations', {
        body: {
          query,
          maxResults: options.maxResults || 5,
          similarityThreshold: options.similarityThreshold || 0.7
        }
      });

      if (error) {
        throw new Error(`Regulation search failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error searching regulations:', error);
      throw error;
    }
  }

  /**
   * Get specific CFR section
   */
  static async getCFRSection(title: number, part: number, section?: string) {
    try {
      let query = supabase
        .from('regulatory_documents')
        .select('*')
        .eq('cfr_title', title)
        .eq('cfr_part', part);

      if (section) {
        query = query.eq('cfr_section', section);
      }

      const { data, error } = await query.order('cfr_section');

      if (error) {
        throw new Error(`CFR lookup failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching CFR section:', error);
      throw error;
    }
  }

  /**
   * Sync eCFR data (admin function)
   */
  static async synceCFRData() {
    try {
      const { data, error } = await supabase.functions.invoke('ecfr-sync', {
        body: {}
      });

      if (error) {
        throw new Error(`eCFR sync failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error syncing eCFR data:', error);
      throw error;
    }
  }
}