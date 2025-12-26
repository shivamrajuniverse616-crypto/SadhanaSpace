import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Calendar, Trash2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { BlessingsLog as BlessingsLogType } from '../lib/types';

const BlessingsLog: React.FC = () => {
  const [blessings, setBlessings] = useState<BlessingsLogType[]>([]);
  const [newBlessing, setNewBlessing] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const blessingPrompts = [
    "What unexpected kindness did you receive today?",
    "How did the Divine show up in your life?",
    "What synchronicity or miracle occurred?",
    "Which person reflected God's grace to you?",
    "What challenge turned into a blessing?",
    "How did Krishna protect or guide you?",
    "What abundance flowed into your life?",
    "Which prayer was answered in an unexpected way?"
  ];

  const [currentPrompt] = useState(() =>
    blessingPrompts[new Date().getDate() % blessingPrompts.length]
  );

  useEffect(() => {
    loadBlessings();
  }, []);

  const loadBlessings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'blessings_log'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlessingsLogType));
      setBlessings(data);
    } catch (error) {
      console.error('Error loading blessings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBlessing = async () => {
    if (!newBlessing.trim()) return;

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const blessing: BlessingsLogType = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        blessing_description: newBlessing.trim(),
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'blessings_log'), blessing);

      setNewBlessing('');
      await loadBlessings();
    } catch (error) {
      console.error('Error adding blessing:', error);
      alert('Error saving blessing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlessing = async (id: string) => {
    if (!confirm('Remove this blessing from your log?')) return;

    try {
      await deleteDoc(doc(db, 'blessings_log', id));
      await loadBlessings();
    } catch (error) {
      console.error('Error deleting blessing:', error);
      alert('Error removing blessing. Please try again.');
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

  const getThisWeekBlessings = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return blessings.filter(blessing => new Date(blessing.date) >= oneWeekAgo).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your divine blessings...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">✨ Kṛpā Patra</h1>
          <p className="sacred-text text-xl">Divine blessings and grace received</p>
        </div>

        {/* Today's Blessing Prompt */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">Today's Divine Reflection</h3>
          <p className="text-lg text-amber-100 italic leading-relaxed">
            "{currentPrompt}"
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-yellow-300 mb-2">{blessings.length}</div>
            <p className="sacred-text">Total Blessings</p>
          </div>

          <div className="spiritual-card rounded-xl p-6 text-center divine-glow">
            <div className="text-4xl font-bold text-amber-300 mb-2">{getThisWeekBlessings()}</div>
            <p className="sacred-text">This Week</p>
          </div>
        </div>

        {/* Add New Blessing */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Record Divine Grace</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">What blessing did you receive today?</label>
              <textarea
                value={newBlessing}
                onChange={(e) => setNewBlessing(e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={4}
                placeholder="Krishna blessed me with..."
              />
            </div>

            <button
              onClick={addBlessing}
              disabled={submitting || !newBlessing.trim()}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-6 h-6 mr-3" />
              {submitting ? 'Recording blessing...' : 'Record Divine Blessing'}
            </button>
          </div>
        </div>

        {/* Blessings List */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Blessings Archive</h2>

          {blessings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">✨</div>
              <p className="sacred-text text-xl mb-4">Begin recognizing divine grace in your life.</p>
              <p className="text-slate-400">Every moment contains hidden blessings waiting to be acknowledged.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {blessings.map((blessing) => (
                <div key={blessing.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-yellow-300 mr-3" />
                      <span className="text-yellow-200 font-medium">{formatDate(blessing.date)}</span>
                    </div>
                    <button
                      onClick={() => blessing.id && deleteBlessing(blessing.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start">
                    <Sparkles className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="sacred-text text-lg leading-relaxed">{blessing.blessing_description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divine Wisdom */}
        {blessings.length > 0 && (
          <div className="mt-8 spiritual-card rounded-xl p-6 divine-glow">
            <h4 className="text-lg font-semibold text-amber-100 mb-4 text-center">
              🙏 Divine Truth
            </h4>
            <p className="sacred-text text-center">
              "When we recognize the Divine hand in every blessing,
              our hearts overflow with gratitude and our faith deepens.
              Krishna's grace is always flowing—we need only open our eyes to see it."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlessingsLog;