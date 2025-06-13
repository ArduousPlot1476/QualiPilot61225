import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions<T> {
  initialItems?: T[];
  batchSize?: number;
  loadMoreThreshold?: number;
  fetchItems: (offset: number, limit: number) => Promise<T[]>;
  totalCount?: number;
  dependencies?: any[];
}

interface UseLazyLoadingResult<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
}

export function useLazyLoading<T>({
  initialItems = [],
  batchSize = 10,
  loadMoreThreshold = 200,
  fetchItems,
  totalCount,
  dependencies = []
}: UseLazyLoadingOptions<T>): UseLazyLoadingResult<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialItems.length);
  const loadingRef = useRef(false);

  // Reset when dependencies change
  useEffect(() => {
    setItems(initialItems);
    setOffset(initialItems.length);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, dependencies);

  // Initial load if no items provided
  useEffect(() => {
    if (initialItems.length === 0) {
      loadMore();
    }
  }, []);

  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const newItems = await fetchItems(offset, batchSize);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setOffset(prev => prev + newItems.length);
        
        // Check if we've reached the total count
        if (totalCount !== undefined && offset + newItems.length >= totalCount) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load items'));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [offset, batchSize, hasMore, fetchItems, totalCount]);

  // Set up intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, {
      rootMargin: `0px 0px ${loadMoreThreshold}px 0px`
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [isLoading, hasMore, loadMore, loadMoreThreshold]);

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    error
  };
}