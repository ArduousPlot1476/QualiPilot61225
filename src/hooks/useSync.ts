import { useEffect, useState, useCallback } from 'react';
import { syncManager } from '../lib/sync/syncManager';
import { useToast } from '../components/ui/Toast';

interface SyncHookReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number;
  queueOperation: (
    type: 'create' | 'update' | 'delete',
    table: 'threads' | 'messages' | 'documents',
    data: any,
    optimisticId?: string
  ) => Promise<string>;
  forceSync: () => Promise<void>;
}

export const useSync = (): SyncHookReturn => {
  const [syncState, setSyncState] = useState(syncManager.getState());
  const { showToast, updateToast } = useToast();

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setSyncState);
    return unsubscribe;
  }, []);

  // Show connection status toasts
  useEffect(() => {
    let toastId: string | null = null;

    if (!syncState.isOnline) {
      toastId = showToast({
        type: 'warning',
        title: 'Working Offline',
        message: 'Changes will sync when connection is restored',
        duration: 0 // Don't auto-dismiss
      });
    } else if (toastId) {
      updateToast(toastId, {
        type: 'success',
        title: 'Back Online',
        message: 'Syncing your changes...',
        duration: 3000
      });
    }

    return () => {
      if (toastId) {
        // Toast will be dismissed automatically
      }
    };
  }, [syncState.isOnline, showToast, updateToast]);

  // Show sync status for pending operations
  useEffect(() => {
    if (syncState.pendingCount > 0 && syncState.isSyncing) {
      const toastId = showToast({
        type: 'info',
        title: 'Syncing Changes',
        message: `${syncState.pendingCount} operation${syncState.pendingCount > 1 ? 's' : ''} pending`,
        isLoading: true,
        duration: 0
      });

      // Update when sync completes
      const checkSyncComplete = () => {
        if (!syncManager.getState().isSyncing) {
          updateToast(toastId, {
            type: 'success',
            title: 'Sync Complete',
            message: 'All changes saved',
            isLoading: false,
            duration: 2000
          });
        } else {
          setTimeout(checkSyncComplete, 500);
        }
      };

      setTimeout(checkSyncComplete, 500);
    }
  }, [syncState.pendingCount, syncState.isSyncing, showToast, updateToast]);

  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    table: 'threads' | 'messages' | 'documents',
    data: any,
    optimisticId?: string
  ) => {
    try {
      return await syncManager.queueOperation(type, table, data, optimisticId);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sync Error',
        message: 'Failed to queue operation for sync',
        duration: 5000
      });
      throw error;
    }
  }, [showToast]);

  const forceSync = useCallback(async () => {
    try {
      await syncManager.forcSync();
      showToast({
        type: 'success',
        title: 'Sync Complete',
        message: 'All changes have been synchronized',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Unable to synchronize changes',
        duration: 5000
      });
    }
  }, [showToast]);

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingCount: syncState.pendingOperations.length,
    lastSyncTime: syncState.lastSyncTime,
    queueOperation,
    forceSync
  };
};