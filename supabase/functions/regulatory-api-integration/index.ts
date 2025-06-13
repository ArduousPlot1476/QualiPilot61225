import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// API Constants
const ECFR_BASE_URL = 'https://www.ecfr.gov/api/versioner/v1/'
const FDA_PRODUCT_CLASSIFICATION_URL = 'https://api.fda.gov/device/classification.json'
const FDA_510K_URL = 'https://api.fda.gov/device/510k.json'
const FEDERAL_REGISTER_URL = 'https://www.federalregister.gov/api/v1/'
const API_TIMEOUT = 10000 // 10 seconds

// Type Definitions
interface RegulationCitation {
  title: number
  chapter?: number
  part: number
  section: string
  isValid: boolean
  errorMessage?: string
}

interface eCFRResponse {
  title: string
  identifier: string
  label_level: string
  children?: eCFRNode[]
  text?: string
  effective_date?: string
  last_updated?: string
}

interface eCFRNode {
  identifier: string
  label_level: string
  title: string
  children?: eCFRNode[]
  text?: string
}

interface FDAClassificationResponse {
  meta: {
    disclaimer: string
    terms: string
    license: string
    last_updated: string
    results: {
      skip: number
      limit: number
      total: number
    }
  }
  results: FDAClassificationResult[]
}

interface FDAClassificationResult {
  device_name: string
  medical_specialty_description: string
  device_class: string
  regulation_number: string
  product_code: string
  submission_type_id: string
  definition: string
  physical_state: string
  technical_method: string
  target_area: string
}

interface FDA510KResponse {
  meta: {
    disclaimer: string
    terms: string
    license: string
    last_updated: string
    results: {
      skip: number
      limit: number
      total: number
    }
  }
  results: FDA510KResult[]
}

interface FDA510KResult {
  k_number: string
  device_name: string
  applicant: string
  date_received: string
  decision_date: string
  decision_description: string
  clearance_type: string
  product_code: string
  statement_or_summary: string
  type: string
  expedited_review_flag: string
}

interface FederalRegisterResponse {
  count: number
  description: string
  results: FederalRegisterDocument[]
}

interface FederalRegisterDocument {
  abstract: string
  action: string
  agencies: Array<{
    id: number
    name: string
    url: string
  }>
  body_html_url: string
  cfr_references: Array<{
    title: number
    part: number
    chapter: number
  }>
  citation: string
  document_number: string
  effective_on: string
  html_url: string
  pdf_url: string
  publication_date: string
  title: string
  type: string
}

interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
  source: 'eCFR' | 'FDA' | 'FederalRegister'
}

interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
}

/**
 * Type-safe regulation parser function
 * Accepts CFR citations in the format "XX CFR YYY.ZZ"
 * Returns structured regulation data including title, chapter, part, and section
 */
function parseRegulationCitation(citation: string): RegulationCitation {
  // Remove extra whitespace and normalize
  const normalizedCitation = citation.trim().replace(/\s+/g, ' ')
  
  // Pattern for "XX CFR YYY.ZZ" format
  const cfrPattern = /^(\d{1,2})\s+CFR\s+(\d{1,4})\.(\d{1,4}[a-z]?)$/i
  const match = normalizedCitation.match(cfrPattern)
  
  if (!match) {
    return {
      title: 0,
      part: 0,
      section: '',
      isValid: false,
      errorMessage: `Invalid CFR citation format. Expected format: "XX CFR YYY.ZZ" (e.g., "21 CFR 820.30")`
    }
  }
  
  const [, titleStr, partStr, sectionStr] = match
  const title = parseInt(titleStr, 10)
  const part = parseInt(partStr, 10)
  
  // Validate title range (CFR titles are 1-50)
  if (title < 1 || title > 50) {
    return {
      title,
      part,
      section: sectionStr,
      isValid: false,
      errorMessage: `Invalid CFR title: ${title}. CFR titles must be between 1 and 50.`
    }
  }
  
  // Validate part range (reasonable bounds)
  if (part < 1 || part > 9999) {
    return {
      title,
      part,
      section: sectionStr,
      isValid: false,
      errorMessage: `Invalid CFR part: ${part}. Part numbers must be between 1 and 9999.`
    }
  }
  
  // Validate section format
  if (!/^\d{1,4}[a-z]?$/.test(sectionStr)) {
    return {
      title,
      part,
      section: sectionStr,
      isValid: false,
      errorMessage: `Invalid CFR section format: ${sectionStr}. Expected format: number optionally followed by a letter.`
    }
  }
  
  return {
    title,
    part,
    section: sectionStr,
    isValid: true
  }
}

