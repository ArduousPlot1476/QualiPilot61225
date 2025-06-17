import { supabase } from '../supabase/client';
import { useToast } from '../../components/ui/Toast';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'threads' | 'messages' | 'documents';
  data: any;
  timestamp: number;
  retryCount: number;
  optimisticId?: string;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: PendingOperation[];
  lastSyncTime: number;
}

// Define allowed columns for each table to prevent schema mismatches
const ALLOWED_COLUMNS = {
  threads: ['id', 'user_id', 'title', 'created_at', 'updated_at'],
  messages: ['id', 'thread_id', 'content', 'role', 'created_at', 'citations'],
  documents: ['id', 'user_id', 'title', 'type', 'status', 'content', 'metadata', 'created_at', 'template_id', 'generation_metadata', 'validation_results', 'compliance_report']
};

export class SyncManager {
  private static instance: SyncManager;
  private state: SyncState = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingOperations: [],
    lastSyncTime: 0
  };
  
  private listeners: Set<(state: SyncState) => void> = new Set();
  private syncInterval: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initializeIndexedDB();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Filter data to only include columns that exist in the database schema
  private filterDataForTable(table: 'threads' | 'messages' | 'documents', data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const allowedColumns = ALLOWED_COLUMNS[table];
    const filteredData: any = {};
    
    for (const key of Object.keys(data)) {
      if (allowedColumns.includes(key)) {
        filteredData[key] = data[key];
      }
    }
    
    return filteredData;
  }

  // IndexedDB initialization for offline storage
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QualiPilotSync', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadPendingOperations();
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pendingOperations')) {
          const store = db.createObjectStore('pendingOperations', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('table', 'table');
        }
      };
    });
  }

  private async loadPendingOperations(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['pendingOperations'], 'readonly');
    const store = transaction.objectStore('pendingOperations');
    const request = store.getAll();

    request.onsuccess = () => {
      this.state.pendingOperations = request.result || [];
      this.notifyListeners();
    };
  }

  private async savePendingOperation(operation: PendingOperation): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    await store.put(operation);
  }

  private async removePendingOperation(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    await store.delete(id);
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notifyListeners();
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notifyListeners();
    });

    // Page visibility for sync optimization
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.state.isOnline) {
        this.syncPendingOperations();
      }
    });
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && !this.state.isSyncing) {
        this.syncPendingOperations();
      }
    }, 30000); // Sync every 30 seconds
  }

  // Queue operation for sync
  async queueOperation(
    type: 'create' | 'update' | 'delete',
    table: 'threads' | 'messages' | 'documents',
    data: any,
    optimisticId?: string
  ): Promise<string> {
    // Filter data to match database schema
    const filteredData = this.filterDataForTable(table, data);
    
    const operation: PendingOperation = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      table,
      data: filteredData,
      timestamp: Date.now(),
      retryCount: 0,
      optimisticId
    };

    this.state.pendingOperations.push(operation);
    await this.savePendingOperation(operation);
    this.notifyListeners();

    // Try immediate sync if online
    if (this.state.isOnline) {
      this.debouncedSync();
    }

    return operation.id;
  }

  // Debounced sync to prevent excessive calls
  private debouncedSync = this.debounce(() => {
    this.syncPendingOperations();
  }, 300);

  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Main sync function
  private async syncPendingOperations(): Promise<void> {
    if (!this.state.isOnline || this.state.isSyncing || this.state.pendingOperations.length === 0) {
      return;
    }

    this.state.isSyncing = true;
    this.notifyListeners();

    const operationsToSync = [...this.state.pendingOperations];
    const successfulOperations: string[] = [];
    const failedOperations: PendingOperation[] = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeOperation(operation);
        successfulOperations.push(operation.id);
        await this.removePendingOperation(operation.id);
      } catch (error) {
        console.error('Sync operation failed:', error);
        
        operation.retryCount++;
        if (operation.retryCount < 3) {
          failedOperations.push(operation);
        } else {
          // Max retries reached, remove from queue
          await this.removePendingOperation(operation.id);
          this.notifyError(`Failed to sync ${operation.type} operation after 3 attempts`);
        }
      }
    }

    // Update pending operations
    this.state.pendingOperations = this.state.pendingOperations.filter(
      op => !successfulOperations.includes(op.id)
    );

    // Schedule retry for failed operations with exponential backoff
    if (failedOperations.length > 0) {
      const delay = Math.min(1000 * Math.pow(2, failedOperations[0].retryCount), 30000);
      this.retryTimeout = setTimeout(() => {
        this.syncPendingOperations();
      }, delay);
    }

    this.state.isSyncing = false;
    this.state.lastSyncTime = Date.now();
    this.notifyListeners();
  }

  private async executeOperation(operation: PendingOperation): Promise<any> {
    const { type, table, data } = operation;

    switch (table) {
      case 'threads':
        return this.executeThreadOperation(type, data);
      case 'messages':
        return this.executeMessageOperation(type, data);
      case 'documents':
        return this.executeDocumentOperation(type, data);
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  private async executeThreadOperation(type: string, data: any): Promise<any> {
    // Filter data to ensure only valid columns are used
    const filteredData = this.filterDataForTable('threads', data);
    
    switch (type) {
      case 'create':
        return supabase.from('threads').insert(filteredData).select().single();
      case 'update':
        const updateData = this.filterDataForTable('threads', data.updates || data);
        return supabase.from('threads').update(updateData).eq('id', data.id).select().single();
      case 'delete':
        return supabase.from('threads').delete().eq('id', data.id);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  private async executeMessageOperation(type: string, data: any): Promise<any> {
    // Filter data to ensure only valid columns are used
    const filteredData = this.filterDataForTable('messages', data);
    
    switch (type) {
      case 'create':
        return supabase.from('messages').insert(filteredData).select().single();
      case 'update':
        const updateData = this.filterDataForTable('messages', data.updates || data);
        return supabase.from('messages').update(updateData).eq('id', data.id).select().single();
      case 'delete':
        return supabase.from('messages').delete().eq('id', data.id);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  private async executeDocumentOperation(type: string, data: any): Promise<any> {
    // Filter data to ensure only valid columns are used
    const filteredData = this.filterDataForTable('documents', data);
    
    switch (type) {
      case 'create':
        return supabase.from('documents').insert(filteredData).select().single();
      case 'update':
        const updateData = this.filterDataForTable('documents', data.updates || data);
        return supabase.from('documents').update(updateData).eq('id', data.id).select().single();
      case 'delete':
        return supabase.from('documents').delete().eq('id', data.id);
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Public API
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): SyncState {
    return { ...this.state };
  }

  async forcSync(): Promise<void> {
    await this.syncPendingOperations();
  }

  getPendingCount(): number {
    return this.state.pendingOperations.length;
  }

  isOnline(): boolean {
    return this.state.isOnline;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private notifyError(message: string): void {
    // This would integrate with your toast system
    console.error('Sync error:', message);
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    if (this.db) {
      this.db.close();
    }
  }
}

export const syncManager = SyncManager.getInstance();