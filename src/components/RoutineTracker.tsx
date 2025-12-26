import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle, Circle, Calendar } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';
import { RoutineLog } from '../lib/types';

const RoutineTracker: React.FC = () => {
  const [todayRoutine, setTodayRoutine] = useState<RoutineLog | null>(null);
  const [routineHistory, setRoutineHistory] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  const morningRoutine = [
    'Wake up before sunrise',
    'Drink water mindfully',
    'Practice pranayama (5 minutes)',
    'Naam Japa (108 rounds)',
    'Read Bhagavad Gita (1 verse)',
    'Set daily spiritual intention',
    'Gratitude prayer'
  ];

  const nightRoutine = [
    'Reflect on the day',
    'Write in gratitude journal',
    'Practice forgiveness',
    'Naam Japa (54 rounds)',
    'Read spiritual text',
    'Set phone aside 1 hour before sleep',
    'Sleep with Krishna\'s name'
  ];

  useEffect(() => {
    loadRoutineData();
  }, []);

  const loadRoutineData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Load today's routine
      const routineRef = collection(db, 'routine_log');

      const todaySnap = await getDocs(query(routineRef, where('user_id', '==', user.uid), where('date', '==', today)));

      if (!todaySnap.empty) {
        setTodayRoutine(todaySnap.docs[0].data() as RoutineLog);
      }

      // Load routine history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const historyQuery = query(
        routineRef,
        where('user_id', '==', user.uid),
        where('date', '>=', thirtyDaysAgoStr),
        orderBy('date', 'desc')
      );

      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoutineLog));

      setRoutineHistory(historyData);
    } catch (error) {
      console.error('Error loading routine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRoutine = async (type: 'morning' | 'night', completed: boolean) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const docId = `${user.uid}_${today}`;

      const updateData = {
        user_id: user.uid,
        date: today,
        morning_done: type === 'morning' ? completed : (todayRoutine?.morning_done || false),
        night_done: type === 'night' ? completed : (todayRoutine?.night_done || false),
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'routine_log', docId), updateData, { merge: true });

      setTodayRoutine(updateData as RoutineLog);
      await loadRoutineData();
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Error updating routine. Please try again.');
    }
  };

  const getStreakCount = (type: 'morning' | 'night') => {
    let streak = 0;
    for (const entry of routineHistory) {
      if (type === 'morning' && entry.morning_done) {
        streak++;
      } else if (type === 'night' && entry.night_done) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getCompletionRate = (type: 'morning' | 'night') => {
    if (routineHistory.length === 0) return 0;
    const completed = routineHistory.filter(entry =>
      type === 'morning' ? entry.morning_done : entry.night_done
    ).length;
    return Math.round((completed / routineHistory.length) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your sādhanā...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
            <Sun className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🌅 Daily Sādhanā</h1>
          <p className="sacred-text text-xl">Sacred morning and evening spiritual practices</p>
        </div>

        {/* Today's Progress */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-yellow-300 mb-2">{getStreakCount('morning')}</div>
            <p className="sacred-text">Morning Streak</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-blue-300 mb-2">{getStreakCount('night')}</div>
            <p className="sacred-text">Evening Streak</p>
          </div>
        </div>

        {/* Morning Routine */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-amber-100 flex items-center">
              <Sun className="w-8 h-8 mr-3 text-yellow-400" />
              Morning Sādhanā
            </h3>
            <button
              onClick={() => updateRoutine('morning', !todayRoutine?.morning_done)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all ${todayRoutine?.morning_done
                ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/50'
                : 'bg-slate-700/50 text-amber-100 border border-slate-600/50 hover:bg-slate-600/50'
                }`}
            >
              {todayRoutine?.morning_done ? (
                <CheckCircle className="w-6 h-6 mr-2" />
              ) : (
                <Circle className="w-6 h-6 mr-2" />
              )}
              {todayRoutine?.morning_done ? 'Completed' : 'Mark Complete'}
            </button>
          </div>

          <div className="space-y-3">
            {morningRoutine.map((practice, index) => (
              <div key={index} className="flex items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="w-6 h-6 bg-yellow-600 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-amber-100">{practice}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="sacred-text">
              Completion Rate: {getCompletionRate('morning')}% over last 30 days
            </p>
          </div>
        </div>

        {/* Evening Routine */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-amber-100 flex items-center">
              <Moon className="w-8 h-8 mr-3 text-blue-400" />
              Evening Sādhanā
            </h3>
            <button
              onClick={() => updateRoutine('night', !todayRoutine?.night_done)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all ${todayRoutine?.night_done
                ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/50'
                : 'bg-slate-700/50 text-amber-100 border border-slate-600/50 hover:bg-slate-600/50'
                }`}
            >
              {todayRoutine?.night_done ? (
                <CheckCircle className="w-6 h-6 mr-2" />
              ) : (
                <Circle className="w-6 h-6 mr-2" />
              )}
              {todayRoutine?.night_done ? 'Completed' : 'Mark Complete'}
            </button>
          </div>

          <div className="space-y-3">
            {nightRoutine.map((practice, index) => (
              <div key={index} className="flex items-center p-3 bg-slate-700/30 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-amber-100">{practice}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="sacred-text">
              Completion Rate: {getCompletionRate('night')}% over last 30 days
            </p>
          </div>
        </div>

        {/* Recent History */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 flex items-center justify-center">
            <Calendar className="w-8 h-8 mr-3" />
            Recent Sādhanā History
          </h3>

          {routineHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🌅</div>
              <p className="sacred-text text-xl mb-4">Begin your daily spiritual practice today.</p>
              <p className="text-slate-400">Consistency in sādhanā leads to spiritual transformation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routineHistory.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <span className="sacred-text">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Sun className="w-4 h-4 text-yellow-400 mr-2" />
                      {entry.morning_done ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex items-center">
                      <Moon className="w-4 h-4 text-blue-400 mr-2" />
                      {entry.night_done ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineTracker;