import React, { useState, useEffect } from 'react';
import { Target, Plus, Award, AlertCircle, CheckCircle, Calendar, Dumbbell, Heart, HandHeart, BookOpen, User } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, setDoc, orderBy } from 'firebase/firestore';
import { Sankalp, SankalpProgress } from '../lib/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface SankalpStats {
  totalDays: number;
  keptDays: number;
  missedDays: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
}

const SankalpTracker: React.FC = () => {
  const [activeSankalp, setActiveSankalp] = useState<Sankalp | null>(null);
  const [sankalpStats, setSankalpStats] = useState<SankalpStats>({
    totalDays: 0,
    keptDays: 0,
    missedDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    successRate: 0
  });
  const [todayProgress, setTodayProgress] = useState<SankalpProgress | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSankalp, setNewSankalp] = useState({
    title: '',
    description: '',
    category: 'discipline' as Sankalp['category'],
    difficulty: 'medium' as Sankalp['difficulty'],
    duration: 30 // days
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const categories = {
    discipline: { label: 'Self-Discipline', icon: <Dumbbell className="w-8 h-8" />, color: 'from-red-500 to-red-700', bg: 'bg-red-500', desc: 'Building spiritual strength' },
    devotion: { label: 'Devotional Practice', icon: <Heart className="w-8 h-8" />, color: 'from-purple-500 to-purple-700', bg: 'bg-purple-500', desc: 'Deepening love for Divine' },
    service: { label: 'Selfless Service', icon: <HandHeart className="w-8 h-8" />, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500', desc: 'Serving others with love' },
    study: { label: 'Sacred Study', icon: <BookOpen className="w-8 h-8" />, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-500', desc: 'Learning spiritual wisdom' },
    health: { label: 'Temple Care', icon: <User className="w-8 h-8" />, color: 'from-green-500 to-green-700', bg: 'bg-green-500', desc: 'Honoring the body temple' }
  };

  const difficulties = {
    easy: { label: 'Gentle Path', multiplier: 1, color: 'text-green-300' },
    medium: { label: 'Steady Practice', multiplier: 2, color: 'text-yellow-300' },
    hard: { label: 'Warrior\'s Vow', multiplier: 3, color: 'text-red-300' }
  };

  const sankalpSuggestions = {
    discipline: [
      'Wake up before sunrise daily',
      'No social media for 1 hour after waking',
      'Practice brahmacharya with complete dedication',
      'Fast on Ekadashi',
      'Sleep before 10 PM'
    ],
    devotion: [
      'Chant 108 rounds of Naam Japa daily',
      'Read one Bhagavad Gita verse daily',
      'Offer all meals to Krishna before eating',
      'Listen to spiritual discourse daily',
      'Visit temple weekly'
    ],
    service: [
      'Help one person daily without expectation',
      'Donate to charity weekly',
      'Volunteer for spiritual organization',
      'Teach someone about spirituality',
      'Care for animals or environment'
    ],
    study: [
      'Study Bhagavad Gita for 30 minutes daily',
      'Read spiritual books for 20 minutes',
      'Memorize one Sanskrit shloka weekly',
      'Attend spiritual classes regularly',
      'Practice self-inquiry daily'
    ],
    health: [
      'Practice yoga asanas daily',
      'Eat only sattvic food',
      'Drink 8 glasses of water daily',
      'Walk in nature for 30 minutes',
      'Practice pranayama breathing'
    ]
  };

  // Helper to get local date string YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadSankalps(user.uid);
      } else {
        setLoading(false);
        setActiveSankalp(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSankalps = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'sankalps'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const sankalps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sankalp));

      // Find active sankalp (end date in future)
      const now = new Date();
      const active = sankalps.find(s => new Date(s.end_date) >= now);

      if (active) {
        setActiveSankalp(active);
        await loadSankalpStats(active.id!, userId);
      } else {
        setActiveSankalp(null);
      }
    } catch (error: any) {
      console.error('Error loading sankalps:', error);
      setError('Failed to load your sacred vows.');
    } finally {
      setLoading(false);
    }
  };

  const loadSankalpStats = async (sankalpId: string, userId: string) => {
    try {
      const q = query(
        collection(db, 'sankalp_progress'),
        where('sankalp_id', '==', sankalpId),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => doc.data() as SankalpProgress);

      // Calculate stats
      const totalDays = history.length;
      const keptDays = history.filter(h => h.status === 'success').length;
      const missedDays = history.filter(h => h.status === 'failed').length;

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      history.forEach(day => {
        if (day.status === 'success') {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      });
      longestStreak = Math.max(longestStreak, tempStreak);

      // Check today's status
      const today = getLocalDate();
      const todayEntry = history.find(h => h.date === today);

      if (todayEntry && todayEntry.status === 'success') {
        // If already marked success today, streak continues
        currentStreak = tempStreak;
      } else {
        // Check if yesterday was success
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const offset = yesterday.getTimezoneOffset() * 60000;
        const yesterdayStr = new Date(yesterday.getTime() - offset).toISOString().split('T')[0];
        const yesterdayEntry = history.find(h => h.date === yesterdayStr);

        if (yesterdayEntry && yesterdayEntry.status === 'success') {
          currentStreak = tempStreak;
        } else {
          currentStreak = 0;
        }
      }

      setSankalpStats({
        totalDays,
        keptDays,
        missedDays,
        currentStreak,
        longestStreak,
        successRate: totalDays > 0 ? Math.round((keptDays / totalDays) * 100) : 0
      });

      if (todayEntry) {
        setTodayProgress(todayEntry);
      }
    } catch (error) {
      console.error('Error stats:', error);
    }
  };

  const handleCreateSankalp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSankalp.title) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + newSankalp.duration);

      const sankalpData: Sankalp = {
        user_id: user.uid,
        title: newSankalp.title,
        description: newSankalp.description,
        category: newSankalp.category,
        difficulty: newSankalp.difficulty,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'sankalps'), sankalpData);

      // Reset form
      setShowCreateForm(false);
      setNewSankalp({
        title: '',
        description: '',
        category: 'discipline',
        difficulty: 'medium',
        duration: 30
      });

      setActiveSankalp({ id: docRef.id, ...sankalpData });
    } catch (error) {
      console.error('Error creating sankalp:', error);
      setError('Failed to create vow. Please try again.');
    }
  };

  const logProgress = async (status: 'success' | 'failed' | 'skip') => {
    if (!activeSankalp || !activeSankalp.id) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = getLocalDate();
      const docId = `${activeSankalp.id}_${today}`;

      await setDoc(doc(db, 'sankalp_progress', docId), {
        sankalp_id: activeSankalp.id,
        user_id: user.uid,
        date: today,
        status,
        created_at: new Date().toISOString()
      });

      // Global streak update logic removed to keep Sankalp independent from Brahmacharya streak.


      setTodayProgress({
        sankalp_id: activeSankalp.id,
        user_id: user.uid,
        date: today,
        status
      });

      await loadSankalpStats(activeSankalp.id, user.uid);
    } catch (error) {
      console.error('Error logging progress:', error);
      setError('Failed to log progress.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-8 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold sacred-heading mb-2">Sacred Vow (Sankalp)</h1>
        <p className="sacred-text text-amber-200/80">Commitment is the bridge between intention and realization</p>
      </header>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {!activeSankalp && !showCreateForm ? (
        <div className="spiritual-card p-10 rounded-2xl divine-glow text-center borderBorder-white/5">
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
            <Target className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-amber-100 mb-4">Begin a New Sacred Vow</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            A Sankalp is a solemn vow that harnesses your spiritual energy. Choose a discipline to maintain for a set period to strengthen your will and purify your mind.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="sacred-button px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow-lg hover:shadow-amber-500/20"
          >
            Take a Vow
          </button>
        </div>
      ) : showCreateForm ? (
        <div className="spiritual-card p-8 rounded-2xl divine-glow animate-fade-in relative">
          <button
            onClick={() => setShowCreateForm(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-amber-100 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Sankalp
          </h2>

          <form onSubmit={handleCreateSankalp} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(categories).map(([key, cat]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewSankalp({ ...newSankalp, category: key as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${newSankalp.category === key
                        ? 'bg-amber-500/20 border-amber-500 text-amber-100'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <span className="text-xs font-semibold block">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">I Vow To...</label>
                  <input
                    type="text"
                    value={newSankalp.title}
                    onChange={(e) => setNewSankalp({ ...newSankalp, title: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                    placeholder="e.g., Chant 16 rounds daily"
                  />

                  {/* Suggestions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sankalpSuggestions[newSankalp.category].slice(0, 3).map((sugg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewSankalp({ ...newSankalp, title: sugg })}
                        className="text-xs bg-slate-800/80 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-300 border border-slate-600 transition-colors"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Duration</label>
                    <select
                      value={newSankalp.duration}
                      onChange={(e) => setNewSankalp({ ...newSankalp, duration: Number(e.target.value) })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white outline-none"
                    >
                      <option value={7}>7 Days (Trial)</option>
                      <option value={21}>21 Days (Habit)</option>
                      <option value={41}>41 Days (Mandala)</option>
                      <option value={90}>90 Days (Transformation)</option>
                      <option value={108}>108 Days (Sacred)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={newSankalp.difficulty}
                      onChange={(e) => setNewSankalp({ ...newSankalp, difficulty: e.target.value as any })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white outline-none"
                    >
                      <option value="easy">Gentle Steps</option>
                      <option value="medium">Steady Path</option>
                      <option value="hard">Warrior Vow</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sacred-button bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-amber-500/20 transform active:scale-[0.99] transition-all"
            >
              Seal This Vow
            </button>
          </form>
        </div>
      ) : activeSankalp ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Vow Card */}
          <div className="spiritual-card p-0 rounded-2xl divine-glow overflow-hidden flex flex-col">
            <div className={`p-6 bg-gradient-to-r ${categories[activeSankalp.category].color}`}>
              <div className="flex justify-between items-start">
                <span className="bg-black/20 text-white/90 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {categories[activeSankalp.category].label}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase bg-black/20 ${difficulties[activeSankalp.difficulty].color}`}>
                  {activeSankalp.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-4 mb-2">{activeSankalp.title}</h2>
              <p className="text-white/80 text-sm">{activeSankalp.description || categories[activeSankalp.category].desc}</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-white font-mono flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                    {new Date(activeSankalp.start_date).toLocaleDateString()} - {new Date(activeSankalp.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="text-slate-300 font-semibold mb-4 text-center">Log Today's Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => logProgress('success')}
                    disabled={!!todayProgress}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center ${todayProgress?.status === 'success'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : todayProgress
                        ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-emerald-600/20 hover:border-emerald-500/50 text-emerald-200'
                      }`}
                  >
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <span className="font-bold">Completed</span>
                  </button>
                  <button
                    onClick={() => logProgress('failed')}
                    disabled={!!todayProgress}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center ${todayProgress?.status === 'failed'
                      ? 'bg-red-600 border-red-500 text-white'
                      : todayProgress
                        ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-red-600/20 hover:border-red-500/50 text-red-200'
                      }`}
                  >
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span className="font-bold">Missed</span>
                  </button>
                </div>
                {todayProgress && (
                  <p className="text-center text-xs text-slate-500 mt-4">
                    Progress logged for today. Come back tomorrow!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="spiritual-card p-6 rounded-2xl divine-glow">
              <h3 className="text-xl font-bold text-amber-100 flex items-center mb-6">
                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                Vow Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{sankalpStats.currentStreak}</div>
                  <div className="text-xs text-slate-400 uppercase">Current Streak</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">{sankalpStats.longestStreak}</div>
                  <div className="text-xs text-slate-400 uppercase">Best Streak</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{sankalpStats.successRate}%</div>
                  <div className="text-xs text-slate-400 uppercase">Success Rate</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{sankalpStats.keptDays}</div>
                  <div className="text-xs text-slate-400 uppercase">Days Kept</div>
                </div>
              </div>
            </div>

            <div className="spiritual-card p-6 rounded-2xl bg-amber-900/10 border-amber-500/20">
              <p className="text-amber-200/80 italic text-center font-serif text-lg">
                "When you honor your vow, you honor the Divine within yourself."
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SankalpTracker;