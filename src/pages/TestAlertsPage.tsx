import React, { useState } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { createAlertInDB } from '../lib/realtime/alertSubscription';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { AlertTriangle, Bell, Shield, Info } from 'lucide-react';

export const TestAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [alertForm, setAlertForm] = useState({
    alert_type: 'regulatory_change' as 'regulatory_change' | 'compliance_deadline' | 'guidance_update',
    title: '',
    message: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    cfr_references: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setAlertForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'You must be logged in to create alerts',
        duration: 3000
      });
      return;
    }
    
    if (!alertForm.title || !alertForm.message) {
      showToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Title and message are required',
        duration: 3000
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Parse CFR references
      const cfr_references = alertForm.cfr_references
        ? alertForm.cfr_references.split(',').map(ref => ref.trim())
        : undefined;
      
      await createAlertInDB(user.id, {
        ...alertForm,
        cfr_references
      });
      
      showToast({
        type: 'success',
        title: 'Alert Created',
        message: 'New alert has been created successfully',
        duration: 3000
      });
      
      // Reset form
      setAlertForm({
        alert_type: 'regulatory_change',
        title: '',
        message: '',
        severity: 'medium',
        cfr_references: ''
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: error instanceof Error ? error.message : 'Failed to create alert',
        duration: 5000
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-teal-600 dark:text-teal-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Alerts System</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create test alerts to verify the real-time notification system
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleCreateAlert} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Alert Type
              </label>
              <select
                value={alertForm.alert_type}
                onChange={(e) => handleInputChange('alert_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="regulatory_change">Regulatory Change</option>
                <option value="compliance_deadline">Compliance Deadline</option>
                <option value="guidance_update">Guidance Update</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={alertForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Alert title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message
              </label>
              <textarea
                value={alertForm.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Alert message"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Severity
              </label>
              <select
                value={alertForm.severity}
                onChange={(e) => handleInputChange('severity', e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                CFR References (comma separated)
              </label>
              <input
                type="text"
                value={alertForm.cfr_references}
                onChange={(e) => handleInputChange('cfr_references', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g., 21 CFR 820.30, 21 CFR 820.40"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Create Alert
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Alert Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="font-medium text-slate-900 dark:text-white">Regulatory Change</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Updates to FDA regulations or guidance documents that affect your device
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                <h3 className="font-medium text-slate-900 dark:text-white">Compliance Deadline</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Upcoming deadlines for regulatory submissions or compliance activities
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="font-medium text-slate-900 dark:text-white">Guidance Update</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                New or updated FDA guidance documents relevant to your device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};