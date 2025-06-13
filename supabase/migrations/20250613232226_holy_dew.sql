/*
  # Add Test Alerts for Development

  This migration adds sample regulatory alerts for testing the real-time notification system.
  These alerts will be visible in the alerts tab of the context drawer.
*/

-- Insert test alerts for the first user in the system
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user ID from the system
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we found a user
  IF first_user_id IS NOT NULL THEN
    -- Insert regulatory change alert
    INSERT INTO regulatory_alerts (
      user_id, 
      alert_type, 
      title, 
      message, 
      severity, 
      cfr_references, 
      created_at
    ) VALUES (
      first_user_id,
      'regulatory_change',
      'FDA Updates to 21 CFR Part 820',
      'The FDA has published updates to the Quality System Regulation (21 CFR Part 820) that may affect your device. Review the changes to ensure continued compliance.',
      'high',
      ARRAY['21 CFR 820'],
      NOW() - INTERVAL '2 hours'
    );
    
    -- Insert compliance deadline alert
    INSERT INTO regulatory_alerts (
      user_id, 
      alert_type, 
      title, 
      message, 
      severity, 
      cfr_references, 
      created_at
    ) VALUES (
      first_user_id,
      'compliance_deadline',
      'Annual QMS Review Due',
      'Your annual Quality Management System review is due in 14 days. Schedule your review meeting and prepare documentation.',
      'medium',
      ARRAY['21 CFR 820.20'],
      NOW() - INTERVAL '1 day'
    );
    
    -- Insert guidance update alert
    INSERT INTO regulatory_alerts (
      user_id, 
      alert_type, 
      title, 
      message, 
      severity, 
      cfr_references, 
      created_at
    ) VALUES (
      first_user_id,
      'guidance_update',
      'New FDA Guidance on Software Validation',
      'The FDA has published new guidance on software validation for medical devices. This guidance provides updated recommendations for software validation practices.',
      'low',
      ARRAY['21 CFR 820.30'],
      NOW() - INTERVAL '3 days'
    );
    
    RAISE NOTICE 'Added test alerts for user %', first_user_id;
  ELSE
    RAISE NOTICE 'No users found in the system. Skipping test alert creation.';
  END IF;
END $$;