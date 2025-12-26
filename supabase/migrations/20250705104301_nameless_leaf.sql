/*
  # Add spiritual features to The Inner Sanctum

  1. New Tables
    - `gratitude_entries` - Daily gratitude journal with photo support
    - `triggers` - Track situations and moods that lead to urges
    - `affirmations` - Personal spiritual affirmations
    - `future_self` - Letters to future self with vision photos
    - `meditation_sessions` - Track meditation practice with mood changes
    - `tasks` - Focus board for meaningful daily tasks
    - `japa_counter` - Track daily Naam Japa chanting
    - `relapse_analysis` - Automatic analysis after slips

  2. Table Updates
    - Add `photo_url` to existing `journal_entries` and `goals` tables

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Gratitude Journal
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  gratitude_text text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Triggers Tracker
CREATE TABLE IF NOT EXISTS triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  trigger_type text NOT NULL,
  mood text NOT NULL,
  situation text,
  created_at timestamptz DEFAULT now()
);

-- Spiritual Affirmations
CREATE TABLE IF NOT EXISTS affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  affirmation_text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Future Self Mirror
CREATE TABLE IF NOT EXISTS future_self (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  letter_text text NOT NULL,
  photo_url text,
  date_written date DEFAULT CURRENT_DATE,
  updated_at timestamptz DEFAULT now()
);

-- Meditation Sessions
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  session_length integer NOT NULL, -- in minutes
  mood_before text,
  mood_after text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Focus Board Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_text text NOT NULL,
  is_completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Naam Japa Counter
CREATE TABLE IF NOT EXISTS japa_counter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  japa_count integer DEFAULT 0,
  mantra_type text DEFAULT 'Hare Krishna',
  created_at timestamptz DEFAULT now()
);

-- Relapse Analysis
CREATE TABLE IF NOT EXISTS relapse_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relapse_date date NOT NULL,
  days_clean_before integer NOT NULL,
  common_triggers text[],
  suggested_actions text[],
  created_at timestamptz DEFAULT now()
);

-- Add photo_url to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN photo_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE goals ADD COLUMN photo_url text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_self ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE japa_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE relapse_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own gratitude entries"
  ON gratitude_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own triggers"
  ON triggers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own affirmations"
  ON affirmations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own future self"
  ON future_self
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meditation sessions"
  ON meditation_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own japa counter"
  ON japa_counter
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own relapse analysis"
  ON relapse_analysis
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);