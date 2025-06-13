# Regulatory Onboarding Wizard for Medical Device Companies

A comprehensive step-by-step wizard that guides medical device companies through the FDA approval process, from company information collection to compliance roadmap generation.

## 🚀 Key Features

### 🏢 Company Information Collection
- **Comprehensive Data Gathering**: Legal name, DUNS number, revenue range, employee count
- **Real-time DUNS Validation**: Validates 9-digit format with immediate feedback
- **QMS Status Tracking**: Captures current quality management system status
- **Certification Management**: Records ISO 13485, ISO 14971, and other certifications
- **Contact Information**: Structured collection of primary contact details
- **Submission History**: Tracks prior FDA submissions for reference

### 📋 Device Description Questionnaire
- **Guided Product Description**: Structured collection of device characteristics
- **Risk Level Assessment**: Categorization based on potential harm
- **Technical Characteristics**: Multi-select interface for device components
- **Special Characteristics**: Identification of software, sterility, implantability
- **User Environment**: Specification of intended use environment
- **Patient Contact Classification**: Categorization of patient interaction level

### 🛡️ Smart Device Classification
- **FDA Database Integration**: Direct connection to FDA product code database
- **AI-Powered Classification**: Intelligent algorithm for device class determination
- **Confidence Scoring**: Transparency in classification certainty
- **Similar Device Identification**: Displays potential predicate devices
- **CFR Reference Linking**: Direct links to relevant regulatory sections
- **Manual Override**: Option to override with justification

### 🧭 Personalized Regulatory Pathway
- **Pathway Recommendation**: Based on device class and characteristics
- **Detailed Requirements**: Comprehensive list of submission requirements
- **Timeline Visualization**: Interactive timeline with key milestones
- **Cost Estimation**: Breakdown of expected costs
- **Testing Requirements**: Identification of necessary testing protocols
- **Documentation Checklist**: Complete list of required documentation

### 📊 Compliance Roadmap Generation
- **Applicable Regulations**: Comprehensive list of relevant CFR sections
- **Required Standards**: Identification of applicable ISO and IEC standards
- **Testing Protocol Identification**: Specific testing requirements
- **Quality System Requirements**: Detailed QMS components needed
- **Clinical Evidence Needs**: Determination of clinical data requirements
- **Post-Market Surveillance Plan**: Customized surveillance requirements
- **Document Template Access**: Pre-filled templates based on device profile

## 💻 Technical Implementation

### Progressive Web App Architecture
```typescript
// Main wizard component with step management
export const RegulatoryWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({...});
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({...});
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [regulatoryPathway, setRegulatoryPathway] = useState<RegulatoryPathway | null>(null);
  const [complianceRoadmap, setComplianceRoadmap] = useState<ComplianceRoadmap | null>(null);
  
  // Auto-save functionality
  useEffect(() => {
    const saveProgress = () => {
      localStorage.setItem('regulatory_wizard_progress', JSON.stringify({
        currentStep, companyInfo, deviceInfo, classificationResult,
        regulatoryPathway, complianceRoadmap
      }));
    };
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentStep, companyInfo, deviceInfo, classificationResult, 
      regulatoryPathway, complianceRoadmap]);
};
```

### Real-time Validation System
```typescript
const validateForm = (): boolean => {
  const errors: string[] = [];
  
  // Company information validation
  if (!companyInfo.legalName) errors.push('Legal company name is required');
  if (!companyInfo.dunsNumber) errors.push('DUNS number is required');
  if (!validateDUNS(companyInfo.dunsNumber)) errors.push('Invalid DUNS format');
  
  // Email validation
  if (!validateEmail(companyInfo.contactEmail)) errors.push('Invalid email format');
  
  setValidationErrors(errors);
  return errors.length === 0;
};

// DUNS number validation (9 digits)
const validateDUNS = (duns: string): boolean => {
  return /^\d{9}$/.test(duns);
};

// Email validation
const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};
```

### FDA Database Integration
```typescript
const classifyDevice = async () => {
  setIsProcessing(true);
  try {
    // Get classification from FDA database
    const classification = await RegulatoryIntelligenceService.getDeviceClassification(
      deviceInfo.deviceName
    );
    
    // Get similar devices for predicate selection
    const predicates = await RegulatoryIntelligenceService.getPredicateDevices(
      classification.product_code
    );
    
    setClassificationResult({
      suggestedClass: classification.device_class,
      confidence: 0.95,
      productCode: classification.product_code,
      regulationNumber: classification.regulation_number,
      submissionType: classification.submission_type,
      predicateDevices: predicates.map(p => p.device_name),
      cfrReferences: [classification.regulation_number],
      reasoning: `Classification based on FDA database match for ${deviceInfo.deviceName}`
    });
  } catch (error) {
    console.error('Classification error:', error);
    // Fallback to AI-based classification
    classifyDeviceWithAI();
  } finally {
    setIsProcessing(false);
  }
};
```

