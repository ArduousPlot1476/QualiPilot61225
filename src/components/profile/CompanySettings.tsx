import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Shield, AlertTriangle, CheckCircle, Edit2, Home } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/Toast';

export const CompanySettings: React.FC = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    establishmentNumber: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  // Load company data
  useEffect(() => {
    if (userProfile?.company_info) {
      setCompanyForm({
        companyName: userProfile.company_info.company_name || '',
        establishmentNumber: userProfile.company_info.establishment_number || '',
        contactName: userProfile.company_info.contact_name || '',
        contactEmail: userProfile.company_info.contact_email || user?.email || '',
        contactPhone: userProfile.company_info.contact_phone || '',
        address: userProfile.company_info.address || ''
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (field: string, value: string) => {
    setCompanyForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCompany = async () => {
    try {
      await updateProfile({
        company_info: {
          ...userProfile?.company_info,
          company_name: companyForm.companyName,
          establishment_number: companyForm.establishmentNumber,
          contact_name: companyForm.contactName,
          contact_email: companyForm.contactEmail,
          contact_phone: companyForm.contactPhone,
          address: companyForm.address
        }
      });
      
      setIsEditing(false);
      
      showToast({
        type: 'success',
        title: 'Company Updated',
        message: 'Company information has been updated successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating company:', error);
      
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update company information',
        duration: 5000
      });
    }
  };

  const handleLaunchWizard = () => {
    navigate('/onboarding');
  };

  // Navigate to home screen
  const handleReturnHome = () => {
    navigate('/dashboard');
  };

  const hasRegulatoryProfile = userProfile?.company_info?.onboarding_completed || false;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Company Settings</h1>
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                  {userProfile?.company_info?.company_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{userProfile?.company_info?.company_name || 'Your Company'}</h2>
                  <p className="text-blue-100">{user?.email}</p>
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
                  <Shield className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Regulatory Status</p>
                    <p className="font-medium text-slate-900">
                      {hasRegulatoryProfile ? 'Profile Configured' : 'Not Configured'}
                    </p>
                  </div>
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
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center space-x-1"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCompany(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyForm.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        FDA Establishment Number (if applicable)
                      </label>
                      <input
                        type="text"
                        value={companyForm.establishmentNumber}
                        onChange={(e) => handleInputChange('establishmentNumber', e.target.value)}
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
                        value={companyForm.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={companyForm.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={companyForm.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., (123) 456-7890"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Business Address *
                      </label>
                      <textarea
                        value={companyForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Save Changes
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
          
          {/* Regulatory Profile Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Regulatory Profile</h2>
            </div>
            
            <div className="p-6">
              {hasRegulatoryProfile ? (
                <div className="space-y-6">
                  {/* Device Information */}
                  <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-6 w-6 text-teal-600" />
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {userProfile?.company_info?.device_info?.name} - Class {userProfile?.company_info?.classification?.device_class}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {userProfile?.company_info?.regulatory_pathway} Pathway
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-teal-500" />
                          <h5 className="font-medium text-slate-900">Product Code</h5>
                        </div>
                        <p className="text-sm text-slate-600">
                          {userProfile?.company_info?.device_info?.productCode || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-teal-500" />
                          <h5 className="font-medium text-slate-900">Regulation</h5>
                        </div>
                        <p className="text-sm text-slate-600">
                          {userProfile?.company_info?.device_info?.regulationNumber || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-teal-500" />
                          <h5 className="font-medium text-slate-900">Setup Date</h5>
                        </div>
                        <p className="text-sm text-slate-600">
                          {userProfile?.company_info?.onboarding_date 
                            ? new Date(userProfile.company_info.onboarding_date).toLocaleDateString() 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleLaunchWizard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Update Regulatory Profile</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Compliance Roadmap Summary */}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Compliance Roadmap</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Applicable Regulations</h4>
                        <ul className="space-y-1">
                          {userProfile?.company_info?.compliance_roadmap?.applicableRegulations?.slice(0, 3).map((reg: string, index: number) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start">
                              <CheckCircle className="h-3 w-3 text-teal-500 mt-1 mr-2 flex-shrink-0" />
                              <span>{reg}</span>
                            </li>
                          ))}
                          {(userProfile?.company_info?.compliance_roadmap?.applicableRegulations?.length || 0) > 3 && (
                            <li className="text-sm text-slate-600">
                              <span className="text-blue-600">+{(userProfile?.company_info?.compliance_roadmap?.applicableRegulations?.length || 0) - 3} more</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Required Standards</h4>
                        <ul className="space-y-1">
                          {userProfile?.company_info?.compliance_roadmap?.requiredStandards?.slice(0, 3).map((std: string, index: number) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start">
                              <CheckCircle className="h-3 w-3 text-teal-500 mt-1 mr-2 flex-shrink-0" />
                              <span>{std}</span>
                            </li>
                          ))}
                          {(userProfile?.company_info?.compliance_roadmap?.requiredStandards?.length || 0) > 3 && (
                            <li className="text-sm text-slate-600">
                              <span className="text-blue-600">+{(userProfile?.company_info?.compliance_roadmap?.requiredStandards?.length || 0) - 3} more</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => navigate('/documents')}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        View Document Templates
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 mb-2">Regulatory Profile Not Configured</h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        Your regulatory profile has not been set up yet. Complete the Regulatory Onboarding Wizard to 
                        configure your device's regulatory information and get a customized compliance roadmap.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                              <Shield className="h-4 w-4 text-teal-500 mr-2" />
                              Device Classification
                            </h4>
                            <p className="text-sm text-slate-600">
                              Determine your device's FDA classification
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 text-teal-500 mr-2" />
                              Regulatory Pathway
                            </h4>
                            <p className="text-sm text-slate-600">
                              Identify the appropriate submission pathway
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleLaunchWizard}
                          className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Shield className="h-5 w-5" />
                          <span>Launch Regulatory Onboarding Wizard</span>
                        </button>
                      </div>
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