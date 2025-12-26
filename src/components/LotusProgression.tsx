import React, { useState, useEffect } from 'react';
import { Award, Sparkles } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface SpiritualStats {
  totalJapa: number;
  totalMeditation: number;
  totalJournalEntries: number;
  currentStreak: number;
  totalDays: number;
}

interface LotusLevel {
  level: number;
  name: string;
  icon: string;
  description: string;
  requirement: number;
  color: string;
  glow: string;
}

interface LotusProgressionProps {
  streak?: number;
}

const LotusProgression: React.FC<LotusProgressionProps> = ({ streak = 0 }) => {
  const [stats, setStats] = useState<SpiritualStats>({
    totalJapa: 0,
    totalMeditation: 0,
    totalJournalEntries: 0,
    currentStreak: streak,
    totalDays: 0
  });
  const [currentLevel, setCurrentLevel] = useState<LotusLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<LotusLevel | null>(null);
  const [loading, setLoading] = useState(true);

  const lotusLevels: LotusLevel[] = [
    {
      level: 1,
      name: "Seed of Devotion",
      icon: "🌱",
      description: "Your spiritual journey begins",
      requirement: 0,
      color: "text-green-300",
      glow: "shadow-green-400/20"
    },
    {
      level: 2,
      name: "Sprouting Bud",
      icon: "🌿",
      description: "First signs of spiritual growth",
      requirement: 500,
      color: "text-emerald-300",
      glow: "shadow-emerald-400/20"
    },
    {
      level: 3,
      name: "Opening Petals",
      icon: "🌸",
      description: "Consciousness begins to bloom",
      requirement: 1500,
      color: "text-pink-300",
      glow: "shadow-pink-400/20"
    },
    {
      level: 4,
      name: "Sacred Lotus",
      icon: "🪷",
      description: "Beautiful spiritual flowering",
      requirement: 3500,
      color: "text-purple-300",
      glow: "shadow-purple-400/20"
    },
    {
      level: 5,
      name: "Golden Lotus",
      icon: "🌟",
      description: "Radiant divine consciousness",
      requirement: 7500,
      color: "text-amber-300",
      glow: "shadow-amber-400/30"
    },
    {
      level: 6,
      name: "Thousand-Petaled Lotus",
      icon: "✨",
      description: "Enlightened spiritual master",
      requirement: 15000,
      color: "text-yellow-200",
      glow: "shadow-yellow-400/40"
    }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadSpiritualStats(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadSpiritualStats = async (userId: string) => {
    try {
      if (!userId) return;

      // 1. Calculate Japa Count (JapaCounter)
      const japaSnapshot = await getDocs(query(collection(db, 'japa_counter'), where('user_id', '==', userId)));
      const totalJapa = japaSnapshot.docs.reduce((sum, doc) => sum + (doc.data().japa_count || 0), 0);

      // 2. Calculate Meditation Minutes (MeditationSessions)
      const meditationSnapshot = await getDocs(query(collection(db, 'meditation_sessions'), where('user_id', '==', userId)));
      const totalMeditation = meditationSnapshot.docs.reduce((sum, doc) => sum + (doc.data().session_length || 0), 0);

      // 3. Calculate Journal Entries (Journal)
      const journalSnapshot = await getDocs(query(collection(db, 'journal_entries'), where('user_id', '==', userId)));
      const totalJournalEntries = journalSnapshot.size;

      // 4. Calculate Streak
      // Ideally query a dedicated streak table or calculate from daily logs. 
      // For now, let's use the 'users' collection's spiritual_score as a proxy or fetch streak data from 'streaks' collection if available.
      // Assuming 'streaks' collection exists from Leaderboard logic:
      const streakSnapshot = await getDocs(query(collection(db, 'streaks'), where('user_id', '==', userId)));
      let currentStreak = 0;
      if (!streakSnapshot.empty) {
        currentStreak = streakSnapshot.docs[0].data().current_streak || 0;
      }

      // 5. Total Days
      let totalDays = 1;
      const user = auth.currentUser;
      if (user && user.metadata.creationTime) {
        const created = new Date(user.metadata.creationTime);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      const newStats = {
        totalJapa,
        totalMeditation,
        totalJournalEntries,
        currentStreak,
        totalDays
      };

      setStats(newStats);
      calculateLotusLevel(newStats);
    } catch (error) {
      console.error('Error loading spiritual stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLotusLevel = (stats: SpiritualStats) => {
    // Calculate spiritual score based on various practices
    const spiritualScore =
      stats.totalJapa * 1 +           // 1 point per japa
      stats.totalMeditation * 5 +     // 5 points per meditation minute
      stats.totalJournalEntries * 50 + // 50 points per journal entry
      stats.currentStreak * 100 +     // 100 points per streak day
      stats.totalDays * 25;           // 25 points per day tracked

    // Find current level
    let current = lotusLevels[0];
    for (let i = lotusLevels.length - 1; i >= 0; i--) {
      if (spiritualScore >= lotusLevels[i].requirement) {
        current = lotusLevels[i];
        break;
      }
    }

    // Find next level
    let next = null;
    for (let i = 0; i < lotusLevels.length; i++) {
      if (lotusLevels[i].requirement > spiritualScore) {
        next = lotusLevels[i];
        break;
      }
    }

    setCurrentLevel(current);
    setNextLevel(next);
  };

  const getSpiritualScore = () => {
    return stats.totalJapa * 1 +
      stats.totalMeditation * 5 +
      stats.totalJournalEntries * 50 +
      stats.currentStreak * 100 +
      stats.totalDays * 25;
  };

  const getProgressToNext = () => {
    if (!nextLevel) return 100;
    const currentScore = getSpiritualScore();
    const currentReq = currentLevel?.requirement || 0;
    const nextReq = nextLevel.requirement;
    return Math.min(((currentScore - currentReq) / (nextReq - currentReq)) * 100, 100);
  };

  if (loading) {
    return (
      <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-4 animate-pulse" />
          <p className="sacred-text">Assessing your spiritual growth...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-amber-300 mr-3" />
          <h3 className="text-2xl font-bold text-amber-100">Lotus of Consciousness</h3>
          <Award className="w-8 h-8 text-amber-300 ml-3" />
        </div>
        <p className="sacred-text">Your spiritual evolution through sacred practice</p>
      </div>

      {/* Current Level Display */}
      {currentLevel && (
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-amber-300/30 mb-4 ${currentLevel.glow} shadow-2xl`}>
            <span className="text-5xl lotus-glow">{currentLevel.icon}</span>
          </div>
          <h4 className={`text-2xl font-bold ${currentLevel.color} mb-2`}>
            {currentLevel.name}
          </h4>
          <p className="sacred-text text-lg mb-4">{currentLevel.description}</p>
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-amber-100 font-medium">Spiritual Score: {getSpiritualScore().toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-amber-100 font-medium">Progress to {nextLevel.name}</span>
            <span className="text-amber-300">{Math.round(getProgressToNext())}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-4 rounded-full transition-all duration-1000 lotus-progress-glow"
              style={{ width: `${getProgressToNext()}%` }}
            ></div>
          </div>
          <p className="text-sm sacred-text text-center">
            {nextLevel.requirement - getSpiritualScore()} points to {nextLevel.name} {nextLevel.icon}
          </p>
        </div>
      )}

      {/* Spiritual Stats Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-300 mb-1">{stats.totalJapa.toLocaleString()}</div>
          <p className="sacred-text text-sm">Naam Japa</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-300 mb-1">{stats.totalMeditation}</div>
          <p className="sacred-text text-sm">Meditation (min)</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-300 mb-1">{stats.totalJournalEntries}</div>
          <p className="sacred-text text-sm">Reflections</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-300 mb-1">{stats.currentStreak}</div>
          <p className="sacred-text text-sm">Current Streak</p>
        </div>
      </div>

      {/* All Levels Preview */}
      <div className="bg-slate-700/20 rounded-xl p-6">
        <h5 className="text-lg font-semibold text-amber-100 mb-4 text-center">Lotus Evolution Path</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {lotusLevels.map((level) => (
            <div
              key={level.level}
              className={`text-center p-3 rounded-lg transition-all ${currentLevel?.level === level.level
                ? 'bg-amber-600/20 border border-amber-400/50'
                : getSpiritualScore() >= level.requirement
                  ? 'bg-emerald-600/20 border border-emerald-400/30'
                  : 'bg-slate-600/20 border border-slate-500/30'
                }`}
            >
              <div className="text-2xl mb-2">{level.icon}</div>
              <div className={`text-sm font-medium ${level.color} mb-1`}>
                {level.name}
              </div>
              <div className="text-xs sacred-text">
                {level.requirement.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .percentage-ring__circle {
          transition: stroke-dashoffset 0.5s ease-in-out;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        
        .lotus-glow {
          filter: drop-shadow(0 0 10px rgba(245, 233, 200, 0.5));
          animation: gentle-lotus-pulse 3s ease-in-out infinite;
        }
        
        .lotus-progress-glow {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
        }
        
        @keyframes gentle-lotus-pulse {
          0%, 100% { 
            filter: drop-shadow(0 0 10px rgba(245, 233, 200, 0.5));
          }
          50% { 
            filter: drop-shadow(0 0 20px rgba(245, 233, 200, 0.8));
          }
        }
      `}</style>
    </div >
  );
};

export default LotusProgression;