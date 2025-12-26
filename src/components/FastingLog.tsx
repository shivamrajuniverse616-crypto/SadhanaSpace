import React, { useState, useEffect } from 'react';
import { Sunrise, Plus, Calendar, Trash2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { FastingLog as FastingLogType } from '../lib/types';

const FastingLog: React.FC = () => {
  const [fastingEntries, setFastingEntries] = useState<FastingLogType[]>([]);
  const [newPurpose, setNewPurpose] = useState('');
  const [newReflection, setNewReflection] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fastingPurposes = [
    'Ekadashi Vrat',
    'Spiritual Purification',
    'Mental Clarity',
    'Devotional Practice',
    'Health & Detox',
    'Penance & Atonement',
    'Festival Observance',
    'Personal Discipline'
  ];

  useEffect(() => {
    loadFastingEntries();
  }, []);

  const loadFastingEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'fasting_log'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FastingLogType));
      setFastingEntries(data);
    } catch (error) {
      console.error('Error loading fasting entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFastingEntry = async () => {
    if (!newPurpose.trim() || !newReflection.trim()) {
      alert('Please fill in both purpose and reflection');
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entry: FastingLogType = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        purpose: newPurpose.trim(),
        reflection: newReflection.trim(),
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'fasting_log'), entry);

      setNewPurpose('');
      setNewReflection('');
      await loadFastingEntries();
    } catch (error) {
      console.error('Error adding fasting entry:', error);
      alert('Error saving tapasya entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Remove this tapasya entry?')) return;

    try {
      await deleteDoc(doc(db, 'fasting_log', id));
      await loadFastingEntries();
    } catch (error) {
      console.error('Error deleting fasting entry:', error);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your tapasya journey...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full flex items-center justify-center">
            <Sunrise className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🌅 Tapasya Journal</h1>
          <p className="sacred-text text-xl">Sacred fasting and spiritual austerity tracker</p>
        </div>

        {/* Add New Fasting Entry */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Record Today's Tapasya</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">Purpose of Fasting</label>
              <select
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              >
                <option value="">Select fasting purpose...</option>
                {fastingPurposes.map((purpose) => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-100 font-medium mb-3">Spiritual Reflection</label>
              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={4}
                placeholder="How did this tapasya purify your consciousness? What insights arose?"
              />
            </div>

            <button
              onClick={addFastingEntry}
              disabled={submitting || !newPurpose || !newReflection.trim()}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              {submitting ? 'Recording tapasya...' : 'Record Sacred Fast'}
            </button>
          </div>
        </div>

        {/* Fasting Statistics */}
        {fastingEntries.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
              <div className="text-4xl font-bold text-orange-300 mb-2">{fastingEntries.length}</div>
              <p className="sacred-text">Total Fasts</p>
            </div>

            <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
              <div className="text-4xl font-bold text-amber-300 mb-2">
                {fastingEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="sacred-text">Today's Tapasya</p>
            </div>
          </div>
        )}

        {/* Fasting Entries */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Tapasya History</h2>

          {fastingEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🌅</div>
              <p className="sacred-text text-xl mb-4">Begin your tapasya journey today.</p>
              <p className="text-slate-400">Fasting purifies the body, mind, and soul.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {fastingEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-orange-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-orange-300 mr-3" />
                      <span className="text-orange-200 font-medium">{formatDate(entry.date)}</span>
                    </div>
                    <button
                      onClick={() => entry.id && deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-amber-100 mb-2 flex items-center">
                        <span className="mr-2">🎯</span> Purpose:
                      </h4>
                      <p className="sacred-text">{entry.purpose}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-amber-100 mb-2 flex items-center">
                        <span className="mr-2">🧘</span> Reflection:
                      </h4>
                      <p className="sacred-text">{entry.reflection}</p>
                    </div>
                  </div>

                  {entry.photo_url && (
                    <div className="mt-4">
                      <img
                        src={entry.photo_url}
                        alt="Tapasya moment"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FastingLog;