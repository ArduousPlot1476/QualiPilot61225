import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Shield, AlertTriangle, CheckCircle, Edit2, Home, Upload, FileText, Download, Clock } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [roadmapFile, setRoadmapFile] = useState<File | null>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      
      // Check if there's already roadmap data
      if (userProfile.company_info.roadmap_data) {
        setRoadmapData(userProfile.company_info.roadmap_data);
      }
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
  
  // Handle roadmap file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRoadmapFile(e.target.files[0]);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleUploadRoadmap = async () => {
    if (!roadmapFile) {
      showToast({
        type: 'warning',
        title: 'No File Selected',
        message: 'Please select a roadmap JSON file to upload',
        duration: 3000
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Read the file content
      const fileContent = await roadmapFile.text();
      let parsedData;
      
      try {
        parsedData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON file. Please upload a valid roadmap file.');
      }
      
      // Validate the file has expected structure
      if (!parsedData.companyInfo || !parsedData.deviceInfo || !parsedData.classification) {
        throw new Error('Invalid roadmap file format. Missing required data.');
      }
      
      // Store the roadmap data in the user profile
      await updateProfile({
        company_info: {
          ...userProfile?.company_info,
          roadmap_data: parsedData,
          onboarding_completed: true,
          regulatory_profile_completed: true,
          device_info: parsedData.deviceInfo,
          classification: parsedData.classification,
          regulatory_pathway: parsedData.pathway?.name || parsedData.pathway,
          compliance_roadmap: parsedData.regulatoryOverview || parsedData.roadmap
        }
      });
      
      setRoadmapData(parsedData);
      setRoadmapFile(null);
      
      showToast({
        type: 'success',
        title: 'Roadmap Uploaded',
        message: 'Regulatory roadmap has been uploaded and saved to your profile',
        duration: 3000
      });
    } catch (error) {
      console.error('Error uploading roadmap:', error);
      
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload roadmap file',
        duration: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDownloadRoadmap = () => {
    if (!roadmapData) return;
    
    const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-roadmap-${roadmapData.deviceInfo?.name || 'device'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Roadmap Downloaded',
      message: 'Regulatory roadmap has been downloaded',
      duration: 3000
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Settings</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturnHome}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </button>
          <div className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full text-sm font-medium">
            {user?.email}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-500 text-xl font-bold">
                  {userProfile?.company_info?.company_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{userProfile?.company_info?.company_name || 'Your Company'}</h2>
                  <p className="text-blue-100 dark:text-blue-200">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                    <p className="font-medium text-slate-900 dark:text-white">{userProfile?.company_info?.company_name || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Regulatory Status</p>
                    <p className="font-medium text-slate-900 dark:text-white">
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Company Profile</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/50 transition-colors flex items-center space-x-1"
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
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyForm.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        FDA Establishment Number (if applicable)
                      </label>
                      <input
                        type="text"
                        value={companyForm.establishmentNumber}
                        onChange={(e) => handleInputChange('establishmentNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., 1234567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={companyForm.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={companyForm.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={companyForm.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., (123) 456-7890"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Business Address *
                      </label>
                      <textarea
                        value={companyForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Company Name</h3>
                      <p className="text-slate-900 dark:text-white">{userProfile?.company_info?.company_name || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">FDA Establishment Number</h3>
                      <p className="text-slate-900 dark:text-white">{userProfile?.company_info?.establishment_number || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Name</h3>
                      <p className="text-slate-900 dark:text-white">{userProfile?.company_info?.contact_name || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Email</h3>
                      <p className="text-slate-900 dark:text-white">{userProfile?.company_info?.contact_email || user?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Phone</h3>
                      <p className="text-slate-900 dark:text-white">{userProfile?.company_info?.contact_phone || 'Not specified'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Business Address</h3>
                      <p className="text-slate-900 dark:text-white whitespace-pre-line">{userProfile?.company_info?.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Regulatory Profile Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Regulatory Profile</h2>
            </div>
            
            <div className="p-6">
              {hasRegulatoryProfile ? (
                <div className="space-y-6">
                  {/* Device Information */}
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {userProfile?.company_info?.device_info?.name} - Class {userProfile?.company_info?.classification?.device_class}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userProfile?.company_info?.regulatory_pathway} Pathway
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                          <h5 className="font-medium text-slate-900 dark:text-white">Product Code</h5>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userProfile?.company_info?.device_info?.productCode || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                          <h5 className="font-medium text-slate-900 dark:text-white">Regulation</h5>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userProfile?.company_info?.device_info?.regulationNumber || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                          <h5 className="font-medium text-slate-900 dark:text-white">Setup Date</h5>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {userProfile?.company_info?.onboarding_date 
                            ? new Date(userProfile.company_info.onboarding_date).toLocaleDateString() 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleLaunchWizard}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Update Regulatory Profile</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Roadmap Upload/Download Section */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Regulatory Roadmap</h3>
                    
                    {roadmapData ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900 dark:text-green-100">Roadmap Available</h4>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Your regulatory roadmap for {roadmapData.deviceInfo?.name || 'your device'} is available.
                              </p>
                              <div className="mt-3">
                                <button
                                  onClick={handleDownloadRoadmap}
                                  className="px-3 py-1.5 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center space-x-1 text-sm"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download Roadmap</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Update Roadmap</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                            You can upload a new roadmap JSON file to update your regulatory profile.
                          </p>
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".json"
                              className="hidden"
                            />
                            <button
                              onClick={handleUploadClick}
                              className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center space-x-1 text-sm"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Select File</span>
                            </button>
                            {roadmapFile && (
                              <button
                                onClick={handleUploadRoadmap}
                                disabled={isUploading}
                                className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Upload</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {roadmapFile && (
                            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                              Selected file: {roadmapFile.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">No Roadmap Available</h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                You haven't uploaded a regulatory roadmap yet. You can upload a roadmap JSON file that was exported from the Regulatory Onboarding Wizard.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Upload Roadmap</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Upload a regulatory roadmap JSON file to add it to your profile.
                          </p>
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".json"
                              className="hidden"
                            />
                            <button
                              onClick={handleUploadClick}
                              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-sm"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Select File</span>
                            </button>
                            {roadmapFile && (
                              <button
                                onClick={handleUploadRoadmap}
                                disabled={isUploading}
                                className="px-3 py-1.5 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Upload</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {roadmapFile && (
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                              Selected file: {roadmapFile.name}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Don't have a roadmap yet?</p>
                            <button
                              onClick={handleLaunchWizard}
                              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                              Create with Regulatory Wizard
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Regulatory Profile Not Configured</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                        Your regulatory profile has not been set up yet. Complete the Regulatory Onboarding Wizard to 
                        configure your device's regulatory information and get a customized compliance roadmap.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                              <Shield className="h-4 w-4 text-teal-500 dark:text-teal-400 mr-2" />
                              Device Classification
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Determine your device's FDA classification
                            </p>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 text-teal-500 dark:text-teal-400 mr-2" />
                              Regulatory Pathway
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Identify the appropriate submission pathway
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Upload Existing Roadmap</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            If you have a previously exported roadmap JSON file, you can upload it here.
                          </p>
                          <div className="flex items-center space-x-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".json"
                              className="hidden"
                            />
                            <button
                              onClick={handleUploadClick}
                              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-sm"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Select File</span>
                            </button>
                            {roadmapFile && (
                              <button
                                onClick={handleUploadRoadmap}
                                disabled={isUploading}
                                className="px-3 py-1.5 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Upload</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {roadmapFile && (
                            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                              Selected file: {roadmapFile.name}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleLaunchWizard}
                          className="w-full px-4 py-3 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2"
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