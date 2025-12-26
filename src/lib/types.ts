
// Database types
export interface StreakData {
  id?: string;
  user_id?: string;
  current_streak: number;
  start_date: string;
  last_slip_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id?: string;
  user_id?: string;
  date: string;
  reason: string;
  feeling: string;
  plan: string;
  photo_url?: string;
  created_at?: string;
}

export interface ProgressLog {
  id?: string;
  user_id?: string;
  date: string;
  streak_value: number;
  event?: string;
  notes?: string;
  created_at?: string;
}

export interface Goal {
  id?: string;
  user_id?: string;
  text: string;
  category: 'mental' | 'physical' | 'spiritual' | 'personal' | 'professional';
  date_set: string;
  photo_url?: string;
  created_at?: string;
}

export interface GratitudeEntry {
  id?: string;
  user_id?: string;
  date: string;
  gratitude_text: string;
  photo_url?: string;
  created_at?: string;
}

export interface Trigger {
  id?: string;
  user_id?: string;
  date: string;
  trigger_type: string;
  mood: string;
  situation?: string;
  created_at?: string;
}

export interface Affirmation {
  id?: string;
  user_id?: string;
  affirmation_text: string;
  is_active: boolean;
  created_at?: string;
}

export interface FutureSelf {
  id?: string;
  user_id?: string;
  letter_text: string;
  photo_url?: string;
  date_written: string;
  updated_at?: string;
}

export interface MeditationSession {
  id?: string;
  user_id?: string;
  date: string;
  session_length: number;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  created_at?: string;
}

export interface Task {
  id?: string;
  user_id?: string;
  task_text: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  completed_at?: string;
}

export interface JapaCounter {
  id?: string;
  user_id?: string;
  date: string;
  japa_count: number;
}

export interface WisdomVault {
  id?: string;
  user_id: string;
  title: string;
  category: string;
  url: string;
  date_added: string;
  created_at?: string;
}

export interface FavoriteBhajan {
  id?: string;
  user_id: string;
  bhajan_id: string;
  title: string;
  artist: string;
  url: string;
  created_at?: string;
}

export interface GitaProgress {
  id?: string;
  user_id: string;
  verse_id: string;
  is_favorite: boolean;
  is_reflected: boolean;
  reflection_notes?: string;
  date_studied: string;
  created_at?: string;
}

export interface RelapseAnalysis {
  id?: string;
  user_id?: string;
  relapse_date: string;
  days_clean_before: number;
  common_triggers: string[];
  suggested_actions: string[];
  created_at?: string;
}

// New types for advanced features
export interface SpiritualOath {
  id?: string;
  user_id?: string;
  oath_text: string;
  signed_date: string;
  created_at?: string;
}

export interface MoodLog {
  id?: string;
  user_id?: string;
  date: string;
  mood: string;
  created_at?: string;
}



export interface FastingLog {
  id?: string;
  user_id?: string;
  date: string;
  purpose: string;
  reflection: string;
  photo_url?: string;
  created_at?: string;
}

export interface CrisisPlan {
  id?: string;
  user_id?: string;
  triggers: string[];
  emergency_actions: string[];
  motivations: string[];
  created_at?: string;
}

export interface RoutineLog {
  id?: string;
  user_id?: string;
  date: string;
  morning_done: boolean;
  night_done: boolean;
  created_at?: string;
}

export interface NatureWalkLog {
  id?: string;
  user_id?: string;
  date: string;
  duration: number;
  photo_url?: string;
  created_at?: string;
}

export interface BlessingsLog {
  id?: string;
  user_id?: string;
  date: string;
  blessing_description: string;
  created_at?: string;
}

export interface FocusSession {
  id?: string;
  user_id?: string;
  date: string;
  task_name: string;
  duration: number;
  reflections?: string;
  created_at?: string;
}

// User profile for leaderboard
export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string | null;
  spiritual_score: number;
  last_score_update: string;
  created_at: string;
  isBanned?: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry extends UserProfile {
  rank: number;
  badge?: string;
}

export interface Sankalp {
  id?: string;
  user_id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: 'discipline' | 'devotion' | 'service' | 'study' | 'health';
  difficulty: 'easy' | 'medium' | 'hard';
  created_at?: string;
}

export interface SankalpProgress {
  id?: string;
  sankalp_id: string;
  user_id?: string;
  date: string;
  kept: boolean;
  notes?: string;
  created_at?: string;
}
