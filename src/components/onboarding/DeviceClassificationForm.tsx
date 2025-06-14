import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, ExternalLink, Info, Loader2 } from 'lucide-react';
import { RegulatoryIntelligenceService } from '../../lib/ai/regulatoryIntelligence';
import { useToast } from '../ui/Toast';

interface DeviceClassificationFormProps {
  onClassificationComplete: (classification: any) => void;
}

export const DeviceClassificationForm: React.FC<DeviceClassificationFormProps> = ({ 
  onClassificationComplete 
}) => {
  const [deviceName, setDeviceName] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any | null>(null);
  const [similarDevices, setSimilarDevices] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { showToast } = useToast();

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!deviceName.trim()) {
      errors.push('Device name is required');
    }
    
    if (!intendedUse.trim()) {
      errors.push('Intended use is required');
    }
    
    if (!deviceDescription.trim()) {
      errors.push('Device description is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleClassify = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    console.log('Starting device classification for:', deviceName);
    
    try {
      // Call the regulatory intelligence service to classify the device
      console.log('Calling RegulatoryIntelligenceService.getDeviceClassification with:', deviceName);
      const classification = await RegulatoryIntelligenceService.getDeviceClassification(deviceName);
      console.log('Classification result received:', classification);
      
      // Get similar devices
      console.log('Fetching predicate devices for product code:', classification.product_code);
      const predicates = await RegulatoryIntelligenceService.getPredicateDevices(classification.product_code);
      console.log('Predicate devices received:', predicates);
      
      setClassificationResult(classification);
      setSimilarDevices(predicates);
      
      // Notify parent component
      console.log('Calling onClassificationComplete with classification result');
      onClassificationComplete(classification);
      
      showToast({
        type: 'success',
        title: 'Classification Complete',
        message: `Device classified as Class ${classification.device_class}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Classification error:', error);
      showToast({
        type: 'error',
        title: 'Classification Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000
      });
    } finally {
      console.log('Classification process completed, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const getClassColor = (deviceClass: string) => {
    switch (deviceClass) {
      case 'I':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'II':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'III':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Please fix the following errors:</h4>
              <ul className="mt-1 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Device Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Device Name *
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Blood Glucose Meter, Cardiac Pacemaker"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Intended Use *
            </label>
            <textarea
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Describe the intended use of the device"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Device Description *
            </label>
            <textarea
              value={deviceDescription}
              onChange={(e) => setDeviceDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Provide a detailed description of the device"
              rows={4}
            />
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleClassify}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              id="classifyDeviceButton"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Classifying Device...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  <span>Classify Device</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {classificationResult && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-teal-600 dark:text-teal-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Classification Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassColor(classificationResult.device_class)}`}>
                  Class {classificationResult.device_class}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {classificationResult.submission_type}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Device Name:</p>
                  <p className="text-sm text-slate-900 dark:text-white">{classificationResult.device_name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Product Code:</p>
                  <p className="text-sm text-slate-900 dark:text-white">{classificationResult.product_code}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Regulation Number:</p>
                  <p className="text-sm text-slate-900 dark:text-white">{classificationResult.regulation_number}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Definition:</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{classificationResult.definition}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-slate-900 dark:text-white mb-3">Classification Details</h4>
              
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Class I Devices:</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Low risk devices subject to general controls. Most Class I devices are exempt from premarket notification.
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Class II Devices:</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Moderate risk devices subject to general and special controls. Most require 510(k) premarket notification.
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Class III Devices:</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    High risk devices subject to general controls and premarket approval (PMA). These devices usually sustain or support life, are implanted, or present potential unreasonable risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {similarDevices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-slate-900 dark:text-white mb-3">Similar Approved Devices</h4>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <ul className="space-y-2">
                  {similarDevices.slice(0, 5).map((device, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 dark:text-teal-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{device.device_name}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {device.k_number || 'No K-number'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {device.applicant || 'Unknown manufacturer'}
                          </span>
                          {device.clearance_date && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Cleared: {new Date(device.clearance_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <Info className="h-4 w-4" />
              <span>Classification based on FDA product classification database</span>
            </div>
            
            <a
              href={`https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm?ID=${classificationResult.product_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <span>View on FDA Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};