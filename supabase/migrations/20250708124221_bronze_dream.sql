/*
  # Create favorite bhajans table

  1. New Tables
    - `favorite_bhajans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `bhajan_id` (text, reference to bhajan)
      - `title` (text, bhajan title)
      - `artist` (text, bhajan artist)
      - `url` (text, bhajan audio URL)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `favorite_bhajans` table
    - Add policy for authenticated users to manage their own favorites

  3. Performance
    - Add indexes for user_id and bhajan_id
*/

CREATE TABLE IF NOT EXISTS favorite_bhajans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id text NOT NULL,
  title text NOT NULL,
  artist text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_bhajans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorite bhajans"
  ON favorite_bhajans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorite_bhajans_user_id ON favorite_bhajans(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_bhajans_bhajan_id ON favorite_bhajans(user_id, bhajan_id);

-- Prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_bhajans_unique ON favorite_bhajans(user_id, bhajan_id);