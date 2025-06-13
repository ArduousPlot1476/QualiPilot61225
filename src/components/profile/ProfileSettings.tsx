import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, MapPin, Shield, CheckCircle, AlertTriangle, Loader2, Lock, Edit2, Home } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/Toast';
import { useNavigate } from 'react-router-dom';

export const ProfileSettings: React.FC = () => {
  const { user, userProfile, updateProfile, updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    establishmentNumber: ''
  });
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Validation state
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Load user profile data
  useEffect(() => {
    if (userProfile?.company_info) {
      setProfileForm({
        companyName: userProfile.company_info.company_name || '',
        contactName: userProfile.company_info.contact_name || '',
        contactEmail: userProfile.company_info.contact_email || user?.email || '',
        contactPhone: userProfile.company_info.contact_phone || '',
        address: userProfile.company_info.address || '',
        establishmentNumber: userProfile.company_info.establishment_number || ''
      });
    }
  }, [userProfile, user]);
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileForm.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    if (!profileForm.contactName.trim()) {
      errors.contactName = 'Contact name is required';
    }
    
    if (!profileForm.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    if (!profileForm.address.trim()) {
      errors.address = 'Business address is required';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
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
  
  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setIsSavingProfile(true);
    
    try {
      await updateProfile({
        company_info: {
          company_name: profileForm.companyName,
          contact_name: profileForm.contactName,
          contact_email: profileForm.contactEmail,
          contact_phone: profileForm.contactPhone,
          address: profileForm.address,
          establishment_number: profileForm.establishmentNumber,
          // Preserve existing regulatory profile data
          ...(userProfile?.company_info?.onboarding_completed && {
            onboarding_completed: userProfile.company_info.onboarding_completed,
            device_info: userProfile.company_info.device_info,
            classification: userProfile.company_info.classification,
            regulatory_pathway: userProfile.company_info.regulatory_pathway,
            compliance_roadmap: userProfile.company_info.compliance_roadmap,
            onboarding_date: userProfile.company_info.onboarding_date
          })
        }
      });
      
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        duration: 3000
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update profile',
        duration: 5000
      });
    } finally {
      setIsSavingProfile(false);
    }
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
  
  // Navigate to home screen
  const handleReturnHome = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturnHome}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </button>
          <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
            {user?.email}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-600 text-xl font-bold">
                  {userProfile?.company_info?.company_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{userProfile?.company_info?.company_name || 'Your Company'}</h2>
                  <p className="text-teal-100">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="font-medium text-slate-900">{userProfile?.company_info?.company_name || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Contact</p>
                    <p className="font-medium text-slate-900">{userProfile?.company_info?.contact_name || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{userProfile?.company_info?.contact_email || user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{userProfile?.company_info?.contact_phone || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{userProfile?.company_info?.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <span className="text-sm font-medium text-slate-700">Account Status</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Company Profile</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center space-x-1"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            <div className="p-6">
              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                          profileErrors.companyName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {profileErrors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.companyName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        FDA Establishment Number (if applicable)
                      </label>
                      <input
                        type="text"
                        value={profileForm.establishmentNumber}
                        onChange={(e) => setProfileForm({...profileForm, establishmentNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., 1234567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.contactName}
                        onChange={(e) => setProfileForm({...profileForm, contactName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                          profileErrors.contactName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {profileErrors.contactName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.contactName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={profileForm.contactEmail}
                        onChange={(e) => setProfileForm({...profileForm, contactEmail: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                          profileErrors.contactEmail ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {profileErrors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.contactEmail}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.contactPhone}
                        onChange={(e) => setProfileForm({...profileForm, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., (123) 456-7890"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Business Address *
                      </label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none ${
                          profileErrors.address ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {profileErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.address}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      disabled={isSavingProfile}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Company Name</h3>
                      <p className="text-slate-900">{userProfile?.company_info?.company_name || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">FDA Establishment Number</h3>
                      <p className="text-slate-900">{userProfile?.company_info?.establishment_number || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Name</h3>
                      <p className="text-slate-900">{userProfile?.company_info?.contact_name || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Email</h3>
                      <p className="text-slate-900">{userProfile?.company_info?.contact_email || user?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Contact Phone</h3>
                      <p className="text-slate-900">{userProfile?.company_info?.contact_phone || 'Not specified'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Business Address</h3>
                      <p className="text-slate-900 whitespace-pre-line">{userProfile?.company_info?.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Security Settings Section */}
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
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                      
                      {passwordForm.newPassword && !passwordErrors.newPassword && (
                        <div className="mt-2">
                          <div className="flex space-x-1">
                            <div className={`h-1 flex-1 rounded ${passwordForm.newPassword.length >= 8 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            <div className={`h-1 flex-1 rounded ${/[a-z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            <div className={`h-1 flex-1 rounded ${/\d/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            <div className={`h-1 flex-1 rounded ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Strong passwords have at least 8 characters, uppercase, lowercase, numbers, and special characters</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
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
                <div className="space-y-4">
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
                  
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                    <User className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Account Information</h3>
                      <p className="text-sm text-slate-700 mt-1">
                        Email: {user?.email}<br />
                        Account created: {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};