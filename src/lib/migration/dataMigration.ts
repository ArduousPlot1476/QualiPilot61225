import { supabase, dbHelpers, SupabaseError } from '../supabase/client';
import { ChatMessage, ConversationThread, RegulatoryDocument, GeneratedDocument } from '../../types';

interface LocalStorageData {
  threads: ConversationThread[];
  messages: ChatMessage[];
  documents: RegulatoryDocument[];
  generatedDocs: GeneratedDocument[];
  userPreferences: any;
}

interface MigrationResult {
  success: boolean;
  migratedThreads: number;
  migratedMessages: number;
  migratedDocuments: number;
  errors: string[];
}

export class DataMigrationService {
  private static readonly BACKUP_KEY = 'qualipilot_backup';
  private static readonly MIGRATION_STATUS_KEY = 'qualipilot_migration_status';

  /**
   * Extract data from localStorage
   */
  static extractLocalStorageData(): LocalStorageData {
    try {
      const threads = JSON.parse(localStorage.getItem('qualipilot_threads') || '[]');
      const messages = JSON.parse(localStorage.getItem('qualipilot_messages') || '[]');
      const documents = JSON.parse(localStorage.getItem('qualipilot_documents') || '[]');
      const generatedDocs = JSON.parse(localStorage.getItem('qualipilot_generated_docs') || '[]');
      const userPreferences = JSON.parse(localStorage.getItem('qualipilot_preferences') || '{}');

      return {
        threads,
        messages,
        documents,
        generatedDocs,
        userPreferences
      };
    } catch (error) {
      console.error('Error extracting localStorage data:', error);
      return {
        threads: [],
        messages: [],
        documents: [],
        generatedDocs: [],
        userPreferences: {}
      };
    }
  }

