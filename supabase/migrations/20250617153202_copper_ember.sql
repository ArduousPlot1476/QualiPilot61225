-- Add is_saved column to threads table
ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false;

-- Update existing rows to have false value
UPDATE public.threads
SET is_saved = false
WHERE is_saved IS NULL;

-- Add comment to explain purpose
COMMENT ON COLUMN public.threads.is_saved IS 'Indicates whether the user has saved this conversation for easy access';