import React, { useState, useEffect } from 'react';
import { TreePine, Plus, Calendar, Trash2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { NatureWalkLog as NatureWalkLogType } from '../lib/types';

const NatureWalkLog: React.FC = () => {
  const [walkEntries, setWalkEntries] = useState<NatureWalkLogType[]>([]);
  const [newDuration, setNewDuration] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const durationOptions = [15, 30, 45, 60, 90, 120];

  useEffect(() => {
    loadWalkEntries();
  }, []);

  const loadWalkEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'nature_walk_log'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NatureWalkLogType));
      setWalkEntries(data);
    } catch (error) {
      console.error('Error loading nature walk entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWalkEntry = async () => {
    if (newDuration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entry: NatureWalkLogType = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        duration: newDuration,
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'nature_walk_log'), entry);

      setNewDuration(30);
      await loadWalkEntries();
    } catch (error) {
      console.error('Error adding nature walk entry:', error);
      alert('Error saving nature walk. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Remove this nature walk entry?')) return;

    try {
      await deleteDoc(doc(db, 'nature_walk_log', id));
      await loadWalkEntries();
    } catch (error) {
      console.error('Error deleting nature walk entry:', error);
      alert('Error removing entry. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalTime = () => {
    return walkEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  const getThisWeekTime = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return walkEntries
      .filter(entry => new Date(entry.date) >= oneWeekAgo)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your nature connection...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-200 to-green-400 rounded-full flex items-center justify-center">
            <TreePine className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🌲 Vṛkṣa Sanchāra</h1>
          <p className="sacred-text text-xl">Sacred connection with Mother Nature</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-green-300 mb-2">{Math.round(getTotalTime() / 60)}h</div>
            <p className="sacred-text">Total Time</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-emerald-300 mb-2">{getThisWeekTime()}m</div>
            <p className="sacred-text">This Week</p>
          </div>
        </div>

        {/* Add New Walk */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Log Today's Nature Walk</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">Duration (minutes)</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {durationOptions.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setNewDuration(duration)}
                    className={`p-3 rounded-xl transition-all ${newDuration === duration
                      ? 'bg-green-600/50 border-2 border-green-400 text-green-200'
                      : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                      }`}
                  >
                    {duration}m
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
                placeholder="Custom duration in minutes"
                min="1"
                max="480"
              />
            </div>

            <button
              onClick={addWalkEntry}
              disabled={submitting || newDuration <= 0}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              {submitting ? 'Recording walk...' : 'Record Nature Walk'}
            </button>
          </div>
        </div>

        {/* Walk Entries */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Nature Connections</h2>

          {walkEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🌲</div>
              <p className="sacred-text text-xl mb-4">Begin connecting with Mother Nature today.</p>
              <p className="text-slate-400">Walking in nature grounds the soul and calms the mind.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {walkEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-300 mr-3" />
                      <span className="text-green-200 font-medium">{formatDate(entry.date)}</span>
                    </div>
                    <button
                      onClick={() => entry.id && deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TreePine className="w-6 h-6 text-green-400 mr-3" />
                      <div>
                        <p className="text-amber-100 font-medium">{entry.duration} minutes in nature</p>
                        <p className="sacred-text text-sm">Grounding and peace</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-300">{entry.duration}m</div>
                      <p className="sacred-text text-xs">Sacred time</p>
                    </div>
                  </div>

                  {entry.photo_url && (
                    <div className="mt-4">
                      <img
                        src={entry.photo_url}
                        alt="Nature walk moment"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nature Wisdom */}
        {walkEntries.length > 0 && (
          <div className="mt-8 spiritual-card rounded-xl p-6 divine-glow">
            <h4 className="text-lg font-semibold text-amber-100 mb-4 text-center">
              🌿 Nature's Teaching
            </h4>
            <p className="sacred-text text-center">
              "In every walk with nature, one receives far more than they seek.
              The trees teach patience, the rivers teach flow, and the earth teaches grounding."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NatureWalkLog;