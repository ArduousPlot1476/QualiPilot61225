import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// API Constants
const ECFR_BASE_URL = 'https://www.ecfr.gov/api/versioner/v1/'
const FEDERAL_REGISTER_URL = 'https://www.federalregister.gov/api/v1/'
const FDA_DEVICE_API = 'https://api.fda.gov/device/'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const API_TIMEOUT = 10000 // 10 seconds

// Type Definitions
interface RegulatoryUpdate {
  id: string
  title: string
  type: 'proposed_rule' | 'final_rule' | 'guidance' | 'notice'
  agency: string
  publication_date: string
  effective_date?: string
  cfr_references: string[]
  summary: string
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  affected_devices: string[]
  document_url: string
  federal_register_number?: string
}

interface DeviceClassification {
  device_name: string
  device_class: 'I' | 'II' | 'III'
  product_code: string
  regulation_number: string
  submission_type: '510(k)' | 'PMA' | 'De Novo' | 'Exempt'
  definition: string
  guidance_documents: string[]
  predicate_devices?: string[]
}

interface CFRSection {
  title: number
  part: number
  section: string
  heading: string
  content: string
  effective_date: string
  last_updated: string
  related_sections: string[]
  guidance_references: string[]
  embedding?: number[]
}

interface SearchRequest {
  query: string
  filters?: {
    cfr_title?: number
    cfr_part?: number
    device_class?: string
    regulation_type?: string
    date_range?: {
      start: string
      end: string
    }
  }
  search_type?: 'hybrid' | 'semantic' | 'keyword'
  limit?: number
}

interface ComplianceAuditEntry {
  id: string
  user_id: string
  query: string
  results: any[]
  cfr_version: string
  timestamp: string
  response_time: number
  confidence_score: number
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

    const requestData = await req.json()
    const { action } = requestData

    let result: any
    const startTime = Date.now()

