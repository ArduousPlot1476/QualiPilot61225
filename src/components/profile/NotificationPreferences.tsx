import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  inApp: boolean;
  category: 'regulatory' | 'system' | 'marketing';
}

export const NotificationPreferences: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'regulatory_updates',
      name: 'Regulatory Updates',
      description: 'FDA regulatory changes and updates',
      email: true,
      inApp: true,
      category: 'regulatory'
    },
    {
      id: 'compliance_deadlines',
      name: 'Compliance Deadlines',
      description: 'Upcoming compliance deadlines and requirements',
      email: true,
      inApp: true,
      category: 'regulatory'
    },
    {
      id: 'document_generation',
      name: 'Document Generation',
      description: 'Notifications when documents are ready',
      email: true,
      inApp: true,
      category: 'system'
    },
    {
      id: 'chat_responses',
      name: 'Chat Responses',
      description: 'Notifications for AI assistant responses',
      email: false,
      inApp: true,
      category: 'system'
    },
    {
      id: 'product_updates',
      name: 'Product Updates',
      description: 'New features and improvements',
      email: false,
      inApp: true,
      category: 'marketing'
    },
    {
      id: 'promotional_offers',
      name: 'Promotional Offers',
      description: 'Special offers and discounts',
      email: false,
      inApp: false,
      category: 'marketing'
    }
  ]);
  
  const handleToggleEmail = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, email: !setting.email } : setting
      )
    );
  };
  
  const handleToggleInApp = (id: string) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, inApp: !setting.inApp } : setting
      )
    );
  };
  
  const handleSavePreferences = async () => {
    setIsSaving(true);
    
    try {
      // In a real implementation, this would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        type: 'success',
        title: 'Preferences Saved',
        message: 'Your notification preferences have been updated',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save notification preferences',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const regulatorySettings = notificationSettings.filter(s => s.category === 'regulatory');
  const systemSettings = notificationSettings.filter(s => s.category === 'system');
  const marketingSettings = notificationSettings.filter(s => s.category === 'marketing');
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-teal-600" />
          <h2 className="text-xl font-semibold text-slate-900">Notification Preferences</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Regulatory Notifications */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Regulatory Notifications</h3>
            
            <div className="space-y-4">
              {regulatorySettings.map(setting => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-medium text-slate-900">{setting.name}</h4>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.email}
                          onChange={() => handleToggleEmail(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">In-App</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.inApp}
                          onChange={() => handleToggleInApp(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* System Notifications */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">System Notifications</h3>
            
            <div className="space-y-4">
              {systemSettings.map(setting => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-medium text-slate-900">{setting.name}</h4>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.email}
                          onChange={() => handleToggleEmail(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">In-App</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.inApp}
                          onChange={() => handleToggleInApp(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Marketing Notifications */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Marketing Communications</h3>
            
            <div className="space-y-4">
              {marketingSettings.map(setting => (
                <div key={setting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-medium text-slate-900">{setting.name}</h4>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.email}
                          onChange={() => handleToggleEmail(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">In-App</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={setting.inApp}
                          onChange={() => handleToggleInApp(setting.id)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notification Delivery */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Notification Delivery</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Email Delivery</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Emails will be sent to: <span className="font-medium">{localStorage.getItem('userEmail') || 'your-email@example.com'}</span>
                  </p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Change email address
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">In-App Notifications</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    In-app notifications will appear in your notification center.
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Clear all notifications</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};