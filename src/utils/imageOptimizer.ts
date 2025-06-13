/**
 * Image optimization utility functions
 */

/**
 * Generate responsive image srcset
 * @param baseUrl Base URL of the image
 * @param widths Array of widths to generate
 * @param format Image format (webp, jpg, etc.)
 * @returns srcset string
 */
export function generateSrcSet(baseUrl: string, widths: number[], format: string = 'webp'): string {
  // Extract base path without extension
  const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('.'));
  
  return widths
    .map(width => `${basePath}-${width}w.${format} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints Object with breakpoint sizes
 * @returns sizes string
 */
export function generateSizes(breakpoints: {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  default: string;
}): string {
  const sizeEntries = [];
  
  if (breakpoints.sm) sizeEntries.push(`(max-width: 640px) ${breakpoints.sm}`);
  if (breakpoints.md) sizeEntries.push(`(max-width: 768px) ${breakpoints.md}`);
  if (breakpoints.lg) sizeEntries.push(`(max-width: 1024px) ${breakpoints.lg}`);
  if (breakpoints.xl) sizeEntries.push(`(max-width: 1280px) ${breakpoints.xl}`);
  
  sizeEntries.push(breakpoints.default);
  
  return sizeEntries.join(', ');
}

/**
 * Get WebP image URL from original URL
 * @param url Original image URL
 * @returns WebP image URL
 */
export function getWebPUrl(url: string): string {
  if (!url) return '';
  
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) return url;
  
  return url.substring(0, lastDotIndex) + '.webp';
}

/**
 * Get placeholder image URL (low quality)
 * @param url Original image URL
 * @returns Placeholder image URL
 */
export function getPlaceholderUrl(url: string): string {
  if (!url) return '';
  
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) return url;
  
  const extension = url.substring(lastDotIndex);
  return url.substring(0, lastDotIndex) + '-placeholder' + extension;
}

/**
 * Check if image is from Pexels
 * @param url Image URL
 * @returns boolean
 */
export function isPexelsImage(url: string): boolean {
  return url.includes('pexels.com') || url.includes('images.pexels.com');
}

/**
 * Get optimized Pexels image URL with specific dimensions
 * @param url Original Pexels URL
 * @param width Desired width
 * @param height Optional desired height
 * @returns Optimized Pexels URL
 */
export function getOptimizedPexelsUrl(url: string, width: number, height?: number): string {
  if (!isPexelsImage(url)) return url;
  
  // Pexels URLs can be modified to request specific dimensions
  // Format: https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg?auto=compress&cs=tinysrgb&w=WIDTH&h=HEIGHT
  
  const baseUrl = url.split('?')[0];
  const params = new URLSearchParams();
  
  params.append('auto', 'compress');
  params.append('cs', 'tinysrgb');
  params.append('w', width.toString());
  
  if (height) {
    params.append('h', height.toString());
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Create a responsive image component props
 * @param src Original image source
 * @param alt Alt text
 * @param widths Array of widths for srcset
 * @param sizes Sizes attribute
 * @returns Props for responsive image
 */
export function createResponsiveImageProps(
  src: string,
  alt: string,
  widths: number[] = [320, 640, 960, 1280],
  sizes: string = '100vw'
): {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  loading: 'lazy';
  width?: number;
  height?: number;
} {
  // For Pexels images, use their built-in resizing
  if (isPexelsImage(src)) {
    const srcSet = widths
      .map(width => `${getOptimizedPexelsUrl(src, width)} ${width}w`)
      .join(', ');
    
    return {
      src: getOptimizedPexelsUrl(src, 640),
      srcSet,
      sizes,
      alt,
      loading: 'lazy'
    };
  }
  
  // For other images, use WebP format if available
  const webpSrc = getWebPUrl(src);
  
  return {
    src,
    srcSet: generateSrcSet(src, widths),
    sizes,
    alt,
    loading: 'lazy'
  };
}