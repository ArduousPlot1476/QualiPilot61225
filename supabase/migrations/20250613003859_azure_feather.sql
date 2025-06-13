/*
  # Create Regulatory Knowledge Base Tables

  1. New Tables
    - `regulatory_documents`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `cfr_title` (integer for CFR title number)
      - `cfr_part` (integer for CFR part number)
      - `cfr_section` (text for section number)
      - `content` (text for document content)
      - `embedding` (vector for semantic search)
      - `last_updated` (timestamp)
      - `source_url` (text for eCFR link)
      - `metadata` (jsonb for additional data)

    - `regulatory_citations`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `citation_text` (text)
      - `citation_url` (text)
      - `regulation_type` (text: FDA, ISO, EU-MDR)
      - `confidence_score` (float)

  2. Extensions
    - Enable pgvector for embeddings

  3. Indexes
    - Vector similarity search index
    - Text search indexes for regulatory content
    - Composite indexes for CFR lookups

  4. Security
    - Public read access for regulatory documents
    - Admin-only write access
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create regulatory documents table
CREATE TABLE IF NOT EXISTS regulatory_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cfr_title integer,
  cfr_part integer,
  cfr_section text,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  last_updated timestamptz DEFAULT now(),
  source_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create regulatory citations table
CREATE TABLE IF NOT EXISTS regulatory_citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES regulatory_documents(id) ON DELETE CASCADE,
  citation_text text NOT NULL,
  citation_url text,
  regulation_type text CHECK (regulation_type IN ('FDA', 'ISO', 'EU-MDR', 'OTHER')),
  confidence_score float DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_embedding ON regulatory_documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_cfr ON regulatory_documents(cfr_title, cfr_part, cfr_section);
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_content_search ON regulatory_documents USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_regulatory_documents_title_search ON regulatory_documents USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_regulatory_citations_document_id ON regulatory_citations(document_id);
CREATE INDEX IF NOT EXISTS idx_regulatory_citations_type ON regulatory_citations(regulation_type);

-- Enable RLS
ALTER TABLE regulatory_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_citations ENABLE ROW LEVEL SECURITY;

-- Public read access for regulatory documents
CREATE POLICY "Public read access for regulatory documents"
  ON regulatory_documents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for regulatory citations"
  ON regulatory_citations
  FOR SELECT
  TO public
  USING (true);

-- Admin-only write access (service role)
CREATE POLICY "Service role can manage regulatory documents"
  ON regulatory_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage regulatory citations"
  ON regulatory_citations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);