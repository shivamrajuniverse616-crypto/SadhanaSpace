import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Heart, Target, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { StreakData } from '../lib/types';
import ScriptureOfTheDay from './ScriptureOfTheDay';
import LotusProgression from './LotusProgression';
import SpiritualQuests from './SpiritualQuests';
import FlameAnimation from './FlameAnimation';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    start_date: new Date().toISOString().split('T')[0],
    last_slip_date: null
  });
  const [dailyAffirmation, setDailyAffirmation] = useState<string>('');
  const [todayJapa, setTodayJapa] = useState<number>(0);
  const [todayMeditation, setTodayMeditation] = useState<number>(0);
  const [todayFocus, setTodayFocus] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load Streak
      const streakQ = query(
        collection(db, 'streaks'),
        where('user_id', '==', user.uid),
        orderBy('current_streak', 'desc'),
        limit(1)
      );

      const streakSnapshot = await getDocs(streakQ);
      let calculatedStreak = 0;
      let streakDocId = null;
      let streakDataTemp: StreakData = {
        current_streak: 0,
        start_date: new Date().toISOString().split('T')[0],
        last_slip_date: null
      };

      if (!streakSnapshot.empty) {
        streakDocId = streakSnapshot.docs[0].id;
        streakDataTemp = streakSnapshot.docs[0].data() as StreakData;

        // Calculate streak based on time difference
        // If last_slip_date exists, use that. Otherwise use start_date.
        const referenceDateStr = streakDataTemp.last_slip_date || streakDataTemp.start_date;
        const referenceDate = new Date(referenceDateStr);
        const today = new Date();

        // Reset time part to ensure we count full days
        referenceDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - referenceDate.getTime());
        calculatedStreak = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Update local state with calculated value
        setStreakData({
          ...streakDataTemp,
          current_streak: calculatedStreak
        });

        // Optionally update Firestore if it's out of sync (lazy update)
        if (calculatedStreak !== streakDataTemp.current_streak) {
          updateDoc(doc(db, 'streaks', streakDocId), {
            current_streak: calculatedStreak,
            updated_at: new Date().toISOString()
          });
        }

      } else {
        // Create initial streak doc if none exists
        const newStreak: StreakData = {
          user_id: user.uid,
          current_streak: 0,
          start_date: new Date().toISOString().split('T')[0],
          last_slip_date: new Date().toISOString().split('T')[0] // Assume starting today means day 0
        };
        await addDoc(collection(db, 'streaks'), newStreak);
        setStreakData(newStreak);
      }

      // Load today's stats
      const today = new Date().toISOString().split('T')[0];

      // Japa
      const japaQ = query(
        collection(db, 'japa_counter'),
        where('user_id', '==', user.uid),
        where('date', '==', today)
      );
      const japaSnapshot = await getDocs(japaQ);
      const japaCount = japaSnapshot.docs.reduce((sum, doc) => sum + (doc.data().japa_count || 0), 0);
      setTodayJapa(japaCount);

      // Meditation
      const medQ = query(
        collection(db, 'meditation_sessions'),
        where('user_id', '==', user.uid),
        where('date', '==', today)
      );
      const medSnapshot = await getDocs(medQ);
      const medMins = medSnapshot.docs.reduce((sum, doc) => sum + (doc.data().session_length || 0), 0);
      setTodayMeditation(medMins);

      // Focus
      const focusQ = query(
        collection(db, 'focus_sessions'),
        where('user_id', '==', user.uid),
        where('date', '==', today)
      );
      const focusSnapshot = await getDocs(focusQ);
      const focusMins = focusSnapshot.docs.reduce((sum, doc) => sum + (doc.data().duration || 0), 0);
      setTodayFocus(focusMins);

      // Affirmation (Mock or fetch)
      setDailyAffirmation("Today is a sacred gift. Use it wisely.");

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSlip = async () => {
    if (!window.confirm('Are you sure you want to reset your streak? Honesty is the first step.')) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Update Firestore
      const streakQ = query(
        collection(db, 'streaks'),
        where('user_id', '==', user.uid),
        orderBy('current_streak', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(streakQ);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          current_streak: 0,
          last_slip_date: today,
          updated_at: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'streaks'), {
          user_id: user.uid,
          current_streak: 0,
          start_date: today,
          last_slip_date: today,
          updated_at: new Date().toISOString()
        });
      }

      setStreakData(prev => ({
        ...prev,
        current_streak: 0,
        last_slip_date: today
      }));

      alert('Streak reset. Begin again with renewed determination.');
    } catch (error) {
      console.error('Error resetting streak:', error);
      alert('Failed to reset streak. Please try again.');
    }
  };

  return (
    <div className="space-y-8 pb-20 relative z-10">
      {/* Header Section */}
      <header className="relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold sacred-heading mb-2 filter drop-shadow-lg page-enter" style={{ animationDelay: '0.1s' }}>
              {getGreeting()}, Seeker
            </h1>
            <p className="text-amber-100/80 text-lg font-light page-enter" style={{ animationDelay: '0.2s' }}>
              Your spiritual journey continues today.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Optional: Add Date or Weather Widget here if desired */}
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="spiritual-card rounded-2xl p-6 relative group overflow-hidden page-enter" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider mb-1">Brahmacharya Streak</div>
            <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
              {streakData.current_streak}
              <span className="text-lg font-normal text-amber-200/50">days</span>
            </div>
            <FlameAnimation intensity={Math.min(streakData.current_streak / 10, 3)} />
            {streakData.current_streak > 0 && (
              <div className="text-xs text-green-400 mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Power Growing
              </div>
            )}
          </div>
        </div>

        {/* Japa Card */}
        <div className="spiritual-card rounded-2xl p-6 relative group overflow-hidden page-enter" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="text-rose-200/70 text-sm font-medium uppercase tracking-wider mb-1">Today's Japa</div>
            <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
              {todayJapa}
              <span className="text-lg font-normal text-rose-200/50">names</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-3">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((todayJapa / 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Meditation Card */}
        <div className="spiritual-card rounded-2xl p-6 relative group overflow-hidden page-enter" style={{ animationDelay: '0.5s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="w-16 h-16 text-cyan-500" />
          </div>
          <div className="relative z-10">
            <div className="text-cyan-200/70 text-sm font-medium uppercase tracking-wider mb-1">Meditation</div>
            <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
              {todayMeditation}
              <span className="text-lg font-normal text-cyan-200/50">mins</span>
            </div>
            <div className="text-xs text-cyan-400/80 mt-2">
              Inner silence achieved
            </div>
          </div>
        </div>

        {/* Focus Card */}
        <div className="spiritual-card rounded-2xl p-6 relative group overflow-hidden page-enter" style={{ animationDelay: '0.6s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-200/70 text-sm font-medium uppercase tracking-wider mb-1">Deep Work</div>
            <div className="text-4xl font-bold text-white mb-2 flex items-baseline gap-2">
              {todayFocus}
              <span className="text-lg font-normal text-emerald-200/50">mins</span>
            </div>
            <div className="text-xs text-emerald-400/80 mt-2">
              Karm Yog practice
            </div>
          </div>
        </div>
      </div>

      {/* Featured Content & Daily Wisdom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Scripture/Quote */}
          <div className="page-enter" style={{ animationDelay: '0.7s' }}>
            <ScriptureOfTheDay />
          </div>

          {/* Lotus Progression */}
          <div className="page-enter" style={{ animationDelay: '0.8s' }}>
            <LotusProgression streak={streakData.current_streak} />
          </div>
        </div>

        {/* Sidebar Area (1 col) */}
        <div className="space-y-8">
          {/* Spiritual Quests */}
          <div className="page-enter" style={{ animationDelay: '0.9s' }}>
            <SpiritualQuests />
          </div>

          {/* AI Affirmation Card */}
          {dailyAffirmation ? (
            <div className="spiritual-card rounded-2xl p-6 relative overflow-hidden page-enter" style={{ animationDelay: '1.0s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
              <h3 className="text-lg font-semibold text-amber-200 mb-3 flex items-center relative z-10">
                <Sparkles className="w-5 h-5 mr-2 text-amber-400" /> Daily Prana
              </h3>
              <p className="text-white/90 italic leading-relaxed text-lg font-medium relative z-10">
                "{dailyAffirmation}"
              </p>
            </div>
          ) : (
            <div className="spiritual-card rounded-2xl p-6 text-center page-enter" style={{ animationDelay: '1.0s' }}>
              <p className="text-slate-400 italic">"The journey of a thousand miles begins with a single step."</p>
            </div>
          )}

          {/* Emergency Button */}
          <div className="page-enter" style={{ animationDelay: '1.1s' }}>
            <button
              onClick={() => navigate('/emergency')}
              className="w-full bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800 hover:to-red-700 text-red-100 p-4 rounded-2xl border border-red-500/30 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] shadow-lg group"
            >
              <div className="p-2 bg-red-500/20 rounded-full group-hover:animate-pulse">
                <Shield className="w-6 h-6 text-red-200" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Emergency Mode</div>
                <div className="text-xs text-red-200/60">Urges? Get help immediately</div>
              </div>
            </button>
          </div>

          {/* Slip Button (Less prominent) */}
          <div className="text-center pt-4 page-enter" style={{ animationDelay: '1.2s' }}>
            <button
              onClick={handleSlip}
              className="text-slate-500 hover:text-red-400 text-sm transition-colors flex items-center justify-center mx-auto"
            >
              <AlertTriangle className="w-3 h-3 mr-1.5" />
              I slipped (Reset Streak)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;