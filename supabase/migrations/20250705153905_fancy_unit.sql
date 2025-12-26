/*
  # Advanced Spiritual Features for The Inner Sanctum

  1. New Tables
    - `spiritual_oath` - Sacred vows and commitments
    - `mood_log` - Daily emotional tracking
    - `wisdom_vault` - Spiritual teachings library
    - `fasting_log` - Tapasya and fasting tracker
    - `crisis_plan` - Personalized relapse prevention
    - `routine_log` - Daily spiritual routine tracking
    - `nature_walk_log` - Connection with nature
    - `blessings_log` - Divine grace acknowledgment
    - `focus_sessions` - Spiritual productivity tracking

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data

  3. Performance
    - Add appropriate indexes for common queries
*/

-- Spiritual Oath Table
CREATE TABLE IF NOT EXISTS spiritual_oath (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  oath_text text NOT NULL,
  signed_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Mood Log Table
CREATE TABLE IF NOT EXISTS mood_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  mood text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Wisdom Vault Table
CREATE TABLE IF NOT EXISTS wisdom_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  url text NOT NULL,
  date_added date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Fasting Log Table
CREATE TABLE IF NOT EXISTS fasting_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  purpose text NOT NULL,
  reflection text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Crisis Plan Table
CREATE TABLE IF NOT EXISTS crisis_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  triggers text[] NOT NULL,
  emergency_actions text[] NOT NULL,
  motivations text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Routine Log Table
CREATE TABLE IF NOT EXISTS routine_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  morning_done boolean DEFAULT false,
  night_done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Nature Walk Log Table
CREATE TABLE IF NOT EXISTS nature_walk_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  duration integer NOT NULL, -- in minutes
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Blessings Log Table
CREATE TABLE IF NOT EXISTS blessings_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  blessing_description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Focus Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date DEFAULT CURRENT_DATE,
  task_name text NOT NULL,
  duration integer NOT NULL, -- in minutes
  reflections text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE spiritual_oath ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE nature_walk_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE blessings_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own spiritual oath"
  ON spiritual_oath
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood log"
  ON mood_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wisdom vault"
  ON wisdom_vault
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fasting log"
  ON fasting_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own crisis plan"
  ON crisis_plan
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own routine log"
  ON routine_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own nature walk log"
  ON nature_walk_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own blessings log"
  ON blessings_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own focus sessions"
  ON focus_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spiritual_oath_user_id ON spiritual_oath(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_log_user_date ON mood_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_wisdom_vault_user_category ON wisdom_vault(user_id, category);
CREATE INDEX IF NOT EXISTS idx_fasting_log_user_date ON fasting_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_crisis_plan_user_id ON crisis_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_log_user_date ON routine_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_nature_walk_log_user_date ON nature_walk_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_blessings_log_user_date ON blessings_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON focus_sessions(user_id, date);