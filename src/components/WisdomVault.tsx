import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ExternalLink, Trash2, Filter } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { WisdomVault as WisdomVaultType } from '../lib/types';

const WisdomVault: React.FC = () => {
  const [wisdom, setWisdom] = useState<WisdomVaultType[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Bhakti');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = [
    'Bhakti',
    'Vairagya',
    'Lust Control',
    'Meditation',
    'Scripture Study',
    'Satsang',
    'Karma Yoga',
    'Jnana',
    'Pranayama',
    'General Wisdom'
  ];

  useEffect(() => {
    loadWisdom();
  }, []);

  const loadWisdom = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'wisdom_vault'),
        where('user_id', '==', user.uid),
        orderBy('date_added', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WisdomVaultType));

      setWisdom(data);
    } catch (error) {
      console.error('Error loading wisdom vault:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWisdom = async () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Please provide both title and URL');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const wisdomEntry: Omit<WisdomVaultType, 'id'> = {
        user_id: user.uid,
        title: newTitle.trim(),
        category: selectedCategory,
        url: newUrl.trim(),
        date_added: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'wisdom_vault'), wisdomEntry);

      setNewTitle('');
      setNewUrl('');
      await loadWisdom();
    } catch (error) {
      console.error('Error adding wisdom:', error);
      alert('Error saving wisdom. Please try again.');
    }
  };

  const deleteWisdom = async (id: string) => {
    if (!confirm('Remove this wisdom from your vault?')) return;

    try {
      await deleteDoc(doc(db, 'wisdom_vault', id));
      await loadWisdom();
    } catch (error) {
      console.error('Error deleting wisdom:', error);
      alert('Error removing wisdom. Please try again.');
    }
  };

  const filteredWisdom = filterCategory === 'All'
    ? wisdom
    : wisdom.filter(w => w.category === filterCategory);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Bhakti': '💖',
      'Vairagya': '🧘',
      'Lust Control': '🛡️',
      'Meditation': '🕉️',
      'Scripture Study': '📖',
      'Satsang': '👥',
      'Karma Yoga': '🙏',
      'Jnana': '🧠',
      'Pranayama': '🌬️',
      'General Wisdom': '✨'
    };
    return icons[category] || '📚';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your wisdom vault...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-200 to-purple-400 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">📚 Wisdom Vault</h1>
          <p className="sacred-text text-xl">Your sacred library of spiritual teachings</p>
        </div>

        {/* Add New Wisdom */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Add Sacred Wisdom</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-100 font-medium mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-100 font-medium mb-3">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Premanand Maharaj - Lust Control Discourse"
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-amber-100 font-medium mb-3">URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              />
            </div>

            <button
              onClick={addWisdom}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add to Wisdom Vault
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="spiritual-card rounded-xl p-6 mb-8 divine-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-amber-200 mr-3" />
              <span className="text-amber-100 font-medium">Filter by Category:</span>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-3 bg-slate-800/50 text-amber-100 rounded-lg border border-slate-600/50 focus:border-amber-300 focus:outline-none transition-all"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wisdom Collection */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">
            Sacred Collection ({filteredWisdom.length})
          </h3>

          {filteredWisdom.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📚</div>
              <p className="sacred-text text-xl mb-4">
                {filterCategory === 'All'
                  ? 'Your wisdom vault awaits sacred teachings.'
                  : `No wisdom found in ${filterCategory} category.`
                }
              </p>
              <p className="text-slate-400">
                Add spiritual videos, audios, and articles to build your personal satsang library.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWisdom.map((item) => (
                <div key={item.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-purple-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{getCategoryIcon(item.category)}</span>
                        <span className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="text-amber-100 font-semibold text-lg mb-3">{item.title}</h4>

                      <div className="flex items-center justify-between">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600/80 hover:bg-blue-700/80 text-amber-100 font-medium py-2 px-4 rounded-lg transition-all flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Sacred Teaching
                        </a>

                        <span className="sacred-text text-sm">
                          Added {new Date(item.date_added).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteWisdom(item.id!)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-600/50 transition-all ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Suggestions */}
        {wisdom.length > 0 && (
          <div className="mt-8 spiritual-card rounded-xl p-6 divine-glow">
            <h4 className="text-lg font-semibold text-amber-100 mb-4 text-center">
              💡 Spiritual Practice Tip
            </h4>
            <p className="sacred-text text-center">
              After a slip or during urges, revisit wisdom from the "Lust Control" category.
              Regular satsang strengthens your spiritual resolve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WisdomVault;