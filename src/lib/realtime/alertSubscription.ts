import { supabase } from '../supabase/client';
import { Alert } from '../../types';
import { useAppStore } from '../../store/appStore';

/**
 * Subscribes to real-time alerts from Supabase
 * @param userId The user ID to subscribe to alerts for
 * @returns A function to unsubscribe
 */
export const subscribeToAlerts = (userId: string): (() => void) => {
  if (!userId) {
    console.error('Cannot subscribe to alerts: No user ID provided');
    return () => {};
  }

  console.log('Subscribing to alerts for user:', userId);

  // Subscribe to the regulatory_alerts table for this user
  const subscription = supabase
    .channel('alerts-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'regulatory_alerts',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Alert change received:', payload);
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        // Get the store's addAlert, updateAlert, and deleteAlert functions
        const { addAlert, markAlertAsRead, deleteAlert } = useAppStore.getState();
        
        switch (eventType) {
          case 'INSERT':
            if (newRecord) {
              // Format the alert for the store
              const alert: Alert = {
                id: newRecord.id,
                type: mapAlertType(newRecord.alert_type),
                title: newRecord.title,
                message: newRecord.message,
                timestamp: new Date(newRecord.created_at),
                isRead: !!newRecord.read_at,
                severity: newRecord.severity,
                sourceUrl: newRecord.source_url // Add source URL to the alert
              };
              
              // Add the alert to the store
              addAlert(alert);
            }
            break;
            
          case 'UPDATE':
            if (newRecord && oldRecord) {
              // If the alert was marked as read
              if (newRecord.read_at && !oldRecord.read_at) {
                markAlertAsRead(oldRecord.id);
              }
              
              // Other updates could be handled here
            }
            break;
            
          case 'DELETE':
            if (oldRecord) {
              // Remove the alert from the store
              deleteAlert(oldRecord.id);
            }
            break;
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from alerts');
    supabase.removeChannel(subscription);
  };
};

/**
 * Maps the alert_type from the database to the type used in the UI
 */
function mapAlertType(dbType: string): 'warning' | 'critical' | 'info' {
  switch (dbType) {
    case 'regulatory_change':
      return 'critical';
    case 'compliance_deadline':
      return 'warning';
    case 'guidance_update':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Fetches initial alerts for a user
 */
export const fetchInitialAlerts = async (userId: string): Promise<Alert[]> => {
  if (!userId) {
    console.error('Cannot fetch alerts: No user ID provided');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('regulatory_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map the database records to Alert objects
    return (data || []).map(record => ({
      id: record.id,
      type: mapAlertType(record.alert_type),
      title: record.title,
      message: record.message,
      timestamp: new Date(record.created_at),
      isRead: !!record.read_at,
      severity: record.severity,
      sourceUrl: record.source_url // Include source URL in the mapped alert
    }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

/**
 * Marks an alert as read in the database
 */
export const markAlertAsReadInDB = async (alertId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('regulatory_alerts')
      .update({ read_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

/**
 * Creates a new alert in the database
 */
export const createAlertInDB = async (
  userId: string,
  alertData: {
    alert_type: 'regulatory_change' | 'compliance_deadline' | 'guidance_update';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cfr_references?: string[];
    source_url?: string; // Add source URL parameter
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('regulatory_alerts')
      .insert({
        user_id: userId,
        ...alertData,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};