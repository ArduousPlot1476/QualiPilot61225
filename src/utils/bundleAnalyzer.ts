/**
 * Bundle size analysis utilities
 * 
 * This file provides utilities to analyze and optimize bundle size.
 * It's used during development and build time to identify large dependencies
 * and opportunities for code splitting.
 */

/**
 * Log imported module sizes
 * @param modules Object with module names and sizes
 */
export function logModuleSizes(modules: Record<string, number>): void {
  console.group('Module Sizes (KB)');
  
  const sortedModules = Object.entries(modules)
    .sort(([, sizeA], [, sizeB]) => sizeB - sizeA);
  
  sortedModules.forEach(([name, size]) => {
    const sizeKB = (size / 1024).toFixed(2);
    const sizeColor = size > 50 * 1024 ? 'red' : size > 20 * 1024 ? 'orange' : 'green';
    
    console.log(
      `%c${name}: %c${sizeKB} KB`,
      'color: black',
      `color: ${sizeColor}; font-weight: bold`
    );
  });
  
  console.groupEnd();
}

/**
 * Analyze bundle size
 * This is a development utility to help identify large dependencies
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('Bundle analysis is only available in development mode');
  
  // Example module sizes (in bytes)
  const moduleSizes = {
    'react': 143000,
    'react-dom': 1100000,
    'zustand': 17000,
    '@supabase/supabase-js': 120000,
    'lucide-react': 85000,
    'react-router-dom': 30000
  };
  
  logModuleSizes(moduleSizes);
  
  console.log('\nRecommendations:');
  console.log('1. Use dynamic imports for route-based code splitting');
  console.log('2. Lazy load components that are not immediately visible');
  console.log('3. Consider smaller alternatives for large dependencies');
}

/**
 * Check if a module should be dynamically imported
 * @param moduleName Name of the module
 * @returns Whether the module should be dynamically imported
 */
export function shouldDynamicImport(moduleName: string): boolean {
  const largeModules = [
    '@supabase/supabase-js',
    'chart.js',
    'pdf-lib',
    'react-pdf',
    'react-markdown'
  ];
  
  return largeModules.some(name => moduleName.includes(name));
}

/**
 * Get recommended chunk size for a module
 * @param moduleName Name of the module
 * @returns Recommended chunk size in KB
 */
export function getRecommendedChunkSize(moduleName: string): number {
  // Default chunk size: 100KB
  const defaultSize = 100;
  
  const sizeMap: Record<string, number> = {
    'ui': 50,
    'auth': 30,
    'chat': 80,
    'documents': 120,
    'regulatory': 150
  };
  
  for (const [key, size] of Object.entries(sizeMap)) {
    if (moduleName.includes(key)) {
      return size;
    }
  }
  
  return defaultSize;
}