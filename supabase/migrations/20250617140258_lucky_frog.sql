/*
  # Add Saved Conversations Feature

  1. Changes
    - Add `is_saved` boolean column to threads table
    - Set default value to false
    - Update existing rows to have false value

  2. Purpose
    - Allow users to save important conversations for easy access
    - Used to filter conversations in the sidebar
*/

-- Add is_saved column to threads table
ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false;

-- Update existing rows to have false value
UPDATE public.threads
SET is_saved = false
WHERE is_saved IS NULL;

-- Add comment to explain purpose
COMMENT ON COLUMN public.threads.is_saved IS 'Indicates whether the user has saved this conversation for easy access';