import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, Bell, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { EmptyState } from '../../ui/EmptyState';
import { useAuth } from '../../auth/AuthProvider';
import { fetchInitialAlerts, markAlertAsReadInDB } from '../../../lib/realtime/alertSubscription';
import { useToast } from '../../ui/Toast';

export const AlertsTab: React.FC = () => {
  const { alerts, markAlertAsRead } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load alerts when component mounts
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const initialAlerts = await fetchInitialAlerts(user.id);
        
        // Update the store with the fetched alerts
        initialAlerts.forEach(alert => {
          // Only add if not already in the store
          if (!alerts.some(a => a.id === alert.id)) {
            useAppStore.getState().addAlert(alert);
          }
        });
      } catch (error) {
        console.error('Failed to load alerts:', error);
        showToast({
          type: 'error',
          title: 'Failed to Load Alerts',
          message: 'Could not retrieve your regulatory alerts',
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAlerts();
  }, [user, showToast]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // First update the UI optimistically
      markAlertAsRead(alertId);
      
      // Then update the database
      await markAlertAsReadInDB(alertId);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not mark alert as read',
        duration: 3000
      });
    }
  };

  // Get alert link based on alert type and content
  const getAlertLink = (alert: any) => {
    // If the alert has a source URL, use it
    if (alert.sourceUrl) {
      return alert.sourceUrl;
    }
    
    // Default links based on alert type
    const defaultLinks = {
      'regulatory_change': 'https://www.fda.gov/medical-devices/medical-device-safety',
      'compliance_deadline': 'https://www.fda.gov/medical-devices/how-study-and-market-your-device/device-advice-comprehensive-regulatory-assistance',
      'guidance_update': 'https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/guidance-documents-medical-devices-and-radiation-emitting-products'
    };

    // Check if the alert has CFR references
    if (alert.cfr_references && alert.cfr_references.length > 0) {
      const cfrRef = alert.cfr_references[0];
      if (cfrRef.includes('21 CFR 820')) {
        return 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820';
      }
      if (cfrRef.includes('21 CFR 807')) {
        return 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-807';
      }
    }

    // Check for specific keywords in the title or message
    const content = (alert.title + ' ' + alert.message).toLowerCase();
    if (content.includes('software validation')) {
      return 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-principles-software-validation';
    }
    if (content.includes('510(k)')) {
      return 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k';
    }
    if (content.includes('qms') || content.includes('quality management')) {
      return 'https://www.fda.gov/medical-devices/quality-and-compliance-medical-devices/quality-system-qs-regulationmedical-device-good-manufacturing-practices';
    }

    // Use default link based on alert type
    return defaultLinks[alert.alert_type] || 'https://www.fda.gov/medical-devices';
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="h-4 w-4 bg-slate-300 dark:bg-slate-600 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Alerts & Updates</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          {alerts.filter(a => !a.isRead).length} unread
        </span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alerts"
            description="You're all caught up! Alerts will appear here when there are regulatory updates or compliance issues."
          />
        ) : (
          alerts.map((alert) => {
            const alertLink = getAlertLink(alert);
            
            return (
              <div
                key={alert.id}
                className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
                  alert.isRead ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700' : getAlertColor(alert.type)
                }`}
                onClick={() => !alert.isRead && handleMarkAsRead(alert.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.type === 'warning' ? (
                      <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    ) : (
                      getAlertIcon(alert.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm leading-tight ${
                      alert.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      alert.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(alert.timestamp)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          alert.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {alert.severity}
                        </span>
                        <a 
                          href={alertLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Source
                        </a>
                      </div>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};