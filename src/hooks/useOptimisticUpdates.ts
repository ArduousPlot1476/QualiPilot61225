import React, { useState, useCallback, useRef } from 'react';
import { useSync } from './useSync';
import { useToast } from '../components/ui/Toast';

interface OptimisticState<T> {
  data: T[];
  optimisticItems: Map<string, T>;
  pendingOperations: Map<string, 'create' | 'update' | 'delete'>;
}

interface UseOptimisticUpdatesReturn<T> {
  data: T[];
  createItem: (item: Omit<T, 'id'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  isOptimistic: (id: string) => boolean;
  isPending: (id: string) => boolean;
  rollbackItem: (id: string) => void;
}

export function useOptimisticUpdates<T extends { id: string }>(
  initialData: T[],
  table: 'threads' | 'messages' | 'documents'
): UseOptimisticUpdatesReturn<T> {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    optimisticItems: new Map(),
    pendingOperations: new Map()
  });
  
  const { queueOperation } = useSync();
  const { showToast } = useToast();
  const rollbackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update state when initialData changes (e.g., from props)
  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      data: initialData
    }));
  }, [initialData]);

  // Combine real data with optimistic updates
  const combinedData = React.useMemo(() => {
    // Start with real data that isn't being modified
    const realData = state.data.filter(item => !state.optimisticItems.has(item.id) && 
      !state.pendingOperations.get(item.id)?.includes('delete'));
    
    // Add optimistic items that aren't being deleted
    const optimisticData = Array.from(state.optimisticItems.values())
      .filter(item => !state.pendingOperations.get(item.id)?.includes('delete'));
    
    return [...realData, ...optimisticData];
  }, [state.data, state.optimisticItems, state.pendingOperations]);

  const createItem = useCallback(async (item: Omit<T, 'id'>): Promise<string> => {
    const optimisticId = `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticItem = { ...item, id: optimisticId } as T;

    // Add optimistic item immediately
    setState(prev => ({
      ...prev,
      optimisticItems: new Map(prev.optimisticItems).set(optimisticId, optimisticItem),
      pendingOperations: new Map(prev.pendingOperations).set(optimisticId, 'create')
    }));

    try {
      // Queue for sync - the sync manager will handle the actual API call
      await queueOperation('create', table, item, optimisticId);

      // Set rollback timeout
      const timeoutId = setTimeout(() => {
        rollbackItem(optimisticId);
        showToast({
          type: 'error',
          title: 'Sync Timeout',
          message: 'Item creation timed out and was rolled back',
          duration: 5000
        });
      }, 30000); // 30 second timeout

      rollbackTimeouts.current.set(optimisticId, timeoutId);

      // Return the optimistic ID so the caller can use it
      return optimisticId;

    } catch (error) {
      // Rollback on immediate failure
      rollbackItem(optimisticId);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create item',
        duration: 5000
      });
      throw error;
    }
  }, [queueOperation, table, showToast]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    // Don't make API calls for optimistic items - they don't exist in the database yet
    if (id.startsWith('optimistic_')) {
      // Just update the optimistic item locally
      const existingItem = state.optimisticItems.get(id);
      if (existingItem) {
        const updatedItem = { ...existingItem, ...updates };
        setState(prev => ({
          ...prev,
          optimisticItems: new Map(prev.optimisticItems).set(id, updatedItem)
        }));
      }
      return;
    }

    const existingItem = state.data.find(item => item.id === id) || 
                        state.optimisticItems.get(id);
    
    if (!existingItem) {
      throw new Error('Item not found');
    }

    const updatedItem = { ...existingItem, ...updates };

    // Apply optimistic update
    setState(prev => ({
      ...prev,
      optimisticItems: new Map(prev.optimisticItems).set(id, updatedItem),
      pendingOperations: new Map(prev.pendingOperations).set(id, 'update')
    }));

    try {
      await queueOperation('update', table, { id, updates }, id);

      // Set rollback timeout
      const timeoutId = setTimeout(() => {
        rollbackItem(id);
        showToast({
          type: 'error',
          title: 'Sync Timeout',
          message: 'Item update timed out and was rolled back',
          duration: 5000
        });
      }, 30000);

      rollbackTimeouts.current.set(id, timeoutId);

    } catch (error) {
      rollbackItem(id);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update item',
        duration: 5000
      });
      throw error;
    }
  }, [state.data, state.optimisticItems, queueOperation, table, showToast]);

  const deleteItem = useCallback(async (id: string) => {
    // Don't make API calls for optimistic items - they don't exist in the database yet
    if (id.startsWith('optimistic_')) {
      // Just remove the optimistic item locally
      setState(prev => {
        const newOptimisticItems = new Map(prev.optimisticItems);
        const newPendingOperations = new Map(prev.pendingOperations);
        
        newOptimisticItems.delete(id);
        newPendingOperations.delete(id);

        return {
          ...prev,
          optimisticItems: newOptimisticItems,
          pendingOperations: newPendingOperations
        };
      });
      return;
    }

    // Mark as pending delete (hide from UI)
    setState(prev => ({
      ...prev,
      pendingOperations: new Map(prev.pendingOperations).set(id, 'delete')
    }));

    try {
      await queueOperation('delete', table, { id }, id);

      // Set rollback timeout
      const timeoutId = setTimeout(() => {
        rollbackItem(id);
        showToast({
          type: 'error',
          title: 'Sync Timeout',
          message: 'Item deletion timed out and was rolled back',
          duration: 5000
        });
      }, 30000);

      rollbackTimeouts.current.set(id, timeoutId);

    } catch (error) {
      rollbackItem(id);
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete item',
        duration: 5000
      });
      throw error;
    }
  }, [queueOperation, table, showToast]);

  const isOptimistic = useCallback((id: string) => {
    return state.optimisticItems.has(id);
  }, [state.optimisticItems]);

  const isPending = useCallback((id: string) => {
    return state.pendingOperations.has(id);
  }, [state.pendingOperations]);

  const rollbackItem = useCallback((id: string) => {
    setState(prev => {
      const newOptimisticItems = new Map(prev.optimisticItems);
      const newPendingOperations = new Map(prev.pendingOperations);
      
      newOptimisticItems.delete(id);
      newPendingOperations.delete(id);

      return {
        ...prev,
        optimisticItems: newOptimisticItems,
        pendingOperations: newPendingOperations
      };
    });

    // Clear timeout
    const timeoutId = rollbackTimeouts.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      rollbackTimeouts.current.delete(id);
    }
  }, []);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      rollbackTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    data: combinedData,
    createItem,
    updateItem,
    deleteItem,
    isOptimistic,
    isPending,
    rollbackItem
  };
}