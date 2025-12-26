import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Calendar, PenTool, Trash2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { JournalEntry } from '../lib/types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [formData, setFormData] = useState({
    reason: '',
    feeling: '',
    plan: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'journal_entries'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));

      setEntries(data);
    } catch (error: any) {
      console.error('Error loading journal entries:', error);
      if (error.message?.includes('index')) {
        setError(`Missing Index: Check console or use link: ${error.message}`);
      } else {
        setError('Failed to load past reflections.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    if (!formData.reason.trim() || !formData.feeling.trim() || !formData.plan.trim()) {
      setError('Please fill in all fields with honesty and compassion');
      return;
    }

    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const newEntry = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        reason: formData.reason.trim(),
        feeling: formData.feeling.trim(),
        plan: formData.plan.trim(),
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'journal_entries'), newEntry);

      setFormData({
        reason: '',
        feeling: '',
        plan: ''
      });

      await loadEntries();
      setSuccessMsg('Your reflection has been recorded. This act of honesty strengthens your soul.');

      // Clear success message after 5s
      setTimeout(() => setSuccessMsg(''), 5000);

    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      setError('Error saving reflection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this reflection? This cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'journal_entries', entryId));
      await loadEntries();
      setSuccessMsg('Reflection deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete reflection.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-8 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold sacred-heading mb-2">Mirror of the Soul</h1>
        <p className="sacred-text text-amber-200/80">Reflect with honesty, heal with compassion</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-4 rounded-xl mb-6 animate-fade-in">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
          {error.includes('https://console.firebase.google.com') && (
            <div className="mt-2 pl-11">
              <a
                href={error.match(/https:\/\/[^\s]+/)?.[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Missing Index
              </a>
            </div>
          )}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm p-4 rounded-xl flex items-center space-x-3 mb-6 animate-fade-in text-emerald-200">
          <span>✨</span>
          <p>{successMsg}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="spiritual-card p-8 rounded-2xl divine-glow relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <PenTool className="w-24 h-24 text-amber-500" />
          </div>

          <h2 className="text-xl font-semibold mb-6 text-amber-100 flex items-center relative z-10">
            <BookOpen className="w-5 h-5 mr-3 text-amber-500" />
            New Reflection
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-medium">What triggered the urge/action?</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full bg-slate-900/50 text-amber-100 rounded-xl p-4 border border-slate-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 h-24 resize-none transition-all placeholder:text-slate-600"
                placeholder="Be honest about the situation..."
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2 text-sm font-medium">How did you feel before and after?</label>
              <textarea
                value={formData.feeling}
                onChange={(e) => handleInputChange('feeling', e.target.value)}
                className="w-full bg-slate-900/50 text-amber-100 rounded-xl p-4 border border-slate-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 h-24 resize-none transition-all placeholder:text-slate-600"
                placeholder="Describe your emotional state..."
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-2 text-sm font-medium">What will you do differently next time?</label>
              <textarea
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                className="w-full bg-slate-900/50 text-amber-100 rounded-xl p-4 border border-slate-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 h-24 resize-none transition-all placeholder:text-slate-600"
                placeholder="Your plan for strength..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sacred-button bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Reflection
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-2 px-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-amber-100">Past Reflections</h2>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {entries.length === 0 ? (
              <div className="spiritual-card p-8 rounded-2xl text-center">
                <p className="text-slate-500">Your journal is waiting for your first truth.</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="spiritual-card p-6 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                    <span className="text-amber-500 font-medium font-mono text-sm bg-amber-500/10 px-3 py-1 rounded-full">
                      {formatDate(entry.date)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id!)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                      title="Delete Reflection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-1">Trigger</h4>
                      <p className="text-slate-300 leading-relaxed">{entry.reason}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-1">Feelings</h4>
                      <p className="text-slate-300 leading-relaxed italic">"{entry.feeling}"</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">The Plan</h4>
                      <p className="text-emerald-100/90 leading-relaxed font-medium bg-emerald-900/10 p-3 rounded-lg border border-emerald-500/10">
                        {entry.plan}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;