    switch (action) {
      case 'search_regulations':
        result = await searchRegulations(requestData as SearchRequest, supabase, openaiApiKey)
        break

      case 'get_device_classification':
        result = await getDeviceClassification(requestData.device_name, supabase)
        break

      case 'monitor_changes':
        result = await monitorRegulatoryChanges(requestData.cfr_parts, supabase)
        break

      case 'validate_citation':
        result = await validateCitation(requestData.citation, supabase)
        break

      case 'get_compliance_pathway':
        result = await getCompliancePathway(requestData.device_info, supabase)
        break

      case 'sync_ecfr_updates':
        result = await synceCFRUpdates(supabase, openaiApiKey)
        break

      case 'generate_gap_analysis':
        result = await generateGapAnalysis(requestData.requirements, supabase)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    const processingTime = Date.now() - startTime

    // Log audit entry
    await logAuditEntry(supabase, {
      user_id: user.id,
      action,
      query: requestData.query || action,
      results: Array.isArray(result) ? result.slice(0, 10) : [result],
      processing_time: processingTime,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({
        success: true,
        action,
        data: result,
        processing_time: processingTime,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Regulatory intelligence error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Advanced hybrid search for regulations
 */
async function searchRegulations(
  request: SearchRequest,
  supabase: any,
  openaiApiKey: string
): Promise<any> {
  const { query, filters = {}, search_type = 'hybrid', limit = 20 } = request

  // Generate query embedding for semantic search
  const queryEmbedding = await generateEmbedding(query, openaiApiKey)
  
  let semanticResults: any[] = []
  let keywordResults: any[] = []

  // Semantic search (60% weight)
  if (search_type === 'hybrid' || search_type === 'semantic') {
    const { data: semanticData } = await supabase.rpc('search_cfr_semantic', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      similarity_threshold: 0.7,
      match_count: Math.ceil(limit * 0.6),
      cfr_title: filters.cfr_title,
      cfr_part: filters.cfr_part
    })
    
    semanticResults = semanticData || []
  }

  // Keyword search (40% weight)
  if (search_type === 'hybrid' || search_type === 'keyword') {
    let keywordQuery = supabase
      .from('regulatory_documents')
      .select('*')
      .textSearch('content', query.replace(/[^\w\s]/g, ''))
      .limit(Math.ceil(limit * 0.4))

    if (filters.cfr_title) {
      keywordQuery = keywordQuery.eq('cfr_title', filters.cfr_title)
    }
    if (filters.cfr_part) {
      keywordQuery = keywordQuery.eq('cfr_part', filters.cfr_part)
    }

    const { data: keywordData } = await keywordQuery
    keywordResults = keywordData || []
  }

  // Combine and deduplicate results
  const combinedResults = combineSearchResults(semanticResults, keywordResults, query)
  
  // Enhance results with related information
  const enhancedResults = await enhanceSearchResults(combinedResults, supabase)

  return {
    results: enhancedResults.slice(0, limit),
    search_metadata: {
      query,
      search_type,
      semantic_count: semanticResults.length,
      keyword_count: keywordResults.length,
      total_results: enhancedResults.length,
      filters_applied: filters
    }
  }
}

/**
 * Get comprehensive device classification information
 */
async function getDeviceClassification(
  deviceName: string,
  supabase: any
): Promise<DeviceClassification> {
  // Search FDA device classification database
  const classificationUrl = `${FDA_DEVICE_API}classification.json?search=device_name:"${deviceName}"&limit=1`
  
  const response = await fetch(classificationUrl, {
    headers: { 'User-Agent': 'QualiPilot-Regulatory-Intelligence/1.0' }
  })

  if (!response.ok) {
    throw new Error(`FDA API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`Device classification not found for: ${deviceName}`)
  }

  const classification = data.results[0]

  // Get related guidance documents
  const { data: guidanceData } = await supabase
    .from('guidance_documents')
    .select('*')
    .ilike('title', `%${deviceName}%`)
    .limit(5)

  // Get predicate devices for 510(k) pathway
  const predicateDevices = await getPredicateDevices(classification.product_code, supabase)

  return {
    device_name: classification.device_name,
    device_class: classification.device_class,
    product_code: classification.product_code,
    regulation_number: classification.regulation_number,
    submission_type: determineSubmissionType(classification.device_class),
    definition: classification.definition,
    guidance_documents: guidanceData?.map((g: any) => g.title) || [],
    predicate_devices: predicateDevices
  }
}

/**
 * Monitor regulatory changes and updates
 */
async function monitorRegulatoryChanges(
  cfrParts: number[],
  supabase: any
): Promise<RegulatoryUpdate[]> {
  const updates: RegulatoryUpdate[] = []
  
  // Check Federal Register for recent updates
  for (const part of cfrParts) {
    const federalRegisterUrl = `${FEDERAL_REGISTER_URL}documents.json?conditions[cfr][title]=21&conditions[cfr][part]=${part}&conditions[publication_date][gte]=${getDateDaysAgo(30)}&per_page=10`
    
    try {
      const response = await fetch(federalRegisterUrl)
      if (response.ok) {
        const data = await response.json()
        
        for (const doc of data.results) {
          const update: RegulatoryUpdate = {
            id: doc.document_number,
            title: doc.title,
            type: mapDocumentType(doc.type),
            agency: doc.agencies[0]?.name || 'FDA',
            publication_date: doc.publication_date,
            effective_date: doc.effective_on,
            cfr_references: [`21 CFR ${part}`],
            summary: doc.abstract || '',
            impact_level: assessImpactLevel(doc.title, doc.abstract),
            affected_devices: extractAffectedDevices(doc.abstract),
            document_url: doc.html_url,
            federal_register_number: doc.document_number
          }
          
          updates.push(update)
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch updates for CFR part ${part}:`, error)
    }
  }

  // Store updates in database
  for (const update of updates) {
    await supabase
      .from('regulatory_updates')
      .upsert(update, { onConflict: 'id' })
  }

  return updates.sort((a, b) => 
    new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime()
  )
}

/**
 * Validate and parse CFR citations
 */
async function validateCitation(citation: string, supabase: any): Promise<any> {
  const cfrPattern = /^(\d{1,2})\s+CFR\s+(\d{1,4})\.(\d{1,4}[a-z]?)$/i
  const match = citation.trim().match(cfrPattern)
  
  if (!match) {
    return {
      valid: false,
      error: 'Invalid CFR citation format. Expected: "XX CFR YYY.ZZ"',
      suggestion: 'Use format like "21 CFR 820.30"'
    }
  }

  const [, title, part, section] = match
  
  // Check if citation exists in database
  const { data: cfrData, error } = await supabase
    .from('regulatory_documents')
    .select('*')
    .eq('cfr_title', parseInt(title))
    .eq('cfr_part', parseInt(part))
    .eq('cfr_section', section)
    .single()

  if (error || !cfrData) {
    return {
      valid: false,
      error: `CFR section ${citation} not found in database`,
      suggestion: 'Verify the citation exists in current CFR'
    }
  }

  // Generate interactive tooltip content
  const tooltip = {
    summary: cfrData.content.substring(0, 200) + '...',
    effective_date: cfrData.last_updated,
    revision_history: await getCFRRevisionHistory(title, part, section, supabase),
    related_guidance: await getRelatedGuidance(citation, supabase),
    ecfr_url: `https://www.ecfr.gov/current/title-${title}/chapter-I/subchapter-H/part-${part}/section-${section}`
  }

  return {
    valid: true,
    citation: {
      title: parseInt(title),
      part: parseInt(part),
      section: section,
      heading: cfrData.title,
      content: cfrData.content
    },
    tooltip,
    links: {
      ecfr: tooltip.ecfr_url,
      guidance: tooltip.related_guidance.map((g: any) => g.url)
    }
  }
}

/**
 * Get recommended compliance pathway
 */
async function getCompliancePathway(deviceInfo: any, supabase: any): Promise<any> {
  const { device_type, intended_use, device_class, predicate_device } = deviceInfo

  // Determine regulatory pathway based on device class
  let pathway = 'Unknown'
  let requirements: string[] = []
  let timeline = 'Unknown'
  let estimated_cost = 'Contact FDA'

  switch (device_class) {
    case 'I':
      pathway = predicate_device ? '510(k)' : 'Exempt'
      requirements = ['510(k) submission', 'Substantial equivalence demonstration']
      timeline = '3-6 months'
      estimated_cost = '$10,000 - $50,000'
      break
    
    case 'II':
      pathway = '510(k)'
      requirements = [
        '510(k) premarket notification',
        'Substantial equivalence demonstration',
        'Performance testing',
        'Labeling review'
      ]
      timeline = '6-12 months'
      estimated_cost = '$50,000 - $200,000'
      break
    
    case 'III':
      pathway = predicate_device ? '510(k)' : 'PMA'
      requirements = pathway === 'PMA' ? [
        'PMA application',
        'Clinical trials',
        'Manufacturing information',
        'Risk analysis',
        'Labeling'
      ] : [
        '510(k) submission',
        'Substantial equivalence',
        'Clinical data may be required'
      ]
      timeline = pathway === 'PMA' ? '1-3 years' : '6-18 months'
      estimated_cost = pathway === 'PMA' ? '$500,000 - $2,000,000' : '$100,000 - $500,000'
      break
  }

  // Get specific requirements from database
  const { data: pathwayData } = await supabase
    .from('regulatory_pathways')
    .select('*')
    .eq('device_class', device_class)
    .eq('pathway', pathway)
    .single()

  return {
    recommended_pathway: pathway,
    device_class,
    requirements,
    timeline,
    estimated_cost,
    detailed_requirements: pathwayData?.requirements || [],
    next_steps: [
      'Conduct predicate device search',
      'Prepare technical documentation',
      'Engage with FDA through pre-submission meeting',
      'Submit regulatory application'
    ],
    resources: {
      fda_guidance: `https://www.fda.gov/medical-devices/premarket-submissions/${pathway.toLowerCase()}`,
      regulations: [`21 CFR ${pathway === 'PMA' ? '814' : '807'}`]
    }
  }
}

/**
 * Sync eCFR updates and maintain cache
 */
async function synceCFRUpdates(supabase: any, openaiApiKey: string): Promise<any> {
  const syncResults = {
    updated_sections: 0,
    new_sections: 0,
    errors: 0,
    last_sync: new Date().toISOString()
  }

  // Get list of CFR parts to sync (Title 21, Parts 800-1299)
  const medicalDeviceParts = Array.from({ length: 500 }, (_, i) => 800 + i)

  for (const part of medicalDeviceParts.slice(0, 10)) { // Limit for demo
    try {
      // Check if we need to update this part
      const { data: lastSync } = await supabase
        .from('sync_status')
        .select('last_updated')
        .eq('cfr_part', part)
        .single()

      const shouldSync = !lastSync || 
        (Date.now() - new Date(lastSync.last_updated).getTime()) > CACHE_DURATION

      if (!shouldSync) continue

      // Fetch current structure from eCFR
      const structureUrl = `${ECFR_BASE_URL}structure/current/title-21/part-${part}`
      const response = await fetch(structureUrl, {
        headers: { 'User-Agent': 'QualiPilot-Regulatory-Intelligence/1.0' }
      })

      if (!response.ok) continue

      const partData = await response.json()
      
      if (partData.children) {
        for (const section of partData.children) {
          if (section.type !== 'section') continue

          // Fetch section content
          const contentUrl = `${ECFR_BASE_URL}full/current/title-21/part-${part}/section-${section.identifier}`
          const contentResponse = await fetch(contentUrl)
          
          if (contentResponse.ok) {
            const sectionData = await contentResponse.json()
            const content = extractTextContent(sectionData)
            
            if (content.length > 100) {
              // Generate embedding
              const embedding = await generateEmbedding(content, openaiApiKey)
              
              // Upsert section
              const { error } = await supabase
                .from('regulatory_documents')
                .upsert({
                  cfr_title: 21,
                  cfr_part: part,
                  cfr_section: section.identifier,
                  title: section.title || `21 CFR ${part}.${section.identifier}`,
                  content: content,
                  embedding: `[${embedding.join(',')}]`,
                  last_updated: new Date().toISOString(),
                  source_url: `https://www.ecfr.gov/current/title-21/part-${part}/section-${part}.${section.identifier}`
                }, { onConflict: 'cfr_title,cfr_part,cfr_section' })

              if (error) {
                syncResults.errors++
              } else {
                syncResults.updated_sections++
              }
            }
          }
        }
      }

      // Update sync status
      await supabase
        .from('sync_status')
        .upsert({
          cfr_part: part,
          last_updated: new Date().toISOString(),
          status: 'completed'
        }, { onConflict: 'cfr_part' })

    } catch (error) {
      console.error(`Error syncing CFR part ${part}:`, error)
      syncResults.errors++
    }
  }

  return syncResults
}

/**
 * Generate compliance gap analysis
 */
async function generateGapAnalysis(requirements: any, supabase: any): Promise<any> {
  const { current_documentation, target_standard, device_class } = requirements

  // Get required sections for target standard
  const { data: requiredSections } = await supabase
    .from('compliance_requirements')
    .select('*')
    .eq('standard', target_standard)
    .eq('device_class', device_class)

  const gaps = []
  const compliant = []

  for (const requirement of requiredSections || []) {
    const hasDocumentation = current_documentation.some((doc: any) => 
      doc.section === requirement.section_id
    )

    if (hasDocumentation) {
      compliant.push({
        section: requirement.section_id,
        title: requirement.title,
        status: 'compliant'
      })
    } else {
      gaps.push({
        section: requirement.section_id,
        title: requirement.title,
        priority: requirement.priority,
        description: requirement.description,
        guidance: requirement.implementation_guidance
      })
    }
  }

  const complianceScore = Math.round(
    (compliant.length / (compliant.length + gaps.length)) * 100
  )

  return {
    compliance_score: complianceScore,
    target_standard,
    device_class,
    summary: {
      total_requirements: requiredSections?.length || 0,
      compliant_sections: compliant.length,
      gap_sections: gaps.length
    },
    gaps,
    compliant_sections: compliant,
    recommendations: generateRecommendations(gaps, target_standard)
  }
}

// Helper Functions

function combineSearchResults(semantic: any[], keyword: any[], query: string): any[] {
  const combined = [...semantic]
  const existingIds = new Set(semantic.map(r => r.id))

  for (const result of keyword) {
    if (!existingIds.has(result.id)) {
      combined.push(result)
    }
  }

  return combined.sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
}

async function enhanceSearchResults(results: any[], supabase: any): Promise<any[]> {
  for (const result of results) {
    // Add related sections
    const { data: relatedSections } = await supabase
      .from('regulatory_documents')
      .select('cfr_section, title')
      .eq('cfr_title', result.cfr_title)
      .eq('cfr_part', result.cfr_part)
      .neq('cfr_section', result.cfr_section)
      .limit(3)

    result.related_sections = relatedSections || []

    // Add guidance documents
    const { data: guidance } = await supabase
      .from('guidance_documents')
      .select('title, url')
      .contains('cfr_references', [result.cfr_section])
      .limit(2)

    result.guidance_documents = guidance || []
  }

  return results
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const maxLength = 8000
  const textToEmbed = text.length > maxLength ? text.substring(0, maxLength) : text
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: textToEmbed,
      model: 'text-embedding-ada-002'
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI embeddings API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.data[0].embedding
}

function extractTextContent(sectionData: any): string {
  let content = ''
  
  function extractFromNode(node: any): void {
    if (typeof node === 'string') {
      content += node + ' '
      return
    }
    
    if (node.text) {
      content += node.text + ' '
    }
    
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(extractFromNode)
    }
  }
  
  if (sectionData.children) {
    sectionData.children.forEach(extractFromNode)
  }
  
  return content.trim().replace(/\s+/g, ' ')
}

function determineSubmissionType(deviceClass: string): '510(k)' | 'PMA' | 'De Novo' | 'Exempt' {
  switch (deviceClass) {
    case 'I': return 'Exempt'
    case 'II': return '510(k)'
    case 'III': return 'PMA'
    default: return 'De Novo'
  }
}

function mapDocumentType(type: string): 'proposed_rule' | 'final_rule' | 'guidance' | 'notice' {
  const typeMap: Record<string, any> = {
    'Proposed Rule': 'proposed_rule',
    'Final Rule': 'final_rule',
    'Guidance': 'guidance',
    'Notice': 'notice'
  }
  return typeMap[type] || 'notice'
}

function assessImpactLevel(title: string, abstract: string): 'low' | 'medium' | 'high' | 'critical' {
  const text = (title + ' ' + abstract).toLowerCase()
  
  if (text.includes('recall') || text.includes('safety alert') || text.includes('immediate')) {
    return 'critical'
  }
  if (text.includes('guidance') || text.includes('draft')) {
    return 'medium'
  }
  if (text.includes('final rule') || text.includes('effective immediately')) {
    return 'high'
  }
  return 'low'
}

function extractAffectedDevices(abstract: string): string[] {
  const deviceKeywords = [
    'pacemaker', 'defibrillator', 'stent', 'catheter', 'implant',
    'diagnostic', 'surgical', 'monitoring', 'therapeutic'
  ]
  
  return deviceKeywords.filter(keyword => 
    abstract.toLowerCase().includes(keyword)
  )
}

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

async function getPredicateDevices(productCode: string, supabase: any): Promise<string[]> {
  const { data } = await supabase
    .from('predicate_devices')
    .select('device_name')
    .eq('product_code', productCode)
    .limit(5)

  return data?.map((d: any) => d.device_name) || []
}

async function getCFRRevisionHistory(title: number, part: number, section: string, supabase: any): Promise<any[]> {
  const { data } = await supabase
    .from('cfr_revision_history')
    .select('*')
    .eq('cfr_title', title)
    .eq('cfr_part', part)
    .eq('cfr_section', section)
    .order('revision_date', { ascending: false })
    .limit(5)

  return data || []
}

async function getRelatedGuidance(citation: string, supabase: any): Promise<any[]> {
  const { data } = await supabase
    .from('guidance_documents')
    .select('title, url')
    .contains('cfr_references', [citation])
    .limit(3)

  return data || []
}

function generateRecommendations(gaps: any[], standard: string): string[] {
  const recommendations = [
    `Prioritize ${gaps.filter(g => g.priority === 'high').length} high-priority gaps`,
    `Develop implementation plan for ${standard} compliance`,
    'Engage regulatory consultant for complex requirements',
    'Schedule regular compliance reviews'
  ]

  return recommendations
}

async function logAuditEntry(supabase: any, entry: any): Promise<void> {
  await supabase
    .from('compliance_audit_log')
    .insert({
      user_id: entry.user_id,
      action: entry.action,
      query: entry.query,
      results_count: entry.results.length,
      processing_time: entry.processing_time,
      timestamp: entry.timestamp,
      cfr_version: 'current'
    })
}