/**
 * Retry logic with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = { maxAttempts: 3, baseDelay: 1000, maxDelay: 10000 }
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === config.maxAttempts) {
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      )
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * Fetch with timeout and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'QualiPilot-Regulatory-Assistant/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`)
    }
    
    throw error
  }
}

/**
 * Fetch eCFR content with comprehensive error handling
 */
async function fetcheCFRContent(citation: RegulationCitation): Promise<eCFRResponse> {
  if (!citation.isValid) {
    throw new Error(citation.errorMessage || 'Invalid citation')
  }
  
  const { title, part, section } = citation
  const url = `${ECFR_BASE_URL}full/current/title-${title}/part-${part}/section-${part}.${section}`
  
  return await withRetry(async () => {
    console.log(`Fetching eCFR content: ${url}`)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`CFR section ${title} CFR ${part}.${section} not found`)
      }
      if (response.status === 429) {
        throw new Error('eCFR API rate limit exceeded. Please try again later.')
      }
      if (response.status >= 500) {
        throw new Error(`eCFR API server error (${response.status}). Please try again later.`)
      }
      
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`eCFR API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from eCFR API')
    }
    
    return data as eCFRResponse
  })
}

/**
 * Fetch FDA device classification data
 */
async function fetchFDAClassification(
  searchTerm?: string,
  productCode?: string,
  limit: number = 10
): Promise<FDAClassificationResponse> {
  let url = FDA_PRODUCT_CLASSIFICATION_URL
  const params = new URLSearchParams()
  
  if (searchTerm) {
    params.append('search', `device_name:"${searchTerm}"`)
  }
  
  if (productCode) {
    params.append('search', `product_code:"${productCode}"`)
  }
  
  params.append('limit', limit.toString())
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  return await withRetry(async () => {
    console.log(`Fetching FDA classification: ${url}`)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('FDA classification data not found')
      }
      if (response.status === 429) {
        throw new Error('FDA API rate limit exceeded. Please try again later.')
      }
      
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`FDA API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from FDA classification API')
    }
    
    return data as FDAClassificationResponse
  })
}

/**
 * Fetch FDA 510(k) data
 */
