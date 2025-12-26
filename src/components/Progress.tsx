import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Flame, Calendar, Trophy, AlertTriangle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ProgressLog, StreakData } from '../lib/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ProgressStats {
  longestStreak: number;
  currentStreak: number;
  totalDays: number;
  slipCount: number;
}

const Progress: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressLog[]>([]);
  const [streakStats, setStreakStats] = useState<ProgressStats>({
    longestStreak: 0,
    currentStreak: 0,
    totalDays: 0,
    slipCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load progress logs
      const progressQuery = query(
        collection(db, 'progress_logs'),
        where('user_id', '==', user.uid),
        orderBy('date', 'asc')
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progressLogs = progressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog));

      // Load streaks
      const streakQuery = query(
        collection(db, 'streaks'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const streakSnapshot = await getDocs(streakQuery);
      const streakData = !streakSnapshot.empty ? (streakSnapshot.docs[0].data() as StreakData) : null;

      setProgressData(progressLogs || []);

      // Calculate stats
      let longestStreak = 0;
      let currentStreak = 0;
      let slipCount = 0;
      let tempStreak = 0;

      (progressLogs || []).forEach((entry) => {
        if (entry.event === 'slip') {
          slipCount++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
        } else {
          tempStreak = Math.max(tempStreak, entry.streak_value);
        }
      });

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      if (streakData) {
        // Calculate current streak
        const today = new Date();
        const lastSlip = streakData.last_slip_date ? new Date(streakData.last_slip_date) : null;
        const startDate = new Date(streakData.start_date);

        if (lastSlip) {
          const daysSinceSlip = Math.floor((today.getTime() - lastSlip.getTime()) / (1000 * 60 * 60 * 24));
          currentStreak = Math.max(0, daysSinceSlip);
        } else {
          const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          currentStreak = Math.max(0, daysSinceStart);
        }
      } else {
        currentStreak = 0;
      }

      setStreakStats({
        longestStreak: Math.max(longestStreak, currentStreak) || 0,
        currentStreak: currentStreak || 0,
        totalDays: (progressLogs || []).length,
        slipCount
      });
    } catch (error: any) {
      console.error('Error loading progress data:', error);
      setError('Failed to load your journey statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-8 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold sacred-heading mb-2">My Journey</h1>
        <p className="sacred-text text-amber-200/80">Every step forward is a victory</p>
      </header>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="spiritual-card p-4 rounded-xl divine-glow text-center borderBorder-white/5">
          <div className="text-2xl mb-1 flex justify-center"><Flame className="w-8 h-8 text-orange-500" /></div>
          <div className="text-2xl font-bold text-orange-500 mb-1">{streakStats.currentStreak}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Current Streak</div>
        </div>
        <div className="spiritual-card p-4 rounded-xl divine-glow text-center borderBorder-white/5">
          <div className="text-2xl mb-1 flex justify-center"><Trophy className="w-8 h-8 text-yellow-500" /></div>
          <div className="text-2xl font-bold text-yellow-500 mb-1">{streakStats.longestStreak}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Longest Streak</div>
        </div>
        <div className="spiritual-card p-4 rounded-xl divine-glow text-center borderBorder-white/5">
          <div className="text-2xl mb-1 flex justify-center"><Calendar className="w-8 h-8 text-blue-500" /></div>
          <div className="text-2xl font-bold text-blue-500 mb-1">{streakStats.totalDays}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Days Active</div>
        </div>
        <div className="spiritual-card p-4 rounded-xl divine-glow text-center borderBorder-white/5">
          <div className="text-2xl mb-1 flex justify-center"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
          <div className="text-2xl font-bold text-red-500 mb-1">{streakStats.slipCount}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Relapses</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart / Timeline Area - Left 2/3 */}
        <div className="lg:col-span-2 spiritual-card p-6 rounded-2xl divine-glow">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-amber-100">Progression Timeline</h2>
          </div>

          <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 pl-6 pb-2">
            {progressData.length === 0 ? (
              <p className="text-slate-500 italic">Your timeline begins today.</p>
            ) : (
              [...progressData].reverse().slice(0, 10).map((log, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${log.event === 'slip' ? 'bg-red-900 border-red-500' : 'bg-emerald-900 border-emerald-500'
                    } ring-4 ring-slate-900 transition-transform group-hover:scale-125`}></div>

                  <div className={`p-4 rounded-xl border ${log.event === 'slip'
                    ? 'bg-red-900/10 border-red-500/20 text-red-100'
                    : 'bg-emerald-900/10 border-emerald-500/20 text-emerald-100'
                    }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-lg capitalize">{log.event} Recorded</span>
                      <span className="text-xs opacity-70 font-mono">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm opacity-80">{log.notes || 'No notes for this entry.'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Motivational Right Column */}
        <div className="space-y-6">
          <div className="spiritual-card p-6 rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-bold text-yellow-100">Milestones</h3>
            </div>
            <div className="space-y-4">
              {[7, 21, 90].map(days => {
                const achieved = streakStats.currentStreak >= days;
                return (
                  <div key={days} className={`flex items-center p-3 rounded-lg border ${achieved
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500 grayscale'
                    }`}>
                    <span className="text-xl mr-3">{achieved ? '🏆' : '🔒'}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{days} Day Streak</div>
                      <div className="text-xs opacity-80">{achieved ? 'Unlocked!' : 'Keep going!'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="spiritual-card p-6 rounded-2xl bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-200 mb-2">Quote of Strength</h3>
            <p className="text-slate-300 italic text-sm leading-relaxed">
              "The journey of a thousand miles begins with a single step. Do not look back in anger, nor forward in fear, but around in awareness."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;