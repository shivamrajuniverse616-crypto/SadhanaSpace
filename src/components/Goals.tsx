import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Goal } from '../lib/types';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Goal['category']>('personal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = {
    mental: { label: 'Mental Clarity', color: 'bg-blue-600', icon: '🧠', desc: 'Mind and consciousness' },
    physical: { label: 'Physical Temple', color: 'bg-green-600', icon: '💪', desc: 'Body and vitality' },
    spiritual: { label: 'Spiritual Growth', color: 'bg-purple-600', icon: '🙏', desc: 'Soul and transcendence' },
    personal: { label: 'Personal Mastery', color: 'bg-orange-600', icon: '🌟', desc: 'Character and wisdom' },
    professional: { label: 'Sacred Work', color: 'bg-red-600', icon: '💼', desc: 'Purpose and service' }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'goals'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));

      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const goal = {
        user_id: user.uid,
        text: newGoal.trim(),
        category: selectedCategory,
        date_set: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'goals'), goal);

      setNewGoal('');
      await loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Error adding sacred intention. Please try again.');
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to release this sacred intention?')) return;

    try {
      await deleteDoc(doc(db, 'goals', id));
      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error releasing intention. Please try again.');
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id!);
    setEditingText(goal.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;

    try {
      await updateDoc(doc(db, 'goals', editingId!), { text: editingText.trim() });

      setEditingId(null);
      setEditingText('');
      await loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error updating sacred intention. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<Goal['category'], Goal[]>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Illuminating your sacred dharma...</div>
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

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">My Sacred Dharma</h1>
          <p className="sacred-text text-xl">The sacred purposes that guide your soul's journey</p>
        </div>

        {/* Sacred Intention Creator */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">✨ Plant New Sacred Intention</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">Sacred Realm</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Goal['category'])}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              >
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label} - {cat.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-100 font-medium mb-3">Sacred Intention</label>
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="I commit to manifesting..."
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              />
            </div>

            <button
              onClick={addGoal}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <Plus className="w-6 h-6 mr-3" />
              Plant Sacred Intention
            </button>
          </div>
        </div>

        {/* Sacred Intentions by Realm */}
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryGoals = groupedGoals[categoryKey as Goal['category']] || [];
          if (categoryGoals.length === 0) return null;

          return (
            <div key={categoryKey} className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
              <h3 className="text-2xl font-bold text-amber-100 mb-6 flex items-center">
                <span className="text-3xl mr-4">{categoryInfo.icon}</span>
                <div>
                  <div>{categoryInfo.label}</div>
                  <div className="text-sm font-normal sacred-text">{categoryInfo.desc}</div>
                </div>
              </h3>

              <div className="space-y-4">
                {categoryGoals.map((goal) => (
                  <div key={goal.id} className={`p-6 rounded-xl border-l-4 ${categoryInfo.color} bg-slate-700/30`}>
                    {editingId === goal.id ? (
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 p-3 bg-slate-600/50 text-amber-100 rounded-lg border border-slate-500/50 focus:border-amber-300 focus:outline-none transition-all"
                        />
                        <button
                          onClick={saveEdit}
                          className="p-3 text-emerald-400 hover:bg-slate-600/50 rounded-lg transition-all"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-3 text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-amber-100 font-medium text-lg leading-relaxed">{goal.text}</p>
                          <p className="sacred-text text-sm mt-2">
                            Sacred intention set on {new Date(goal.date_set).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => startEditing(goal)}
                            className="p-3 text-blue-400 hover:bg-slate-600/50 rounded-lg transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id!)}
                            className="p-3 text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🌱</div>
            <p className="sacred-text text-xl mb-4">Your sacred garden awaits the first seed.</p>
            <p className="text-slate-400">Plant your first sacred intention above to begin manifesting your highest self.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;