async function fetchFDA510K(
  searchTerm?: string,
  kNumber?: string,
  limit: number = 10
): Promise<FDA510KResponse> {
  let url = FDA_510K_URL
  const params = new URLSearchParams()
  
  if (searchTerm) {
    params.append('search', `device_name:"${searchTerm}"`)
  }
  
  if (kNumber) {
    params.append('search', `k_number:"${kNumber}"`)
  }
  
  params.append('limit', limit.toString())
  
  if (params.toString()) {
    url += '?' + params.toString()
  }
  
  return await withRetry(async () => {
    console.log(`Fetching FDA 510(k): ${url}`)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('FDA 510(k) data not found')
      }
      if (response.status === 429) {
        throw new Error('FDA API rate limit exceeded. Please try again later.')
      }
      
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`FDA API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from FDA 510(k) API')
    }
    
    return data as FDA510KResponse
  })
}

/**
 * Fetch Federal Register documents
 */
async function fetchFederalRegister(
  searchTerm?: string,
  cfrTitle?: number,
  cfrPart?: number,
  limit: number = 10
): Promise<FederalRegisterResponse> {
  let url = FEDERAL_REGISTER_URL + 'documents.json'
  const params = new URLSearchParams()
  
  if (searchTerm) {
    params.append('conditions[term]', searchTerm)
  }
  
  if (cfrTitle && cfrPart) {
    params.append('conditions[cfr][title]', cfrTitle.toString())
    params.append('conditions[cfr][part]', cfrPart.toString())
  }
  
  params.append('per_page', limit.toString())
  params.append('order', 'newest')
  
  url += '?' + params.toString()
  
  return await withRetry(async () => {
    console.log(`Fetching Federal Register: ${url}`)
    
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Federal Register documents not found')
      }
      if (response.status === 429) {
        throw new Error('Federal Register API rate limit exceeded. Please try again later.')
      }
      
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Federal Register API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from Federal Register API')
    }
    
    return data as FederalRegisterResponse
  })
}

/**
 * Create standardized API error
 */
function createAPIError(
  message: string,
  source: 'eCFR' | 'FDA' | 'FederalRegister',
  details?: any
): APIError {
  return {
    code: 'API_ERROR',
    message,
    details,
    timestamp: new Date().toISOString(),
    source
  }
}

/**
 * Main Edge Function handler
 */
serve(async (req) => {
  // Handle CORS preflight
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

    // Parse request body
    const requestBody = await req.json().catch(() => ({}))
    const {
      action,
      citation,
      searchTerm,
      productCode,
      kNumber,
      cfrTitle,
      cfrPart,
      limit = 10
    } = requestBody

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let result: any
    let errors: APIError[] = []

    try {
      switch (action) {
        case 'parse_citation':
          if (!citation) {
            throw new Error('Citation parameter is required for parse_citation action')
          }
          result = parseRegulationCitation(citation)
          break

        case 'fetch_ecfr':
          if (!citation) {
            throw new Error('Citation parameter is required for fetch_ecfr action')
          }
          const parsedCitation = parseRegulationCitation(citation)
          result = await fetcheCFRContent(parsedCitation)
          break

        case 'search_fda_classification':
          result = await fetchFDAClassification(searchTerm, productCode, limit)
          break

        case 'search_fda_510k':
          result = await fetchFDA510K(searchTerm, kNumber, limit)
          break

        case 'search_federal_register':
          result = await fetchFederalRegister(searchTerm, cfrTitle, cfrPart, limit)
          break

        case 'comprehensive_search':
          // Perform multiple API calls concurrently with fallback behavior
          const promises = []
          
          if (citation) {
            const parsedCitation = parseRegulationCitation(citation)
            if (parsedCitation.isValid) {
              promises.push(
                fetcheCFRContent(parsedCitation)
                  .then(data => ({ type: 'ecfr', data }))
                  .catch(error => {
                    errors.push(createAPIError(error.message, 'eCFR', { citation }))
                    return null
                  })
              )
            }
          }
          
          if (searchTerm) {
            promises.push(
              fetchFDAClassification(searchTerm, undefined, limit)
                .then(data => ({ type: 'fda_classification', data }))
                .catch(error => {
                  errors.push(createAPIError(error.message, 'FDA', { searchTerm }))
                  return null
                })
            )
            
            promises.push(
              fetchFDA510K(searchTerm, undefined, limit)
                .then(data => ({ type: 'fda_510k', data }))
                .catch(error => {
                  errors.push(createAPIError(error.message, 'FDA', { searchTerm }))
                  return null
                })
            )
            
            promises.push(
              fetchFederalRegister(searchTerm, cfrTitle, cfrPart, limit)
                .then(data => ({ type: 'federal_register', data }))
                .catch(error => {
                  errors.push(createAPIError(error.message, 'FederalRegister', { searchTerm }))
                  return null
                })
            )
          }
          
          const results = await Promise.all(promises)
          result = {
            results: results.filter(r => r !== null),
            errors: errors,
            summary: {
              total_apis_called: promises.length,
              successful_calls: results.filter(r => r !== null).length,
              failed_calls: errors.length
            }
          }
          break

        default:
          throw new Error(`Unknown action: ${action}`)
      }

      // Log successful API call
      await supabase
        .from('api_logs')
        .insert({
          action,
          status: 'success',
          request_data: requestBody,
          response_data: result,
          errors: errors.length > 0 ? errors : null,
          timestamp: new Date().toISOString()
        })
        .catch(logError => console.warn('Failed to log API call:', logError))

      return new Response(
        JSON.stringify({
          success: true,
          action,
          data: result,
          errors: errors.length > 0 ? errors : undefined,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (operationError) {
      const error = createAPIError(
        operationError.message || 'Operation failed',
        'eCFR', // Default source
        { action, requestBody }
      )
      errors.push(error)

      // Log failed API call
      await supabase
        .from('api_logs')
        .insert({
          action,
          status: 'error',
          request_data: requestBody,
          errors: errors,
          timestamp: new Date().toISOString()
        })
        .catch(logError => console.warn('Failed to log API error:', logError))

      throw operationError
    }

  } catch (error) {
    console.error('Regulatory API integration error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})