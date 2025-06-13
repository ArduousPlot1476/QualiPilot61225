import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ToastProvider } from './components/ui/Toast';
import { AppRoutes } from './routes';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;