  /**
   * Create backup of current localStorage data
   */
  static createBackup(): void {
    try {
      const data = this.extractLocalStorageData();
      const backup = {
        timestamp: new Date().toISOString(),
        data
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      console.log('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from backup
   */
  static restoreFromBackup(): boolean {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        console.warn('No backup found');
        return false;
      }

      const backup = JSON.parse(backupData);
      const { data } = backup;

      localStorage.setItem('qualipilot_threads', JSON.stringify(data.threads));
      localStorage.setItem('qualipilot_messages', JSON.stringify(data.messages));
      localStorage.setItem('qualipilot_documents', JSON.stringify(data.documents));
      localStorage.setItem('qualipilot_generated_docs', JSON.stringify(data.generatedDocs));
      localStorage.setItem('qualipilot_preferences', JSON.stringify(data.userPreferences));

      console.log('Data restored from backup successfully');
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Validate data before migration
   */
  static validateData(data: LocalStorageData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate threads
    if (!Array.isArray(data.threads)) {
      errors.push('Threads data is not an array');
    } else {
      data.threads.forEach((thread, index) => {
        if (!thread.id || !thread.title) {
          errors.push(`Thread at index ${index} is missing required fields`);
        }
      });
    }

    // Validate messages
    if (!Array.isArray(data.messages)) {
      errors.push('Messages data is not an array');
    } else {
      data.messages.forEach((message, index) => {
        if (!message.id || !message.content || !message.sender) {
          errors.push(`Message at index ${index} is missing required fields`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Migrate threads to Supabase
   */
  static async migrateThreads(threads: ConversationThread[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const thread of threads) {
      try {
        await dbHelpers.createThread(thread.title);
        success++;
      } catch (error) {
        const errorMessage = error instanceof SupabaseError ? error.message : 'Unknown error';
        errors.push(`Failed to migrate thread "${thread.title}": ${errorMessage}`);
      }
    }

    return { success, errors };
  }

  /**
   * Migrate messages to Supabase
   */
  static async migrateMessages(messages: ChatMessage[], threadMapping: Map<string, string>): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const message of messages) {
      try {
        // Find the corresponding thread ID in Supabase
        const supabaseThreadId = threadMapping.get(message.id) || threadMapping.values().next().value;
        
        if (!supabaseThreadId) {
          errors.push(`No thread mapping found for message: ${message.id}`);
          continue;
        }

        const role = message.sender === 'user' ? 'user' : 'assistant';
        const citations = message.citations || [];

        await dbHelpers.createMessage(supabaseThreadId, message.content, role, citations);
        success++;
      } catch (error) {
        const errorMessage = error instanceof SupabaseError ? error.message : 'Unknown error';
        errors.push(`Failed to migrate message: ${errorMessage}`);
      }
    }

    return { success, errors };
  }

  /**
   * Migrate documents to Supabase
   */
  static async migrateDocuments(documents: (RegulatoryDocument | GeneratedDocument)[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const doc of documents) {
      try {
        const docType = 'type' in doc ? doc.type : 'generated';
        const status = 'status' in doc ? doc.status : 'completed';
        const content = 'summary' in doc ? doc.summary : '';
        
        await dbHelpers.createDocument(
          doc.title,
          docType,
          content,
          {
            originalId: doc.id,
            migratedAt: new Date().toISOString()
          }
        );
        success++;
      } catch (error) {
        const errorMessage = error instanceof SupabaseError ? error.message : 'Unknown error';
        errors.push(`Failed to migrate document "${doc.title}": ${errorMessage}`);
      }
    }

    return { success, errors };
  }

  /**
   * Main migration function
   */
  static async migrateToSupabase(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedThreads: 0,
      migratedMessages: 0,
      migratedDocuments: 0,
      errors: []
    };

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to migrate data');
      }

      // Check if migration was already completed
      const migrationStatus = localStorage.getItem(this.MIGRATION_STATUS_KEY);
      if (migrationStatus === 'completed') {
        console.log('Migration already completed');
        result.success = true;
        return result;
      }

      // Create backup before migration
      this.createBackup();

      // Extract and validate data
      const localData = this.extractLocalStorageData();
      const validation = this.validateData(localData);

      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        return result;
      }

      // Migrate threads first
      const threadResult = await this.migrateThreads(localData.threads);
      result.migratedThreads = threadResult.success;
      result.errors.push(...threadResult.errors);

      // Get the created threads to map old IDs to new ones
      const supabaseThreads = await dbHelpers.getThreads();
      const threadMapping = new Map<string, string>();
      
      // Simple mapping - in a real scenario, you'd want more sophisticated mapping
      localData.threads.forEach((localThread, index) => {
        if (supabaseThreads[index]) {
          threadMapping.set(localThread.id, supabaseThreads[index].id);
        }
      });

      // Migrate messages
      const messageResult = await this.migrateMessages(localData.messages, threadMapping);
      result.migratedMessages = messageResult.success;
      result.errors.push(...messageResult.errors);

      // Migrate documents
      const allDocuments = [...localData.documents, ...localData.generatedDocs];
      const documentResult = await this.migrateDocuments(allDocuments);
      result.migratedDocuments = documentResult.success;
      result.errors.push(...documentResult.errors);

      // Mark migration as completed if successful
      if (result.errors.length === 0) {
        localStorage.setItem(this.MIGRATION_STATUS_KEY, 'completed');
        result.success = true;
        console.log('Migration completed successfully');
      } else {
        console.warn('Migration completed with errors:', result.errors);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Migration failed: ${errorMessage}`);
      console.error('Migration error:', error);
    }

    return result;
  }

  /**
   * Reset migration status (for testing purposes)
   */
  static resetMigrationStatus(): void {
    localStorage.removeItem(this.MIGRATION_STATUS_KEY);
    console.log('Migration status reset');
  }

  /**
   * Check if migration is needed
   */
  static isMigrationNeeded(): boolean {
    const migrationStatus = localStorage.getItem(this.MIGRATION_STATUS_KEY);
    const hasLocalData = localStorage.getItem('qualipilot_threads') || 
                        localStorage.getItem('qualipilot_messages') ||
                        localStorage.getItem('qualipilot_documents');
    
    return migrationStatus !== 'completed' && !!hasLocalData;
  }
}