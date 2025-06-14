import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ChevronLeft, CheckCircle, Building, FileText, AlertTriangle, Home, Info, Loader2 } from 'lucide-react';
import { CompanyInformationForm } from './CompanyInformationForm';
import { DeviceClassificationForm } from './DeviceClassificationForm';
import { RegulatoryPathwayCard } from './RegulatoryPathwayCard';
import { ComplianceRoadmapView } from './ComplianceRoadmapView';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../ui/Toast';

const STEPS = [
  { id: 'company', title: 'Company Information', description: 'Enter your company details' },
  { id: 'device', title: 'Device Classification', description: 'Classify your medical device' },
  { id: 'pathway', title: 'Regulatory Pathway', description: 'Determine submission pathway' },
  { id: 'roadmap', title: 'Compliance Roadmap', description: 'View your compliance plan' }
];

export const RegulatoryWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [deviceClassification, setDeviceClassification] = useState<any>(null);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [complianceRoadmap, setComplianceRoadmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile, userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load existing profile data if available
  useEffect(() => {
    if (userProfile?.company_info) {
      // If user already has company info, pre-fill the form
      if (userProfile.company_info.company_name) {
        setCompanyInfo({
          legalName: userProfile.company_info.company_name,
          dunsNumber: userProfile.company_info.dunsNumber || '',
          annualRevenue: userProfile.company_info.annualRevenue || '',
          employeeCount: userProfile.company_info.company_size || '',
          qmsStatus: userProfile.company_info.qmsStatus || '',
          priorSubmissions: userProfile.company_info.priorSubmissions || '',
          certifications: userProfile.company_info.certifications || [],
          contactName: userProfile.company_info.contact_name || '',
          contactEmail: userProfile.company_info.contact_email || user?.email || '',
          contactPhone: userProfile.company_info.contact_phone || '',
          address: userProfile.company_info.address || '',
          establishmentNumber: userProfile.company_info.establishment_number || ''
        });
      }

      // If user already has device info, pre-fill the form
      if (userProfile.company_info.device_info) {
        setDeviceInfo(userProfile.company_info.device_info);
        setDeviceClassification(userProfile.company_info.classification);
        setSelectedPathway(userProfile.company_info.regulatory_pathway);
        setComplianceRoadmap(userProfile.company_info.compliance_roadmap);
      }
    }
  }, [userProfile, user]);

  // Regulatory pathways based on device classification
  const pathwayOptions = [
    {
      name: '510(k)',
      description: 'Premarket notification demonstrating substantial equivalence to a legally marketed device.',
      timeline: '6-12 months',
      cost: '$50,000 - $200,000',
      requirements: [
        'Substantial equivalence demonstration',
        'Performance testing',
        'Biocompatibility (if applicable)',
        'Software validation (if applicable)',
        'Clinical data (if applicable)'
      ],
      deviceClass: 'II',
      isRecommended: deviceClassification?.device_class === 'II'
    },
    {
      name: 'PMA',
      description: 'Premarket approval for Class III devices that support or sustain human life.',
      timeline: '1-3 years',
      cost: '$500,000 - $2,000,000',
      requirements: [
        'Clinical trials',
        'Manufacturing information',
        'Extensive performance testing',
        'Risk analysis',
        'Post-market surveillance plan'
      ],
      deviceClass: 'III',
      isRecommended: deviceClassification?.device_class === 'III'
    },
    {
      name: 'De Novo',
      description: 'For novel devices with no predicate, providing a new classification pathway.',
      timeline: '9-12 months',
      cost: '$100,000 - $500,000',
      requirements: [
        'Device description and classification',
        'Performance testing',
        'Risk/benefit analysis',
        'Special controls identification'
      ],
      deviceClass: 'I or II',
      isRecommended: false
    },
    {
      name: 'Exempt',
      description: 'For low-risk Class I devices exempt from premarket notification requirements.',
      timeline: '1-3 months',
      cost: '$5,000 - $20,000',
      requirements: [
        'Device listing',
        'Establishment registration',
        'Good Manufacturing Practices',
        'Medical Device Reporting'
      ],
      deviceClass: 'I',
      isRecommended: deviceClassification?.device_class === 'I'
    }
  ];

  const handleCompanyInfoSave = (data: any) => {
    setCompanyInfo(data);
    setCurrentStep(1);
    
    showToast({
      type: 'success',
      title: 'Company Information Saved',
      message: 'Your company information has been saved',
      duration: 3000
    });
  };

  const handleDeviceClassification = (classification: any) => {
    setDeviceClassification(classification);
    setDeviceInfo({
      name: classification.device_name,
      classification: classification.device_class,
      productCode: classification.product_code,
      regulationNumber: classification.regulation_number
    });
    setCurrentStep(2);
    
    showToast({
      type: 'success',
      title: 'Device Classified',
      message: `Device classified as Class ${classification.device_class}`,
      duration: 3000
    });
  };

  const handlePathwaySelection = (pathway: string) => {
    setSelectedPathway(pathway);
    
    // Generate compliance roadmap based on device classification and pathway
    const roadmap = generateComplianceRoadmap(deviceClassification.device_class, pathway);
    setComplianceRoadmap(roadmap);
    
    setCurrentStep(3);
    
    showToast({
      type: 'success',
      title: 'Pathway Selected',
      message: `${pathway} pathway selected for your device`,
      duration: 3000
    });
  };

  const handleFinish = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    
    try {
      console.log('--- Starting handleFinish ---');
      console.log('Current companyInfo:', companyInfo);
      console.log('Current deviceInfo:', deviceInfo);
      console.log('Current deviceClassification:', deviceClassification);
      console.log('Current selectedPathway:', selectedPathway);
      console.log('Current complianceRoadmap:', complianceRoadmap);
      console.log('Current userProfile from useAuth():', userProfile);

      // Create a simplified regulatory profile object to avoid potential circular references
      const regulatoryProfile = {
        company_info: {
          company_name: companyInfo.legalName,
          dunsNumber: companyInfo.dunsNumber,
          annualRevenue: companyInfo.annualRevenue,
          company_size: companyInfo.employeeCount,
          qmsStatus: companyInfo.qmsStatus,
          priorSubmissions: companyInfo.priorSubmissions,
          certifications: companyInfo.certifications,
          contact_name: companyInfo.contactName,
          contact_email: companyInfo.contactEmail || user?.email,
          contact_phone: companyInfo.contactPhone,
          address: companyInfo.address,
          establishment_number: companyInfo.establishmentNumber,
          // Add regulatory profile data
          device_info: {
            name: deviceInfo.name,
            classification: deviceInfo.classification,
            productCode: deviceInfo.productCode,
            regulationNumber: deviceInfo.regulationNumber
          },
          classification: {
            device_class: deviceClassification.device_class,
            product_code: deviceClassification.product_code,
            submission_type: deviceClassification.submission_type
          },
          regulatory_pathway: selectedPathway,
          compliance_roadmap: {
            applicableRegulations: complianceRoadmap.applicableRegulations,
            requiredStandards: complianceRoadmap.requiredStandards,
            testingProtocols: complianceRoadmap.testingProtocols,
            qualitySystemRequirements: complianceRoadmap.qualitySystemRequirements,
            clinicalEvidenceNeeds: complianceRoadmap.clinicalEvidenceNeeds,
            postMarketSurveillance: complianceRoadmap.postMarketSurveillance,
            documentTemplates: complianceRoadmap.documentTemplates
          },
          onboarding_completed: true,
          onboarding_date: new Date().toISOString()
        },
        regulatory_profile_completed: true
      };
      
      console.log('Regulatory profile object to be sent to updateProfile:', regulatoryProfile);
      
      // Update the profile with a timeout to prevent hanging
      const updatePromise = updateProfile(regulatoryProfile);
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile update timed out after 10 seconds'));
        }, 10000);
      });
      
      // Race the update against the timeout
      await Promise.race([updatePromise, timeoutPromise]);
      
      console.log('Profile updated successfully');
      
      showToast({
        type: 'success',
        title: 'Onboarding Complete',
        message: 'Your regulatory profile has been saved',
        duration: 3000
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      console.log('--- handleFinish completed ---');
    } catch (error) {
      console.error('Error saving regulatory profile:', error);
      
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your regulatory profile. Please try again.',
        duration: 5000
      });
      
      // Even if there's an error, we'll still redirect to dashboard
      // This prevents the user from getting stuck in the wizard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRoadmap = () => {
    // Create a JSON file with the roadmap data
    const roadmapData = {
      companyInfo,
      deviceInfo,
      classification: deviceClassification,
      pathway: selectedPathway,
      roadmap: complianceRoadmap,
      generatedDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-roadmap-${deviceInfo.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Roadmap Exported',
      message: 'Regulatory roadmap has been exported',
      duration: 3000
    });
  };

  // Return to home/dashboard
  const handleReturnHome = () => {
    navigate('/dashboard');
  };

  const generateComplianceRoadmap = (deviceClass: string, pathway: string) => {
    // This would typically come from an API, but we'll mock it for now
    return {
      applicableRegulations: [
        '21 CFR 820 - Quality System Regulation',
        '21 CFR 803 - Medical Device Reporting',
        '21 CFR 806 - Medical Devices; Reports of Corrections and Removals',
        deviceClass === 'I' ? '21 CFR 807 Subpart B - Establishment Registration' : '21 CFR 807 Subpart E - Premarket Notification'
      ],
      requiredStandards: [
        'ISO 13485:2016 - Medical devices — Quality management systems',
        'ISO 14971:2019 - Medical devices — Application of risk management to medical devices',
        deviceClass !== 'I' ? 'IEC 62304 - Medical device software — Software life cycle processes' : null,
        deviceClass === 'III' ? 'ISO 10993 - Biological evaluation of medical devices' : null
      ].filter(Boolean) as string[],
      testingProtocols: [
        'Performance Testing',
        'Safety Testing',
        deviceClass !== 'I' ? 'Software Validation' : null,
        deviceClass === 'III' ? 'Clinical Testing' : null
      ].filter(Boolean) as string[],
      qualitySystemRequirements: [
        'Management Responsibility',
        'Design Controls',
        'Document Controls',
        'Purchasing Controls',
        'Identification and Traceability',
        'Production and Process Controls',
        'Acceptance Activities',
        'Nonconforming Product',
        'Corrective and Preventive Action',
        'Labeling and Packaging Controls',
        'Handling, Storage, Distribution, and Installation',
        'Records',
        'Servicing',
        'Statistical Techniques'
      ],
      clinicalEvidenceNeeds: deviceClass === 'I' 
        ? ['Literature Review'] 
        : deviceClass === 'II' 
          ? ['Literature Review', 'Clinical Evaluation', 'Post-Market Clinical Follow-up'] 
          : ['Clinical Investigation', 'Clinical Evaluation', 'Post-Market Clinical Follow-up'],
      postMarketSurveillance: [
        'Complaint Handling',
        'Medical Device Reporting',
        'Corrective and Preventive Actions',
        deviceClass !== 'I' ? 'Post-Market Surveillance Plan' : null,
        deviceClass === 'III' ? 'Post-Approval Studies' : null
      ].filter(Boolean) as string[],
      documentTemplates: [
        {
          name: 'Quality Manual',
          description: 'Comprehensive quality management system documentation',
          required: true,
          templateId: 'qms_manual'
        },
        {
          name: 'Risk Management File',
          description: 'Documentation of risk management activities per ISO 14971',
          required: true,
          templateId: 'risk_management'
        },
        {
          name: pathway === '510(k)' ? '510(k) Submission Template' : 
                 pathway === 'PMA' ? 'PMA Application Template' :
                 pathway === 'De Novo' ? 'De Novo Request Template' : 'Device Listing Template',
          description: 'Regulatory submission documentation',
          required: true,
          templateId: pathway.toLowerCase().replace(/\s+/g, '_') + '_submission'
        },
        {
          name: 'Design History File',
          description: 'Documentation of design and development activities',
          required: deviceClass !== 'I',
          templateId: 'design_history_file'
        },
        {
          name: 'Device Master Record',
          description: 'Manufacturing specifications and procedures',
          required: true,
          templateId: 'device_master_record'
        }
      ]
    };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <CompanyInformationForm initialData={companyInfo} onSave={handleCompanyInfoSave} />;
      case 1:
        return <DeviceClassificationForm onClassificationComplete={handleDeviceClassification} />;
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Select Regulatory Pathway</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Based on your device classification (Class {deviceClassification?.device_class}), 
              select the appropriate regulatory pathway:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pathwayOptions
                .filter(pathway => {
                  // Filter pathways based on device class
                  if (deviceClassification?.device_class === 'I' && pathway.deviceClass.includes('I')) return true;
                  if (deviceClassification?.device_class === 'II' && (pathway.name === '510(k)' || pathway.name === 'De Novo')) return true;
                  if (deviceClassification?.device_class === 'III' && (pathway.name === 'PMA' || pathway.name === '510(k)')) return true;
                  return false;
                })
                .map(pathway => (
                  <RegulatoryPathwayCard
                    key={pathway.name}
                    pathway={pathway}
                    onSelect={() => handlePathwaySelection(pathway.name)}
                    isSelected={selectedPathway === pathway.name}
                  />
                ))
              }
            </div>
          </div>
        );
      case 3:
        return (
          <ComplianceRoadmapView
            roadmapData={complianceRoadmap}
            deviceInfo={{
              name: deviceInfo.name,
              classification: `Class ${deviceClassification?.device_class}`,
              regulatoryPathway: selectedPathway || ''
            }}
            companyInfo={{
              name: companyInfo.legalName,
              contact: companyInfo.contactName
            }}
            onExport={handleExportRoadmap}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-600 dark:bg-teal-700 rounded-full p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Regulatory Onboarding Wizard</h2>
            </div>
            
            {/* Return to Home Button */}
            <button
              onClick={handleReturnHome}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
              title="Return to Dashboard"
            >
              <Home className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Complete this step-by-step wizard to set up your regulatory profile and get a customized compliance roadmap.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center w-full">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-center ${
                  index === currentStep 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : index < currentStep 
                    ? 'text-slate-600 dark:text-slate-300' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === currentStep 
                      ? 'bg-teal-100 dark:bg-teal-900/50 border-2 border-teal-500 dark:border-teal-400' 
                      : index < currentStep 
                      ? 'bg-teal-500 dark:bg-teal-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-teal-500 dark:bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || isLoading}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => {
                // This button is only active for steps that don't have their own "Next" action
                if (currentStep === 2 && !selectedPathway) {
                  showToast({
                    type: 'warning',
                    title: 'Selection Required',
                    message: 'Please select a regulatory pathway',
                    duration: 3000
                  });
                  return;
                }
                
                setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
              }}
              disabled={
                (currentStep === 0) || // Company info has its own save button
                (currentStep === 1) || // Device classification has its own complete button
                (currentStep === 2 && !selectedPathway) || // Pathway selection required
                isLoading
              }
              className="px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              id="completeSetupButton"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Complete Setup</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Help Information */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Need Help?</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This wizard will guide you through the regulatory setup process for your medical device. 
              If you need assistance, contact our support team or consult the FDA guidance documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};