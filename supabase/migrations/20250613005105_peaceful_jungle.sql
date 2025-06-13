/*
  # Document Generation System Schema

  1. New Tables
    - `document_templates` - Store document templates with metadata
    - `document_generations` - Track document generation jobs
    - `compliance_validations` - Store compliance validation results
    - `template_sections` - Store template sections and content

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Service role access for system operations

  3. Storage
    - Create storage bucket for generated documents
    - Set up access policies for document downloads
*/

-- Document Templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  classification text[] NOT NULL DEFAULT '{}',
  pathway text[] NOT NULL DEFAULT '{}',
  framework text[] NOT NULL DEFAULT '{}',
  content jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  version text NOT NULL DEFAULT '1.0',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Template Sections table
CREATE TABLE IF NOT EXISTS template_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES document_templates(id) ON DELETE CASCADE,
  section_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  conditional jsonb DEFAULT null,
  cfr_references text[] NOT NULL DEFAULT '{}',
  validation_rules jsonb NOT NULL DEFAULT '[]',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Document Generations table (extends existing documents table)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES document_templates(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS generation_metadata jsonb DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS validation_results jsonb DEFAULT null;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS compliance_report jsonb DEFAULT null;

-- Compliance Validations table
CREATE TABLE IF NOT EXISTS compliance_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  validation_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'warning')),
  message text NOT NULL,
  cfr_reference text,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details jsonb DEFAULT '{}',
  validated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_classification ON document_templates USING GIN(classification);
CREATE INDEX IF NOT EXISTS idx_document_templates_pathway ON document_templates USING GIN(pathway);
CREATE INDEX IF NOT EXISTS idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_template_sections_order ON template_sections(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_compliance_validations_document_id ON compliance_validations(document_id);
CREATE INDEX IF NOT EXISTS idx_compliance_validations_status ON compliance_validations(status);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_templates (public read, service role write)
CREATE POLICY "Public read access for document templates"
  ON document_templates
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage document templates"
  ON document_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for template_sections (public read, service role write)
CREATE POLICY "Public read access for template sections"
  ON template_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage template sections"
  ON template_sections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for compliance_validations (user access to own documents)
CREATE POLICY "Users can read compliance validations for own documents"
  ON compliance_validations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = compliance_validations.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage compliance validations"
  ON compliance_validations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default templates
INSERT INTO document_templates (name, type, classification, pathway, framework, content, metadata) VALUES
(
  'Quality Management System Manual',
  'QMS',
  ARRAY['Class I', 'Class II', 'Class III'],
  ARRAY['510(k)', 'PMA', 'De Novo'],
  ARRAY['21 CFR 820', 'ISO 13485'],
  '{"description": "Comprehensive QMS manual template compliant with 21 CFR 820 and ISO 13485"}',
  '{"version": "1.0", "cfrReferences": ["21 CFR 820.20", "21 CFR 820.30", "21 CFR 820.40"], "lastUpdated": "2024-01-01"}'
),
(
  'Risk Management File',
  'Risk Management',
  ARRAY['Class I', 'Class II', 'Class III'],
  ARRAY['510(k)', 'PMA', 'De Novo'],
  ARRAY['ISO 14971', '21 CFR 820.30'],
  '{"description": "Risk management file template compliant with ISO 14971:2019"}',
  '{"version": "1.0", "cfrReferences": ["ISO 14971:2019", "21 CFR 820.30"], "lastUpdated": "2024-01-01"}'
),
(
  '510(k) Premarket Notification',
  'Regulatory Submission',
  ARRAY['Class II'],
  ARRAY['510(k)'],
  ARRAY['21 CFR 807'],
  '{"description": "510(k) submission template with all required sections"}',
  '{"version": "1.0", "cfrReferences": ["21 CFR 807.87", "21 CFR 807.92"], "lastUpdated": "2024-01-01"}'
),
(
  'Design History File',
  'Design Documentation',
  ARRAY['Class II', 'Class III'],
  ARRAY['510(k)', 'PMA', 'De Novo'],
  ARRAY['21 CFR 820.30'],
  '{"description": "Design History File template for design control documentation"}',
  '{"version": "1.0", "cfrReferences": ["21 CFR 820.30"], "lastUpdated": "2024-01-01"}'
),
(
  'Device Master Record',
  'Manufacturing Documentation',
  ARRAY['Class I', 'Class II', 'Class III'],
  ARRAY['510(k)', 'PMA', 'De Novo'],
  ARRAY['21 CFR 820.181'],
  '{"description": "Device Master Record template for manufacturing documentation"}',
  '{"version": "1.0", "cfrReferences": ["21 CFR 820.181"], "lastUpdated": "2024-01-01"}'
);

-- Create storage bucket for generated documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);