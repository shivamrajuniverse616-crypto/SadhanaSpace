import React, { useState, useEffect, useRef } from 'react';
import { Target, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  date: string;
  timestamp: string;
  completed: boolean;
  task_name?: string;
  reflections?: string;
}

const FocusTimer: React.FC = () => {
  const [deciseconds, setDeciseconds] = useState(15000); // 1500 seconds * 10
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [taskName, setTaskName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reflections, setReflections] = useState('');
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  const durations = [
    { minutes: 15, label: '15 min - Quick Focus' },
    { minutes: 25, label: '25 min - Pomodoro' },
    { minutes: 45, label: '45 min - Deep Work' },
    { minutes: 60, label: '60 min - Extended Focus' },
    { minutes: 90, label: '90 min - Flow State' }
  ];

  const spiritualTasks = [
    'Study Bhagavad Gita',
    'Read spiritual texts',
    'Write in journal',
    'Plan spiritual goals',
    'Organize sacred space',
    'Research spiritual topics',
    'Prepare for meditation',
    'Creative spiritual work'
  ];

  useEffect(() => {
    loadTodaySessions();
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  const loadTodaySessions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', user.uid),
        where('date', '==', today)
        // Order by timestamp desc would need an index, so we sort in client for now
      );

      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FocusSession))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTodaySessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle timer completion side effects safely
  useEffect(() => {
    if (deciseconds === 0 && isActive) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setIsActive(false);
      setSessionComplete(true);
      // Audio notification could go here
      alert('🎯 Focus session completed! Time for spiritual reflection.');
    }
  }, [deciseconds, isActive]);

  const startTimer = () => {
    if (!taskName.trim()) {
      alert('Please enter what you will focus on');
      return;
    }

    if (timerInterval.current) return;

    setIsActive(true);
    // Play soundscapes if needed (handled by NatureSoundscapes component prop)
    timerInterval.current = setInterval(() => {
      setDeciseconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 100); // 100ms interval
  };

  const pauseTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsActive(false);
  };

  const resetTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsActive(false);
    setDeciseconds(selectedDuration * 600);
    setSessionComplete(false);
    // Keep task name for convenience or clear it? Cleared in original.
    // setTaskName(''); 
    setReflections('');
  };

  const changeDuration = (minutes: number) => {
    if (!isActive) {
      setSelectedDuration(minutes);
      setDeciseconds(minutes * 600);
    }
  };

  const saveSession = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const session: Omit<FocusSession, 'id'> = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        task_name: taskName.trim(),
        duration: selectedDuration,
        timestamp: new Date().toISOString(),
        completed: true,
        reflections: reflections.trim() || undefined
      };

      const docRef = await addDoc(collection(db, 'focus_sessions'), session);

      alert('🎯 Focus session saved! Your spiritual productivity is recorded.');
      resetTimer();
      setTaskName(''); // Clear task name after save

      // Optimistically update
      setTodaySessions(prev => [{ ...session, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error('Error saving focus session:', error);
      alert('Error saving session. Please try again.');
    }
  };

  const formatTime = (totalDeciseconds: number) => {
    const totalSeconds = Math.floor(totalDeciseconds / 10);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalFocusToday = () => {
    return todaySessions.reduce((total, session) => total + session.duration, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your focus space...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🎯 Karma Kṣetra</h1>
          <p className="sacred-text text-xl">Sacred productivity and spiritual focus</p>
        </div>

        {/* Today's Progress */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-purple-300 mb-2">{getTotalFocusToday()}</div>
            <p className="sacred-text">Minutes Today</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-amber-300 mb-2">{todaySessions.length}</div>
            <p className="sacred-text">Sessions Today</p>
          </div>
        </div>

        {/* Task Input */}
        {!isActive && !sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">What will you focus on?</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-amber-100 font-medium mb-3">Sacred Task</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
                  placeholder="Enter your focus task..."
                />
              </div>

              <div>
                <p className="text-sm text-amber-200 mb-2">Spiritual task suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {spiritualTasks.map((task) => (
                    <button
                      key={task}
                      onClick={() => setTaskName(task)}
                      className="px-3 py-1 bg-slate-700/50 text-amber-200 rounded-full text-sm hover:bg-slate-600/50 transition-all"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duration Selection */}
        {!isActive && !sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Choose Focus Duration</h3>
            <div className="grid grid-cols-1 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration.minutes}
                  onClick={() => changeDuration(duration.minutes)}
                  className={`p-4 rounded-xl transition-all ${selectedDuration === duration.minutes
                    ? 'bg-purple-600/50 border-2 border-purple-400 text-purple-200'
                    : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                    }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 text-center divine-glow">
          {taskName && !sessionComplete && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-100 mb-2">Current Focus:</h3>
              <p className="text-purple-300 text-lg">{taskName}</p>
            </div>
          )}

          <div className={`text-8xl font-bold text-purple-300 mb-6 ${isActive ? 'timer-active' : ''}`}>
            {formatTime(deciseconds)}
          </div>

          {!sessionComplete ? (
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  disabled={!taskName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg disabled:opacity-50"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Begin Sacred Focus
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg"
                >
                  <Pause className="w-6 h-6 mr-3" />
                  Pause
                </button>
              )}

              <button
                onClick={resetTimer}
                className="bg-slate-600 hover:bg-slate-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg"
              >
                <RotateCcw className="w-6 h-6 mr-3" />
                Reset
              </button>
            </div>
          ) : (
            <div className="text-emerald-300 text-xl font-semibold">
              🎯 Focus session complete! Time for spiritual reflection.
            </div>
          )}

          {isActive && (
            <div className="mt-6 bg-slate-700/30 rounded-xl p-6">
              <p className="sacred-text text-lg mb-4">
                <strong>Focus Guidance:</strong>
              </p>
              <div className="space-y-2 text-amber-100">
                <p>🎯 Stay present with your sacred task</p>
                <p>🧘‍♂️ If mind wanders, gently return to focus</p>
                <p>🌬️ Breathe deeply and maintain awareness</p>
                <p>💫 Remember this work serves your higher purpose</p>
              </div>
            </div>
          )}
        </div>

        {/* Post-Session Reflection */}
        {sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Reflection</h3>

            <div className="space-y-6">
              <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-400/50">
                <h4 className="font-semibold text-emerald-300 mb-2">Completed Task:</h4>
                <p className="text-amber-100">{taskName}</p>
                <p className="text-emerald-200 text-sm mt-2">Duration: {selectedDuration} minutes</p>
              </div>

              <div>
                <label className="block text-amber-100 font-medium mb-3">Reflections & Insights (Optional)</label>
                <textarea
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                  rows={3}
                  placeholder="How did this focused work serve your spiritual growth?"
                />
              </div>

              <button
                onClick={saveSession}
                className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                <Save className="w-6 h-6 mr-3" />
                Save Sacred Session
              </button>
            </div>
          </div>
        )}

        {/* Today's Sessions */}
        {todaySessions.length > 0 && (
          <div className="spiritual-card rounded-2xl p-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Today's Focus Journey</h3>
            <div className="space-y-4">
              {todaySessions.map((session, index) => (
                <div key={session.id} className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-300 font-semibold">Session {index + 1}</span>
                    <span className="text-amber-100">{session.duration} minutes</span>
                  </div>
                  <p className="text-amber-100 font-medium mb-2">{session.task_name}</p>
                  {session.reflections && (
                    <p className="text-slate-300 text-sm italic">"{session.reflections}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;