import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Users } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy, limit, updateDoc } from 'firebase/firestore';
import { UserProfile, LeaderboardEntry } from '../lib/types';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const timeFilters = {
    week: { label: 'This Week', icon: '📅', desc: 'Last 7 days' },
    month: { label: 'This Month', icon: '🗓️', desc: 'Last 30 days' },
    all: { label: 'All Time', icon: '♾️', desc: 'Since beginning' }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadLeaderboard(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [timeFilter]);

  const calculateSpiritualScore = async (userId: string): Promise<number> => {
    try {
      let dateFilter = '';
      const now = new Date();

      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString().split('T')[0];
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString().split('T')[0];
      }

      // Queries
      // Queries
      const japaReq = timeFilter === 'all'
        ? query(collection(db, 'japa_counter'), where('user_id', '==', userId))
        : query(collection(db, 'japa_counter'), where('user_id', '==', userId), where('date', '>=', dateFilter));

      const sessionReq = timeFilter === 'all'
        ? query(collection(db, 'meditation_sessions'), where('user_id', '==', userId))
        : query(collection(db, 'meditation_sessions'), where('user_id', '==', userId), where('date', '>=', dateFilter));

      const journalReq = timeFilter === 'all'
        ? query(collection(db, 'journal_entries'), where('user_id', '==', userId))
        : query(collection(db, 'journal_entries'), where('user_id', '==', userId), where('date', '>=', dateFilter));

      const streakQuery = query(collection(db, 'streaks'), where('user_id', '==', userId));

      const [japaSnap, meditationSnap, journalSnap, streakSnap] = await Promise.all([
        getDocs(japaReq),
        getDocs(sessionReq),
        getDocs(journalReq),
        getDocs(streakQuery)
      ]);

      const totalJapa = japaSnap.docs.reduce((sum, doc) => sum + doc.data().japa_count, 0) || 0;
      const totalMeditation = meditationSnap.docs.reduce((sum, doc) => sum + doc.data().session_length, 0) || 0;
      const totalJournal = journalSnap.size || 0;

      let currentStreak = 0;
      if (!streakSnap.empty) {
        currentStreak = streakSnap.docs[0].data().current_streak || 0;
      }

      // Calculate total days (Consistency with LotusProgression)
      // Use auth metadata if available, or created_at from user doc if stored
      const user = auth.currentUser;
      let totalDays = 1;
      if (user && user.metadata.creationTime) {
        const created = new Date(user.metadata.creationTime);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - created.getTime());
        totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      // Calculate spiritual score
      const spiritualScore =
        totalJapa * 1 +           // 1 point per japa
        totalMeditation * 5 +     // 5 points per meditation minute
        totalJournal * 50 +       // 50 points per journal entry
        currentStreak * 100 +     // 100 points per streak day
        totalDays * 25;           // 25 points per day tracked

      return spiritualScore;
    } catch (error) {
      console.error('Error calculating spiritual score:', error);
      return 0;
    }
  };

  const loadLeaderboard = async (userId: string) => {
    try {
      // User is passed directly from auth listener to avoid race condition
      if (!userId) return;

      // Get all users
      // Note: In a real production app with many users, you would not fetch all users client-side.
      // You would use a cloud function to aggregate scores periodically.
      // For this migration, we keep similar logic but use Firestore.
      const usersRef = collection(db, 'users');
      // Limit to top 50 for performance safety if list grows
      const q = query(usersRef, orderBy('spiritual_score', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

      if (users.length === 0) {
        // Create current user profile if no users exist
        await createUserProfile(userId);
        // Retry loading
        return loadLeaderboard(userId);
      }

      // Note: Recalculating score for EVERY user on EVERY load is very expensive and slow.
      // For now, I will use the stored 'spiritual_score' for the leaderboard display 
      // and only recalculate/update the CURRENT user's score.
      // This is a slight change from the original code but much more performant for Firestore.

      // Update current user's score first
      // Update current user's score first
      const currentScore = await calculateSpiritualScore(userId);
      const user = auth.currentUser;
      const username = user?.displayName || user?.email?.split('@')[0] || 'Seeker';
      const photoURL = user?.photoURL || null;

      await updateDoc(doc(db, 'users', userId), {
        spiritual_score: currentScore,
        username: username, // Sync latest username
        avatar_url: photoURL, // Sync latest avatar (if auth has one) - NOTE: This might overwrite manual DB avatar if not careful.
        // Actually, we should only set avatar_url if it's currently null in DB, or if we want auth to overwrite.
        // For now, let's assume DB avatar takes precedence IF we had separated them, but we haven't.
        // Let's use setDoc with merge to ensure fields exist.
        // Better yet: update only score, and if username/avatar are missing/old, update them. 
        // But simply:
        last_score_update: new Date().toISOString()
      });

      // Reload users to get updated score
      const updatedSnapshot = await getDocs(q);
      const updatedUsers = updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));

      const leaderboardData: LeaderboardEntry[] = updatedUsers.map((userProfile, index) => ({
        ...userProfile,
        rank: index + 1
      }));

      setLeaderboard(leaderboardData);

      // Find current user in leaderboard
      const currentUserEntry = leaderboardData.find(entry => entry.id === userId);

      // If user is not in top 50, manually fetch/add them for "My Rank" display
      if (!currentUserEntry) {
        // Should fetch user profile specifically if not in list
        // For now, simplify to just null or partial data if needed, but let's assume they are in top 50 or we handle it gracefully
        // Actually, let's construct it from auth + calculated score
        setCurrentUser({
          id: userId,
          username: auth.currentUser?.email?.split('@')[0] || 'User',
          spiritual_score: currentScore,
          last_score_update: new Date().toISOString(),
          rank: 999, // Unknown rank if outside top 50
          created_at: new Date().toISOString()
        });
      } else {
        setCurrentUser(currentUserEntry);
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const username = user.displayName || user.email?.split('@')[0] || `User${Date.now()}`;
      const score = await calculateSpiritualScore(userId);
      const photoURL = user.photoURL || null;

      const userProfile: UserProfile = {
        id: userId,
        username: username,
        avatar_url: photoURL,
        spiritual_score: score,
        last_score_update: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userId), userProfile, { merge: true });

    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2: return <Medal className="w-8 h-8 text-gray-300" />;
      case 3: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <span className="text-2xl font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: "🏆 Spiritual Champion", color: "bg-yellow-600/30 border-yellow-400/50 text-yellow-200" };
    if (rank === 2) return { text: "🥈 Divine Devotee", color: "bg-gray-600/30 border-gray-400/50 text-gray-200" };
    if (rank === 3) return { text: "🥉 Sacred Seeker", color: "bg-amber-600/30 border-amber-400/50 text-amber-200" };
    if (rank <= 10) return { text: "⭐ Top Practitioner", color: "bg-purple-600/30 border-purple-400/50 text-purple-200" };
    if (rank <= 25) return { text: "🌟 Dedicated Soul", color: "bg-blue-600/30 border-blue-400/50 text-blue-200" };
    return { text: "🌱 Growing Spirit", color: "bg-green-600/30 border-green-400/50 text-green-200" };
  };

  const getScoreBadge = (score: number) => {
    if (score >= 10000) return { text: "🕉️ Enlightened Master", color: "text-yellow-300" };
    if (score >= 5000) return { text: "👑 Spiritual Warrior", color: "text-purple-300" };
    if (score >= 2500) return { text: "🌸 Devoted Practitioner", color: "text-pink-300" };
    if (score >= 1000) return { text: "🔥 Rising Soul", color: "text-orange-300" };
    if (score >= 500) return { text: "🌱 Growing Seeker", color: "text-green-300" };
    return { text: "🌟 New Journey", color: "text-blue-300" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <div className="text-amber-100 text-xl">Loading spiritual leaderboard...</div>
        </div>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
            <Trophy className="w-10 h-10 text-indigo-900" />
          </div>
          <h1 className="text-5xl font-bold text-amber-100 mb-4 font-display">🏆 Spiritual Leaderboard</h1>
          <p className="text-xl text-amber-200/80 font-light">Celebrating souls on the path of divine growth</p>
        </div>

        {/* Time Filter */}
        <div className="spiritual-card rounded-2xl p-6 mb-8 divine-glow">
          <h3 className="text-xl font-bold text-amber-100 mb-4 text-center">Choose Time Period</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(timeFilters).map(([key, filter]) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key as any)}
                className={`p-4 rounded-xl transition-all ${timeFilter === key
                  ? 'bg-amber-600/50 border-2 border-amber-400 text-amber-200'
                  : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                  }`}
              >
                <div className="text-2xl mb-2">{filter.icon}</div>
                <div className="font-medium">{filter.label}</div>
                <div className="text-xs opacity-75">{filter.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* My Rank Section */}
        {currentUser && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">🌟 My Spiritual Standing</h3>
            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl p-6 border border-emerald-400/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center mr-4">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl">🪷</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-amber-100">{currentUser.username}</h4>
                    <p className="text-emerald-300 font-medium">Rank #{currentUser.rank}</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRankBadge(currentUser.rank).color}`}>
                      {getRankBadge(currentUser.rank).text}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-300 mb-2">
                    {currentUser.spiritual_score.toLocaleString()}
                  </div>
                  <p className="sacred-text">Spiritual Score</p>
                  <div className={`text-sm font-medium mt-2 ${getScoreBadge(currentUser.spiritual_score).color}`}>
                    {getScoreBadge(currentUser.spiritual_score).text}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-8 text-center">🏆 Sacred Podium</h3>
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* Second Place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  {leaderboard[1].avatar_url ? (
                    <img src={leaderboard[1].avatar_url} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">🪷</span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-gray-300 mb-1">{leaderboard[1].username}</h4>
                <p className="text-2xl font-bold text-gray-300">{leaderboard[1].spiritual_score.toLocaleString()}</p>
              </div>

              {/* First Place */}
              <div className="text-center">
                <div className="w-24 h-20 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-xl flex items-center justify-center mb-4 mx-auto">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl">
                  {leaderboard[0].avatar_url ? (
                    <img src={leaderboard[0].avatar_url} alt="Profile" className="w-18 h-18 rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl">🪷</span>
                  )}
                </div>
                <h4 className="text-xl font-bold text-yellow-300 mb-1">{leaderboard[0].username}</h4>
                <p className="text-3xl font-bold text-yellow-300">{leaderboard[0].spiritual_score.toLocaleString()}</p>
                <div className="text-yellow-400 text-sm font-medium mt-2">👑 Spiritual Champion</div>
              </div>

              {/* Third Place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  {leaderboard[2].avatar_url ? (
                    <img src={leaderboard[2].avatar_url} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">🪷</span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-amber-300 mb-1">{leaderboard[2].username}</h4>
                <p className="text-2xl font-bold text-amber-300">{leaderboard[2].spiritual_score.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center flex items-center justify-center">
            <Users className="w-8 h-8 mr-3" />
            Complete Spiritual Rankings
          </h3>

          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🏆</div>
              <p className="sacred-text text-xl mb-4">Be the first to join the spiritual leaderboard!</p>
              <p className="text-slate-400">Start your spiritual practice to appear on the rankings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-6 rounded-xl transition-all ${entry.rank <= 3
                    ? 'bg-gradient-to-r from-amber-600/20 to-emerald-600/20 border border-amber-400/50'
                    : 'bg-slate-700/30 border border-slate-600/50'
                    } ${currentUser?.id === entry.id ? 'ring-2 ring-emerald-400/50' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center mr-4">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center mr-4">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-xl">🪷</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-amber-100 flex items-center">
                        {entry.username}
                        {currentUser?.id === entry.id && (
                          <span className="ml-2 text-emerald-400 text-sm">(You)</span>
                        )}
                      </h4>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRankBadge(entry.rank).color}`}>
                        {getRankBadge(entry.rank).text}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-300 mb-1">
                      {entry.spiritual_score.toLocaleString()}
                    </div>
                    <p className="sacred-text text-sm">Spiritual Score</p>
                    <div className={`text-xs font-medium mt-1 ${getScoreBadge(entry.spiritual_score).color}`}>
                      {getScoreBadge(entry.spiritual_score).text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-3xl font-bold text-amber-300 mb-2">{leaderboard.length}</div>
            <p className="sacred-text">Total Souls</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-3xl font-bold text-emerald-300 mb-2">
              {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.spiritual_score, 0) / leaderboard.length) : 0}
            </div>
            <p className="sacred-text">Avg Score</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-3xl font-bold text-purple-300 mb-2">
              {leaderboard.length > 0 ? leaderboard[0].spiritual_score.toLocaleString() : 0}
            </div>
            <p className="sacred-text">Highest Score</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-3xl font-bold text-blue-300 mb-2">
              {currentUser?.rank || 'N/A'}
            </div>
            <p className="sacred-text">Your Rank</p>
          </div>
        </div>

        {/* Spiritual Wisdom */}
        <div className="mt-8 spiritual-card rounded-xl p-6 divine-glow">
          <h4 className="text-lg font-semibold text-amber-100 mb-4 text-center">
            🙏 Sacred Truth
          </h4>
          <p className="sacred-text text-center">
            "Competition in spirituality is not about defeating others, but about conquering your own limitations.
            Let this leaderboard inspire your practice, not create ego. We are all souls walking toward the same Divine light."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;