/*
  # Create API Logs Table

  1. New Tables
    - `api_logs`
      - `id` (uuid, primary key)
      - `action` (text, API action performed)
      - `status` (text, success/error)
      - `request_data` (jsonb, request parameters)
      - `response_data` (jsonb, API response data)
      - `errors` (jsonb, error details if any)
      - `timestamp` (timestamptz, when the call was made)
      - `processing_time` (integer, milliseconds)

  2. Indexes
    - Index on timestamp for time-based queries
    - Index on action for filtering by API action
    - Index on status for error monitoring

  3. Security
    - Enable RLS on `api_logs` table
    - Add policy for service role access only
*/

CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error')),
  request_data jsonb DEFAULT '{}'::jsonb,
  response_data jsonb,
  errors jsonb,
  processing_time integer,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_action ON api_logs(action);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Service role only access for API logs
CREATE POLICY "Service role can manage API logs"
  ON api_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);