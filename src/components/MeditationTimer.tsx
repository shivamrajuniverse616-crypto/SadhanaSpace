import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { MeditationSession } from '../lib/types';
import NatureSoundscapes from './NatureSoundscapes';

const MeditationTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const [moodBefore, setMoodBefore] = useState('');
  const [moodAfter, setMoodAfter] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [todaySessions, setTodaySessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);

  const durations = [
    { minutes: 5, label: '5 min - Quick Centering' },
    { minutes: 10, label: '10 min - Standard Practice' },
    { minutes: 15, label: '15 min - Deep Meditation' },
    { minutes: 20, label: '20 min - Extended Practice' },
    { minutes: 30, label: '30 min - Advanced Dhyana' }
  ];

  const moods = [
    'Peaceful', 'Anxious', 'Grateful', 'Restless', 'Focused',
    'Stressed', 'Joyful', 'Confused', 'Centered', 'Overwhelmed'
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
        collection(db, 'meditation_sessions'),
        where('user_id', '==', user.uid),
        where('date', '==', today)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MeditationSession));

      // Sort by created_at desc (newest first)
      data.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setTodaySessions(data || []);
    } catch (error) {
      console.error('Error loading meditation sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle timer completion side effects safely
  useEffect(() => {
    if (timeRemaining === 0 && isActive) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      setIsActive(false);
      setSessionComplete(true);
      // Play completion sound or notification
      alert('🕉️ Beautiful meditation session completed! How do you feel now?');
    }
  }, [timeRemaining, isActive]);

  const startTimer = () => {
    if (!moodBefore) {
      alert('Please select your mood before starting meditation');
      return;
    }

    if (timerInterval.current) return;

    setIsActive(true);
    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
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
    setTimeRemaining(selectedDuration * 60);
    setSessionComplete(false);
    setMoodBefore('');
    setMoodAfter('');
    setNotes('');
  };

  const changeDuration = (minutes: number) => {
    if (!isActive) {
      setSelectedDuration(minutes);
      setTimeRemaining(minutes * 60);
    }
  };

  const saveSession = async () => {
    if (!moodAfter) {
      alert('Please select your mood after meditation');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const session: MeditationSession = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        session_length: selectedDuration,
        mood_before: moodBefore,
        mood_after: moodAfter,
        notes: notes.trim() || undefined,
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'meditation_sessions'), session);

      alert('🙏 Meditation session saved! Your spiritual practice is recorded.');
      resetTimer();
      await loadTodaySessions();
    } catch (error) {
      console.error('Error saving meditation session:', error);
      alert('Error saving session. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalMeditationToday = () => {
    return todaySessions.reduce((total, session) => total + session.session_length, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your meditation space...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🧘‍♂️ Dhyana - Sacred Meditation</h1>
          <p className="sacred-text text-xl">Connect with your divine essence</p>
        </div>

        {/* Today's Progress */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-blue-300 mb-2">{getTotalMeditationToday()}</div>
            <p className="sacred-text">Minutes Today</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-emerald-300 mb-2">{todaySessions.length}</div>
            <p className="sacred-text">Sessions Today</p>
          </div>
        </div>

        {/* Duration Selection */}
        {!isActive && !sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Choose Your Practice Duration</h3>
            <div className="grid grid-cols-1 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration.minutes}
                  onClick={() => changeDuration(duration.minutes)}
                  className={`p-4 rounded-xl transition-all ${selectedDuration === duration.minutes
                    ? 'bg-blue-600/50 border-2 border-blue-400 text-blue-200'
                    : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                    }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mood Before (if not started) */}
        {!isActive && !sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">How do you feel right now?</h3>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodBefore(mood)}
                  className={`p-3 rounded-xl transition-all ${moodBefore === mood
                    ? 'bg-emerald-600/50 border-2 border-emerald-400 text-emerald-200'
                    : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                    }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 text-center divine-glow">
          {/* Nature Soundscapes Integration */}
          <NatureSoundscapes
            isTimerActive={isActive}
            onTimerComplete={() => {
              setSessionComplete(true);
              alert('🕉️ Beautiful meditation session completed! How do you feel now?');
            }}
          />

          <div className="text-8xl font-bold text-blue-300 mb-6">
            {formatTime(timeRemaining)}
          </div>

          {!sessionComplete ? (
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <button
                  onClick={startTimer}
                  disabled={!moodBefore}
                  className="bg-blue-600 hover:bg-blue-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg disabled:opacity-50"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Begin Sacred Meditation
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
              🕉️ Session Complete! Well done, spiritual warrior.
            </div>
          )}

          {isActive && (
            <div className="mt-6 bg-slate-700/30 rounded-xl p-6">
              <p className="sacred-text text-lg mb-4">
                <strong>Meditation Guidance:</strong>
              </p>
              <div className="space-y-2 text-amber-100">
                <p>🧘‍♂️ Sit comfortably with spine straight</p>
                <p>👁️ Close your eyes gently</p>
                <p>🌬️ Focus on your natural breath</p>
                <p>🕉️ When mind wanders, gently return to breath</p>
                <p>💫 Feel Krishna's presence within you</p>
              </div>
            </div>
          )}
        </div>

        {/* Post-Meditation Reflection */}
        {sessionComplete && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Post-Meditation Reflection</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-amber-100 font-medium mb-3">How do you feel after meditation?</label>
                <div className="grid grid-cols-2 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setMoodAfter(mood)}
                      className={`p-3 rounded-xl transition-all ${moodAfter === mood
                        ? 'bg-emerald-600/50 border-2 border-emerald-400 text-emerald-200'
                        : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                        }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-amber-100 font-medium mb-3">Any insights or experiences? (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                  rows={3}
                  placeholder="I felt Krishna's presence when..."
                />
              </div>

              <button
                onClick={saveSession}
                disabled={!moodAfter}
                className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
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
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Today's Meditation Journey</h3>
            <div className="space-y-4">
              {todaySessions.map((session, index) => (
                <div key={session.id} className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 font-semibold">Session {index + 1}</span>
                    <span className="text-amber-100">{session.session_length} minutes</span>
                  </div>
                  <div className="text-sm sacred-text">
                    <p>Before: {session.mood_before} → After: {session.mood_after}</p>
                    {session.notes && <p className="mt-2 italic">"{session.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeditationTimer;