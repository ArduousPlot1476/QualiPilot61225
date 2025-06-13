import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Building, FileText, Shield, Target, Clock, DollarSign, Download, Save, Eye } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { RegulatoryIntelligenceService } from '../../lib/ai/regulatoryIntelligence';
import { DocumentGeneratorService } from '../../lib/ai/documentGenerator';

interface CompanyInfo {
  legalName: string;
  dunsNumber: string;
  annualRevenue: string;
  employeeCount: string;
  qmsStatus: string;
  priorSubmissions: string;
  certifications: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  establishmentNumber?: string;
}

interface DeviceInfo {
  deviceName: string;
  intendedUse: string;
  deviceDescription: string;
  riskLevel: string;
  technicalCharacteristics: string[];
  userEnvironment: string;
  patientContact: string;
  energySource: string;
  softwareComponent: boolean;
  sterile: boolean;
  implantable: boolean;
  lifeSupporting: boolean;
}

interface ClassificationResult {
  suggestedClass: 'I' | 'II' | 'III';
  confidence: number;
  productCode: string;
  regulationNumber: string;
  submissionType: '510(k)' | 'PMA' | 'De Novo' | 'Exempt';
  predicateDevices: string[];
  cfrReferences: string[];
  reasoning: string;
  manualOverride?: {
    class: 'I' | 'II' | 'III';
    justification: string;
  };
}

interface RegulatoryPathway {
  pathway: string;
  requirements: string[];
  timeline: string;
  estimatedCost: string;
  keyMilestones: Array<{
    phase: string;
    duration: string;
    deliverables: string[];
  }>;
  requiredTesting: string[];
  documentationNeeded: string[];
}

interface ComplianceRoadmap {
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
}

const WIZARD_STEPS = [
  { id: 'company', title: 'Company Information', icon: Building },
  { id: 'device', title: 'Device Description', icon: FileText },
  { id: 'classification', title: 'Device Classification', icon: Shield },
  { id: 'pathway', title: 'Regulatory Pathway', icon: Target },
  { id: 'roadmap', title: 'Compliance Roadmap', icon: CheckCircle }
];

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

const RISK_LEVEL_OPTIONS = [
  'Low risk (minimal potential for harm)',
  'Moderate risk (potential for temporary harm)',
  'High risk (potential for serious harm or death)'
];

const TECHNICAL_CHARACTERISTICS = [
  'Electrical/Electronic',
  'Mechanical',
  'Software/Firmware',
  'Biological/Chemical',
  'Radioactive',
  'Magnetic',
  'Acoustic',
  'Thermal'
];

export const RegulatoryWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    legalName: '',
    dunsNumber: '',
    annualRevenue: '',
    employeeCount: '',
    qmsStatus: '',
    priorSubmissions: '',
    certifications: [],
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceName: '',
    intendedUse: '',
    deviceDescription: '',
    riskLevel: '',
    technicalCharacteristics: [],
    userEnvironment: '',
    patientContact: '',
    energySource: '',
    softwareComponent: false,
    sterile: false,
    implantable: false,
    lifeSupporting: false
  });
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [regulatoryPathway, setRegulatoryPathway] = useState<RegulatoryPathway | null>(null);
  const [complianceRoadmap, setComplianceRoadmap] = useState<ComplianceRoadmap | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [savedProgress, setSavedProgress] = useState(false);
  const { showToast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    const saveProgress = () => {
      const wizardData = {
        currentStep,
        companyInfo,
        deviceInfo,
        classificationResult,
        regulatoryPathway,
        complianceRoadmap,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('regulatory_wizard_progress', JSON.stringify(wizardData));
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 2000);
    };

    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentStep, companyInfo, deviceInfo, classificationResult, regulatoryPathway, complianceRoadmap]);

  // Load saved progress
  useEffect(() => {
    const savedData = localStorage.getItem('regulatory_wizard_progress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCurrentStep(parsed.currentStep || 0);
        setCompanyInfo(parsed.companyInfo || companyInfo);
        setDeviceInfo(parsed.deviceInfo || deviceInfo);
        setClassificationResult(parsed.classificationResult);
        setRegulatoryPathway(parsed.regulatoryPathway);
        setComplianceRoadmap(parsed.complianceRoadmap);
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 0: // Company Information
        if (!companyInfo.legalName) errors.push('Legal company name is required');
        if (!companyInfo.dunsNumber) errors.push('DUNS number is required');
        if (!companyInfo.annualRevenue) errors.push('Annual revenue range is required');
        if (!companyInfo.employeeCount) errors.push('Employee count is required');
        if (!companyInfo.qmsStatus) errors.push('QMS status is required');
        if (!companyInfo.contactName) errors.push('Primary contact name is required');
        if (!companyInfo.contactEmail) errors.push('Primary contact email is required');
        if (!validateEmail(companyInfo.contactEmail)) errors.push('Invalid email format');
        if (!companyInfo.address) errors.push('Business address is required');
        
        setValidationErrors({ company: errors });
        return errors.length === 0;

      case 1: // Device Information
        if (!deviceInfo.deviceName) errors.push('Device name is required');
        if (!deviceInfo.intendedUse) errors.push('Intended use is required');
        if (!deviceInfo.deviceDescription) errors.push('Device description is required');
        if (!deviceInfo.riskLevel) errors.push('Risk level is required');
        if (deviceInfo.technicalCharacteristics.length === 0) errors.push('At least one technical characteristic is required');
        if (!deviceInfo.userEnvironment) errors.push('User environment is required');
        if (!deviceInfo.patientContact) errors.push('Patient contact information is required');
        
        setValidationErrors({ device: errors });
        return errors.length === 0;

      case 2: // Classification
        if (!classificationResult) errors.push('Device classification is required');
        
        setValidationErrors({ classification: errors });
        return errors.length === 0;

      case 3: // Regulatory Pathway
        if (!regulatoryPathway) errors.push('Regulatory pathway is required');
        
        setValidationErrors({ pathway: errors });
        return errors.length === 0;

      default:
        return true;
    }
  };

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: any) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCertificationChange = (certification: string, checked: boolean) => {
    setCompanyInfo(prev => ({
      ...prev,
      certifications: checked
        ? [...prev.certifications, certification]
        : prev.certifications.filter(c => c !== certification)
    }));
  };

  const handleDeviceInfoChange = (field: keyof DeviceInfo, value: any) => {
    setDeviceInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleTechnicalCharacteristicChange = (characteristic: string, checked: boolean) => {
    setDeviceInfo(prev => ({
      ...prev,
      technicalCharacteristics: checked
        ? [...prev.technicalCharacteristics, characteristic]
        : prev.technicalCharacteristics.filter(c => c !== characteristic)
    }));
  };

  const handleClassificationOverride = (deviceClass: 'I' | 'II' | 'III', justification: string) => {
    if (classificationResult) {
      setClassificationResult({
        ...classificationResult,
        manualOverride: {
          class: deviceClass,
          justification
        }
      });
    }
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before proceeding',
        duration: 5000
      });
      return;
    }

    if (currentStep === 1) {
      // Process device classification before moving to next step
      await classifyDevice();
    } else if (currentStep === 2) {
      // Generate regulatory pathway before moving to next step
      await generateRegulatoryPathway();
    } else if (currentStep === 3) {
      // Generate compliance roadmap before moving to next step
      await generateComplianceRoadmap();
    }

    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const classifyDevice = async () => {
    setIsProcessing(true);
    try {
      // First, try to get classification from FDA database
      const classification = await RegulatoryIntelligenceService.getDeviceClassification(deviceInfo.deviceName);
      
      // Then, determine risk-based classification
      let suggestedClass: 'I' | 'II' | 'III';
      let confidence = 0.8;
      let reasoning = '';
      
      // Determine class based on device characteristics
      if (deviceInfo.implantable || deviceInfo.lifeSupporting) {
        suggestedClass = 'III';
        confidence = 0.95;
        reasoning = 'Device is implantable or life-supporting, which typically requires Class III classification.';
      } else if (deviceInfo.riskLevel.includes('High risk') || 
                deviceInfo.sterile || 
                (deviceInfo.softwareComponent && deviceInfo.patientContact.includes('invasive'))) {
        suggestedClass = 'II';
        confidence = 0.9;
        reasoning = 'Device has moderate to high risk factors, sterility requirements, or is software with invasive patient contact.';
      } else {
        suggestedClass = 'I';
        confidence = 0.85;
        reasoning = 'Device has low risk profile and no high-risk characteristics.';
      }
      
      // If we got FDA classification, use that instead but include our reasoning
      if (classification) {
        suggestedClass = classification.device_class as 'I' | 'II' | 'III';
        confidence = 0.95;
        reasoning += ` FDA database classification confirms this is a Class ${suggestedClass} device.`;
      }
      
      // Determine relevant CFR references
      const cfrReferences = [];
      if (suggestedClass === 'I') {
        cfrReferences.push('21 CFR 860.3(c)(1)', '21 CFR 807.20');
        if (!deviceInfo.sterile) cfrReferences.push('21 CFR 807.65');
      } else if (suggestedClass === 'II') {
        cfrReferences.push('21 CFR 860.3(c)(2)', '21 CFR 807.87');
        if (deviceInfo.softwareComponent) cfrReferences.push('21 CFR 820.30');
      } else {
        cfrReferences.push('21 CFR 860.3(c)(3)', '21 CFR 814.20');
      }
      
      // Set classification result
      setClassificationResult({
        suggestedClass,
        confidence,
        productCode: classification?.product_code || 'TBD',
        regulationNumber: classification?.regulation_number || 'TBD',
        submissionType: classification?.submission_type || 
                        (suggestedClass === 'I' ? 'Exempt' : 
                         suggestedClass === 'II' ? '510(k)' : 'PMA'),
        predicateDevices: classification?.predicate_devices || [],
        cfrReferences,
        reasoning
      });
      
      showToast({
        type: 'success',
        title: 'Classification Complete',
        message: `Device classified as Class ${suggestedClass}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Classification error:', error);
      showToast({
        type: 'error',
        title: 'Classification Failed',
        message: 'Could not determine device classification',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRegulatoryPathway = async () => {
    if (!classificationResult) return;
    
    setIsProcessing(true);
    try {
      // Use the classification result to determine the regulatory pathway
      const deviceClass = classificationResult.manualOverride?.class || classificationResult.suggestedClass;
      
      // Get pathway recommendation from regulatory intelligence service
      const pathwayRecommendation = await RegulatoryIntelligenceService.getCompliancePathway({
        device_type: deviceInfo.deviceName,
        intended_use: deviceInfo.intendedUse,
        device_class: deviceClass,
        predicate_device: classificationResult.predicateDevices[0]
      });
      
      // Format the response into our pathway structure
      const pathway: RegulatoryPathway = {
        pathway: pathwayRecommendation.recommended_pathway,
        requirements: pathwayRecommendation.requirements,
        timeline: pathwayRecommendation.timeline,
        estimatedCost: pathwayRecommendation.estimated_cost,
        keyMilestones: [
          {
            phase: 'Planning & Preparation',
            duration: '1-2 months',
            deliverables: ['Project plan', 'Regulatory strategy', 'Gap analysis']
          },
          {
            phase: 'Design & Development',
            duration: '3-6 months',
            deliverables: ['Design documentation', 'Risk analysis', 'Verification protocols']
          },
          {
            phase: 'Testing & Validation',
            duration: '2-4 months',
            deliverables: ['Test reports', 'Validation summary', 'Clinical data (if required)']
          },
          {
            phase: 'Submission Preparation',
            duration: '1-2 months',
            deliverables: ['Complete submission package', 'Technical documentation', 'Labeling']
          },
          {
            phase: 'FDA Review',
            duration: deviceClass === 'III' ? '6-12 months' : '3-6 months',
            deliverables: ['Response to FDA questions', 'Additional testing (if required)']
          }
        ],
        requiredTesting: [
          'Biocompatibility (if patient contact)',
          'Electrical safety',
          'Software validation',
          'Performance testing',
          'Sterilization validation (if applicable)'
        ],
        documentationNeeded: [
          'Device description',
          'Substantial equivalence comparison',
          'Performance data',
          'Risk analysis',
          'Software documentation (if applicable)',
          'Clinical data (if applicable)',
          'Labeling'
        ]
      };
      
      setRegulatoryPathway(pathway);
      
      showToast({
        type: 'success',
        title: 'Pathway Generated',
        message: `${pathway.pathway} pathway recommended`,
        duration: 3000
      });
    } catch (error) {
      console.error('Pathway generation error:', error);
      showToast({
        type: 'error',
        title: 'Pathway Generation Failed',
        message: 'Could not determine regulatory pathway',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateComplianceRoadmap = async () => {
    if (!classificationResult || !regulatoryPathway) return;
    
    setIsProcessing(true);
    try {
      const deviceClass = classificationResult.manualOverride?.class || classificationResult.suggestedClass;
      
      // Get compatible document templates
      const templates = await DocumentGeneratorService.getCompatibleTemplates(
        `Class ${deviceClass}`,
        regulatoryPathway.pathway
      );
      
      // Create compliance roadmap
      const roadmap: ComplianceRoadmap = {
        applicableRegulations: [
          ...classificationResult.cfrReferences,
          deviceClass !== 'I' ? '21 CFR 820.30 (Design Controls)' : '',
          '21 CFR 820 (Quality System Regulation)',
          regulatoryPathway.pathway === '510(k)' ? '21 CFR 807 (Premarket Notification)' : '',
          regulatoryPathway.pathway === 'PMA' ? '21 CFR 814 (Premarket Approval)' : '',
          deviceInfo.softwareComponent ? '21 CFR 820.30(g) (Software Validation)' : ''
        ].filter(Boolean),
        
        requiredStandards: [
          'ISO 13485:2016 (Quality Management Systems)',
          'ISO 14971:2019 (Risk Management)',
          deviceInfo.softwareComponent ? 'IEC 62304 (Software Life Cycle Processes)' : '',
          deviceInfo.sterile ? 'ISO 11135 or ISO 11137 (Sterilization)' : '',
          deviceInfo.patientContact.includes('invasive') ? 'ISO 10993 (Biocompatibility)' : ''
        ].filter(Boolean),
        
        testingProtocols: [
          deviceInfo.patientContact.includes('invasive') ? 'Biocompatibility testing' : '',
          deviceInfo.sterile ? 'Sterilization validation' : '',
          deviceInfo.softwareComponent ? 'Software verification and validation' : '',
          'Performance testing',
          'Shelf life testing (if applicable)',
          deviceClass === 'III' ? 'Clinical studies' : ''
        ].filter(Boolean),
        
        qualitySystemRequirements: [
          'Quality Manual',
          'Design Controls',
          'Document Controls',
          'Purchasing Controls',
          'Identification and Traceability',
          'Production and Process Controls',
          'Acceptance Activities',
          'Nonconforming Product',
          'Corrective and Preventive Action',
          'Labeling and Packaging Controls',
          'Handling, Storage, Distribution',
          'Records',
          'Servicing',
          'Statistical Techniques'
        ],
        
        clinicalEvidenceNeeds: deviceClass === 'I' ? ['Generally not required'] : [
          'Literature review',
          'Predicate device comparison',
          deviceClass === 'III' ? 'Clinical trials' : 'Clinical evaluation',
          'Post-market clinical follow-up plan'
        ],
        
        postMarketSurveillance: [
          'Complaint handling procedures',
          'Medical device reporting procedures',
          'Recall procedures',
          'Post-market surveillance plan',
          deviceClass !== 'I' ? 'Periodic safety update reports' : ''
        ].filter(Boolean),
        
        documentTemplates: templates.map(template => ({
          name: template.name,
          description: template.description,
          required: true,
          templateId: template.id
        }))
      };
      
      setComplianceRoadmap(roadmap);
      
      showToast({
        type: 'success',
        title: 'Compliance Roadmap Generated',
        message: 'Your personalized compliance roadmap is ready',
        duration: 3000
      });
    } catch (error) {
      console.error('Roadmap generation error:', error);
      showToast({
        type: 'error',
        title: 'Roadmap Generation Failed',
        message: 'Could not generate compliance roadmap',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDocuments = async (templateId: string) => {
    if (!classificationResult || !regulatoryPathway) return;
    
    setIsProcessing(true);
    try {
      const deviceClass = classificationResult.manualOverride?.class || classificationResult.suggestedClass;
      
      // Generate document using the document generator service
      await DocumentGeneratorService.generateDocument({
        deviceClassification: `Class ${deviceClass}` as any,
        regulatoryPathway: regulatoryPathway.pathway as any,
        deviceType: deviceInfo.deviceName,
        intendedUse: deviceInfo.intendedUse,
        companyInfo: {
          name: companyInfo.legalName,
          address: companyInfo.address,
          contact: companyInfo.contactName,
          establishmentNumber: companyInfo.establishmentNumber
        },
        complianceFramework: complianceRoadmap?.applicableRegulations || [],
        templateType: templateId
      }, {
        onProgress: (progress) => {
          console.log(`Document generation progress: ${progress.progress}% - ${progress.message}`);
        },
        onComplete: (result) => {
          showToast({
            type: 'success',
            title: 'Document Generated',
            message: 'Your document has been generated successfully',
            duration: 3000
          });
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error('Document generation error:', error);
          showToast({
            type: 'error',
            title: 'Document Generation Failed',
            message: error,
            duration: 5000
          });
          setIsProcessing(false);
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
      setIsProcessing(false);
    }
  };

  const exportRoadmap = () => {
    if (!complianceRoadmap || !classificationResult || !regulatoryPathway) return;
    
    const roadmapData = {
      companyInfo,
      deviceInfo,
      classification: classificationResult,
      pathway: regulatoryPathway,
      roadmap: complianceRoadmap,
      generatedDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-roadmap-${deviceInfo.deviceName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast({
      type: 'success',
      title: 'Roadmap Exported',
      message: 'Your compliance roadmap has been exported',
      duration: 3000
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderCompanyInfoStep();
      case 1:
        return renderDeviceInfoStep();
      case 2:
        return renderClassificationStep();
      case 3:
        return renderPathwayStep();
      case 4:
        return renderRoadmapStep();
      default:
        return null;
    }
  };

  const renderCompanyInfoStep = () => {
    const errors = validationErrors.company || [];
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900">Company Information</h3>
        
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Legal Company Name *
            </label>
            <input
              type="text"
              value={companyInfo.legalName}
              onChange={(e) => handleCompanyInfoChange('legalName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter legal company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              DUNS Number *
            </label>
            <input
              type="text"
              value={companyInfo.dunsNumber}
              onChange={(e) => handleCompanyInfoChange('dunsNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter 9-digit DUNS number"
            />
            <p className="mt-1 text-xs text-slate-500">
              Data Universal Numbering System (DUNS) is a unique identifier for businesses
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual Revenue Range *
            </label>
            <select
              value={companyInfo.annualRevenue}
              onChange={(e) => handleCompanyInfoChange('annualRevenue', e.target.value)}
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
              value={companyInfo.employeeCount}
              onChange={(e) => handleCompanyInfoChange('employeeCount', e.target.value)}
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
              value={companyInfo.qmsStatus}
              onChange={(e) => handleCompanyInfoChange('qmsStatus', e.target.value)}
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
              value={companyInfo.priorSubmissions}
              onChange={(e) => handleCompanyInfoChange('priorSubmissions', e.target.value)}
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
                    checked={companyInfo.certifications.includes(certification)}
                    onChange={(e) => handleCertificationChange(certification, e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700">{certification}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-lg font-medium text-slate-900 mb-3">Primary Contact Information</h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Name *
            </label>
            <input
              type="text"
              value={companyInfo.contactName}
              onChange={(e) => handleCompanyInfoChange('contactName', e.target.value)}
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
              value={companyInfo.contactEmail}
              onChange={(e) => handleCompanyInfoChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter contact email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={companyInfo.contactPhone}
              onChange={(e) => handleCompanyInfoChange('contactPhone', e.target.value)}
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
              value={companyInfo.establishmentNumber || ''}
              onChange={(e) => handleCompanyInfoChange('establishmentNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter FDA establishment number"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Address *
            </label>
            <textarea
              value={companyInfo.address}
              onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter complete business address"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDeviceInfoStep = () => {
    const errors = validationErrors.device || [];
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900">Device Description</h3>
        
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Device Name *
            </label>
            <input
              type="text"
              value={deviceInfo.deviceName}
              onChange={(e) => handleDeviceInfoChange('deviceName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter device name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Intended Use *
            </label>
            <textarea
              value={deviceInfo.intendedUse}
              onChange={(e) => handleDeviceInfoChange('intendedUse', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Describe the intended use of the device"
              rows={3}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Device Description *
            </label>
            <textarea
              value={deviceInfo.deviceDescription}
              onChange={(e) => handleDeviceInfoChange('deviceDescription', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Provide a detailed description of the device"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Risk Level *
            </label>
            <select
              value={deviceInfo.riskLevel}
              onChange={(e) => handleDeviceInfoChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select risk level</option>
              {RISK_LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User Environment
            </label>
            <select
              value={deviceInfo.userEnvironment}
              onChange={(e) => handleDeviceInfoChange('userEnvironment', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select user environment</option>
              <option value="Hospital">Hospital</option>
              <option value="Home">Home</option>
              <option value="Clinical">Clinical setting</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Multiple">Multiple environments</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Patient Contact
            </label>
            <select
              value={deviceInfo.patientContact}
              onChange={(e) => handleDeviceInfoChange('patientContact', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select patient contact</option>
              <option value="none">No patient contact</option>
              <option value="surface">Surface contact only</option>
              <option value="external">External communicating</option>
              <option value="invasive">Invasive</option>
              <option value="implant">Implanted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Energy Source
            </label>
            <select
              value={deviceInfo.energySource}
              onChange={(e) => handleDeviceInfoChange('energySource', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select energy source</option>
              <option value="none">None (passive device)</option>
              <option value="battery">Battery powered</option>
              <option value="electrical">Electrical (mains)</option>
              <option value="pneumatic">Pneumatic/hydraulic</option>
              <option value="multiple">Multiple sources</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Technical Characteristics *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TECHNICAL_CHARACTERISTICS.map((characteristic) => (
                <label key={characteristic} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={deviceInfo.technicalCharacteristics.includes(characteristic)}
                    onChange={(e) => handleTechnicalCharacteristicChange(characteristic, e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <span className="text-sm text-slate-700">{characteristic}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Special Characteristics
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={deviceInfo.softwareComponent}
                  onChange={(e) => handleDeviceInfoChange('softwareComponent', e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Contains software/firmware</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={deviceInfo.sterile}
                  onChange={(e) => handleDeviceInfoChange('sterile', e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Provided sterile</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={deviceInfo.implantable}
                  onChange={(e) => handleDeviceInfoChange('implantable', e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Implantable</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={deviceInfo.lifeSupporting}
                  onChange={(e) => handleDeviceInfoChange('lifeSupporting', e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-700">Life-supporting/sustaining</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClassificationStep = () => {
    const errors = validationErrors.classification || [];
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900">Device Classification</h3>
        
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-slate-700">Analyzing device characteristics...</p>
          </div>
        ) : classificationResult ? (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-teal-600" />
                    <h4 className="text-lg font-semibold text-slate-900">
                      Class {classificationResult.manualOverride?.class || classificationResult.suggestedClass} Medical Device
                    </h4>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Product Code:</p>
                      <p className="text-sm text-slate-900">{classificationResult.productCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-700">Regulation Number:</p>
                      <p className="text-sm text-slate-900">{classificationResult.regulationNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-700">Submission Type:</p>
                      <p className="text-sm text-slate-900">{classificationResult.submissionType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-700">Confidence:</p>
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${classificationResult.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-900">{Math.round(classificationResult.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700">Classification Reasoning:</p>
                    <p className="text-sm text-slate-600 mt-1">{classificationResult.reasoning}</p>
                  </div>
                  
                  {classificationResult.cfrReferences.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">CFR References:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {classificationResult.cfrReferences.map((reference, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {reference}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {classificationResult.predicateDevices.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700">Potential Predicate Devices:</p>
                      <ul className="mt-1 text-sm text-slate-600 list-disc list-inside">
                        {classificationResult.predicateDevices.map((device, index) => (
                          <li key={index}>{device}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {classificationResult.manualOverride && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-800">Manual Override</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Classification manually changed to Class {classificationResult.manualOverride.class}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Justification: {classificationResult.manualOverride.justification}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Manual Classification Override</h4>
              <p className="text-sm text-slate-600 mb-4">
                If you believe the suggested classification is incorrect, you can manually override it.
                Please provide justification for the override.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Override Classification
                  </label>
                  <select
                    value={classificationResult.manualOverride?.class || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const justification = classificationResult.manualOverride?.justification || '';
                        handleClassificationOverride(e.target.value as 'I' | 'II' | 'III', justification);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">No override</option>
                    <option value="I">Class I</option>
                    <option value="II">Class II</option>
                    <option value="III">Class III</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Justification for Override
                  </label>
                  <textarea
                    value={classificationResult.manualOverride?.justification || ''}
                    onChange={(e) => {
                      if (classificationResult.manualOverride) {
                        handleClassificationOverride(
                          classificationResult.manualOverride.class,
                          e.target.value
                        );
                      }
                    }}
                    disabled={!classificationResult.manualOverride}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                    placeholder="Provide justification for classification override"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Classification Details</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-700">Class I Devices:</h5>
                  <p className="text-sm text-slate-600">
                    Low risk devices subject to general controls. Most Class I devices are exempt from premarket notification.
                  </p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-slate-700">Class II Devices:</h5>
                  <p className="text-sm text-slate-600">
                    Moderate risk devices subject to general and special controls. Most require 510(k) premarket notification.
                  </p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-slate-700">Class III Devices:</h5>
                  <p className="text-sm text-slate-600">
                    High risk devices subject to general controls and premarket approval (PMA). These devices usually sustain or support life, are implanted, or present potential unreasonable risk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Complete the device information to generate classification</p>
            <button
              onClick={classifyDevice}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Classify Device
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPathwayStep = () => {
    const errors = validationErrors.pathway || [];
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-900">Regulatory Pathway</h3>
        
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-slate-700">Generating regulatory pathway...</p>
          </div>
        ) : regulatoryPathway ? (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-6 w-6 text-teal-600" />
                <h4 className="text-lg font-semibold text-slate-900">
                  {regulatoryPathway.pathway} Pathway
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-700">Estimated Timeline:</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-slate-500 mr-1" />
                    <p className="text-sm text-slate-900">{regulatoryPathway.timeline}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-700">Estimated Cost:</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 text-slate-500 mr-1" />
                    <p className="text-sm text-slate-900">{regulatoryPathway.estimatedCost}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700">Key Requirements:</p>
                <ul className="mt-2 space-y-1">
                  {regulatoryPathway.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Submission Timeline</h4>
              
              <div className="relative">
                {regulatoryPathway.keyMilestones.map((milestone, index) => (
                  <div key={index} className="mb-8 flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      {index < regulatoryPathway.keyMilestones.length - 1 && (
                        <div className="h-full w-0.5 bg-teal-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{milestone.phase}</h5>
                        <span className="text-sm text-slate-500">{milestone.duration}</span>
                      </div>
                      
                      <div className="text-sm text-slate-600">
                        <p className="font-medium mb-1">Key Deliverables:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {milestone.deliverables.map((deliverable, idx) => (
                            <li key={idx}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Required Testing</h4>
                <ul className="space-y-2">
                  {regulatoryPathway.requiredTesting.map((test, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{test}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-slate-900 mb-4">Required Documentation</h4>
                <ul className="space-y-2">
                  {regulatoryPathway.documentationNeeded.map((doc, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Complete the device classification to generate regulatory pathway</p>
            <button
              onClick={generateRegulatoryPathway}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              disabled={!classificationResult}
            >
              Generate Pathway
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRoadmapStep = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Compliance Roadmap</h3>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportRoadmap}
              disabled={!complianceRoadmap}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export Roadmap</span>
            </button>
          </div>
        </div>
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-slate-700">Generating compliance roadmap...</p>
          </div>
        ) : complianceRoadmap ? (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-teal-600" />
                <h4 className="text-lg font-semibold text-slate-900">
                  Compliance Roadmap for {deviceInfo.deviceName}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-md font-medium text-slate-900 mb-3">Applicable Regulations</h5>
                  <ul className="space-y-2">
                    {complianceRoadmap.applicableRegulations.map((regulation, index) => (
                      <li key={index} className="flex items-start">
                        <Shield className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                        <span className="text-sm text-slate-600">{regulation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-md font-medium text-slate-900 mb-3">Required Standards</h5>
                  <ul className="space-y-2">
                    {complianceRoadmap.requiredStandards.map((standard, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                        <span className="text-sm text-slate-600">{standard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h5 className="text-md font-medium text-slate-900 mb-3">Required Testing Protocols</h5>
                <ul className="space-y-2">
                  {complianceRoadmap.testingProtocols.map((protocol, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{protocol}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h5 className="text-md font-medium text-slate-900 mb-3">Quality System Requirements</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {complianceRoadmap.qualitySystemRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h5 className="text-md font-medium text-slate-900 mb-3">Clinical Evidence Needs</h5>
                <ul className="space-y-2">
                  {complianceRoadmap.clinicalEvidenceNeeds.map((need, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{need}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h5 className="text-md font-medium text-slate-900 mb-3">Post-Market Surveillance Plan</h5>
                <ul className="space-y-2">
                  {complianceRoadmap.postMarketSurveillance.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h5 className="text-md font-medium text-slate-900 mb-4">Document Templates</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complianceRoadmap.documentTemplates.map((template, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h6 className="font-medium text-slate-900">{template.name}</h6>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => generateDocuments(template.templateId)}
                          className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Generate document"
                        >
                          <FileText className="h-4 w-4" />
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
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h5 className="text-md font-medium text-slate-900 mb-3">Next Steps</h5>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Review and finalize device classification</p>
                    <p className="text-sm text-slate-600">Ensure your device classification is accurate before proceeding</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Generate required documentation</p>
                    <p className="text-sm text-slate-600">Use the document templates to create your regulatory submission package</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Conduct required testing</p>
                    <p className="text-sm text-slate-600">Complete all necessary testing according to the testing protocols</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Submit to FDA</p>
                    <p className="text-sm text-slate-600">Prepare and submit your regulatory submission to the FDA</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Complete the regulatory pathway to generate compliance roadmap</p>
            <button
              onClick={generateComplianceRoadmap}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              disabled={!regulatoryPathway}
            >
              Generate Roadmap
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Regulatory Onboarding Wizard</h2>
              <p className="text-slate-600">
                Step-by-step guidance through the FDA approval process for medical devices
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium text-slate-700">FDA Compliant</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center w-full">
              {WIZARD_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <div 
                      className={`flex flex-col items-center ${
                        index === currentStep 
                          ? 'text-teal-600' 
                          : index < currentStep 
                          ? 'text-slate-600' 
                          : 'text-slate-400'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === currentStep 
                          ? 'bg-teal-100 border-2 border-teal-500' 
                          : index < currentStep 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-slate-200'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-xs mt-1">{step.title}</span>
                    </div>
                    {index < WIZARD_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-teal-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <div className="md:hidden flex items-center justify-between w-full">
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].title}
              </span>
              <div className="flex items-center space-x-1">
                <div className="text-xs text-slate-500">
                  {Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100)}%
                </div>
                <div className="w-16 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {savedProgress && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Progress saved</span>
              </div>
            )}
            <button
              onClick={() => {
                const wizardData = {
                  currentStep,
                  companyInfo,
                  deviceInfo,
                  classificationResult,
                  regulatoryPathway,
                  complianceRoadmap,
                  timestamp: new Date().toISOString()
                };
                localStorage.setItem('regulatory_wizard_progress', JSON.stringify(wizardData));
                setSavedProgress(true);
                setTimeout(() => setSavedProgress(false), 2000);
                
                showToast({
                  type: 'success',
                  title: 'Progress Saved',
                  message: 'Your progress has been saved',
                  duration: 2000
                });
              }}
              className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 text-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save Progress</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            {currentStep < WIZARD_STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={isProcessing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={exportRoadmap}
                disabled={!complianceRoadmap || isProcessing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Export Roadmap</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};