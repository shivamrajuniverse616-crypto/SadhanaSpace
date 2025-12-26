import React, { useState, useEffect } from 'react';
import { Smile, Calendar, TrendingUp } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';
import { MoodLog } from '../lib/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const MoodTracker: React.FC = () => {
  const [todayMood, setTodayMood] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const moods = [
    { name: 'Peaceful', icon: '😌', color: 'from-blue-400 to-blue-600', ring: 'ring-blue-400', desc: 'Calm and centered' },
    { name: 'Joyful', icon: '😊', color: 'from-yellow-400 to-yellow-600', ring: 'ring-yellow-400', desc: 'Happy and content' },
    { name: 'Grateful', icon: '🙏', color: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-400', desc: 'Thankful and blessed' },
    { name: 'Focused', icon: '🎯', color: 'from-purple-400 to-purple-600', ring: 'ring-purple-400', desc: 'Clear and determined' },
    { name: 'Restless', icon: '😤', color: 'from-orange-400 to-orange-600', ring: 'ring-orange-400', desc: 'Agitated or anxious' },
    { name: 'Craving', icon: '😔', color: 'from-red-400 to-red-600', ring: 'ring-red-400', desc: 'Struggling with urges' },
    { name: 'Confused', icon: '😕', color: 'from-slate-400 to-slate-600', ring: 'ring-slate-400', desc: 'Uncertain or lost' },
    { name: 'Overwhelmed', icon: '😰', color: 'from-pink-400 to-pink-600', ring: 'ring-pink-400', desc: 'Stressed or burdened' }
  ];

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const moodRef = collection(db, 'mood_log');
      const todayQuery = query(moodRef, where('user_id', '==', user.uid), where('date', '==', today));
      const todaySnapshot = await getDocs(todayQuery);

      if (!todaySnapshot.empty) {
        const todayData = todaySnapshot.docs[0].data() as MoodLog;
        setTodayMood(todayData.mood);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const historyQuery = query(
        moodRef,
        where('user_id', '==', user.uid),
        where('date', '>=', thirtyDaysAgoStr),
        orderBy('date', 'desc')
      );

      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodLog));

      setMoodHistory(historyData);
    } catch (error: any) {
      console.error('Error loading mood data:', error);
      setError('Failed to load mood history. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const logMood = async (mood: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const docId = `${user.uid}_${today}`;

      await setDoc(doc(db, 'mood_log', docId), {
        user_id: user.uid,
        date: today,
        mood: mood,
        created_at: new Date().toISOString()
      }, { merge: true });

      setTodayMood(mood);
      await loadMoodData();
    } catch (error: any) {
      console.error('Error logging mood:', error);
      setError('Failed to save mood. Please try again.');
    }
  };

  const getMoodStats = () => {
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood.name] = moodHistory.filter(entry => entry.mood === mood.name).length;
      return acc;
    }, {} as Record<string, number>);

    const totalEntries = moodHistory.length;
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    return { moodCounts, totalEntries, dominantMood: dominantMood ? dominantMood[0] : 'None' };
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = getMoodStats();

  return (
    <div className="space-y-8 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold sacred-heading mb-2">Emotional Awareness</h1>
        <p className="sacred-text text-amber-200/80">Observe your inner state without judgment</p>
      </header>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Today's Mood Input */}
        <div className="spiritual-card p-6 rounded-2xl divine-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Smile className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-semibold text-amber-100">How do you feel today?</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.name}
                onClick={() => logMood(mood.name)}
                className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden ${todayMood === mood.name
                    ? `bg-gradient-to-br ${mood.color} shadow-lg ring-2 ${mood.ring} ring-offset-2 ring-offset-slate-900`
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/10'
                  }`}
              >
                <div className="text-3xl mb-2 filter drop-shadow-md transition-transform group-hover:scale-110">{mood.icon}</div>
                <div className={`font-medium text-sm ${todayMood === mood.name ? 'text-white' : 'text-slate-300'}`}>
                  {mood.name}
                </div>
                {todayMood === mood.name && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                )}
              </button>
            ))}
          </div>

          {todayMood && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-white/5 animate-fade-in text-center">
              <p className="text-slate-300 text-sm">You are feeling <span className="text-white font-semibold">{todayMood}</span> today.</p>
            </div>
          )}
        </div>

        {/* Stats & Dominant Mood */}
        <div className="space-y-8">
          <div className="spiritual-card p-6 rounded-2xl divine-glow">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-purple-100">Monthly Insight</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.totalEntries}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Entries</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                <div className="text-lg font-bold text-white mb-1 truncate">{stats.dominantMood}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Dominant State</div>
              </div>
            </div>
          </div>

          {/* Recent History List */}
          <div className="spiritual-card p-6 rounded-2xl divine-glow">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-semibold text-emerald-100">Recent Logs</h2>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {moodHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No mood logs yet.</p>
              ) : (
                moodHistory.map((entry) => {
                  const moodConfig = moods.find(m => m.name === entry.mood);
                  return (
                    <div key={entry.id || entry.date} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors border border-white/5">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{moodConfig?.icon || '😐'}</div>
                        <div>
                          <div className="text-amber-100 font-medium">{entry.mood}</div>
                          <div className="text-slate-500 text-xs">{new Date(entry.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {moodConfig && (
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${moodConfig.color}`}></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;