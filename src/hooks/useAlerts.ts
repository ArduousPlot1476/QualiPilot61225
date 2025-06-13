import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { useAppStore } from '../store/appStore';
import { fetchInitialAlerts, markAlertAsReadInDB, createAlertInDB } from '../lib/realtime/alertSubscription';
import { useToast } from '../components/ui/Toast';
import { Alert } from '../types';

export const useAlerts = () => {
  const { user } = useAuth();
  const { alerts, addAlert, markAlertAsRead, deleteAlert } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Load initial alerts
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const initialAlerts = await fetchInitialAlerts(user.id);
        
        // Update the store with the fetched alerts
        initialAlerts.forEach(alert => {
          // Only add if not already in the store
          if (!alerts.some(a => a.id === alert.id)) {
            addAlert(alert);
          }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load alerts';
        setError(errorMessage);
        console.error('Error loading alerts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAlerts();
  }, [user, addAlert]);

  // Mark alert as read
  const markAsRead = async (alertId: string) => {
    try {
      // First update the UI optimistically
      markAlertAsRead(alertId);
      
      // Then update the database
      if (user) {
        await markAlertAsReadInDB(alertId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark alert as read';
      setError(errorMessage);
      console.error('Error marking alert as read:', err);
      
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not mark alert as read',
        duration: 3000
      });
    }
  };

  // Create a new alert
  const createAlert = async (alertData: {
    alert_type: 'regulatory_change' | 'compliance_deadline' | 'guidance_update';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cfr_references?: string[];
  }) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    try {
      await createAlertInDB(user.id, alertData);
      
      showToast({
        type: 'success',
        title: 'Alert Created',
        message: 'New alert has been created',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create alert';
      setError(errorMessage);
      console.error('Error creating alert:', err);
      
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not create alert',
        duration: 3000
      });
    }
  };

  // Get unread alerts count
  const getUnreadCount = (): number => {
    return alerts.filter(alert => !alert.isRead).length;
  };

  return {
    alerts,
    isLoading,
    error,
    markAsRead,
    createAlert,
    getUnreadCount
  };
};