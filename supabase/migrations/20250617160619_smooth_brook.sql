/*
  # Fix Threads RLS Policies

  1. Security Updates
    - Add missing RLS policies for threads table
    - Allow authenticated users to insert, update, and delete their own threads
    - Ensure proper user ownership validation

  2. Policy Details
    - INSERT: Users can create threads with their own user_id
    - SELECT: Users can read their own threads
    - UPDATE: Users can update their own threads
    - DELETE: Users can delete their own threads
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own threads" ON threads;
DROP POLICY IF EXISTS "Users can read own threads" ON threads;
DROP POLICY IF EXISTS "Users can update own threads" ON threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;

-- Create comprehensive RLS policies for threads table
CREATE POLICY "Users can insert own threads"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own threads"
  ON threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
  ON threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled on threads table
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;