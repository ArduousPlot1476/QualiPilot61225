import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';

export const AlertsTab: React.FC = () => {
  const { alerts, markAlertAsRead } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="h-4 w-4 bg-slate-300 rounded-full mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-slate-300 rounded mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-2/3 bg-slate-200 rounded mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
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
        <h3 className="text-lg font-semibold text-slate-900">Alerts & Updates</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {alerts.filter(a => !a.isRead).length} unread
        </span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No alerts</p>
            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
                alert.isRead ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : getAlertColor(alert.type)
              }`}
              onClick={() => !alert.isRead && markAlertAsRead(alert.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {alert.type === 'warning' ? (
                    <Clock className="h-4 w-4 text-amber-500" />
                  ) : (
                    getAlertIcon(alert.type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-sm leading-tight ${
                    alert.isRead ? 'text-slate-700' : 'text-slate-900'
                  }`}>
                    {alert.title}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    alert.isRead ? 'text-slate-500' : 'text-slate-700'
                  }`}>
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(alert.timestamp)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};