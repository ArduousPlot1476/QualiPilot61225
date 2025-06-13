/*
  # Add Regulatory Profile Flag to Users Table

  1. Changes
    - Add `regulatory_profile_completed` boolean column to users table
    - Set default value to false
    - Update existing rows to have false value

  2. Purpose
    - Track whether users have completed the regulatory onboarding process
    - Used to determine whether to show the regulatory onboarding wizard
*/

-- Add regulatory_profile_completed column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS regulatory_profile_completed BOOLEAN DEFAULT false;

-- Update existing rows to have false value
UPDATE public.users
SET regulatory_profile_completed = false
WHERE regulatory_profile_completed IS NULL;

-- Add comment to explain purpose
COMMENT ON COLUMN public.users.regulatory_profile_completed IS 'Indicates whether the user has completed the regulatory onboarding process';