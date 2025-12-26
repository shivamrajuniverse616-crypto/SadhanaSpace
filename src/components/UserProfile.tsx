import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { User, Calendar, Activity, Zap, Award, Target, Book, Heart, TrendingUp, Sparkles, MapPin, Clock, Edit2 } from 'lucide-react';
import { UserProfile as UserProfileType } from '../lib/types';
import LotusProgression from './LotusProgression';

const AVATAR_PRESETS = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Mila"
];

const BADGES = [
    { id: 'new_beginnings', name: 'New Beginnings', icon: '🌱', description: 'Begin your spiritual journey', condition: (stats: any) => true },
    { id: 'mantra_adept', name: 'Mantra Adept', icon: '📿', description: 'Complete 108 Japa repetitions', condition: (stats: any) => stats.totalJapa >= 108 },
    { id: 'silence_seeker', name: 'Silence Seeker', icon: '🧘', description: 'Meditate for 60+ minutes', condition: (stats: any) => stats.totalMeditation >= 60 },
    { id: 'self_reflector', name: 'Self Reflector', icon: '📓', description: 'Write 5+ journal entries', condition: (stats: any) => stats.totalJournal >= 5 },
    { id: 'unbreakable', name: 'Unbreakable', icon: '🔥', description: 'Achieve a 7-day streak', condition: (stats: any) => stats.streak >= 7 },
    { id: 'devoted_soul', name: 'Devoted Soul', icon: '✨', description: 'Reach 1000 Spiritual Score', condition: (stats: any) => (stats.totalJapa * 1 + stats.totalMeditation * 5 + stats.totalJournal * 50 + stats.streak * 100 + stats.totalDays * 25) >= 1000 },
];

const UserProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [stats, setStats] = useState({
        totalJapa: 0,
        totalMeditation: 0,
        totalJournal: 0,
        streak: 0,
        totalDays: 0,
        rank: 0
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await loadProfileData(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadProfileData = async (userId: string) => {
        try {
            // 1. Load User Profile Doc (for score, username, etc.)
            const userDocSnap = await getDoc(doc(db, 'users', userId));
            let dbAvatar = null;
            let dbUsername = null;

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                dbAvatar = data.avatar_url;
                dbUsername = data.username;
            }

            const user = auth.currentUser;
            const username = dbUsername || user?.displayName || user?.email?.split('@')[0] || 'Seeker';
            // Prefer DB avatar, then Auth avatar
            const avatarUrl = dbAvatar || user?.photoURL || null;
            const creationTime = user?.metadata.creationTime;

            // 2. Fetch Stats
            // Japa
            const japaSnap = await getDocs(query(collection(db, 'japa_counter'), where('user_id', '==', userId)));
            const totalJapa = japaSnap.docs.reduce((sum, doc) => sum + (doc.data().japa_count || 0), 0);

            // Meditation
            const medSnap = await getDocs(query(collection(db, 'meditation_sessions'), where('user_id', '==', userId)));
            const totalMeditation = medSnap.docs.reduce((sum, doc) => sum + (doc.data().session_length || 0), 0);

            // Journal
            const journalSnap = await getDocs(query(collection(db, 'journal_entries'), where('user_id', '==', userId)));
            const totalJournal = journalSnap.size;

            // Streak
            const streakSnap = await getDocs(query(collection(db, 'streaks'), where('user_id', '==', userId)));
            let streak = 0;
            if (!streakSnap.empty) {
                streak = streakSnap.docs[0].data().current_streak || 0;
            }

            // Total Days
            let totalDays = 0;
            if (creationTime) {
                const created = new Date(creationTime);
                const now = new Date();
                const diff = Math.abs(now.getTime() - created.getTime());
                totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
            }

            // 3. Calculate Score
            const spiritualScore =
                totalJapa * 1 +
                totalMeditation * 5 +
                totalJournal * 50 +
                streak * 100 +
                totalDays * 25;

            // 4. Estimate Rank (Simplified: Count users with higher score)
            // Note: This is an estimation. Real rank comes from Leaderboard logic.
            const higherScoresQuery = query(collection(db, 'users'), where('spiritual_score', '>', spiritualScore));
            const higherScoresSnap = await getDocs(higherScoresQuery);
            const rank = higherScoresSnap.size + 1;

            setStats({
                totalJapa,
                totalMeditation,
                totalJournal,
                streak,
                totalDays,
                rank
            });

            setProfile({
                id: userId,
                username,
                avatar_url: avatarUrl,
                spiritual_score: spiritualScore,
                last_score_update: new Date().toISOString(),
                created_at: creationTime || new Date().toISOString()
            });

        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async (newUrl: string) => {
        if (!profile) return;
        try {
            await updateDoc(doc(db, 'users', profile.id), {
                avatar_url: newUrl
            });
            setProfile({ ...profile, avatar_url: newUrl });
            setIsEditingAvatar(false);
        } catch (error) {
            console.error("Error updating avatar:", error);
        }
    };

    const getLevelInfo = (score: number) => {
        if (score >= 15000) return { title: "Thousand-Petaled Lotus", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" };
        if (score >= 7500) return { title: "Golden Lotus", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
        if (score >= 3500) return { title: "Sacred Lotus", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" };
        if (score >= 1500) return { title: "Opening Petals", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/30" };
        if (score >= 500) return { title: "Sprouting Bud", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" };
        return { title: "Seed of Devotion", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!profile) return null;

    const level = getLevelInfo(profile.spiritual_score);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
            {/* Header / Cover */}
            <div className="h-48 bg-gradient-to-r from-amber-700/30 to-purple-900/40 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {/* Profile Card */}
                <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl relative">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-400" />
                                )}

                                <button
                                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                >
                                    <Edit2 className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-slate-900 rounded-full p-1.5 border border-amber-500/50">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>

                            {/* Avatar Picker Popup */}
                            {isEditingAvatar && (
                                <div className="absolute top-36 left-0 bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl z-50 w-64 animate-fade-in">
                                    <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Choose Avatar</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {AVATAR_PRESETS.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAvatarUpdate(url)}
                                                className={`rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${profile.avatar_url === url
                                                    ? 'border-amber-500 ring-2 ring-amber-500/30'
                                                    : 'border-transparent hover:border-slate-500'}`}
                                            >
                                                <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsEditingAvatar(false)}
                                        className="w-full mt-3 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">{profile.username}</h1>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${level.bg} ${level.color} border ${level.border} mb-4`}>
                                {level.title}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                                    Digital Temple
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                                    Joined {new Date(profile.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stat for Header */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg text-center min-w-[120px]">
                            <div className="text-xs font-medium opacity-90 uppercase tracking-wider mb-1">Rank</div>
                            <div className="text-3xl font-bold">#{stats.rank}</div>
                            <div className="text-xs opacity-75 mt-1">Global</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center hover:bg-slate-800/70 transition-colors group">
                                <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-white mb-1">{profile.spiritual_score.toLocaleString()}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Score</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center hover:bg-slate-800/70 transition-colors group">
                                <Activity className="w-6 h-6 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-white mb-1">{stats.streak}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Streak</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center hover:bg-slate-800/70 transition-colors group">
                                <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-white mb-1">{stats.totalDays}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Days</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center hover:bg-slate-800/70 transition-colors group">
                                <Award className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold text-white mb-1">{(stats.totalJapa / 108).toFixed(0)}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wide">Malas</div>
                            </div>
                        </div>

                        {/* Lotus Progression (Reused) */}
                        <LotusProgression streak={stats.streak} />

                        {/* Detailed Activity Breakdown */}
                        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
                                Activity Breakdown
                            </h3>
                            <div className="space-y-6">
                                {/* Japa */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center text-slate-200">
                                            <Target className="w-4 h-4 mr-2 text-rose-400" />
                                            <span>Mantra Japa</span>
                                        </div>
                                        <span className="text-white font-mono">{stats.totalJapa.toLocaleString()} <span className="text-slate-500 text-xs">Names</span></span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                                        <div className="bg-rose-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                                {/* Meditation */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center text-slate-200">
                                            <Heart className="w-4 h-4 mr-2 text-cyan-400" />
                                            <span>Meditation</span>
                                        </div>
                                        <span className="text-white font-mono">{stats.totalMeditation} <span className="text-slate-500 text-xs">Minutes</span></span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                {/* Journaling */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center text-slate-200">
                                            <Book className="w-4 h-4 mr-2 text-purple-400" />
                                            <span>Journaling</span>
                                        </div>
                                        <span className="text-white font-mono">{stats.totalJournal} <span className="text-slate-500 text-xs">Entries</span></span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Badges / Extra */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {BADGES.map((badge) => {
                                    const isUnlocked = badge.condition(stats);
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all group relative cursor-help
                                                ${isUnlocked
                                                    ? 'bg-slate-700/50 border-amber-500/30 text-white'
                                                    : 'bg-slate-800/50 border-white/5 opacity-50 grayscale'
                                                }`}
                                            title={badge.description}
                                        >
                                            <span className="text-2xl mb-1">{badge.icon}</span>
                                            <span className="text-[9px] text-center px-1 leading-tight opacity-80">{badge.name}</span>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border border-white/10">
                                                {badge.description}
                                                {!isUnlocked && <span className="block text-[10px] text-red-300 mt-1">Locked</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center">Complete specific tasks to unlock badges.</p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-2xl p-6 border border-indigo-500/20">
                            <h3 className="text-lg font-bold text-indigo-100 mb-2">Quote of the Moment</h3>
                            <p className="text-indigo-200/70 italic text-sm">"The spiritual journey is the unlearning of fear and the acceptance of love."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
