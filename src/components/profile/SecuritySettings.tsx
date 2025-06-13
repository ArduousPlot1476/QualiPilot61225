import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/Toast';

export const SecuritySettings: React.FC = () => {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^A-Za-z0-9]/)) strength += 20;
    
    return strength;
  };
  
  const getStrengthLabel = (strength: number): string => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };
  
  const getStrengthColor = (strength: number): string => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one special character';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSavingPassword(true);
    
    try {
      await updatePassword(passwordForm.newPassword);
      
      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully changed',
        duration: 3000
      });
      
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Password Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update password',
        duration: 5000
      });
    } finally {
      setIsSavingPassword(false);
    }
  };
  
  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Security Settings</h2>
        {!isChangingPassword && (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
          >
            <Lock className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
                
                {passwordForm.newPassword && !passwordErrors.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Strong passwords have at least 8 characters, uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordErrors({});
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={isSavingPassword}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Password & Security</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your password was last changed on June 10, 2024.
                  We recommend changing your password regularly for security.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Two-Factor Authentication</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Two-factor authentication is not enabled on your account. Enable it for additional security.
                </p>
                <button className="mt-2 px-3 py-1.5 bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-300 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Security Recommendations</h3>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Strong Password</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Your password meets our security requirements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Enable Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Recent Login Activity</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    No suspicious login activity detected.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-4">Login History</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Today, 10:45 AM</p>
                    <p className="text-xs text-slate-500">Chrome on Windows • 192.168.1.1</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Current
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Yesterday, 3:20 PM</p>
                    <p className="text-xs text-slate-500">Safari on macOS • 192.168.1.2</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">
                    Successful
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">June 10, 2024, 9:15 AM</p>
                    <p className="text-xs text-slate-500">Firefox on Windows • 192.168.1.3</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">
                    Successful
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};