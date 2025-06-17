/*
  # Fix RLS policies for threads table

  1. Security Updates
    - Drop existing INSERT policy that may be incorrectly configured
    - Create new INSERT policy for authenticated users to create their own threads
    - Ensure all CRUD operations work correctly for thread owners

  2. Policy Changes
    - Allow authenticated users to INSERT threads with their own user_id
    - Maintain existing SELECT, UPDATE, DELETE policies for thread owners
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own threads" ON threads;

-- Create a new INSERT policy that allows authenticated users to create threads
CREATE POLICY "Users can insert own threads"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure the SELECT policy exists and is correct
DROP POLICY IF EXISTS "Users can read own threads" ON threads;
CREATE POLICY "Users can read own threads"
  ON threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure the UPDATE policy exists and is correct
DROP POLICY IF EXISTS "Users can update own threads" ON threads;
CREATE POLICY "Users can update own threads"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the DELETE policy exists and is correct
DROP POLICY IF EXISTS "Users can delete own threads" ON threads;
CREATE POLICY "Users can delete own threads"
  ON threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);