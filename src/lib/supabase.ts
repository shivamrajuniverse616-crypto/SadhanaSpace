import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  mantra_type: string;
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

export interface WisdomVault {
  id?: string;
  user_id?: string;
  title: string;
  category: string;
  url: string;
  date_added: string;
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
  avatar_url?: string;
  spiritual_score: number;
  last_score_update: string;
  created_at: string;
}

// Leaderboard entry
export interface LeaderboardEntry extends UserProfile {
  rank: number;
  badge?: string;
}

// Premanand Maharaj Ji's spiritual quotes
export const spiritualQuotes = [
  "When lust arises, immediately start chanting Krishna's name. Your mind will become peaceful.",
  "The soul is eternal, pure, and beyond the body's temporary desires.",
  "Vairagya (detachment) comes through constant remembrance of the Divine.",
  "Bhakti is the fastest path to liberation from material bondage.",
  "Every moment spent in Naam Japa purifies the consciousness.",
  "Satsang with devotees strengthens your spiritual resolve.",
  "The mind that remembers Krishna cannot be touched by lust.",
  "Discipline in spiritual practice leads to ultimate freedom.",
  "You are not the body, not the mind - you are the eternal soul.",
  "Surrender your desires to Krishna and find true peace.",
  "The path of devotion transforms even the greatest sinner.",
  "Chanting the holy names burns away all material attachments.",
  "In the company of saints, the heart naturally turns to God.",
  "Every breath is an opportunity to remember the Divine.",
  "True strength comes from spiritual practice, not material pursuits.",
  "The divine energy within you is more powerful than any temptation.",
  "Through tapasya (austerity), the soul regains its original purity.",
  "Krishna's grace flows to those who sincerely call His name.",
  "Meditation is the bridge between the material and spiritual worlds.",
  "A pure heart reflects the divine light like a clear mirror."
];

// Maharaj Ji's wisdom for emergency situations
export const emergencyWisdom = [
  "Brother, this urge is temporary. Krishna's love is eternal. Choose wisely.",
  "When the mind becomes restless, immediately sit for Naam Japa.",
  "Remember: You are seeking permanent happiness, not momentary pleasure.",
  "The soul that remembers God cannot be defeated by material desires.",
  "This moment of temptation is your test. Pass it with Krishna's name.",
  "Lust is the enemy of spiritual progress. Fight it with devotion.",
  "Your future self will thank you for this moment of self-control.",
  "The pleasure you seek is already within you through divine connection.",
  "Close your eyes, breathe deeply, and feel Krishna's presence within.",
  "This too shall pass. Your spiritual strength is greater than any urge.",
  "Transform this energy into devotion. Channel it toward the Divine.",
  "You are a warrior of light. Do not surrender to darkness."
];