import { supabase } from '../supabase/client';

export interface RegulationCitation {
  title: number;
  chapter?: number;
  part: number;
  section: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface eCFRContent {
  title: string;
  identifier: string;
  label_level: string;
  children?: any[];
  text?: string;
  effective_date?: string;
  last_updated?: string;
}

export interface FDAClassificationResult {
  device_name: string;
  medical_specialty_description: string;
  device_class: string;
  regulation_number: string;
  product_code: string;
  submission_type_id: string;
  definition: string;
  physical_state: string;
  technical_method: string;
  target_area: string;
}

export interface FDA510KResult {
  k_number: string;
  device_name: string;
  applicant: string;
  date_received: string;
  decision_date: string;
  decision_description: string;
  clearance_type: string;
  product_code: string;
  statement_or_summary: string;
  type: string;
  expedited_review_flag: string;
}

export interface FederalRegisterDocument {
  abstract: string;
  action: string;
  agencies: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  body_html_url: string;
  cfr_references: Array<{
    title: number;
    part: number;
    chapter: number;
  }>;
  citation: string;
  document_number: string;
  effective_on: string;
  html_url: string;
  pdf_url: string;
  publication_date: string;
  title: string;
  type: string;
}

export interface APIResponse<T> {
  success: boolean;
  action: string;
  data: T;
  errors?: Array<{
    code: string;
    message: string;
    source: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export interface ComprehensiveSearchResult {
  results: Array<{
    type: 'ecfr' | 'fda_classification' | 'fda_510k' | 'federal_register';
    data: any;
  }>;
  errors: any[];
  summary: {
    total_apis_called: number;
    successful_calls: number;
    failed_calls: number;
  };
}

export class RegulatoryAPIService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regulatory-api-integration`;

  /**
   * Parse a CFR citation string into structured data
   */
  static async parseCitation(citation: string): Promise<RegulationCitation> {
    try {
      const response = await this.callAPI<RegulationCitation>({
        action: 'parse_citation',
        citation
      });

      return response.data;
    } catch (error) {
      console.error('Citation parsing error:', error);
      throw new Error(`Failed to parse citation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch eCFR content for a specific regulation
   */
  static async fetcheCFRContent(citation: string): Promise<eCFRContent> {
    try {
      const response = await this.callAPI<eCFRContent>({
        action: 'fetch_ecfr',
        citation
      });

      return response.data;
    } catch (error) {
      console.error('eCFR fetch error:', error);
      throw new Error(`Failed to fetch eCFR content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search FDA device classification database
   */
  static async searchFDAClassification(
    searchTerm?: string,
    productCode?: string,
    limit: number = 10
  ): Promise<{ results: FDAClassificationResult[]; meta: any }> {
    try {
      const response = await this.callAPI<{ results: FDAClassificationResult[]; meta: any }>({
        action: 'search_fda_classification',
        searchTerm,
        productCode,
        limit
      });

      return response.data;
    } catch (error) {
      console.error('FDA classification search error:', error);
      throw new Error(`Failed to search FDA classifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search FDA 510(k) database
   */
  static async searchFDA510K(
    searchTerm?: string,
    kNumber?: string,
    limit: number = 10
  ): Promise<{ results: FDA510KResult[]; meta: any }> {
    try {
      const response = await this.callAPI<{ results: FDA510KResult[]; meta: any }>({
        action: 'search_fda_510k',
        searchTerm,
        kNumber,
        limit
      });

      return response.data;
    } catch (error) {
      console.error('FDA 510(k) search error:', error);
      throw new Error(`Failed to search FDA 510(k) database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search Federal Register documents
   */
  static async searchFederalRegister(
    searchTerm?: string,
    cfrTitle?: number,
    cfrPart?: number,
    limit: number = 10
  ): Promise<{ results: FederalRegisterDocument[]; count: number }> {
    try {
      const response = await this.callAPI<{ results: FederalRegisterDocument[]; count: number }>({
        action: 'search_federal_register',
        searchTerm,
        cfrTitle,
        cfrPart,
        limit
      });

      return response.data;
    } catch (error) {
      console.error('Federal Register search error:', error);
      throw new Error(`Failed to search Federal Register: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform comprehensive search across all regulatory APIs
   */
  static async comprehensiveSearch(options: {
    citation?: string;
    searchTerm?: string;
    cfrTitle?: number;
    cfrPart?: number;
    limit?: number;
  }): Promise<ComprehensiveSearchResult> {
    try {
      const response = await this.callAPI<ComprehensiveSearchResult>({
        action: 'comprehensive_search',
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Comprehensive search error:', error);
      throw new Error(`Failed to perform comprehensive search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get device classification by product code
   */
  static async getDeviceClassification(productCode: string): Promise<FDAClassificationResult | null> {
    try {
      const result = await this.searchFDAClassification(undefined, productCode, 1);
      return result.results.length > 0 ? result.results[0] : null;
    } catch (error) {
      console.error('Device classification lookup error:', error);
      throw error;
    }
  }

  /**
   * Get 510(k) details by K-number
   */
  static async get510KDetails(kNumber: string): Promise<FDA510KResult | null> {
    try {
      const result = await this.searchFDA510K(undefined, kNumber, 1);
      return result.results.length > 0 ? result.results[0] : null;
    } catch (error) {
      console.error('510(k) lookup error:', error);
      throw error;
    }
  }

  /**
   * Validate CFR citation format
   */
  static validateCFRCitation(citation: string): { isValid: boolean; errorMessage?: string } {
    const cfrPattern = /^(\d{1,2})\s+CFR\s+(\d{1,4})\.(\d{1,4}[a-z]?)$/i;
    
    if (!cfrPattern.test(citation.trim())) {
      return {
        isValid: false,
        errorMessage: 'Invalid CFR citation format. Expected format: "XX CFR YYY.ZZ" (e.g., "21 CFR 820.30")'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Format CFR citation for display
   */
  static formatCFRCitation(title: number, part: number, section: string): string {
    return `${title} CFR ${part}.${section}`;
  }

  /**
   * Generate eCFR URL for a citation
   */
  static generateeCFRURL(title: number, part: number, section: string): string {
    return `https://www.ecfr.gov/current/title-${title}/part-${part}/section-${part}.${section}`;
  }

  /**
   * Generate FDA device classification URL
   */
  static generateFDAClassificationURL(productCode: string): string {
    return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpcd/classification.cfm?ID=${productCode}`;
  }

  /**
   * Generate FDA 510(k) URL
   */
  static generateFDA510KURL(kNumber: string): string {
    return `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${kNumber}`;
  }

  /**
   * Private method to call the Edge Function
   */
  private static async callAPI<T>(payload: any): Promise<APIResponse<T>> {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      return result;

    } catch (error) {
      console.error('Regulatory API call error:', error);
      throw error;
    }
  }
}