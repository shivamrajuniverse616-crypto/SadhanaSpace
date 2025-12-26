import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crown, Medal, ExternalLink } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { UserProfile, LeaderboardEntry } from '../lib/types';

const LeaderboardWidget: React.FC = () => {
  const navigate = useNavigate();
  const [topThree, setTopThree] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopThree();
  }, []);

  const loadTopThree = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get users
      const usersRef = collection(db, 'users');
      // Limit to top 20 to find top 3 + potentially user
      const q = query(usersRef, orderBy('spiritual_score', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

      if (users.length === 0) {
        setTopThree([]);
        setLoading(false);
        return;
      }

      // We use stored score for widget performance
      const leaderboardData: LeaderboardEntry[] = users.map((userProfile, index) => ({
        ...userProfile,
        rank: index + 1
      }));

      setTopThree(leaderboardData.slice(0, 3));

      // Find current user rank
      const currentUserEntry = leaderboardData.find(entry => entry.id === user.uid);
      setCurrentUserRank(currentUserEntry?.rank || null);
    } catch (error) {
      console.error('Error loading top three:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="spiritual-card rounded-2xl p-6 divine-glow">
        <div className="text-center">
          <Trophy className="w-8 h-8 text-amber-300 mx-auto mb-4 animate-pulse" />
          <p className="sacred-text">Loading spiritual rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-card rounded-2xl p-8 divine-glow">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-amber-300 mr-3" />
          <h3 className="text-2xl font-bold text-amber-100">Top Spiritual Practitioners</h3>
        </div>
        <p className="sacred-text">Souls leading the path of divine growth</p>
      </div>

      {topThree.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <p className="sacred-text">Be the first to join the spiritual leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {topThree.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${entry.rank === 1
                ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-400/50'
                : entry.rank === 2
                  ? 'bg-gradient-to-r from-gray-600/20 to-slate-600/20 border border-gray-400/50'
                  : 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-400/50'
                }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center mr-3">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm">🪷</span>
                  )}
                </div>

                <div>
                  <h4 className="text-amber-100 font-semibold">{entry.username}</h4>
                  <p className="sacred-text text-xs">Rank #{entry.rank}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-amber-300">
                  {entry.spiritual_score.toLocaleString()}
                </div>
                <p className="sacred-text text-xs">Score</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current User Rank */}
      {currentUserRank && (
        <div className="bg-emerald-600/20 rounded-xl p-4 border border-emerald-400/50 mb-6">
          <div className="text-center">
            <p className="text-emerald-300 font-medium">Your Current Rank</p>
            <div className="text-3xl font-bold text-emerald-300">#{currentUserRank}</div>
          </div>
        </div>
      )}

      {/* View Full Leaderboard Button */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        View Full Spiritual Leaderboard
      </button>

      {/* Scoring Info */}
      <div className="mt-6 bg-slate-700/20 rounded-xl p-4">
        <h5 className="text-amber-100 font-medium mb-3 text-center">How Spiritual Score is Calculated</h5>
        <div className="grid grid-cols-2 gap-2 text-xs sacred-text">
          <div>• 1 pt per Naam Japa</div>
          <div>• 5 pts per meditation min</div>
          <div>• 50 pts per journal entry</div>
          <div>• 100 pts per streak day</div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardWidget;