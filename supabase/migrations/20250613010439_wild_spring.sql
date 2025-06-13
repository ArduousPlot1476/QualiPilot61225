/*
  # Regulatory Intelligence System Schema

  1. New Tables
    - `regulatory_documents` - Enhanced with vector embeddings for semantic search
    - `regulatory_updates` - Federal Register monitoring and change tracking
    - `device_classifications` - FDA device classification database
    - `guidance_documents` - FDA guidance document repository
    - `predicate_devices` - 510(k) predicate device database
    - `compliance_requirements` - Compliance requirements by standard
    - `regulatory_pathways` - Regulatory pathway recommendations
    - `cfr_revision_history` - CFR revision tracking
    - `sync_status` - Cache management and sync status
    - `compliance_audit_log` - Audit trail for compliance activities
    - `regulatory_alerts` - User notification system

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to regulatory data
    - Add service role policies for data management
    - Add user-specific policies for audit logs and alerts

  3. Performance
    - Add comprehensive indexes for search and filtering
    - Add vector similarity search function
    - Add full-text search indexes

  4. Sample Data
    - Insert test data for device classifications, compliance requirements, and regulatory pathways
*/

-- Enhanced regulatory documents table with vector embeddings
CREATE TABLE IF NOT EXISTS regulatory_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cfr_title integer,
  cfr_part integer,
  cfr_section text,
  content text NOT NULL,
  embedding vector(1536),
  last_updated timestamptz DEFAULT now(),
  source_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Regulatory updates from Federal Register
CREATE TABLE IF NOT EXISTS regulatory_updates (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text CHECK (type IN ('proposed_rule', 'final_rule', 'guidance', 'notice')),
  agency text NOT NULL,
  publication_date date NOT NULL,
  effective_date date,
  cfr_references text[] DEFAULT '{}',
  summary text,
  impact_level text CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_devices text[] DEFAULT '{}',
  document_url text,
  federal_register_number text,
  created_at timestamptz DEFAULT now()
);

-- FDA device classifications
CREATE TABLE IF NOT EXISTS device_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text NOT NULL,
  device_class text CHECK (device_class IN ('I', 'II', 'III')),
  product_code text NOT NULL,
  regulation_number text,
  submission_type text CHECK (submission_type IN ('510(k)', 'PMA', 'De Novo', 'Exempt')),
  definition text,
  medical_specialty text,
  created_at timestamptz DEFAULT now()
);

-- FDA guidance documents
CREATE TABLE IF NOT EXISTS guidance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text,
  cfr_references text[] DEFAULT '{}',
  device_types text[] DEFAULT '{}',
  url text,
  publication_date date,
  status text CHECK (status IN ('draft', 'final', 'withdrawn')),
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Predicate devices for 510(k) pathway
CREATE TABLE IF NOT EXISTS predicate_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text NOT NULL,
  k_number text,
  product_code text,
  clearance_date date,
  applicant text,
  device_class text,
  regulation_number text,
  created_at timestamptz DEFAULT now()
);

-- Compliance requirements by standard
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard text NOT NULL,
  device_class text,
  section_id text NOT NULL,
  title text NOT NULL,
  description text,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  implementation_guidance text,
  cfr_references text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Regulatory pathway recommendations
CREATE TABLE IF NOT EXISTS regulatory_pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_class text NOT NULL,
  pathway text NOT NULL,
  requirements jsonb DEFAULT '{}',
  timeline text,
  estimated_cost text,
  success_factors text[],
  created_at timestamptz DEFAULT now()
);

-- CFR revision history tracking
CREATE TABLE IF NOT EXISTS cfr_revision_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cfr_title integer NOT NULL,
  cfr_part integer NOT NULL,
  cfr_section text NOT NULL,
  revision_date date NOT NULL,
  change_type text CHECK (change_type IN ('added', 'modified', 'removed')),
  change_description text,
  previous_content text,
  new_content text,
  federal_register_reference text,
  created_at timestamptz DEFAULT now()
);

-- Sync status for cache management
CREATE TABLE IF NOT EXISTS sync_status (
  cfr_part integer PRIMARY KEY,
  last_updated timestamptz NOT NULL,
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message text,
  records_synced integer DEFAULT 0
);

-- Compliance audit log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  query text,
  results_count integer,
  processing_time integer,
  cfr_version text,
  timestamp timestamptz DEFAULT now()
);

-- User notification system
CREATE TABLE IF NOT EXISTS regulatory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  alert_type text CHECK (alert_type IN ('regulatory_change', 'compliance_deadline', 'guidance_update')),
  title text NOT NULL,
  message text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  cfr_references text[] DEFAULT '{}',
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_cfr ON regulatory_documents(cfr_title, cfr_part, cfr_section);
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_content_search ON regulatory_documents USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_embedding ON regulatory_documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_title_search ON regulatory_documents USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_regulatory_updates_date ON regulatory_updates(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_impact ON regulatory_updates(impact_level);
CREATE INDEX IF NOT EXISTS idx_regulatory_updates_cfr ON regulatory_updates USING gin(cfr_references);

CREATE INDEX IF NOT EXISTS idx_device_classifications_class ON device_classifications(device_class);
CREATE INDEX IF NOT EXISTS idx_device_classifications_product_code ON device_classifications(product_code);
CREATE INDEX IF NOT EXISTS idx_device_classifications_name_search ON device_classifications USING gin(to_tsvector('english', device_name));

CREATE INDEX IF NOT EXISTS idx_guidance_documents_cfr ON guidance_documents USING gin(cfr_references);
CREATE INDEX IF NOT EXISTS idx_guidance_documents_devices ON guidance_documents USING gin(device_types);

CREATE INDEX IF NOT EXISTS idx_predicate_devices_product_code ON predicate_devices(product_code);
CREATE INDEX IF NOT EXISTS idx_predicate_devices_k_number ON predicate_devices(k_number);

CREATE INDEX IF NOT EXISTS idx_compliance_requirements_standard ON compliance_requirements(standard, device_class);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_priority ON compliance_requirements(priority);

CREATE INDEX IF NOT EXISTS idx_cfr_revision_history_cfr ON cfr_revision_history(cfr_title, cfr_part, cfr_section);
CREATE INDEX IF NOT EXISTS idx_cfr_revision_history_date ON cfr_revision_history(revision_date DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_user ON compliance_audit_log(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_action ON compliance_audit_log(action);

CREATE INDEX IF NOT EXISTS idx_regulatory_alerts_user ON regulatory_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_regulatory_alerts_unread ON regulatory_alerts(user_id) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE regulatory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicate_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfr_revision_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop regulatory_documents policies
  DROP POLICY IF EXISTS "Public read access for regulatory documents" ON regulatory_documents;
  DROP POLICY IF EXISTS "Service role can manage all regulatory data" ON regulatory_documents;
  
  -- Drop regulatory_updates policies
  DROP POLICY IF EXISTS "Public read access for regulatory updates" ON regulatory_updates;
  DROP POLICY IF EXISTS "Service role can manage regulatory updates" ON regulatory_updates;
  
  -- Drop device_classifications policies
  DROP POLICY IF EXISTS "Public read access for device classifications" ON device_classifications;
  DROP POLICY IF EXISTS "Service role can manage device classifications" ON device_classifications;
  
  -- Drop guidance_documents policies
  DROP POLICY IF EXISTS "Public read access for guidance documents" ON guidance_documents;
  DROP POLICY IF EXISTS "Service role can manage guidance documents" ON guidance_documents;
  
  -- Drop predicate_devices policies
  DROP POLICY IF EXISTS "Public read access for predicate devices" ON predicate_devices;
  DROP POLICY IF EXISTS "Service role can manage predicate devices" ON predicate_devices;
  
  -- Drop compliance_requirements policies
  DROP POLICY IF EXISTS "Public read access for compliance requirements" ON compliance_requirements;
  DROP POLICY IF EXISTS "Service role can manage compliance requirements" ON compliance_requirements;
  
  -- Drop regulatory_pathways policies
  DROP POLICY IF EXISTS "Public read access for regulatory pathways" ON regulatory_pathways;
  DROP POLICY IF EXISTS "Service role can manage regulatory pathways" ON regulatory_pathways;
  
  -- Drop cfr_revision_history policies
  DROP POLICY IF EXISTS "Public read access for CFR revision history" ON cfr_revision_history;
  DROP POLICY IF EXISTS "Service role can manage CFR revision history" ON cfr_revision_history;
  
  -- Drop sync_status policies
  DROP POLICY IF EXISTS "Service role can manage sync status" ON sync_status;
  
  -- Drop compliance_audit_log policies
  DROP POLICY IF EXISTS "Users can read own audit log" ON compliance_audit_log;
  DROP POLICY IF EXISTS "Service role can manage audit log" ON compliance_audit_log;
  
  -- Drop regulatory_alerts policies
  DROP POLICY IF EXISTS "Users can manage own alerts" ON regulatory_alerts;
  DROP POLICY IF EXISTS "Service role can manage all alerts" ON regulatory_alerts;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Ignore if policies don't exist
END $$;

-- RLS Policies for public read access to regulatory data
CREATE POLICY "Public read access for regulatory documents"
  ON regulatory_documents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for regulatory updates"
  ON regulatory_updates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for device classifications"
  ON device_classifications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for guidance documents"
  ON guidance_documents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for predicate devices"
  ON predicate_devices
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for compliance requirements"
  ON compliance_requirements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for regulatory pathways"
  ON regulatory_pathways
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for CFR revision history"
  ON cfr_revision_history
  FOR SELECT
  TO public
  USING (true);

-- Service role policies for data management
CREATE POLICY "Service role can manage all regulatory data"
  ON regulatory_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage regulatory updates"
  ON regulatory_updates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage device classifications"
  ON device_classifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage guidance documents"
  ON guidance_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage predicate devices"
  ON predicate_devices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage compliance requirements"
  ON compliance_requirements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage regulatory pathways"
  ON regulatory_pathways
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage CFR revision history"
  ON cfr_revision_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage sync status"
  ON sync_status
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User-specific policies for audit log and alerts
CREATE POLICY "Users can read own audit log"
  ON compliance_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage audit log"
  ON compliance_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage own alerts"
  ON regulatory_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all alerts"
  ON regulatory_alerts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_cfr_semantic(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  cfr_title int DEFAULT NULL,
  cfr_part int DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  cfr_title int,
  cfr_part int,
  cfr_section text,
  content text,
  source_url text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    regulatory_documents.id,
    regulatory_documents.title,
    regulatory_documents.cfr_title,
    regulatory_documents.cfr_part,
    regulatory_documents.cfr_section,
    regulatory_documents.content,
    regulatory_documents.source_url,
    1 - (regulatory_documents.embedding <=> query_embedding) AS similarity
  FROM regulatory_documents
  WHERE 
    regulatory_documents.embedding IS NOT NULL
    AND 1 - (regulatory_documents.embedding <=> query_embedding) > similarity_threshold
    AND (cfr_title IS NULL OR regulatory_documents.cfr_title = cfr_title)
    AND (cfr_part IS NULL OR regulatory_documents.cfr_part = cfr_part)
  ORDER BY regulatory_documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Insert sample data for testing (only if not exists)
INSERT INTO device_classifications (device_name, device_class, product_code, regulation_number, submission_type, definition) 
SELECT 'Blood Glucose Meter', 'II', 'NBW', '21 CFR 862.1345', '510(k)', 'A glucose meter is a device intended to measure glucose quantitatively in blood and other body fluids.'
WHERE NOT EXISTS (SELECT 1 FROM device_classifications WHERE product_code = 'NBW');

INSERT INTO device_classifications (device_name, device_class, product_code, regulation_number, submission_type, definition) 
SELECT 'Cardiac Pacemaker', 'III', 'MHX', '21 CFR 870.3610', 'PMA', 'A pacemaker is an implanted device used to control the heart rate.'
WHERE NOT EXISTS (SELECT 1 FROM device_classifications WHERE product_code = 'MHX');

INSERT INTO device_classifications (device_name, device_class, product_code, regulation_number, submission_type, definition) 
SELECT 'Surgical Gloves', 'I', 'FYC', '21 CFR 878.4040', 'Exempt', 'Surgical gloves are disposable gloves used during medical procedures.'
WHERE NOT EXISTS (SELECT 1 FROM device_classifications WHERE product_code = 'FYC');

INSERT INTO compliance_requirements (standard, device_class, section_id, title, description, priority) 
SELECT '21 CFR 820', 'II', '820.30', 'Design Controls', 'Procedures to control the design of the device', 'high'
WHERE NOT EXISTS (SELECT 1 FROM compliance_requirements WHERE standard = '21 CFR 820' AND device_class = 'II' AND section_id = '820.30');

INSERT INTO compliance_requirements (standard, device_class, section_id, title, description, priority) 
SELECT '21 CFR 820', 'III', '820.30', 'Design Controls', 'Procedures to control the design of the device', 'critical'
WHERE NOT EXISTS (SELECT 1 FROM compliance_requirements WHERE standard = '21 CFR 820' AND device_class = 'III' AND section_id = '820.30');

INSERT INTO compliance_requirements (standard, device_class, section_id, title, description, priority) 
SELECT 'ISO 14971', 'II', '4.1', 'Risk Management Process', 'Risk management process for medical devices', 'high'
WHERE NOT EXISTS (SELECT 1 FROM compliance_requirements WHERE standard = 'ISO 14971' AND device_class = 'II' AND section_id = '4.1');

INSERT INTO compliance_requirements (standard, device_class, section_id, title, description, priority) 
SELECT 'ISO 14971', 'III', '4.1', 'Risk Management Process', 'Risk management process for medical devices', 'critical'
WHERE NOT EXISTS (SELECT 1 FROM compliance_requirements WHERE standard = 'ISO 14971' AND device_class = 'III' AND section_id = '4.1');

INSERT INTO regulatory_pathways (device_class, pathway, requirements, timeline, estimated_cost) 
SELECT 'I', 'Exempt', '{"requirements": ["Device listing", "Establishment registration"]}'::jsonb, '1-3 months', '$5,000 - $15,000'
WHERE NOT EXISTS (SELECT 1 FROM regulatory_pathways WHERE device_class = 'I' AND pathway = 'Exempt');

INSERT INTO regulatory_pathways (device_class, pathway, requirements, timeline, estimated_cost) 
SELECT 'II', '510(k)', '{"requirements": ["510(k) submission", "Substantial equivalence", "Performance testing"]}'::jsonb, '6-12 months', '$50,000 - $200,000'
WHERE NOT EXISTS (SELECT 1 FROM regulatory_pathways WHERE device_class = 'II' AND pathway = '510(k)');

INSERT INTO regulatory_pathways (device_class, pathway, requirements, timeline, estimated_cost) 
SELECT 'III', 'PMA', '{"requirements": ["PMA application", "Clinical trials", "Manufacturing data"]}'::jsonb, '1-3 years', '$500,000 - $2,000,000'
WHERE NOT EXISTS (SELECT 1 FROM regulatory_pathways WHERE device_class = 'III' AND pathway = 'PMA');