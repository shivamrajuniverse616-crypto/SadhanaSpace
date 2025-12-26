import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Shield, Users, Ban, Edit2, Save, X, LogOut, Search, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserProfile } from '../lib/types';

// Admin Credentials
const ADMIN_USERNAME = 'shivamraj616';
const ADMIN_PASSWORD = 'mnbvcxz@shivam396914';

interface AdminUser extends UserProfile {
    streak?: number;
    lastActive?: string;
}

const AdminDashboard: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Streak Modal
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [newStreak, setNewStreak] = useState<number>(0);
    const [streakLoading, setStreakLoading] = useState(false);

    // Login Handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
            // Optionally save to session storage for persistence across reloads
            sessionStorage.setItem('adminAuth', 'true');
            fetchUsers();
        } else {
            setError('Invalid credentials. Access denied.');
        }
    };

    // Check session on mount
    useEffect(() => {
        const isAuth = sessionStorage.getItem('adminAuth');
        if (isAuth === 'true') {
            setIsAuthenticated(true);
            fetchUsers();
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);

            const fetchedUsers: AdminUser[] = [];

            // Fetch streaks for each user effectively? 
            // For now, let's just get users. Streak fetching might be expensive N+1. 
            // We can fetch streaks collection largely or just fetch on demand?
            // Let's try to fetch all streaks first since it's an admin dashboard and likely not huge scale yet.

            const streaksSnapshot = await getDocs(collection(db, 'streaks'));
            const streakMap: Record<string, number> = {};
            streaksSnapshot.forEach(doc => {
                const data = doc.data();
                streakMap[data.user_id] = data.current_streak || 0;
            });

            snapshot.forEach(doc => {
                const data = doc.data() as UserProfile;
                fetchedUsers.push({
                    ...data,
                    id: doc.id,
                    streak: streakMap[doc.id] || 0,
                });
            });

            setUsers(fetchedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleBan = async (user: AdminUser) => {
        if (!confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} ${user.username || 'this user'}?`)) return;

        try {
            await updateDoc(doc(db, 'users', user.id), {
                isBanned: !user.isBanned
            });

            // Update local state
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, isBanned: !u.isBanned } : u
            ));
        } catch (err) {
            console.error("Error updating ban status:", err);
            alert("Failed to update status");
        }
    };

    const openStreakEdit = (user: AdminUser) => {
        setEditingUser(user);
        setNewStreak(user.streak || 0);
    };

    const saveStreak = async () => {
        if (!editingUser) return;
        setStreakLoading(true);
        try {
            // We need to find the streak doc for this user first
            const streaksRef = collection(db, 'streaks');
            const q = query(streaksRef, where('user_id', '==', editingUser.id));
            const snapshot = await getDocs(q);

            const now = new Date().toISOString();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - newStreak);
            const startDateStr = startDate.toISOString().split('T')[0];

            if (!snapshot.empty) {
                const streakDoc = snapshot.docs[0];
                await updateDoc(doc(db, 'streaks', streakDoc.id), {
                    current_streak: newStreak,
                    start_date: startDateStr,
                    updated_at: now
                });
            } else {
                // Create if missing? usually handled elsewhere but admin power
                console.warn("No streak doc found, skipping creation to avoid complex state issues for now.");
            }

            // Update local
            setUsers(users.map(u =>
                u.id === editingUser.id ? { ...u, streak: newStreak } : u
            ));
            setEditingUser(null);
        } catch (err) {
            console.error('Error saving streak:', err);
            alert("Failed to save streak");
        } finally {
            setStreakLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalUsers = users.length;
    const bannedUsers = users.filter(u => u.isBanned).length;
    const activeUsers = totalUsers - bannedUsers; // Rough estimate
    const totalStreakDays = users.reduce((acc, curr) => acc + (curr.streak || 0), 0);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-amber-500/10 p-4 rounded-full mb-4">
                            <Shield className="w-12 h-12 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            Maha-Mantra Admin
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">Restricted Access Area</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Divine ID</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Secret Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                placeholder="Enter password"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02]"
                        >
                            Enter Sanctum
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-amber-500" />
                        <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                        title="Total Seekers"
                        value={totalUsers}
                        color="bg-blue-900/10 border-blue-900/50"
                    />
                    <StatCard
                        icon={<Activity className="w-6 h-6 text-green-400" />}
                        title="Total Impact Days"
                        value={totalStreakDays}
                        label="Cumulative Streak"
                        color="bg-green-900/10 border-green-900/50"
                    />
                    <StatCard
                        icon={<Ban className="w-6 h-6 text-red-400" />}
                        title="Banned Users"
                        value={bannedUsers}
                        color="bg-red-900/10 border-red-900/50"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-6 h-6 text-amber-400" />}
                        title="Active Seekers"
                        value={activeUsers}
                        color="bg-amber-900/10 border-amber-900/50"
                    />
                </div>

                {/* User Management */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            User Directory
                        </h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search users by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50 text-slate-400 text-sm border-b border-slate-800">
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Joined</th>
                                    <th className="p-4 font-medium">Streak</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">Loading spiritual data...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">No seekers found matching your search.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-lg">🧘</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.username || 'Anonymous'}</div>
                                                        <div className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 font-mono text-amber-400">
                                                    <span className="text-lg">🔥</span>
                                                    {user.streak}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isBanned
                                                    ? 'bg-red-900/20 text-red-400 border border-red-900/30'
                                                    : 'bg-green-900/20 text-green-400 border border-green-900/30'
                                                    }`}>
                                                    {user.isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openStreakEdit(user)}
                                                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                        title="Edit Streak"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBan(user)}
                                                        className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${user.isBanned ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                                                            }`}
                                                        title={user.isBanned ? "Unban User" : "Ban User"}
                                                    >
                                                        {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Streak Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Adjust Streak</h3>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                    {editingUser.avatar_url ? <img src={editingUser.avatar_url} className="w-full h-full rounded-full" /> : '🧘'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{editingUser.username}</div>
                                    <div className="text-xs text-slate-400">Current: {editingUser.streak} days</div>
                                </div>
                            </div>

                            <label className="block text-slate-400 text-sm mb-2">New Streak Value</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setNewStreak(Math.max(0, newStreak - 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={newStreak}
                                    onChange={(e) => setNewStreak(parseInt(e.target.value) || 0)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-xl font-mono text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none"
                                />
                                <button
                                    onClick={() => setNewStreak(newStreak + 1)}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveStreak}
                                disabled={streakLoading}
                                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {streakLoading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, title, value, label, color }: { icon: React.ReactNode, title: string, value: number, label?: string, color: string }) => (
    <div className={`p-6 rounded-xl border ${color} backdrop-blur-sm relative overflow-hidden group`}>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                {icon}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {label && <div className="text-xs text-slate-500">{label}</div>}
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
    </div>
);

export default AdminDashboard;
