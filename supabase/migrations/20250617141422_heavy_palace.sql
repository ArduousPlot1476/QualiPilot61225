/*
  # Add Source URL to Regulatory Alerts

  1. Changes
    - Add `source_url` text column to regulatory_alerts table
    - This allows linking alerts to their original sources

  2. Purpose
    - Enable users to access the original source of regulatory information
    - Improve traceability of regulatory updates
    - Enhance user experience by providing direct links to official documentation
*/

-- Add source_url column to regulatory_alerts table
ALTER TABLE public.regulatory_alerts 
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add comment to explain purpose
COMMENT ON COLUMN public.regulatory_alerts.source_url IS 'URL to the source document or announcement';