import React, { useState, useEffect } from 'react';
import { Trophy, Target, CheckCircle, Star, Gift } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  requirement: {
    type: 'streak' | 'japa' | 'meditation' | 'journal' | 'scripture';
    target: number;
    timeframe?: string;
  };
  reward: {
    title: string;
    description: string;
    icon: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
}

const SpiritualQuests: React.FC = () => {
  const [quests] = useState<Quest[]>([
    {
      id: 'first-steps',
      title: 'First Steps on the Path',
      description: 'Complete your first day of spiritual practice',
      icon: '🌱',
      badge: 'Seeker Badge',
      requirement: { type: 'streak', target: 1 },
      reward: {
        title: 'Seeker Badge',
        description: 'You have taken the first step on your spiritual journey',
        icon: '🌱'
      },
      difficulty: 'easy'
    },
    {
      id: 'week-warrior',
      title: 'Week of Devotion',
      description: 'Maintain a 7-day spiritual practice streak',
      icon: '🔥',
      badge: 'Devotion Flame',
      requirement: { type: 'streak', target: 7 },
      reward: {
        title: 'Devotion Flame',
        description: 'Your dedication burns bright for a full week',
        icon: '🔥'
      },
      difficulty: 'medium'
    },
    {
      id: 'japa-master',
      title: 'Naam Japa Master',
      description: 'Complete 1,008 rounds of Naam Japa',
      icon: '📿',
      badge: 'Mantra Master',
      requirement: { type: 'japa', target: 1008 },
      reward: {
        title: 'Mantra Master',
        description: 'Your devotion through sacred chanting is recognized',
        icon: '📿'
      },
      difficulty: 'medium'
    },
    {
      id: 'meditation-monk',
      title: 'Meditation Monk',
      description: 'Complete 10 hours of meditation',
      icon: '🧘‍♂️',
      badge: 'Inner Peace',
      requirement: { type: 'meditation', target: 600 }, // 600 minutes = 10 hours
      reward: {
        title: 'Inner Peace Badge',
        description: 'You have found stillness within the storm',
        icon: '🧘‍♂️'
      },
      difficulty: 'medium'
    },
    {
      id: 'reflection-sage',
      title: 'Reflection Sage',
      description: 'Write 21 journal reflections',
      icon: '📝',
      badge: 'Wisdom Scribe',
      requirement: { type: 'journal', target: 21 },
      reward: {
        title: 'Wisdom Scribe',
        description: 'Your self-reflection brings deep insights',
        icon: '📝'
      },
      difficulty: 'medium'
    },
    {
      id: 'scripture-scholar',
      title: 'Scripture Scholar',
      description: 'Reflect on 30 daily scriptures',
      icon: '📖',
      badge: 'Divine Scholar',
      requirement: { type: 'scripture', target: 30 },
      reward: {
        title: 'Divine Scholar',
        description: 'Sacred wisdom flows through your understanding',
        icon: '📖'
      },
      difficulty: 'hard'
    },
    {
      id: 'month-master',
      title: 'Month of Mastery',
      description: 'Maintain a 30-day spiritual practice streak',
      icon: '👑',
      badge: 'Spiritual Crown',
      requirement: { type: 'streak', target: 30 },
      reward: {
        title: 'Spiritual Crown',
        description: 'You have achieved remarkable spiritual discipline',
        icon: '👑'
      },
      difficulty: 'hard'
    },
    {
      id: 'enlightened-soul',
      title: 'Enlightened Soul',
      description: 'Maintain a 108-day spiritual practice streak',
      icon: '✨',
      badge: 'Enlightened Being',
      requirement: { type: 'streak', target: 108 },
      reward: {
        title: 'Enlightened Being',
        description: 'You have transcended ordinary spiritual practice',
        icon: '✨'
      },
      difficulty: 'legendary'
    }
  ]);

  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestProgress();
  }, []);

  const loadQuestProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const progressMap: Record<string, QuestProgress> = {};

      for (const quest of quests) {
        let currentProgress = 0;
        let isCompleted = false;

        // Fetch progress based on quest type
        // Note: Ideally, we should have a 'quest_progress' collection that is updated via Cloud Functions or Triggers when actions happen.
        // But for client-side calculation (less consistent but works for now):

        if (quest.requirement.type === 'japa') {
          const q = query(collection(db, 'japa_counter'), where('user_id', '==', user.uid));
          const snapshot = await getDocs(q);
          currentProgress = snapshot.docs.reduce((sum, doc) => sum + (doc.data().japa_count || 0), 0);
        } else if (quest.requirement.type === 'meditation') {
          const q = query(collection(db, 'meditation_sessions'), where('user_id', '==', user.uid));
          const snapshot = await getDocs(q);
          currentProgress = snapshot.docs.reduce((sum, doc) => sum + (doc.data().session_length || 0), 0);
        } else if (quest.requirement.type === 'journal') {
          const q = query(collection(db, 'journal_entries'), where('user_id', '==', user.uid));
          const snapshot = await getDocs(q);
          currentProgress = snapshot.size;
        } else if (quest.requirement.type === 'scripture') {
          const q = query(collection(db, 'journal_entries'), where('user_id', '==', user.uid));
          const snapshot = await getDocs(q);
          currentProgress = snapshot.docs.filter(doc =>
            doc.data().reason?.includes('Scripture Reflection')
          ).length;
        } else if (quest.requirement.type === 'streak') {
          const q = query(collection(db, 'streaks'), where('user_id', '==', user.uid));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            currentProgress = snapshot.docs[0].data().current_streak || 0;
          }
        }

        // Check if quest is completed
        if (currentProgress >= quest.requirement.target) {
          isCompleted = true;
        }

        progressMap[quest.id] = {
          questId: quest.id,
          progress: currentProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined // Approximation
        };
      }

      setQuestProgress(Object.values(progressMap));
      setLoading(false);
    } catch (error) {
      console.error('Error loading quest progress:', error);
      setLoading(false);
    }
  };

  const getProgressPercentage = (quest: Quest, progress: QuestProgress) => {
    return Math.min((progress.progress / quest.requirement.target) * 100, 100);
  };

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-300 border-green-400/50';
      case 'medium': return 'text-yellow-300 border-yellow-400/50';
      case 'hard': return 'text-orange-300 border-orange-400/50';
      case 'legendary': return 'text-purple-300 border-purple-400/50';
      default: return 'text-gray-300 border-gray-400/50';
    }
  };

  const getDifficultyBg = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600/20';
      case 'medium': return 'bg-yellow-600/20';
      case 'hard': return 'bg-orange-600/20';
      case 'legendary': return 'bg-purple-600/20';
      default: return 'bg-gray-600/20';
    }
  };

  if (loading) {
    return (
      <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
        <div className="text-center">
          <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-4 animate-pulse" />
          <p className="sacred-text">Loading your spiritual quests...</p>
        </div>
      </div>
    );
  }

  const completedQuests = questProgress.filter(p => p.completed);
  const activeQuests = questProgress.filter(p => !p.completed);

  return (
    <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-amber-300 mr-3" />
          <h3 className="text-2xl font-bold text-amber-100">Spiritual Quests</h3>
          <Trophy className="w-8 h-8 text-amber-300 ml-3" />
        </div>
        <p className="sacred-text">Gamify your spiritual journey with meaningful challenges</p>
      </div>

      {/* Quest Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-300 mb-2">{completedQuests.length}</div>
          <p className="sacred-text">Completed</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-300 mb-2">{activeQuests.length}</div>
          <p className="sacred-text">In Progress</p>
        </div>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-amber-100 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Active Quests
          </h4>
          <div className="space-y-4">
            {activeQuests.map((progress) => {
              const quest = quests.find(q => q.id === progress.questId)!;
              const percentage = getProgressPercentage(quest, progress);

              return (
                <div
                  key={quest.id}
                  className={`p-6 rounded-xl border-2 ${getDifficultyColor(quest.difficulty)} ${getDifficultyBg(quest.difficulty)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{quest.icon}</span>
                      <div>
                        <h5 className="text-lg font-semibold text-amber-100">{quest.title}</h5>
                        <p className="sacred-text text-sm">{quest.description}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getDifficultyColor(quest.difficulty)} ${getDifficultyBg(quest.difficulty)}`}>
                          {quest.difficulty.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-300">
                        {progress.progress}/{quest.requirement.target}
                      </div>
                      <div className="text-sm sacred-text">{Math.round(percentage)}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 text-purple-300 mr-2" />
                      <span className="text-purple-300 text-sm">Reward: {quest.reward.title}</span>
                    </div>
                    <span className="text-amber-300 text-sm">
                      {quest.requirement.target - progress.progress} more to go!
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-emerald-300 mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Completed Quests
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedQuests.map((progress) => {
              const quest = quests.find(q => q.id === progress.questId)!;

              return (
                <div
                  key={quest.id}
                  className="p-4 rounded-xl bg-emerald-600/20 border border-emerald-400/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{quest.icon}</span>
                      <div>
                        <h5 className="text-emerald-300 font-semibold">{quest.title}</h5>
                        <p className="text-emerald-200 text-sm">{quest.reward.title}</p>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-emerald-200/80 text-sm">{quest.reward.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-8 text-center bg-slate-700/20 rounded-xl p-6">
        <Star className="w-8 h-8 text-amber-300 mx-auto mb-3" />
        <p className="sacred-text text-lg">
          "Every quest completed is a step closer to your highest self.
          The journey itself is the destination."
        </p>
      </div>
    </div>
  );
};

export default SpiritualQuests;