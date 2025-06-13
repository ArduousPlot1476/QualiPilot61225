import { supabase } from '../supabase/client';

export interface DocumentGenerationRequest {
  deviceClassification: 'Class I' | 'Class II' | 'Class III';
  regulatoryPathway: '510(k)' | 'PMA' | 'De Novo';
  deviceType: string;
  intendedUse: string;
  companyInfo: {
    name: string;
    address: string;
    contact: string;
    establishmentNumber?: string;
  };
  complianceFramework: string[];
  templateType: string;
  customRequirements?: any;
}

export interface DocumentGenerationProgress {
  type: 'progress' | 'complete' | 'error';
  message?: string;
  progress?: number;
  documentId?: string;
  downloadUrl?: string;
  validationResults?: any;
  complianceReport?: any;
  error?: string;
  timestamp?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  classification: string[];
  pathway: string[];
  framework: string[];
  description: string;
  version: string;
  lastUpdated: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  complianceScore: number;
  missingRequirements: Array<{
    section: string;
    requirement: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
  }>;
}

export class DocumentGeneratorService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-generator`;

  /**
   * Get available document templates
   */
  static async getAvailableTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return data.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        classification: template.classification,
        pathway: template.pathway,
        framework: template.framework,
        description: template.content?.description || '',
        version: template.version,
        lastUpdated: template.updated_at
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get templates filtered by device classification and pathway
   */
  static async getCompatibleTemplates(
    classification: string,
    pathway: string
  ): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .contains('classification', [classification])
        .contains('pathway', [pathway])
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch compatible templates: ${error.message}`);
      }

      return data.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        classification: template.classification,
        pathway: template.pathway,
        framework: template.framework,
        description: template.content?.description || '',
        version: template.version,
        lastUpdated: template.updated_at
      }));
    } catch (error) {
      console.error('Error fetching compatible templates:', error);
      throw error;
    }
  }

  /**
   * Generate document with streaming progress updates
   */
  static async generateDocument(
    request: DocumentGenerationRequest,
    options: {
      onProgress?: (progress: DocumentGenerationProgress) => void;
      onComplete?: (result: DocumentGenerationProgress) => void;
      onError?: (error: string) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<void> {
    const { onProgress, onComplete, onError, signal } = options;

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
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Process Server-Sent Events stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: DocumentGenerationProgress = JSON.parse(line.slice(6));
                
                if (data.type === 'progress' && onProgress) {
                  onProgress(data);
                } else if (data.type === 'complete' && onComplete) {
                  onComplete(data);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Document generation error:', errorMessage);
      
      if (onError) {
        onError(errorMessage);
      } else {
        throw error;
      }
    }
  }

  /**
   * Validate document requirements before generation
   */
  static async validateRequirements(request: DocumentGenerationRequest): Promise<ValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic validation
      if (!request.deviceType?.trim()) {
        errors.push('Device type is required');
      }

      if (!request.intendedUse?.trim()) {
        errors.push('Intended use is required');
      }

      if (!request.companyInfo?.name?.trim()) {
        errors.push('Company name is required');
      }

      if (!request.complianceFramework?.length) {
        errors.push('At least one compliance framework must be selected');
      }

      // Template compatibility validation
      const compatibleTemplates = await this.getCompatibleTemplates(
        request.deviceClassification,
        request.regulatoryPathway
      );

      const selectedTemplate = compatibleTemplates.find(t => t.id === request.templateType);
      if (!selectedTemplate) {
        errors.push('Selected template is not compatible with device classification and regulatory pathway');
      }

      // Regulatory pathway validation
      if (request.deviceClassification === 'Class I' && request.regulatoryPathway === 'PMA') {
        warnings.push('Class I devices typically do not require PMA approval');
      }

      if (request.deviceClassification === 'Class III' && request.regulatoryPathway === '510(k)') {
        warnings.push('Class III devices typically require PMA approval, not 510(k)');
      }

      // Compliance framework validation
      const requiredFrameworks = this.getRequiredFrameworks(request.deviceClassification, request.regulatoryPathway);
      const missingFrameworks = requiredFrameworks.filter(f => !request.complianceFramework.includes(f));
      
      if (missingFrameworks.length > 0) {
        warnings.push(`Consider including these frameworks: ${missingFrameworks.join(', ')}`);
      }

      const complianceScore = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10));

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        complianceScore,
        missingRequirements: errors.map(error => ({
          section: 'General',
          requirement: error,
          severity: 'High' as const
        }))
      };

    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        warnings: [],
        complianceScore: 0,
        missingRequirements: []
      };
    }
  }

  /**
   * Get required compliance frameworks for device classification and pathway
   */
  private static getRequiredFrameworks(classification: string, pathway: string): string[] {
    const frameworks: string[] = ['21 CFR 820']; // QSR is always required

    if (classification !== 'Class I') {
      frameworks.push('21 CFR 820.30'); // Design controls for Class II/III
      frameworks.push('ISO 14971'); // Risk management
    }

    if (pathway === '510(k)') {
      frameworks.push('21 CFR 807');
    } else if (pathway === 'PMA') {
      frameworks.push('21 CFR 814');
    }

    return frameworks;
  }

  /**
   * Get document generation history for current user
   */
  static async getGenerationHistory(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          type,
          status,
          created_at,
          metadata,
          validation_results,
          compliance_report
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Failed to fetch generation history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching generation history:', error);
      throw error;
    }
  }

  /**
   * Download generated document
   */
  static async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('metadata')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error('Document not found');
      }

      const storageUrl = document.metadata?.storageUrl;
      if (!storageUrl) {
        throw new Error('Document file not found');
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .download(storageUrl);

      if (error) {
        throw new Error(`Failed to download document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Get compliance validation results for a document
   */
  static async getValidationResults(documentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('compliance_validations')
        .select('*')
        .eq('document_id', documentId)
        .order('validated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch validation results: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching validation results:', error);
      throw error;
    }
  }
}