import { useState, useEffect } from 'react';

interface UseImagePreloadOptions {
  src: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface UseImagePreloadResult {
  isLoaded: boolean;
  isError: boolean;
  imageProps: {
    src: string;
    srcSet?: string;
    onLoad: () => void;
    onError: () => void;
  };
}

export function useImagePreload({
  src,
  srcSet,
  onLoad: externalOnLoad,
  onError: externalOnError
}: UseImagePreloadOptions): UseImagePreloadResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
  }, [src]);

  // Preload image
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    if (srcSet) {
      img.srcset = srcSet;
    }
    
    img.onload = () => {
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsLoaded(false);
      setIsError(true);
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, srcSet]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    if (externalOnLoad) externalOnLoad();
  };

  const handleError = () => {
    setIsLoaded(false);
    setIsError(true);
    if (externalOnError) externalOnError();
  };

  return {
    isLoaded,
    isError,
    imageProps: {
      src,
      srcSet,
      onLoad: handleLoad,
      onError: handleError
    }
  };
}