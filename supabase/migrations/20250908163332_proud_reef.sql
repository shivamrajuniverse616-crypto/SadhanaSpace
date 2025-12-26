/*
  # Add users table for leaderboard functionality

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `username` (text, unique) - display name for leaderboard
      - `avatar_url` (text, optional) - profile picture
      - `spiritual_score` (integer) - calculated spiritual score
      - `last_score_update` (timestamp) - when score was last calculated
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read all data (for leaderboard)
    - Add policies for users to update their own data only

  3. Indexes
    - Add index on spiritual_score for fast leaderboard queries
    - Add index on username for search functionality
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  spiritual_score integer DEFAULT 0,
  last_score_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all user data (for leaderboard)
CREATE POLICY "Users can read all user data for leaderboard"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_spiritual_score ON users (spiritual_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_last_update ON users (last_score_update);