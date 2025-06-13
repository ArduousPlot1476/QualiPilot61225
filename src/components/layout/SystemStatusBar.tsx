import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useSync } from '../../hooks/useSync';
import { UserNavigation } from './UserNavigation';
import { SyncStatusIndicator } from '../ui/LoadingStates';
import { KeyboardShortcutButton } from '../ui/KeyboardShortcuts';
import { HelpCenterButton } from '../ui/HelpCenter';
import { TransitionWrapper } from '../ui/TransitionWrapper';

export const SystemStatusBar: React.FC = () => {
  const { complianceStatus, toggleSidebar } = useAppStore();
  const { isOnline, isSyncing, pendingCount, forceSync } = useSync();

  const criticalCount = complianceStatus.filter(s => s.status === 'critical').length;
  const warningCount = complianceStatus.filter(s => s.status === 'warning').length;
  const compliantCount = complianceStatus.filter(s => s.status === 'compliant').length;

  return (
    <div className="h-14 bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus-ring hover-scale"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-800">QualiPilot</span>
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

          {/* Compliance Status */}
          <div className="flex items-center space-x-4">
            <TransitionWrapper
              show={criticalCount > 0}
              enter="transition-all duration-300"
              enterFrom="opacity-0 scale-75"
              enterTo="opacity-100 scale-100"
            >
              {criticalCount > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-50 border border-red-200 hover-lift transition-all-300">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">{criticalCount}</span>
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
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 hover-lift transition-all-300">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">{warningCount}</span>
                </div>
              )}
            </TransitionWrapper>
            
            <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-50 border border-green-200 hover-lift transition-all-300">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">{compliantCount}</span>
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
                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 focus-ring hover-scale"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </TransitionWrapper>

          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>

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