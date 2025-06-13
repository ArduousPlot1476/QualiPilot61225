import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Loader2, Settings, Eye, Clock, Shield } from 'lucide-react';
import { DocumentGeneratorService, DocumentGenerationRequest, DocumentTemplate, ValidationResult } from '../../lib/ai/documentGenerator';
import { useToast } from '../ui/Toast';

export const DocumentGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<Partial<DocumentGenerationRequest>>({
    deviceClassification: 'Class II',
    regulatoryPathway: '510(k)',
    deviceType: '',
    intendedUse: '',
    companyInfo: {
      name: '',
      address: '',
      contact: ''
    },
    complianceFramework: ['21 CFR 820']
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const { showToast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadGenerationHistory();
  }, []);

  useEffect(() => {
    if (formData.deviceClassification && formData.regulatoryPathway) {
      loadCompatibleTemplates();
    }
  }, [formData.deviceClassification, formData.regulatoryPathway]);

  const loadTemplates = async () => {
    try {
      const templateList = await DocumentGeneratorService.getAvailableTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to load templates:', error);
      showToast({
        type: 'error',
        title: 'Template Loading Failed',
        message: 'Could not load document templates',
        duration: 5000
      });
    }
  };

  const loadCompatibleTemplates = async () => {
    if (!formData.deviceClassification || !formData.regulatoryPathway) return;

    try {
      const compatibleTemplates = await DocumentGeneratorService.getCompatibleTemplates(
        formData.deviceClassification,
        formData.regulatoryPathway
      );
      setTemplates(compatibleTemplates);
      
      // Reset selected template if it's not compatible
      if (selectedTemplate && !compatibleTemplates.find(t => t.id === selectedTemplate)) {
        setSelectedTemplate('');
      }
    } catch (error) {
      console.error('Failed to load compatible templates:', error);
    }
  };

  const loadGenerationHistory = async () => {
    try {
      const history = await DocumentGeneratorService.getGenerationHistory();
      setGenerationHistory(history);
    } catch (error) {
      console.error('Failed to load generation history:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('companyInfo.')) {
      const companyField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          [companyField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFrameworkChange = (framework: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      complianceFramework: checked
        ? [...(prev.complianceFramework || []), framework]
        : (prev.complianceFramework || []).filter(f => f !== framework)
    }));
  };

  const validateForm = async () => {
    if (!selectedTemplate) {
      showToast({
        type: 'warning',
        title: 'Template Required',
        message: 'Please select a document template',
        duration: 3000
      });
      return;
    }

    const request: DocumentGenerationRequest = {
      ...formData as DocumentGenerationRequest,
      templateType: selectedTemplate
    };

    try {
      const validationResult = await DocumentGeneratorService.validateRequirements(request);
      setValidation(validationResult);

      if (!validationResult.isValid) {
        showToast({
          type: 'error',
          title: 'Validation Failed',
          message: `${validationResult.errors.length} error(s) found`,
          duration: 5000
        });
      } else if (validationResult.warnings.length > 0) {
        showToast({
          type: 'warning',
          title: 'Validation Warnings',
          message: `${validationResult.warnings.length} warning(s) found`,
          duration: 5000
        });
      } else {
        showToast({
          type: 'success',
          title: 'Validation Passed',
          message: 'All requirements validated successfully',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Could not validate requirements',
        duration: 5000
      });
    }
  };

  const generateDocument = async () => {
    if (!validation?.isValid) {
      await validateForm();
      return;
    }

    const request: DocumentGenerationRequest = {
      ...formData as DocumentGenerationRequest,
      templateType: selectedTemplate
    };

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationMessage('Initializing document generation...');

    try {
      await DocumentGeneratorService.generateDocument(request, {
        onProgress: (progress) => {
          setGenerationProgress(progress.progress || 0);
          setGenerationMessage(progress.message || '');
        },
        onComplete: (result) => {
          setIsGenerating(false);
          setGenerationProgress(100);
          setGenerationMessage('Document generated successfully!');
          
          showToast({
            type: 'success',
            title: 'Document Generated',
            message: 'Your document has been generated successfully',
            duration: 5000
          });

          // Refresh history
          loadGenerationHistory();
        },
        onError: (error) => {
          setIsGenerating(false);
          showToast({
            type: 'error',
            title: 'Generation Failed',
            message: error,
            duration: 5000
          });
        }
      });
    } catch (error) {
      setIsGenerating(false);
      console.error('Generation error:', error);
    }
  };

  const downloadDocument = async (documentId: string) => {
    try {
      const blob = await DocumentGeneratorService.downloadDocument(documentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Download Started',
        message: 'Document download has started',
        duration: 3000
      });
    } catch (error) {
      console.error('Download error:', error);
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download document',
        duration: 5000
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Generator</h2>
              <p className="text-slate-600">
                Generate FDA-compliant regulatory documents for medical devices
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium text-slate-700">FDA Compliant</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Generate Document
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Generation History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'generate' ? (
            <div className="space-y-8">
              {/* Device Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Device Classification *
                    </label>
                    <select
                      value={formData.deviceClassification}
                      onChange={(e) => handleInputChange('deviceClassification', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="Class I">Class I</option>
                      <option value="Class II">Class II</option>
                      <option value="Class III">Class III</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Regulatory Pathway *
                    </label>
                    <select
                      value={formData.regulatoryPathway}
                      onChange={(e) => handleInputChange('regulatoryPathway', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="510(k)">510(k) Premarket Notification</option>
                      <option value="PMA">PMA (Premarket Approval)</option>
                      <option value="De Novo">De Novo Classification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Device Type *
                    </label>
                    <input
                      type="text"
                      value={formData.deviceType}
                      onChange={(e) => handleInputChange('deviceType', e.target.value)}
                      placeholder="e.g., Cardiac Pacemaker, Blood Glucose Meter"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Intended Use *
                    </label>
                    <textarea
                      value={formData.intendedUse}
                      onChange={(e) => handleInputChange('intendedUse', e.target.value)}
                      placeholder="Describe the intended use of the device"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyInfo?.name}
                      onChange={(e) => handleInputChange('companyInfo.name', e.target.value)}
                      placeholder="Your company name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={formData.companyInfo?.contact}
                      onChange={(e) => handleInputChange('companyInfo.contact', e.target.value)}
                      placeholder="Contact person name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Address *
                    </label>
                    <textarea
                      value={formData.companyInfo?.address}
                      onChange={(e) => handleInputChange('companyInfo.address', e.target.value)}
                      placeholder="Complete company address"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className={`h-6 w-6 mt-1 ${
                          selectedTemplate === template.id ? 'text-teal-600' : 'text-slate-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{template.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {template.type}
                            </span>
                            <span className="text-xs text-slate-500">v{template.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Framework */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Framework</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    '21 CFR 820',
                    '21 CFR 807',
                    '21 CFR 814',
                    'ISO 13485',
                    'ISO 14971',
                    'EU MDR 2017/745'
                  ].map((framework) => (
                    <label key={framework} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.complianceFramework?.includes(framework)}
                        onChange={(e) => handleFrameworkChange(framework, e.target.checked)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                      />
                      <span className="text-sm font-medium text-slate-700">{framework}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Validation Results */}
              {validation && (
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Validation Results</h3>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {validation.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      Compliance Score: <span className="font-medium">{validation.complianceScore}%</span>
                    </div>
                  </div>

                  {validation.errors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Generation Progress */}
              {isGenerating && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Generating Document</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">{generationMessage}</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      Progress: {generationProgress}%
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={validateForm}
                  disabled={isGenerating}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Validate Requirements
                </button>
                
                <button
                  onClick={generateDocument}
                  disabled={!validation?.isValid || isGenerating}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 inline mr-2" />
                      Generate Document
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Generation History */
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Generation History</h3>
              
              {generationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No documents generated yet</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Generate Your First Document
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {generationHistory.map((doc) => (
                    <div key={doc.id} className="bg-slate-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{doc.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {doc.metadata?.deviceType} • {doc.metadata?.deviceClassification}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(doc.status)}`}>
                              {getStatusIcon(doc.status)}
                              <span className="capitalize">{doc.status}</span>
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {doc.status === 'completed' && (
                            <button
                              onClick={() => downloadDocument(doc.id)}
                              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Download document"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};