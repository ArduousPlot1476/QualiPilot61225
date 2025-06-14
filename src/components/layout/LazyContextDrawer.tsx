import React, { lazy, Suspense, useEffect } from 'react';
import { X, Loader2, Bell } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { useAlerts } from '../../hooks/useAlerts';

// Lazy load the tab contents
const SourcesTab = lazy(() => import('./tabs/SourcesTab').then(module => ({ default: module.SourcesTab })));
const DocumentsTab = lazy(() => import('./tabs/DocumentsTab').then(module => ({ default: module.DocumentsTab })));
const AlertsTab = lazy(() => import('./tabs/AlertsTab').then(module => ({ default: module.AlertsTab })));

export const LazyContextDrawer: React.FC = () => {
  const { 
    contextDrawerOpen, 
    toggleContextDrawer, 
    activeContextTab,
    setActiveContextTab
  } = useAppStore();
  
  const { getUnreadCount } = useAlerts();
  const unreadAlertCount = getUnreadCount();

  const tabs = [
    { id: 'sources', label: 'Sources' },
    { id: 'documents', label: 'Generated' },
    { id: 'alerts', label: 'Alerts' }
  ] as const;

  return (
    <aside className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Context</h2>
        <button
          onClick={toggleContextDrawer}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 focus-ring hover-scale"
          title="Close context drawer"
          aria-label="Close context drawer"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Tab Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeContextTab === tab.id;
            const showBadge = tab.id === 'alerts' && unreadAlertCount > 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveContextTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium border-b-2 transition-all duration-200 focus-ring ${
                  isActive
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
              >
                <span>{tab.label}</span>
                {showBadge && (
                  <TransitionWrapper
                    show={true}
                    enter="transition-all duration-300"
                    enterFrom="opacity-0 scale-75"
                    enterTo="opacity-100 scale-100"
                  >
                    <span className="bg-red-500 dark:bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                    </span>
                  </TransitionWrapper>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" role="tabpanel" id={`panel-${activeContextTab}`}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-teal-500 dark:text-teal-400 animate-spin" />
          </div>
        }>
          <TransitionWrapper
            show={activeContextTab === 'sources'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmountOnExit={false}
          >
            {activeContextTab === 'sources' && <SourcesTab />}
          </TransitionWrapper>
          
          <TransitionWrapper
            show={activeContextTab === 'documents'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmountOnExit={false}
          >
            {activeContextTab === 'documents' && <DocumentsTab />}
          </TransitionWrapper>
          
          <TransitionWrapper
            show={activeContextTab === 'alerts'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmountOnExit={false}
          >
            {activeContextTab === 'alerts' && <AlertsTab />}
          </TransitionWrapper>
        </Suspense>
      </div>
    </aside>
  );
};