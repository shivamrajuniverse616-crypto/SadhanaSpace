/*
  # Discipline Vault Database Schema

  1. New Tables
    - `streaks` - Track user streak data with current streak, start date, and last slip date
    - `journal_entries` - Store reflection entries with reason, feeling, and plan
    - `progress_logs` - Log daily progress for tracking charts and statistics
    - `goals` - Store user life goals organized by category

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data only
    - Ensure complete data isolation between users

  3. Features
    - Automatic timestamps for all records
    - Proper foreign key relationships to auth.users
    - Default values for common fields
*/

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  start_date date DEFAULT CURRENT_DATE,
  last_slip_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  reason text NOT NULL,
  feeling text NOT NULL,
  plan text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create progress_logs table
CREATE TABLE IF NOT EXISTS progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  streak_value integer DEFAULT 0,
  event text,
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  category text DEFAULT 'personal',
  date_set date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for streaks
CREATE POLICY "Users can manage their own streaks"
  ON streaks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for journal_entries
CREATE POLICY "Users can manage their own journal entries"
  ON journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for progress_logs
CREATE POLICY "Users can manage their own progress logs"
  ON progress_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);