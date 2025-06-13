import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
  loadMoreThreshold?: number;
  onLoadMore?: () => void;
  initialScrollIndex?: number;
}

interface UseVirtualScrollResult {
  virtualItems: Array<{ index: number; start: number; size: number; }>;
  totalHeight: number;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  startIndex: number;
  endIndex: number;
  isScrolling: boolean;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  overscan = 10,
  loadMoreThreshold = 10,
  onLoadMore,
  initialScrollIndex
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
  );

  // Create virtual items
  const virtualItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemHeight,
      size: itemHeight
    });
  }

  // Total height of all items
  const totalHeight = itemCount * itemHeight;

  // Scroll to index
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    if (containerRef.current) {
      const top = Math.max(0, index * itemHeight);
      containerRef.current.scrollTo({
        top,
        behavior
      });
    }
  }, [itemHeight]);

  // Initialize with initial scroll index
  useEffect(() => {
    if (initialScrollIndex !== undefined) {
      scrollToIndex(initialScrollIndex);
    }
  }, [initialScrollIndex, scrollToIndex]);

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      
      setScrollTop(scrollTop);
      setViewportHeight(viewportHeight);
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
      
      // Set new timeout
      scrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Check if we need to load more items
      if (onLoadMore && itemCount - endIndex <= loadMoreThreshold) {
        onLoadMore();
      }
    };

    // Initial measurement
    setViewportHeight(container.clientHeight);

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
      container.removeEventListener('scroll', handleScroll);
    };
  }, [endIndex, itemCount, loadMoreThreshold, onLoadMore]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    containerRef,
    startIndex,
    endIndex,
    isScrolling
  };
}