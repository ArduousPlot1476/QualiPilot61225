import React from 'react';

/**
 * Helper for lazy loading components with proper TypeScript types
 * @param factory Function that imports the component
 * @param name Name of the component to extract from the module
 * @returns Lazy loaded component
 */
export function lazyImport<
  T extends React.ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I
>(factory: () => Promise<I>, name: K): React.LazyExoticComponent<T> {
  return React.lazy(() => factory().then((module) => ({ default: module[name] })));
}

/**
 * Helper for lazy loading a default export component
 * @param factory Function that imports the component
 * @returns Lazy loaded component
 */
export function lazyLoadDefault<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}