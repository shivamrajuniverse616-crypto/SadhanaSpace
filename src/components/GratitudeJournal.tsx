import React, { useState, useEffect } from 'react';
import { Heart, Plus, Calendar, Trash2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { GratitudeEntry } from '../lib/types';

const GratitudeJournal: React.FC = () => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const gratitudePrompts = [
    "What blessing from Krishna am I most grateful for today?",
    "How did the Divine show love to me today?",
    "What simple pleasure brought joy to my soul?",
    "Which person in my life reflects God's grace?",
    "What challenge helped me grow spiritually?",
    "How did my body serve me faithfully today?",
    "What moment of peace did I experience?",
    "What food nourished my temple (body) today?"
  ];

  const [currentPrompt] = useState(() =>
    gratitudePrompts[new Date().getDate() % gratitudePrompts.length]
  );

  useEffect(() => {
    loadGratitudeEntries();
  }, []);

  const loadGratitudeEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'gratitude_entries'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GratitudeEntry));

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading gratitude entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGratitudeEntry = async () => {
    if (!newGratitude.trim()) return;

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entry: GratitudeEntry = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        gratitude_text: newGratitude.trim(),
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'gratitude_entries'), entry);

      setNewGratitude('');
      await loadGratitudeEntries();
    } catch (error) {
      console.error('Error adding gratitude entry:', error);
      alert('Error saving gratitude. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blessing from your journal?')) return;

    try {
      await deleteDoc(doc(db, 'gratitude_entries', id));
      await loadGratitudeEntries();
    } catch (error) {
      console.error('Error deleting gratitude entry:', error);
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
        <div className="text-center text-amber-100">Loading your blessings...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-rose-200 to-rose-400 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🙏 Gratitude Journal</h1>
          <p className="sacred-text text-xl">Count your blessings and feel Krishna's love</p>
        </div>

        {/* Today's Gratitude Prompt */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">Today's Sacred Reflection</h3>
          <p className="text-lg text-amber-100 italic leading-relaxed">
            "{currentPrompt}"
          </p>
        </div>

        {/* Add New Gratitude */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">✨ Express Your Gratitude</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">What are you grateful for today?</label>
              <textarea
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={4}
                placeholder="I am grateful for Krishna's love because..."
              />
            </div>

            <button
              onClick={addGratitudeEntry}
              disabled={submitting || !newGratitude.trim()}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              {submitting ? 'Offering gratitude...' : 'Add Sacred Blessing'}
            </button>
          </div>
        </div>

        {/* Gratitude Entries */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">📜 Your Blessings Archive</h2>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🙏</div>
              <p className="sacred-text text-xl mb-4">Your gratitude garden awaits the first blessing.</p>
              <p className="text-slate-400">Start by acknowledging one thing Krishna has given you today.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-rose-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-rose-300 mr-3" />
                      <span className="text-rose-200 font-medium">{formatDate(entry.date)}</span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id!)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="sacred-text text-lg leading-relaxed">{entry.gratitude_text}</p>
                  </div>

                  {entry.photo_url && (
                    <div className="mt-4">
                      <img
                        src={entry.photo_url}
                        alt="Gratitude moment"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gratitude Statistics */}
        {entries.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
              <div className="text-4xl font-bold text-rose-300 mb-2">{entries.length}</div>
              <p className="sacred-text">Total Blessings</p>
            </div>

            <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
              <div className="text-4xl font-bold text-emerald-300 mb-2">
                {entries.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="sacred-text">Today's Gratitude</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GratitudeJournal;