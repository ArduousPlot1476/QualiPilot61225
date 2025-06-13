import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/animations.css';
import { reportWebVitals } from './utils/performance.ts';

// Create root and render app
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Measure performance in development
if (process.env.NODE_ENV === 'development') {
  reportWebVitals();
}

// Register keyboard shortcut for help
document.addEventListener('keydown', (e) => {
  if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    // Don't trigger when typing in input fields
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    
    // Dispatch custom event to open help
    const helpEvent = new CustomEvent('openHelpCenter');
    document.dispatchEvent(helpEvent);
  }
  
  // Toggle theme with Alt+Z
  if (e.key === 'z' && e.altKey && !e.ctrlKey && !e.metaKey) {
    // Don't trigger when typing in input fields
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    
    // Dispatch custom event to toggle theme
    const themeEvent = new CustomEvent('toggleTheme');
    document.dispatchEvent(themeEvent);
  }
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);