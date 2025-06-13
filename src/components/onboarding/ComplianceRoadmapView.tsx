import React, { useState } from 'react';
import { CheckCircle, FileText, Download, Eye, Shield, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { DocumentGeneratorService } from '../../lib/ai/documentGenerator';
import { useToast } from '../ui/Toast';

interface ComplianceRoadmapViewProps {
  roadmapData: {
    applicableRegulations: string[];
    requiredStandards: string[];
    testingProtocols: string[];
    qualitySystemRequirements: string[];
    clinicalEvidenceNeeds: string[];
    postMarketSurveillance: string[];
    documentTemplates: Array<{
      name: string;
      description: string;
      required: boolean;
      templateId: string;
    }>;
  };
  deviceInfo: {
    name: string;
    classification: string;
    regulatoryPathway: string;
  };
  companyInfo: {
    name: string;
    contact: string;
  };
  onExport: () => void;
}

export const ComplianceRoadmapView: React.FC<ComplianceRoadmapViewProps> = ({
  roadmapData,
  deviceInfo,
  companyInfo,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline'>('overview');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleGenerateDocument = async (templateId: string, templateName: string) => {
    setIsGenerating(templateId);
    try {
      await DocumentGeneratorService.generateDocument({
        deviceClassification: deviceInfo.classification as any,
        regulatoryPathway: deviceInfo.regulatoryPathway as any,
        deviceType: deviceInfo.name,
        intendedUse: '',
        companyInfo: {
          name: companyInfo.name,
          address: '',
          contact: companyInfo.contact
        },
        complianceFramework: roadmapData.applicableRegulations,
        templateType: templateId
      }, {
        onProgress: (progress) => {
          console.log(`Document generation progress: ${progress.progress}% - ${progress.message}`);
        },
        onComplete: (result) => {
          showToast({
            type: 'success',
            title: 'Document Generated',
            message: `${templateName} has been generated successfully`,
            duration: 3000
          });
          setIsGenerating(null);
        },
        onError: (error) => {
          console.error('Document generation error:', error);
          showToast({
            type: 'error',
            title: 'Document Generation Failed',
            message: error,
            duration: 5000
          });
          setIsGenerating(null);
        }
      });
    } catch (error) {
      console.error('Document generation error:', error);
      showToast({
        type: 'error',
        title: 'Document Generation Failed',
        message: 'Could not generate document',
        duration: 5000
      });
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">
          Compliance Roadmap for {deviceInfo.name}
        </h3>
        
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Roadmap</span>
        </button>
      </div>
      
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-teal-600" />
          <div>
            <h4 className="text-lg font-semibold text-slate-900">
              {deviceInfo.classification} Device - {deviceInfo.regulatoryPathway} Pathway
            </h4>
            <p className="text-sm text-slate-600">
              {companyInfo.name}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-teal-500" />
              <h5 className="font-medium text-slate-900">Documentation</h5>
            </div>
            <p className="text-sm text-slate-600">
              {roadmapData.documentTemplates.length} document templates available
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-teal-500" />
              <h5 className="font-medium text-slate-900">Testing</h5>
            </div>
            <p className="text-sm text-slate-600">
              {roadmapData.testingProtocols.length} testing protocols required
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-teal-500" />
              <h5 className="font-medium text-slate-900">Estimated Timeline</h5>
            </div>
            <p className="text-sm text-slate-600">
              {deviceInfo.regulatoryPathway === 'PMA' ? '1-3 years' : 
               deviceInfo.regulatoryPathway === '510(k)' ? '6-12 months' : 
               deviceInfo.regulatoryPathway === 'De Novo' ? '9-12 months' : 
               '3-6 months'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Regulatory Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'documents'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Required Documents
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'timeline'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Submission Timeline
          </button>
        </nav>
      </div>
      
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Applicable Regulations</h4>
                <ul className="space-y-2">
                  {roadmapData.applicableRegulations.map((regulation, index) => (
                    <li key={index} className="flex items-start">
                      <Shield className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{regulation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Required Standards</h4>
                <ul className="space-y-2">
                  {roadmapData.requiredStandards.map((standard, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{standard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Testing Protocols</h4>
                <ul className="space-y-2">
                  {roadmapData.testingProtocols.map((protocol, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{protocol}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Clinical Evidence Needs</h4>
                <ul className="space-y-2">
                  {roadmapData.clinicalEvidenceNeeds.map((need, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{need}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Quality System Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roadmapData.qualitySystemRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                    <span className="text-sm text-slate-600">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Post-Market Surveillance</h4>
              <ul className="space-y-2">
                {roadmapData.postMarketSurveillance.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Document Generation</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Click on "Generate" to create pre-filled document templates based on your device information.
                    All documents will be customized for your {deviceInfo.classification} device on the {deviceInfo.regulatoryPathway} pathway.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmapData.documentTemplates.map((template) => (
                <div key={template.templateId} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-slate-900">{template.name}</h5>
                      <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGenerateDocument(template.templateId, template.name)}
                        disabled={isGenerating === template.templateId}
                        className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate document"
                      >
                        {isGenerating === template.templateId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Preview template"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {template.required && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    While these templates provide a solid foundation, all documents should be reviewed by a regulatory expert before submission to the FDA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-6">Submission Timeline</h4>
              
              <div className="relative">
                {[
                  {
                    phase: 'Planning & Preparation',
                    duration: '1-2 months',
                    description: 'Develop regulatory strategy, identify predicate devices, and conduct gap analysis',
                    tasks: [
                      'Identify regulatory requirements',
                      'Develop project plan',
                      'Assemble regulatory team',
                      'Conduct preliminary gap analysis'
                    ]
                  },
                  {
                    phase: 'Design & Development',
                    duration: '3-6 months',
                    description: 'Complete design controls, risk management, and verification activities',
                    tasks: [
                      'Finalize design specifications',
                      'Implement design controls',
                      'Conduct risk analysis',
                      'Develop verification protocols'
                    ]
                  },
                  {
                    phase: 'Testing & Validation',
                    duration: '2-4 months',
                    description: 'Conduct verification and validation testing according to protocols',
                    tasks: [
                      'Execute verification testing',
                      'Conduct validation studies',
                      'Perform biocompatibility testing (if applicable)',
                      'Complete software validation (if applicable)'
                    ]
                  },
                  {
                    phase: 'Submission Preparation',
                    duration: '1-2 months',
                    description: 'Compile all documentation and prepare submission package',
                    tasks: [
                      'Compile test reports',
                      'Prepare submission documents',
                      'Conduct internal review',
                      'Finalize submission package'
                    ]
                  },
                  {
                    phase: 'FDA Review',
                    duration: deviceInfo.regulatoryPathway === 'PMA' ? '6-12 months' : '3-6 months',
                    description: 'FDA reviews submission and may request additional information',
                    tasks: [
                      'Submit application to FDA',
                      'Respond to FDA questions',
                      'Provide additional information if requested',
                      'Prepare for potential facility inspection'
                    ]
                  }
                ].map((milestone, index) => (
                  <div key={index} className="mb-8 flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      {index < 4 && (
                        <div className="h-full w-0.5 bg-teal-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{milestone.phase}</h5>
                        <span className="text-sm text-slate-500">{milestone.duration}</span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">{milestone.description}</p>
                      
                      <div className="text-sm text-slate-600">
                        <p className="font-medium mb-1">Key Tasks:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestone.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-3 w-3 text-teal-500 mt-1 mr-2" />
                              <span className="text-xs">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">FDA Review Process</h4>
              
              <div className="space-y-4">
                {deviceInfo.regulatoryPathway === '510(k)' && (
                  <>
                    <p className="text-sm text-slate-600">
                      The FDA aims to review 510(k) submissions within 90 days, but the actual time may vary based on submission quality and complexity.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">510(k) Review Process:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                        <li>Administrative review (15 days)</li>
                        <li>Substantive review (60-75 days)</li>
                        <li>Interactive review (as needed)</li>
                        <li>Final decision</li>
                      </ol>
                    </div>
                    
                    <div className="flex justify-end">
                      <a
                        href="https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <span>FDA 510(k) Guidance</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
                
                {deviceInfo.regulatoryPathway === 'PMA' && (
                  <>
                    <p className="text-sm text-slate-600">
                      The FDA review process for PMAs is more extensive and typically takes 180-365 days, depending on the complexity of the device.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">PMA Review Process:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                        <li>Administrative and filing review (45 days)</li>
                        <li>Substantive review (180 days)</li>
                        <li>Advisory panel meeting (if needed)</li>
                        <li>Final decision</li>
                      </ol>
                    </div>
                    
                    <div className="flex justify-end">
                      <a
                        href="https://www.fda.gov/medical-devices/premarket-submissions/premarket-approval-pma"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <span>FDA PMA Guidance</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
                
                {deviceInfo.regulatoryPathway === 'De Novo' && (
                  <>
                    <p className="text-sm text-slate-600">
                      The FDA aims to review De Novo requests within 150 days, but complex devices may take longer.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">De Novo Review Process:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                        <li>Acceptance review (15 days)</li>
                        <li>Substantive review (120 days)</li>
                        <li>Interactive review (as needed)</li>
                        <li>Final decision</li>
                      </ol>
                    </div>
                    
                    <div className="flex justify-end">
                      <a
                        href="https://www.fda.gov/medical-devices/premarket-submissions/de-novo-classification-request"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <span>FDA De Novo Guidance</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
                
                {deviceInfo.regulatoryPathway === 'Exempt' && (
                  <>
                    <p className="text-sm text-slate-600">
                      Exempt devices do not require FDA premarket review, but must still comply with general controls.
                    </p>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Requirements for Exempt Devices:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                        <li>Establishment registration</li>
                        <li>Medical Device Listing</li>
                        <li>Quality System Regulation compliance</li>
                        <li>Labeling requirements</li>
                        <li>Medical Device Reporting</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end">
                      <a
                        href="https://www.fda.gov/medical-devices/classify-your-medical-device/class-i-exempt-devices"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <span>FDA Class I Exempt Guidance</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};