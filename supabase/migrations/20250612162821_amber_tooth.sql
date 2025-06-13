/*
  # Create Messages Table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, foreign key to threads)
      - `content` (text, not null)
      - `role` (text, check constraint for user/assistant/system)
      - `created_at` (timestamp with time zone, default now())
      - `citations` (jsonb array for storing citation data)

  2. Indexes
    - Index on thread_id for efficient thread-specific queries
    - Index on created_at for chronological ordering

  3. Security
    - Enable RLS on `messages` table
    - Add policies for message access based on thread ownership
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at timestamptz DEFAULT now(),
  citations jsonb DEFAULT '[]'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON messages(thread_id, created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for message access (based on thread ownership)
CREATE POLICY "Users can read messages from own threads"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own threads"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in own threads"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from own threads"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );