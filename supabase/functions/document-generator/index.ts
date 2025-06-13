import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface DocumentGenerationRequest {
  deviceClassification: 'Class I' | 'Class II' | 'Class III'
  regulatoryPathway: '510(k)' | 'PMA' | 'De Novo'
  deviceType: string
  intendedUse: string
  companyInfo: {
    name: string
    address: string
    contact: string
    establishmentNumber?: string
  }
  complianceFramework: string[]
  templateType: string
  customRequirements?: any
}

interface DocumentTemplate {
  id: string
  name: string
  type: string
  classification: string[]
  pathway: string[]
  framework: string[]
  sections: TemplateSection[]
  metadata: {
    version: string
    lastUpdated: string
    cfrReferences: string[]
  }
}

interface TemplateSection {
  id: string
  title: string
  required: boolean
  conditional?: {
    field: string
    value: any
    operator: 'equals' | 'contains' | 'greaterThan'
  }
  content: string
  subsections?: TemplateSection[]
  cfrReferences: string[]
  validationRules: ValidationRule[]
}

interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'cfr_compliance'
  message: string
  parameters?: any
}

interface GenerationProgress {
  stage: string
  progress: number
  message: string
  timestamp: string
}

const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  'qms_manual': {
    id: 'qms_manual',
    name: 'Quality Management System Manual',
    type: 'QMS',
    classification: ['Class I', 'Class II', 'Class III'],
    pathway: ['510(k)', 'PMA', 'De Novo'],
    framework: ['21 CFR 820', 'ISO 13485'],
    sections: [
      {
        id: 'management_responsibility',
        title: '4.1 Management Responsibility',
        required: true,
        content: `# Management Responsibility

## 4.1.1 General Requirements
Top management shall establish and maintain a quality policy and ensure that:
- Quality objectives are established
- The quality management system is planned and developed
- Responsibilities and authorities are defined and communicated
- A management representative is appointed

**CFR Reference:** 21 CFR 820.20(a) - Management responsibility

## 4.1.2 Quality Policy
The organization shall establish a quality policy that:
- Is appropriate to the purpose of the organization
- Includes a commitment to comply with requirements
- Provides a framework for establishing quality objectives
- Is communicated and understood within the organization

**CFR Reference:** 21 CFR 820.20(b) - Quality policy`,
        subsections: [],
        cfrReferences: ['21 CFR 820.20'],
        validationRules: [
          {
            type: 'required',
            message: 'Management responsibility section is mandatory for all device classes'
          }
        ]
      },
      {
        id: 'design_controls',
        title: '4.4 Design Controls',
        required: true,
        conditional: {
          field: 'deviceClassification',
          value: 'Class I',
          operator: 'equals'
        },
        content: `# Design Controls

## 4.4.1 Design and Development Planning
The organization shall establish and maintain procedures for design controls that include:
- Design and development planning
- Design input requirements
- Design output requirements
- Design review procedures
- Design verification procedures
- Design validation procedures
- Design transfer procedures
- Design changes procedures

**CFR Reference:** 21 CFR 820.30 - Design controls

## 4.4.2 Design Inputs
Design input requirements shall:
- Be documented and reviewed for adequacy
- Address intended use and performance requirements
- Address safety and regulatory requirements
- Be traceable throughout the design process

**CFR Reference:** 21 CFR 820.30(c) - Design input`,
        subsections: [],
        cfrReferences: ['21 CFR 820.30'],
        validationRules: [
          {
            type: 'cfr_compliance',
            message: 'Design controls must comply with 21 CFR 820.30 requirements'
          }
        ]
      }
    ],
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      cfrReferences: ['21 CFR 820.20', '21 CFR 820.30', '21 CFR 820.40']
    }
  },
  'risk_management': {
    id: 'risk_management',
    name: 'Risk Management File',
    type: 'Risk Management',
    classification: ['Class I', 'Class II', 'Class III'],
    pathway: ['510(k)', 'PMA', 'De Novo'],
    framework: ['ISO 14971', '21 CFR 820.30'],
    sections: [
      {
        id: 'risk_management_process',
        title: '1. Risk Management Process',
        required: true,
        content: `# Risk Management Process

## 1.1 Risk Management Policy
This document establishes the risk management policy for {{deviceType}} in accordance with ISO 14971:2019.

**Scope:** This risk management file applies to {{deviceType}} intended for {{intendedUse}}.

**Risk Management Process Overview:**
1. Risk analysis
2. Risk evaluation
3. Risk control
4. Evaluation of overall residual risk acceptability
5. Risk management report

## 1.2 Risk Management Team
The risk management team consists of:
- Risk management coordinator
- Design engineers
- Clinical specialists
- Regulatory affairs personnel
- Quality assurance representatives

**Responsibilities:**
- Conduct systematic risk analysis
- Implement risk control measures
- Monitor and review risk management activities`,
        subsections: [],
        cfrReferences: ['ISO 14971:2019', '21 CFR 820.30(g)'],
        validationRules: [
          {
            type: 'required',
            message: 'Risk management process documentation is mandatory'
          }
        ]
      }
    ],
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      cfrReferences: ['ISO 14971:2019', '21 CFR 820.30']
    }
  },
  '510k_submission': {
    id: '510k_submission',
    name: '510(k) Premarket Notification',
    type: 'Regulatory Submission',
    classification: ['Class II'],
    pathway: ['510(k)'],
    framework: ['21 CFR 807'],
    sections: [
      {
        id: 'cover_letter',
        title: 'Cover Letter',
        required: true,
        content: `# 510(k) Premarket Notification Cover Letter

**Date:** {{currentDate}}

**To:** Document Control Center (HFZ-401)
Center for Devices and Radiological Health
Food and Drug Administration
10903 New Hampshire Avenue
Silver Spring, MD 20993-0002

**Subject:** 510(k) Premarket Notification for {{deviceType}}

Dear FDA Reviewer,

{{companyInfo.name}} respectfully submits this 510(k) premarket notification for {{deviceType}}, intended for {{intendedUse}}.

**Device Information:**
- Device Name: {{deviceType}}
- Classification: {{deviceClassification}}
- Product Code: [To be determined]
- Regulation Number: [To be determined]

**Predicate Device:**
[Predicate device information to be provided]

**Substantial Equivalence:**
This submission demonstrates substantial equivalence to the predicate device through:
- Intended use comparison
- Technological characteristics comparison
- Performance data comparison

We believe this device is substantially equivalent to the predicate device and request FDA clearance for commercial distribution.

Sincerely,
{{companyInfo.contact}}
{{companyInfo.name}}`,
        subsections: [],
        cfrReferences: ['21 CFR 807.87'],
        validationRules: [
          {
            type: 'required',
            message: 'Cover letter is required for 510(k) submissions'
          }
        ]
      }
    ],
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      cfrReferences: ['21 CFR 807.87', '21 CFR 807.92']
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData: DocumentGenerationRequest = await req.json()

    // Validate request
    const validationErrors = validateRequest(requestData)
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create document generation job
    const { data: documentJob, error: jobError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: `${requestData.templateType} - ${requestData.deviceType}`,
        type: requestData.templateType,
        status: 'processing',
        metadata: {
          deviceClassification: requestData.deviceClassification,
          regulatoryPathway: requestData.regulatoryPathway,
          deviceType: requestData.deviceType,
          intendedUse: requestData.intendedUse,
          companyInfo: requestData.companyInfo,
          complianceFramework: requestData.complianceFramework,
          generationStarted: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (jobError) {
      throw new Error(`Failed to create document job: ${jobError.message}`)
    }

    // Set up streaming response for progress updates
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          await sendProgress(controller, 'Initializing document generation', 0)

          // Fetch current eCFR data
          await sendProgress(controller, 'Fetching current regulatory data', 10)
          const cfrData = await fetchCurrentCFRData(requestData.complianceFramework)

          // Select and validate template
          await sendProgress(controller, 'Validating template compatibility', 20)
          const template = selectTemplate(requestData)
          const validationResults = await validateTemplate(template, requestData, cfrData)

          // Generate document content
          await sendProgress(controller, 'Generating document content', 30)
          const documentContent = await generateDocumentContent(
            template, 
            requestData, 
            cfrData, 
            openaiApiKey,
            (progress) => sendProgress(controller, 'Processing sections', 30 + (progress * 0.4))
          )

          // Perform compliance validation
          await sendProgress(controller, 'Validating compliance requirements', 70)
          const complianceReport = await validateCompliance(documentContent, requestData, cfrData)

          // Generate final document
          await sendProgress(controller, 'Generating final document', 80)
          const finalDocument = await generateFinalDocument(documentContent, requestData)

          // Store document
          await sendProgress(controller, 'Storing document', 90)
          const { data: storageResult, error: storageError } = await supabase.storage
            .from('documents')
            .upload(`${user.id}/${documentJob.id}.pdf`, finalDocument.pdf, {
              contentType: 'application/pdf'
            })

          if (storageError) {
            throw new Error(`Failed to store document: ${storageError.message}`)
          }

          // Update document status
          await supabase
            .from('documents')
            .update({
              status: 'completed',
              content: documentContent.text,
              metadata: {
                ...documentJob.metadata,
                generationCompleted: new Date().toISOString(),
                validationResults,
                complianceReport,
                storageUrl: storageResult.path
              }
            })
            .eq('id', documentJob.id)

          // Send completion
          await sendProgress(controller, 'Document generation completed', 100)
          
          const completionData = `data: ${JSON.stringify({
            type: 'complete',
            documentId: documentJob.id,
            downloadUrl: storageResult.path,
            validationResults,
            complianceReport
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(completionData))

        } catch (error) {
          console.error('Document generation error:', error)
          
          // Update document status to error
          await supabase
            .from('documents')
            .update({
              status: 'error',
              metadata: {
                ...documentJob.metadata,
                error: error.message,
                errorTimestamp: new Date().toISOString()
              }
            })
            .eq('id', documentJob.id)

          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error.message || 'Document generation failed'
          })}\n\n`
          
          controller.enqueue(new TextEncoder().encode(errorData))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Request error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendProgress(
  controller: ReadableStreamDefaultController,
  message: string,
  progress: number
): Promise<void> {
  const progressData = `data: ${JSON.stringify({
    type: 'progress',
    message,
    progress: Math.round(progress),
    timestamp: new Date().toISOString()
  })}\n\n`
  
  controller.enqueue(new TextEncoder().encode(progressData))
}

function validateRequest(request: DocumentGenerationRequest): string[] {
  const errors: string[] = []

  if (!['Class I', 'Class II', 'Class III'].includes(request.deviceClassification)) {
    errors.push('Invalid device classification')
  }

  if (!['510(k)', 'PMA', 'De Novo'].includes(request.regulatoryPathway)) {
    errors.push('Invalid regulatory pathway')
  }

  if (!request.deviceType || request.deviceType.trim().length === 0) {
    errors.push('Device type is required')
  }

  if (!request.intendedUse || request.intendedUse.trim().length === 0) {
    errors.push('Intended use is required')
  }

  if (!request.companyInfo?.name || request.companyInfo.name.trim().length === 0) {
    errors.push('Company name is required')
  }

  return errors
}

async function fetchCurrentCFRData(frameworks: string[]): Promise<any> {
  // Fetch current CFR data from eCFR API
  const cfrData: any = {}
  
  for (const framework of frameworks) {
    if (framework.startsWith('21 CFR')) {
      const part = framework.split(' ')[2]
      try {
        const response = await fetch(
          `https://www.ecfr.gov/api/versioner/v1/structure/current/title-21/part-${part}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'QualiPilot-Document-Generator/1.0'
            }
          }
        )
        
        if (response.ok) {
          cfrData[framework] = await response.json()
        }
      } catch (error) {
        console.warn(`Failed to fetch CFR data for ${framework}:`, error)
      }
    }
  }
  
  return cfrData
}

function selectTemplate(request: DocumentGenerationRequest): DocumentTemplate {
  const template = DOCUMENT_TEMPLATES[request.templateType]
  
  if (!template) {
    throw new Error(`Template not found: ${request.templateType}`)
  }

  // Validate template compatibility
  if (!template.classification.includes(request.deviceClassification)) {
    throw new Error(`Template not compatible with ${request.deviceClassification}`)
  }

  if (!template.pathway.includes(request.regulatoryPathway)) {
    throw new Error(`Template not compatible with ${request.regulatoryPathway}`)
  }

  return template
}

async function validateTemplate(
  template: DocumentTemplate,
  request: DocumentGenerationRequest,
  cfrData: any
): Promise<any> {
  const validationResults = {
    templateValid: true,
    cfrCurrent: true,
    sectionsValid: true,
    warnings: [] as string[],
    errors: [] as string[]
  }

  // Validate CFR references are current
  for (const cfrRef of template.metadata.cfrReferences) {
    if (!cfrData[cfrRef]) {
      validationResults.warnings.push(`Could not validate current status of ${cfrRef}`)
    }
  }

  // Validate required sections
  for (const section of template.sections) {
    if (section.required && section.conditional) {
      const conditionMet = evaluateCondition(section.conditional, request)
      if (!conditionMet) {
        validationResults.warnings.push(`Conditional section ${section.title} may not be required`)
      }
    }
  }

  return validationResults
}

function evaluateCondition(condition: any, request: DocumentGenerationRequest): boolean {
  const fieldValue = (request as any)[condition.field]
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value
    case 'contains':
      return fieldValue?.includes?.(condition.value) || false
    case 'greaterThan':
      return fieldValue > condition.value
    default:
      return false
  }
}

async function generateDocumentContent(
  template: DocumentTemplate,
  request: DocumentGenerationRequest,
  cfrData: any,
  openaiApiKey: string,
  progressCallback: (progress: number) => Promise<void>
): Promise<{ text: string; sections: any[] }> {
  const sections = []
  let fullText = `# ${template.name}\n\n`
  
  // Add document header
  fullText += generateDocumentHeader(request)
  
  let sectionIndex = 0
  const totalSections = template.sections.length

  for (const section of template.sections) {
    await progressCallback((sectionIndex / totalSections) * 100)
    
    // Check if section should be included
    if (section.conditional && !evaluateCondition(section.conditional, request)) {
      continue
    }

    // Process section content with AI enhancement
    const processedContent = await enhanceSectionContent(
      section,
      request,
      cfrData,
      openaiApiKey
    )

    sections.push({
      id: section.id,
      title: section.title,
      content: processedContent,
      cfrReferences: section.cfrReferences
    })

    fullText += `\n\n${processedContent}\n\n`
    sectionIndex++
  }

  return { text: fullText, sections }
}

function generateDocumentHeader(request: DocumentGenerationRequest): string {
  return `
**Document Information:**
- Company: ${request.companyInfo.name}
- Device: ${request.deviceType}
- Classification: ${request.deviceClassification}
- Regulatory Pathway: ${request.regulatoryPathway}
- Intended Use: ${request.intendedUse}
- Generation Date: ${new Date().toLocaleDateString()}
- Compliance Framework: ${request.complianceFramework.join(', ')}

---
`
}

async function enhanceSectionContent(
  section: TemplateSection,
  request: DocumentGenerationRequest,
  cfrData: any,
  openaiApiKey: string
): Promise<string> {
  // Replace template variables
  let content = section.content
  content = content.replace(/\{\{deviceType\}\}/g, request.deviceType)
  content = content.replace(/\{\{intendedUse\}\}/g, request.intendedUse)
  content = content.replace(/\{\{deviceClassification\}\}/g, request.deviceClassification)
  content = content.replace(/\{\{companyInfo\.name\}\}/g, request.companyInfo.name)
  content = content.replace(/\{\{companyInfo\.contact\}\}/g, request.companyInfo.contact || '')
  content = content.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString())

  // Enhance with AI if needed
  if (section.cfrReferences.length > 0) {
    try {
      const enhancedContent = await enhanceWithAI(content, section, request, openaiApiKey)
      return enhancedContent
    } catch (error) {
      console.warn('AI enhancement failed, using template content:', error)
    }
  }

  return content
}

async function enhanceWithAI(
  content: string,
  section: TemplateSection,
  request: DocumentGenerationRequest,
  openaiApiKey: string
): Promise<string> {
  const prompt = `
You are a regulatory compliance expert. Enhance the following document section for a ${request.deviceClassification} ${request.deviceType} device.

Section: ${section.title}
Current Content: ${content}

Requirements:
- Maintain FDA compliance
- Include specific requirements for ${request.deviceClassification} devices
- Reference CFR sections: ${section.cfrReferences.join(', ')}
- Keep professional, regulatory tone
- Ensure completeness for ${request.regulatoryPathway} pathway

Enhanced Section:
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert FDA regulatory compliance specialist.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.1
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function validateCompliance(
  documentContent: any,
  request: DocumentGenerationRequest,
  cfrData: any
): Promise<any> {
  const complianceReport = {
    overallCompliance: 'Compliant',
    requiredSections: [],
    missingRequirements: [],
    recommendations: [],
    cfrValidation: {}
  }

  // Validate required sections based on device classification
  const requiredSections = getRequiredSections(request.deviceClassification, request.regulatoryPathway)
  
  for (const requiredSection of requiredSections) {
    const sectionFound = documentContent.sections.find((s: any) => s.id === requiredSection.id)
    
    if (!sectionFound) {
      complianceReport.missingRequirements.push({
        section: requiredSection.title,
        requirement: 'Section missing',
        severity: 'High'
      })
    }
  }

  // Validate CFR compliance
  for (const section of documentContent.sections) {
    for (const cfrRef of section.cfrReferences) {
      complianceReport.cfrValidation[cfrRef] = {
        referenced: true,
        current: !!cfrData[cfrRef],
        lastChecked: new Date().toISOString()
      }
    }
  }

  if (complianceReport.missingRequirements.length > 0) {
    complianceReport.overallCompliance = 'Non-Compliant'
  }

  return complianceReport
}

function getRequiredSections(classification: string, pathway: string): any[] {
  // Define required sections based on classification and pathway
  const baseSections = [
    { id: 'management_responsibility', title: 'Management Responsibility' }
  ]

  if (classification !== 'Class I') {
    baseSections.push({ id: 'design_controls', title: 'Design Controls' })
  }

  if (pathway === '510(k)') {
    baseSections.push({ id: 'substantial_equivalence', title: 'Substantial Equivalence' })
  }

  return baseSections
}

async function generateFinalDocument(
  documentContent: any,
  request: DocumentGenerationRequest
): Promise<{ pdf: Uint8Array; docx: Uint8Array }> {
  // For this implementation, we'll create a simple text-based PDF
  // In production, you would use a proper PDF generation library
  
  const pdfContent = `
QualiPilot Generated Document
${documentContent.text}

Generated on: ${new Date().toISOString()}
For: ${request.companyInfo.name}
Device: ${request.deviceType} (${request.deviceClassification})
`

  // Convert to Uint8Array (simplified for demo)
  const pdfBytes = new TextEncoder().encode(pdfContent)
  const docxBytes = new TextEncoder().encode(pdfContent) // Simplified

  return {
    pdf: pdfBytes,
    docx: docxBytes
  }
}