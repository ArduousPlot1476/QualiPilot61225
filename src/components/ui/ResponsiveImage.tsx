import React, { useState, useEffect } from 'react';
import { createResponsiveImageProps, getPlaceholderUrl } from '../../utils/imageOptimizer';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  widths?: number[];
  sizes?: string;
  usePlaceholder?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  widths = [320, 640, 960, 1280],
  sizes = '100vw',
  usePlaceholder = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

  // Get responsive image props
  const imageProps = createResponsiveImageProps(src, alt, widths, sizes);
  
  // Add width and height if provided
  if (width) imageProps.width = width;
  if (height) imageProps.height = height;

  // Load placeholder image if needed
  useEffect(() => {
    if (usePlaceholder) {
      setPlaceholderSrc(getPlaceholderUrl(src));
    }
  }, [src, usePlaceholder]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: width && height ? `${width}/${height}` : 'auto' }}>
      {/* Placeholder or blur-up image */}
      {usePlaceholder && placeholderSrc && !isLoaded && !isError && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm transition-opacity duration-300"
          style={{ opacity: isLoaded ? 0 : 0.5 }}
        />
      )}
      
      {/* Main image */}
      <img
        {...imageProps}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
      )}
      
      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};