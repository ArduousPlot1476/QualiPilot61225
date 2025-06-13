import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { KeyboardShortcutButton, useKeyboardShortcuts } from '../ui/KeyboardShortcuts';
import { HelpCenterButton } from '../ui/HelpCenter';
import { PrintStyles } from '../ui/PrintStyles';
import { useAppStore } from '../../store/appStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { setCurrentRoute } = useAppStore();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  // Update current route in store when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
    
    // Add page transition effect
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname, setCurrentRoute]);

  // Register global keyboard shortcuts
  useKeyboardShortcuts({
    'Alt+H': () => window.location.href = '/dashboard',
    'Alt+C': () => window.location.href = '/chat',
    'Alt+D': () => window.location.href = '/documents',
    'Alt+R': () => window.location.href = '/regulatory',
    'Alt+S': () => window.location.href = '/settings',
  });

  return (
    <ErrorBoundary>
      <div className="relative">
        {/* Print styles */}
        <PrintStyles />
        
        {/* Page transition overlay */}
        {isPageTransitioning && (
          <div 
            className="fixed inset-0 bg-white z-50 pointer-events-none animate-fade-out"
            style={{ animationDuration: '300ms' }}
            aria-hidden="true"
          />
        )}
        
        {/* Main content with transition */}
        <main 
          className={`transition-opacity duration-300 ${isPageTransitioning ? 'opacity-0' : 'opacity-100'}`}
          id="main-content"
        >
          {children}
        </main>
        
        {/* Global help buttons */}
        <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-2">
          <KeyboardShortcutButton className="bg-white shadow-md hover:shadow-lg" />
          <HelpCenterButton className="bg-white shadow-md hover:shadow-lg" />
        </div>
        
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-teal-600 text-white px-4 py-2 rounded-lg focus:outline-none"
        >
          Skip to content
        </a>
      </div>
    </ErrorBoundary>
  );
};