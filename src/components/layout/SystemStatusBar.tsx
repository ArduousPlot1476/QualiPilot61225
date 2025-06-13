import React, { useEffect, useState } from 'react';
import { Bot, AlertTriangle, CheckCircle, Clock, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useSync } from '../../hooks/useSync';
import { UserNavigation } from './UserNavigation';
import { SyncStatusIndicator } from '../ui/LoadingStates';
import { KeyboardShortcutButton } from '../ui/KeyboardShortcuts';
import { HelpCenterButton } from '../ui/HelpCenter';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';

export const SystemStatusBar: React.FC = () => {
  const { complianceStatus, toggleSidebar, alerts } = useAppStore();
  const { isOnline, isSyncing, pendingCount, forceSync } = useSync();
  const { user } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Count unread alerts
  useEffect(() => {
    const unreadCount = alerts.filter(alert => !alert.isRead).length;
    setUnreadAlerts(unreadCount);
  }, [alerts]);

  const criticalCount = complianceStatus.filter(s => s.status === 'critical').length;
  const warningCount = complianceStatus.filter(s => s.status === 'warning').length;
  const compliantCount = complianceStatus.filter(s => s.status === 'compliant').length;

  return (
    <div className="h-14 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus-ring hover-scale"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-teal-600 dark:text-teal-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">QualiPilot</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Sync Status */}
          <SyncStatusIndicator 
            isOnline={isOnline}
            isSyncing={isSyncing}
            pendingCount={pendingCount}
          />

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>

          {/* Alerts Status */}
          <div className="flex items-center space-x-4">
            <TransitionWrapper
              show={unreadAlerts > 0}
              enter="transition-all duration-300"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
            >
              {unreadAlerts > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover-lift transition-all-300">
                  <Bot className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">{unreadAlerts}</span>
                </div>
              )}
            </TransitionWrapper>
            
            <TransitionWrapper
              show={warningCount > 0}
              enter="transition-all duration-300"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
            >
              {warningCount > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 hover-lift transition-all-300">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">{warningCount}</span>
                </div>
              )}
            </TransitionWrapper>
            
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 hover-lift transition-all-300">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">{compliantCount}</span>
            </div>
          </div>

          {/* Manual Sync Button */}
          <TransitionWrapper
            show={pendingCount > 0}
            enter="transition-all duration-300"
            enterFrom="opacity-0 scale-75"
            enterTo="opacity-100 scale-100"
          >
            {pendingCount > 0 && (
              <button
                onClick={forceSync}
                disabled={isSyncing}
                className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200 disabled:opacity-50 focus-ring hover-scale"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </TransitionWrapper>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Help & Keyboard Shortcuts */}
          <div className="flex items-center space-x-2">
            <KeyboardShortcutButton />
            <HelpCenterButton />
          </div>

          <UserNavigation />
        </div>
      </div>
    </div>
  );
};