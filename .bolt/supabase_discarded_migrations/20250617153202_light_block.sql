-- Add source_url column to regulatory_alerts table
ALTER TABLE public.regulatory_alerts 
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add comment to explain purpose
COMMENT ON COLUMN public.regulatory_alerts.source_url IS 'URL to the source document or announcement';