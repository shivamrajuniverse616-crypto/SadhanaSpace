/*
  # Create affirmations table

  1. New Tables
    - `affirmations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `affirmation_text` (text, not null)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `affirmations` table
    - Add policy for authenticated users to manage their own affirmations (if not exists)

  3. Performance
    - Add indexes for user_id and active affirmations
*/

CREATE TABLE IF NOT EXISTS affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'affirmations' 
    AND policyname = 'Users can manage their own affirmations'
  ) THEN
    CREATE POLICY "Users can manage their own affirmations"
      ON affirmations
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_affirmations_user_id ON affirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmations_active ON affirmations(user_id, is_active) WHERE is_active = true;