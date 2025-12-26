import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Sparkles, Heart, Calendar, Lightbulb } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

interface SadhnaEntry {
  id?: string;
  user_id?: string;
  date: string;
  gratitude_text?: string;
  reflection_text?: string;
  daily_intention?: string;
  mood: string;
  spiritual_insight?: string;
  created_at?: string;
}

interface AIAffirmation {
  text: string;
  category: 'strength' | 'peace' | 'devotion' | 'wisdom';
}

const PersonalSadhnaJournal: React.FC = () => {
  const [entries, setEntries] = useState<SadhnaEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<SadhnaEntry>({
    date: new Date().toISOString().split('T')[0],
    gratitude_text: '',
    reflection_text: '',
    daily_intention: '',
    mood: '',
    spiritual_insight: ''
  });
  const [aiAffirmations, setAiAffirmations] = useState<AIAffirmation[]>([]);
  const [selectedAffirmation, setSelectedAffirmation] = useState<AIAffirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const moods = [
    { name: 'Peaceful', icon: '😌', color: 'bg-blue-500' },
    { name: 'Grateful', icon: '🙏', color: 'bg-emerald-500' },
    { name: 'Joyful', icon: '😊', color: 'bg-yellow-500' },
    { name: 'Contemplative', icon: '🤔', color: 'bg-purple-500' },
    { name: 'Devoted', icon: '💖', color: 'bg-rose-500' },
    { name: 'Centered', icon: '🎯', color: 'bg-indigo-500' }
  ];

  const reflectionPrompts = [
    "How did Krishna show His grace in my life today?",
    "What spiritual lesson did I learn from today's challenges?",
    "How did I serve others with love and compassion?",
    "What moment brought me closest to the Divine today?",
    "How did my spiritual practice transform my consciousness?",
    "What am I ready to surrender to Krishna?",
    "How did I honor my body as a sacred temple today?",
    "What wisdom from the scriptures guided my actions?"
  ];

  const generateAIAffirmations = (mood: string) => {
    const affirmationTemplates: Record<string, AIAffirmation[]> = {
      'Peaceful': [
        { text: "I am a vessel of divine peace, radiating Krishna's tranquility to all beings", category: 'peace' },
        { text: "In stillness, I find my true nature as an eternal soul", category: 'wisdom' },
        { text: "My peaceful heart reflects the infinite calm of the Divine", category: 'devotion' }
      ],
      'Grateful': [
        { text: "Every breath is a gift from Krishna, and I receive it with gratitude", category: 'devotion' },
        { text: "I am blessed beyond measure by the Divine's endless grace", category: 'peace' },
        { text: "Gratitude transforms my heart into a temple of joy", category: 'wisdom' }
      ],
      'Joyful': [
        { text: "My joy is a reflection of Krishna's eternal bliss within me", category: 'devotion' },
        { text: "I radiate divine happiness that uplifts all souls around me", category: 'strength' },
        { text: "In joy, I remember my true nature as sat-chit-ananda", category: 'wisdom' }
      ],
      'Contemplative': [
        { text: "Through deep reflection, I discover the Divine wisdom within", category: 'wisdom' },
        { text: "My contemplation leads me closer to Krishna's eternal truth", category: 'devotion' },
        { text: "In silence, I hear the voice of my highest self", category: 'peace' }
      ],
      'Devoted': [
        { text: "My devotion to Krishna is the fire that purifies my soul", category: 'devotion' },
        { text: "Every action I perform is an offering to the Divine", category: 'strength' },
        { text: "Love for Krishna flows through me like a sacred river", category: 'peace' }
      ],
      'Centered': [
        { text: "I am anchored in divine consciousness, unshaken by worldly storms", category: 'strength' },
        { text: "My center is Krishna, my foundation is eternal truth", category: 'wisdom' },
        { text: "From my spiritual center, I serve the world with love", category: 'devotion' }
      ]
    };

    const defaultAffirmations: AIAffirmation[] = [
      { text: "I am a divine soul on a sacred journey of self-realization", category: 'wisdom' },
      { text: "Krishna's love flows through me, transforming every moment", category: 'devotion' },
      { text: "I choose spiritual growth over material pleasure", category: 'strength' }
    ];

    return affirmationTemplates[mood] || defaultAffirmations;
  };

  useEffect(() => {
    loadJournalEntries();
  }, []);

  useEffect(() => {
    if (todayEntry.mood) {
      const affirmations = generateAIAffirmations(todayEntry.mood);
      setAiAffirmations(affirmations);
      setSelectedAffirmation(affirmations[0]);
    }
  }, [todayEntry.mood]);

  const loadJournalEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'journal_entries'),
        where('user_id', '==', user.uid),
        where('reason', '==', 'Sadhna Journal') // Filtering specifically for this component if needed, or just all journal entries
      );

      const querySnapshot = await getDocs(q);
      const fetchedEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SadhnaEntry));

      setEntries(fetchedEntries);

      // Check for today's entry
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = fetchedEntries.find(e => e.date === today);

      if (todayEntry) {
        setTodayEntry(todayEntry);
      } else {
        setTodayEntry({
          date: today,
          mood: 'neutral'
        });
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!todayEntry.gratitude_text?.trim() && !todayEntry.reflection_text?.trim()) {
      alert('Please write at least gratitude or reflection');
      return;
    }
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entryData = {
        ...todayEntry,
        user_id: user.uid,
        updated_at: new Date().toISOString()
      };

      if (todayEntry.id) {
        // Update existing
        await updateDoc(doc(db, 'journal_entries', todayEntry.id), entryData);
      } else {
        // Create new
        const docRef = await addDoc(collection(db, 'journal_entries'), {
          ...entryData,
          reason: 'Sadhna Journal',
          created_at: new Date().toISOString()
        });
        setTodayEntry({ ...entryData, id: docRef.id });
      }

      // Also save to gratitude_entries if gratitude text is present (for backward compatibility or other views)
      if (todayEntry.gratitude_text?.trim()) {
        await addDoc(collection(db, 'gratitude_entries'), {
          user_id: user.uid,
          date: todayEntry.date,
          gratitude_text: todayEntry.gratitude_text.trim(),
          created_at: new Date().toISOString()
        });
      }

      alert('🙏 Your sacred sadhna entry has been saved with divine blessings!');
      await loadJournalEntries();
    } catch (error) {
      console.error('Error saving sadhna entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTodayEntry = (field: keyof SadhnaEntry, value: string) => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentPrompt = () => {
    const today = new Date().getDate();
    return reflectionPrompts[today % reflectionPrompts.length];
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <div className="text-amber-100 text-xl">Loading your sacred journal...</div>
        </div>
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
            <BookOpen className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">📖 Personal Sādhanā Journal</h1>
          <p className="sacred-text text-xl">Your daily spiritual practice and reflection space</p>
        </div>

        {/* Today's Reflection Prompt */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">Today's Sacred Inquiry</h3>
          <p className="text-lg text-amber-100 italic leading-relaxed">
            "{getCurrentPrompt()}"
          </p>
        </div>

        {/* Today's Entry Form */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Today's Sacred Practice</h3>

          <div className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="block text-amber-100 font-medium mb-3">How is your soul feeling today?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => updateTodayEntry('mood', mood.name)}
                    className={`p-3 rounded-xl transition-all ${todayEntry.mood === mood.name
                      ? `${mood.color} text-white border-2 border-white/50`
                      : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                      }`}
                  >
                    <div className="text-2xl mb-1">{mood.icon}</div>
                    <div className="text-sm font-medium">{mood.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <label className="block text-amber-100 font-medium mb-3">🙏 What are you grateful for today?</label>
              <textarea
                value={todayEntry.gratitude_text || ''}
                onChange={(e) => updateTodayEntry('gratitude_text', e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={3}
                placeholder="I am grateful for Krishna's love because..."
              />
            </div>

            {/* Daily Reflection */}
            <div>
              <label className="block text-amber-100 font-medium mb-3">🌟 Daily Spiritual Reflection</label>
              <textarea
                value={todayEntry.reflection_text || ''}
                onChange={(e) => updateTodayEntry('reflection_text', e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={4}
                placeholder="Today I learned about myself..."
              />
            </div>

            {/* Daily Intention */}
            <div>
              <label className="block text-amber-100 font-medium mb-3">🎯 Tomorrow's Sacred Intention</label>
              <input
                type="text"
                value={todayEntry.daily_intention || ''}
                onChange={(e) => updateTodayEntry('daily_intention', e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
                placeholder="Tomorrow I will focus on..."
              />
            </div>

            {/* Spiritual Insight */}
            <div>
              <label className="block text-amber-100 font-medium mb-3">💡 Spiritual Insight or Realization</label>
              <textarea
                value={todayEntry.spiritual_insight || ''}
                onChange={(e) => updateTodayEntry('spiritual_insight', e.target.value)}
                className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                rows={3}
                placeholder="A divine insight that came to me today..."
              />
            </div>

            <button
              onClick={saveEntry}
              disabled={submitting}
              className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Save className="w-6 h-6 mr-3" />
              {submitting ? 'Saving sacred entry...' : 'Save Today\'s Sādhanā'}
            </button>
          </div>
        </div>

        {/* AI-Generated Affirmations */}
        {aiAffirmations.length > 0 && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center flex items-center justify-center">
              <Sparkles className="w-8 h-8 mr-3" />
              Divine Affirmations for You
            </h3>

            <div className="space-y-4">
              {aiAffirmations.map((affirmation, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedAffirmation?.text === affirmation.text
                    ? 'bg-amber-600/20 border-amber-400/50 text-amber-100'
                    : 'bg-slate-700/30 border-slate-600/50 text-amber-100/80 hover:bg-slate-600/30'
                    }`}
                  onClick={() => setSelectedAffirmation(affirmation)}
                >
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg leading-relaxed mb-2">"{affirmation.text}"</p>
                      <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs font-medium">
                        {affirmation.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAffirmation && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedAffirmation.text);
                    alert('🕉️ Affirmation copied! Repeat it throughout your day.');
                  }}
                  className="bg-purple-600/80 hover:bg-purple-700/80 text-amber-100 font-medium py-3 px-6 rounded-xl transition-all"
                >
                  Copy Selected Affirmation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent Entries */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Journal History</h2>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📖</div>
              <p className="sacred-text text-xl mb-4">Begin your personal sādhanā journey today.</p>
              <p className="text-slate-400">Document your spiritual growth with daily reflections and gratitude.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-slate-700/30 rounded-xl p-6 border-l-4 border-amber-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-amber-300 mr-3" />
                      <span className="text-amber-200 font-medium">{formatDate(entry.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {moods.find(m => m.name === entry.mood)?.icon || '🙏'}
                      </span>
                      <span className="text-amber-100 text-sm">{entry.mood}</span>
                    </div>
                  </div>

                  {entry.gratitude_text && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-amber-100 mb-2 flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Gratitude:
                      </h4>
                      <p className="sacred-text">{entry.gratitude_text}</p>
                    </div>
                  )}

                  {entry.reflection_text && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-amber-100 mb-2 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Reflection:
                      </h4>
                      <p className="sacred-text">{entry.reflection_text}</p>
                    </div>
                  )}

                  {entry.spiritual_insight && (
                    <div>
                      <h4 className="font-semibold text-amber-100 mb-2 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Spiritual Insight:
                      </h4>
                      <p className="sacred-text">{entry.spiritual_insight}</p>
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

export default PersonalSadhnaJournal;