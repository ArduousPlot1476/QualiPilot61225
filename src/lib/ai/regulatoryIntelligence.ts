import { supabase } from '../supabase/client';

export interface RegulatorySearchRequest {
  query: string;
  filters?: {
    cfr_title?: number;
    cfr_part?: number;
    device_class?: string;
    regulation_type?: string;
    date_range?: {
      start: string;
      end: string;
    };
  };
  search_type?: 'hybrid' | 'semantic' | 'keyword';
  limit?: number;
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  type: 'proposed_rule' | 'final_rule' | 'guidance' | 'notice';
  agency: string;
  publication_date: string;
  effective_date?: string;
  cfr_references: string[];
  summary: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_devices: string[];
  document_url: string;
  federal_register_number?: string;
}

export interface DeviceClassification {
  device_name: string;
  device_class: 'I' | 'II' | 'III';
  product_code: string;
  regulation_number: string;
  submission_type: '510(k)' | 'PMA' | 'De Novo' | 'Exempt';
  definition: string;
  guidance_documents: string[];
  predicate_devices?: string[];
}

export interface CitationValidation {
  valid: boolean;
  citation?: {
    title: number;
    part: number;
    section: string;
    heading: string;
    content: string;
  };
  tooltip?: {
    summary: string;
    effective_date: string;
    revision_history: any[];
    related_guidance: any[];
    ecfr_url: string;
  };
  links?: {
    ecfr: string;
    guidance: string[];
  };
  error?: string;
  suggestion?: string;
}

export interface CompliancePathway {
  recommended_pathway: string;
  device_class: string;
  requirements: string[];
  timeline: string;
  estimated_cost: string;
  detailed_requirements: any[];
  next_steps: string[];
  resources: {
    fda_guidance: string;
    regulations: string[];
  };
}

export interface GapAnalysis {
  compliance_score: number;
  target_standard: string;
  device_class: string;
  summary: {
    total_requirements: number;
    compliant_sections: number;
    gap_sections: number;
  };
  gaps: Array<{
    section: string;
    title: string;
    priority: string;
    description: string;
    guidance: string;
  }>;
  compliant_sections: Array<{
    section: string;
    title: string;
    status: string;
  }>;
  recommendations: string[];
}

export class RegulatoryIntelligenceService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/regulatory-intelligence`;

  /**
   * Search regulations using hybrid semantic and keyword search
   */
  static async searchRegulations(request: RegulatorySearchRequest): Promise<any> {
    try {
      console.log('Calling searchRegulations with request:', request);
      const response = await this.callAPI({
        action: 'search_regulations',
        ...request
      });

      return response.data;
    } catch (error) {
      console.error('Regulatory search error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive device classification information
   */
  static async getDeviceClassification(deviceName: string): Promise<DeviceClassification> {
    try {
      console.log('Calling getDeviceClassification for device:', deviceName);
      
      // For testing purposes, let's simulate a successful response
      // This will help us debug the issue without relying on the actual API
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode detected, returning mock classification data');
        
        // Simulate a delay to mimic API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock data based on device name
        const mockClassification: DeviceClassification = {
          device_name: deviceName,
          device_class: 'II',
          product_code: 'ABC',
          regulation_number: '21 CFR 880.1234',
          submission_type: '510(k)',
          definition: 'A mock device for testing purposes',
          guidance_documents: ['Mock Guidance 1', 'Mock Guidance 2'],
          predicate_devices: ['Similar Device 1', 'Similar Device 2']
        };
        
        console.log('Returning mock classification:', mockClassification);
        return mockClassification;
      }
      
      // Real API call
      const response = await this.callAPI({
        action: 'get_device_classification',
        device_name: deviceName
      });

      console.log('Device classification response:', response);
      return response.data;
    } catch (error) {
      console.error('Device classification error:', error);
      throw error;
    }
  }

  /**
   * Monitor regulatory changes for specific CFR parts
   */
  static async monitorRegulatoryChanges(cfrParts: number[]): Promise<RegulatoryUpdate[]> {
    try {
      console.log('Calling monitorRegulatoryChanges for CFR parts:', cfrParts);
      const response = await this.callAPI({
        action: 'monitor_changes',
        cfr_parts: cfrParts
      });

      return response.data;
    } catch (error) {
      console.error('Regulatory monitoring error:', error);
      throw error;
    }
  }

  /**
   * Validate and enhance CFR citations
   */
  static async validateCitation(citation: string): Promise<CitationValidation> {
    try {
      console.log('Calling validateCitation for citation:', citation);
      const response = await this.callAPI({
        action: 'validate_citation',
        citation
      });

      return response.data;
    } catch (error) {
      console.error('Citation validation error:', error);
      throw error;
    }
  }

  /**
   * Get recommended compliance pathway for device
   */
  static async getCompliancePathway(deviceInfo: {
    device_type: string;
    intended_use: string;
    device_class: string;
    predicate_device?: string;
  }): Promise<CompliancePathway> {
    try {
      console.log('Calling getCompliancePathway with device info:', deviceInfo);
      const response = await this.callAPI({
        action: 'get_compliance_pathway',
        device_info: deviceInfo
      });

      return response.data;
    } catch (error) {
      console.error('Compliance pathway error:', error);
      throw error;
    }
  }

  /**
   * Generate compliance gap analysis
   */
  static async generateGapAnalysis(requirements: {
    current_documentation: any[];
    target_standard: string;
    device_class: string;
  }): Promise<GapAnalysis> {
    try {
      console.log('Calling generateGapAnalysis with requirements:', requirements);
      const response = await this.callAPI({
        action: 'generate_gap_analysis',
        requirements
      });

      return response.data;
    } catch (error) {
      console.error('Gap analysis error:', error);
      throw error;
    }
  }

  /**
   * Sync eCFR updates (admin function)
   */
  static async synceCFRUpdates(): Promise<any> {
    try {
      console.log('Calling synceCFRUpdates');
      const response = await this.callAPI({
        action: 'sync_ecfr_updates'
      });

      return response.data;
    } catch (error) {
      console.error('eCFR sync error:', error);
      throw error;
    }
  }

  /**
   * Get regulatory alerts for user
   */
  static async getRegulatoryAlerts(): Promise<any[]> {
    try {
      console.log('Fetching regulatory alerts');
      const { data, error } = await supabase
        .from('regulatory_alerts')
        .select('*')
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Failed to fetch alerts: ${error.message}`);
      }

      console.log('Regulatory alerts fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching regulatory alerts:', error);
      throw error;
    }
  }

  /**
   * Mark alert as read
   */
  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      console.log('Marking alert as read:', alertId);
      const { error } = await supabase
        .from('regulatory_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) {
        throw new Error(`Failed to mark alert as read: ${error.message}`);
      }
      
      console.log('Alert marked as read successfully');
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  /**
   * Get compliance audit trail
   */
  static async getAuditTrail(limit: number = 50): Promise<any[]> {
    try {
      console.log('Fetching compliance audit trail with limit:', limit);
      const { data, error } = await supabase
        .from('compliance_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch audit trail: ${error.message}`);
      }

      console.log('Audit trail fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  }

  /**
   * Get CFR revision history
   */
  static async getCFRRevisionHistory(
    title: number,
    part: number,
    section?: string
  ): Promise<any[]> {
    try {
      console.log(`Fetching CFR revision history for ${title} CFR ${part}${section ? `.${section}` : ''}`);
      let query = supabase
        .from('cfr_revision_history')
        .select('*')
        .eq('cfr_title', title)
        .eq('cfr_part', part);

      if (section) {
        query = query.eq('cfr_section', section);
      }

      const { data, error } = await query
        .order('revision_date', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Failed to fetch CFR revision history: ${error.message}`);
      }

      console.log('CFR revision history fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching CFR revision history:', error);
      throw error;
    }
  }

  /**
   * Search guidance documents
   */
  static async searchGuidanceDocuments(query: string, deviceTypes?: string[]): Promise<any[]> {
    try {
      console.log('Searching guidance documents with query:', query, 'and device types:', deviceTypes);
      let dbQuery = supabase
        .from('guidance_documents')
        .select('*')
        .textSearch('title', query);

      if (deviceTypes && deviceTypes.length > 0) {
        dbQuery = dbQuery.overlaps('device_types', deviceTypes);
      }

      const { data, error } = await dbQuery
        .order('publication_date', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Failed to search guidance documents: ${error.message}`);
      }

      console.log('Guidance documents search results:', data);
      return data || [];
    } catch (error) {
      console.error('Error searching guidance documents:', error);
      throw error;
    }
  }

  /**
   * Get predicate devices for 510(k) pathway
   */
  static async getPredicateDevices(productCode: string): Promise<any[]> {
    try {
      console.log('Fetching predicate devices for product code:', productCode);
      
      // For testing purposes, let's simulate a successful response
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode detected, returning mock predicate devices');
        
        // Simulate a delay to mimic API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return mock data
        const mockPredicates = [
          {
            device_name: 'Similar Device 1',
            k_number: 'K123456',
            applicant: 'Medical Device Company A',
            clearance_date: '2023-01-15'
          },
          {
            device_name: 'Similar Device 2',
            k_number: 'K789012',
            applicant: 'Medical Device Company B',
            clearance_date: '2022-11-30'
          }
        ];
        
        console.log('Returning mock predicate devices:', mockPredicates);
        return mockPredicates;
      }
      
      // Real API call
      const { data, error } = await supabase
        .from('predicate_devices')
        .select('*')
        .eq('product_code', productCode)
        .limit(5);

      if (error) {
        throw new Error(`Failed to fetch predicate devices: ${error.message}`);
      }

      console.log('Predicate devices fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching predicate devices:', error);
      throw error;
    }
  }

  /**
   * Generate interactive citation tooltip
   */
  static generateCitationTooltip(citation: CitationValidation): string {
    if (!citation.valid || !citation.tooltip) {
      return 'Invalid citation';
    }

    const { tooltip } = citation;
    return `
      <div class="citation-tooltip">
        <h4>${citation.citation?.heading}</h4>
        <p>${tooltip.summary}</p>
        <div class="citation-meta">
          <span>Effective: ${tooltip.effective_date}</span>
          <a href="${tooltip.ecfr_url}" target="_blank">View on eCFR</a>
        </div>
      </div>
    `;
  }

  /**
   * Format CFR citation for display
   */
  static formatCFRCitation(title: number, part: number, section: string): string {
    return `${title} CFR ${part}.${section}`;
  }

  /**
   * Generate eCFR URL
   */
  static generateeCFRURL(title: number, part: number, section: string): string {
    return `https://www.ecfr.gov/current/title-${title}/chapter-I/subchapter-H/part-${part}/section-${section}`;
  }

  /**
   * Private method to call the Edge Function
   */
  private static async callAPI(payload: any): Promise<any> {
    try {
      console.log('Making API call to regulatory-intelligence function with payload:', payload);
      
      // For testing purposes, let's simulate a successful response for certain actions
      if (process.env.NODE_ENV === 'development' && payload.action === 'get_device_classification') {
        console.log('Development mode detected, simulating API response for device classification');
        
        // Simulate a delay to mimic API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return mock data
        return {
          success: true,
          action: 'get_device_classification',
          data: {
            device_name: payload.device_name,
            device_class: 'II',
            product_code: 'ABC',
            regulation_number: '21 CFR 880.1234',
            submission_type: '510(k)',
            definition: 'A mock device for testing purposes',
            guidance_documents: ['Mock Guidance 1', 'Mock Guidance 2']
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      console.log('Making actual API call to:', this.FUNCTION_URL);
      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response data:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'API call failed');
      }

      return result;

    } catch (error) {
      console.error('Regulatory intelligence API call error:', error);
      throw error;
    }
  }
}