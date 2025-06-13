import React, { useState } from 'react';
import { Building, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface CompanyInformationFormProps {
  initialData?: any;
  onSave: (data: any) => void;
}

const ANNUAL_REVENUE_OPTIONS = [
  'Under $1M',
  '$1M - $5M',
  '$5M - $25M',
  '$25M - $100M',
  'Over $100M'
];

const EMPLOYEE_COUNT_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+'
];

const QMS_STATUS_OPTIONS = [
  'No QMS in place',
  'QMS in development',
  'ISO 13485 certified',
  'FDA registered QMS',
  'Other certification'
];

const CERTIFICATION_OPTIONS = [
  'ISO 13485',
  'ISO 14971',
  'IEC 62304',
  'ISO 27001',
  'MDSAP',
  'CE Marking',
  'Health Canada License'
];

export const CompanyInformationForm: React.FC<CompanyInformationFormProps> = ({ 
  initialData = {}, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    legalName: initialData.legalName || '',
    dunsNumber: initialData.dunsNumber || '',
    annualRevenue: initialData.annualRevenue || '',
    employeeCount: initialData.employeeCount || '',
    qmsStatus: initialData.qmsStatus || '',
    priorSubmissions: initialData.priorSubmissions || '',
    certifications: initialData.certifications || [],
    contactName: initialData.contactName || '',
    contactEmail: initialData.contactEmail || '',
    contactPhone: initialData.contactPhone || '',
    address: initialData.address || '',
    establishmentNumber: initialData.establishmentNumber || ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dunsValidated, setDunsValidated] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear DUNS validation when the number changes
    if (field === 'dunsNumber') {
      setDunsValidated(false);
    }
  };

  const handleCertificationChange = (certification: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      certifications: checked
        ? [...prev.certifications, certification]
        : prev.certifications.filter(c => c !== certification)
    }));
  };

  const validateDUNS = () => {
    // Simple validation: DUNS should be 9 digits
    const dunsRegex = /^\d{9}$/;
    const isValid = dunsRegex.test(formData.dunsNumber);
    
    if (isValid) {
      setDunsValidated(true);
      showToast({
        type: 'success',
        title: 'DUNS Validated',
        message: 'DUNS number format is valid',
        duration: 3000
      });
    } else {
      setDunsValidated(false);
      showToast({
        type: 'error',
        title: 'Invalid DUNS',
        message: 'DUNS number should be 9 digits',
        duration: 5000
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.legalName) errors.push('Legal company name is required');
    if (!formData.dunsNumber) errors.push('DUNS number is required');
    if (!formData.annualRevenue) errors.push('Annual revenue range is required');
    if (!formData.employeeCount) errors.push('Employee count is required');
    if (!formData.qmsStatus) errors.push('QMS status is required');
    if (!formData.contactName) errors.push('Primary contact name is required');
    if (!formData.contactEmail) errors.push('Primary contact email is required');
    if (!validateEmail(formData.contactEmail)) errors.push('Invalid email format');
    if (!formData.address) errors.push('Business address is required');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      showToast({
        type: 'success',
        title: 'Information Saved',
        message: 'Company information has been saved',
        duration: 3000
      });
    } else {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before proceeding',
        duration: 5000
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="h-6 w-6 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-900">Company Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Legal Company Name *
            </label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter legal company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              DUNS Number *
            </label>
            <div className="flex">
              <input
                type="text"
                value={formData.dunsNumber}
                onChange={(e) => handleInputChange('dunsNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  dunsValidated 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-slate-300'
                }`}
                placeholder="Enter 9-digit DUNS number"
              />
              <button
                type="button"
                onClick={validateDUNS}
                className="px-3 py-2 bg-slate-100 border border-slate-300 border-l-0 rounded-r-lg hover:bg-slate-200 transition-colors"
              >
                Validate
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Data Universal Numbering System (DUNS) is a unique identifier for businesses
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual Revenue Range *
            </label>
            <select
              value={formData.annualRevenue}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select annual revenue</option>
              {ANNUAL_REVENUE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employee Count *
            </label>
            <select
              value={formData.employeeCount}
              onChange={(e) => handleInputChange('employeeCount', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select employee count</option>
              {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quality Management System Status *
            </label>
            <select
              value={formData.qmsStatus}
              onChange={(e) => handleInputChange('qmsStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select QMS status</option>
              {QMS_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prior FDA Submissions
            </label>
            <input
              type="text"
              value={formData.priorSubmissions}
              onChange={(e) => handleInputChange('priorSubmissions', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., K123456, P123456, or None"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certifications
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CERTIFICATION_OPTIONS.map((certification) => (
                <label key={certification} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certifications.includes(certification)}
                    onChange={(e) => handleCertificationChange(certification, e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700">{certification}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Primary Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter contact name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                formData.contactEmail && !validateEmail(formData.contactEmail)
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300'
              }`}
              placeholder="Enter contact email"
            />
            {formData.contactEmail && !validateEmail(formData.contactEmail) && (
              <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter contact phone"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              FDA Establishment Number (if registered)
            </label>
            <input
              type="text"
              value={formData.establishmentNumber}
              onChange={(e) => handleInputChange('establishmentNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter FDA establishment number"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter complete business address"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Save Company Information</span>
        </button>
      </div>
    </form>
  );
};