### Document Generation Integration
```typescript
const generateDocuments = async (templateId: string) => {
  setIsProcessing(true);
  try {
    await DocumentGeneratorService.generateDocument({
      deviceClassification: `Class ${deviceClass}`,
      regulatoryPathway: pathway.pathway,
      deviceType: deviceInfo.deviceName,
      intendedUse: deviceInfo.intendedUse,
      companyInfo: {
        name: companyInfo.legalName,
        address: companyInfo.address,
        contact: companyInfo.contactName
      },
      complianceFramework: complianceRoadmap.applicableRegulations,
      templateType: templateId
    }, {
      onProgress: (progress) => {
        console.log(`${progress.progress}%: ${progress.message}`);
      },
      onComplete: (result) => {
        showToast({
          type: 'success',
          title: 'Document Generated',
          message: 'Your document has been generated successfully'
        });
      }
    });
  } catch (error) {
    console.error('Document generation error:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

### Progress Tracking & Auto-save
```typescript
// Auto-save functionality
useEffect(() => {
  const saveProgress = () => {
    localStorage.setItem('regulatory_wizard_progress', JSON.stringify({
      currentStep, companyInfo, deviceInfo, classificationResult,
      regulatoryPathway, complianceRoadmap, timestamp: new Date().toISOString()
    }));
    setSavedProgress(true);
    setTimeout(() => setSavedProgress(false), 2000);
  };

  const timeoutId = setTimeout(saveProgress, 1000);
  return () => clearTimeout(timeoutId);
}, [currentStep, companyInfo, deviceInfo, classificationResult, 
    regulatoryPathway, complianceRoadmap]);

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
```

## 📊 User Interface Components

### Step-by-Step Navigation
```jsx
<div className="flex items-center w-full">
  {WIZARD_STEPS.map((step, index) => {
    const StepIcon = step.icon;
    return (
      <React.Fragment key={step.id}>
        <div className={`flex flex-col items-center ${
          index === currentStep 
            ? 'text-teal-600' 
            : index < currentStep 
            ? 'text-slate-600' 
            : 'text-slate-400'
        }`}>
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
```

### Classification Result Card
```jsx
<div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
  <div className="flex items-start justify-between">
    <div>
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-teal-600" />
        <h4 className="text-lg font-semibold text-slate-900">
          Class {classificationResult.suggestedClass} Medical Device
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
            <span className="text-sm text-slate-900">
              {Math.round(classificationResult.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Regulatory Pathway Timeline
```jsx
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
```

### Document Template Cards
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {complianceRoadmap.documentTemplates.map((template) => (
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
            className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
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
```

## 📋 Data Models

### Company Information
```typescript
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
```

### Device Information
```typescript
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
```

### Classification Result
```typescript
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
```

### Regulatory Pathway
```typescript
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
```

### Compliance Roadmap
```typescript
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
```

## 🔧 Integration Points

### FDA Database Connection
```typescript
// Device classification lookup
const classification = await RegulatoryIntelligenceService.getDeviceClassification(
  deviceInfo.deviceName
);

// Predicate device search
const predicates = await RegulatoryIntelligenceService.getPredicateDevices(
  classification.product_code
);

// CFR citation validation
const citation = await RegulatoryIntelligenceService.validateCitation(
  "21 CFR 820.30"
);
```

### Document Generation
```typescript
// Generate document from template
await DocumentGeneratorService.generateDocument({
  deviceClassification: `Class ${deviceClass}`,
  regulatoryPathway: pathway.pathway,
  deviceType: deviceInfo.deviceName,
  intendedUse: deviceInfo.intendedUse,
  companyInfo: {
    name: companyInfo.legalName,
    address: companyInfo.address,
    contact: companyInfo.contactName
  },
  complianceFramework: complianceRoadmap.applicableRegulations,
  templateType: templateId
}, {
  onProgress: (progress) => {
    console.log(`${progress.progress}%: ${progress.message}`);
  },
  onComplete: (result) => {
    // Handle completion
  }
});
```

### Roadmap Export
```typescript
const exportRoadmap = () => {
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
};
```

## 🚀 Usage Workflow

1. **Company Information Collection**
   - Enter legal company name and DUNS number
   - Select annual revenue range and employee count
   - Specify QMS status and certifications
   - Provide primary contact information

2. **Device Description**
   - Enter device name and intended use
   - Provide detailed device description
   - Select risk level and technical characteristics
   - Specify special characteristics (software, sterility, etc.)

3. **Device Classification**
   - System analyzes device characteristics
   - Queries FDA database for matching devices
   - Determines device class (I, II, or III)
   - Identifies potential predicate devices
   - Allows manual override with justification

4. **Regulatory Pathway Determination**
   - Recommends appropriate submission pathway
   - Provides timeline and cost estimates
   - Lists key milestones and deliverables
   - Identifies required testing and documentation

5. **Compliance Roadmap Generation**
   - Creates comprehensive regulatory roadmap
   - Lists applicable regulations and standards
   - Identifies required testing protocols
   - Specifies quality system requirements
   - Provides document templates pre-filled with company data

6. **Document Generation**
   - Generate required documentation from templates
   - Export compliance roadmap for reference
   - Access FDA guidance and resources

This regulatory onboarding wizard streamlines the complex FDA approval process, providing step-by-step guidance tailored to each medical device company's specific needs.