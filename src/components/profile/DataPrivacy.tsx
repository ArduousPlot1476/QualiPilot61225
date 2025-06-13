import React, { useState } from 'react';
import { Download, Trash2, Lock, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/Toast';

export const DataPrivacy: React.FC = () => {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would fetch user data from Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock data export
      const userData = {
        profile: {
          email: user?.email,
          created_at: user?.created_at,
          last_sign_in: user?.last_sign_in_at
        },
        company_info: {
          name: 'Your Company',
          contact: 'John Doe',
          address: '123 Main St, Anytown, USA'
        },
        conversations: [
          {
            id: '1',
            title: 'FDA 510(k) Requirements',
            messages: [
              { role: 'user', content: 'What are the requirements for a 510(k) submission?' },
              { role: 'assistant', content: 'The 510(k) submission requires...' }
            ]
          }
        ],
        documents: [
          {
            id: '1',
            title: 'Quality Manual',
            type: 'QMS',
            created_at: '2024-06-01T12:00:00Z'
          }
        ]
      };
      
      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qualipilot-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export your data',
        duration: 5000
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast({
        type: 'error',
        title: 'Confirmation Required',
        message: 'Please type DELETE to confirm account deletion',
        duration: 3000
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // In a real implementation, this would delete the user account from Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast({
        type: 'success',
        title: 'Account Deleted',
        message: 'Your account has been permanently deleted',
        duration: 3000
      });
      
      // Sign out the user
      await signOut();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Could not delete your account',
        duration: 5000
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Lock className="h-6 w-6 text-teal-600" />
          <h2 className="text-xl font-semibold text-slate-900">Data & Privacy</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Data Export */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Data Export</h3>
            <p className="text-sm text-slate-600 mb-4">
              Download a copy of your data, including profile information, conversation history, and generated documents.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </>
              )}
            </button>
          </div>
          
          {/* Data Retention */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Data Retention</h3>
            <p className="text-sm text-slate-600 mb-4">
              We retain your data for as long as your account is active. You can delete specific data or your entire account at any time.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Conversation History</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Your conversation history with the AI assistant is stored securely.
                  </p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Clear Conversation History
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Generated Documents</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Documents generated by the system are stored in your account.
                  </p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                    Manage Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Deletion */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Account Deletion</h3>
            <p className="text-sm text-slate-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {showDeleteConfirm ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Confirm Account Deletion</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="DELETE"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            )}
          </div>
          
          {/* Privacy Policy */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Privacy Policy</h3>
            <p className="text-sm text-slate-600">
              We take your privacy seriously. Read our privacy policy to understand how we collect, use, and protect your data.
            </p>
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center mt-2">
              View Privacy Policy
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};