import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Shield, Check, AlertTriangle } from 'lucide-react';

const AdminFix: React.FC = () => {
    const [targetUid, setTargetUid] = useState('yRvnVGXmwZZcCaoiQwRLxgLN5Yi1');
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const applyStreak = async () => {
        if (!targetUid) return;
        setLoading(true);
        setStatus('Processing...');

        try {
            const streaksRef = collection(db, 'streaks');
            const q = query(streaksRef, where('user_id', '==', targetUid));
            const snapshot = await getDocs(q);

            const today = new Date().toISOString().split('T')[0];
            // Calculate start date as 30 days ago
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString().split('T')[0];

            if (!snapshot.empty) {
                // Update existing
                const streakDoc = snapshot.docs[0];
                await updateDoc(doc(db, 'streaks', streakDoc.id), {
                    current_streak: 30,
                    start_date: startDateStr, // Adjust start date to match the streak logically
                    last_slip_date: null,
                    updated_at: new Date().toISOString()
                });
                setStatus(`Success! Updated streak for ${targetUid} to 30.`);
            } else {
                // Create new
                await addDoc(streaksRef, {
                    user_id: targetUid,
                    current_streak: 30,
                    start_date: startDateStr,
                    last_slip_date: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                setStatus(`Success! Created new streak for ${targetUid} with 30 days.`);
            }
        } catch (error: any) {
            console.error('Admin fix error:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full">
                <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-8 h-8 text-amber-500" />
                    <h1 className="text-2xl font-bold text-white">Admin Fix Tool</h1>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Target User ID</label>
                        <input
                            type="text"
                            value={targetUid}
                            onChange={(e) => setTargetUid(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={applyStreak}
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {loading ? 'Applying...' : 'Set 30 Day Streak'}
                    </button>

                    {status && (
                        <div className={`p-4 rounded-lg mt-4 flex items-start space-x-3 ${status.includes('Success') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                            {status.includes('Success') ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                            <p className="text-sm">{status}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFix;
