import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Save, Share2, Star } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

interface GitaVerse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  translation: string;
  meaning: string;
  practical_application: string;
  category: 'karma' | 'bhakti' | 'jnana' | 'dharma' | 'moksha';
}

interface GitaProgress {
  id?: string;
  user_id?: string;
  verse_id: string;
  is_favorite: boolean;
  is_reflected: boolean;
  reflection_notes?: string;
  date_studied: string;
  created_at?: string;
}

const BhagavadGitaDailyDose: React.FC = () => {
  const [todayVerse, setTodayVerse] = useState<GitaVerse | null>(null);
  const [verseProgress, setVerseProgress] = useState<GitaProgress | null>(null);
  const [favorites, setFavorites] = useState<GitaProgress[]>([]);
  const [studyStats, setStudyStats] = useState({
    totalStudied: 0,
    favoritesCount: 0,
    reflectionsCount: 0,
    currentStreak: 0
  });
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const gitaVerses: GitaVerse[] = [
    {
      id: 'bg_2_47',
      chapter: 2,
      verse: 47,
      sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
      translation: 'You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
      meaning: 'This verse teaches the principle of Nishkama Karma - performing actions without attachment to results. It is the foundation of spiritual practice.',
      practical_application: 'Apply this by focusing on your spiritual practices (meditation, japa, study) without worrying about immediate results or spiritual experiences.',
      category: 'karma'
    },
    {
      id: 'bg_18_65',
      chapter: 18,
      verse: 65,
      sanskrit: 'मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु। मामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे॥',
      translation: 'Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.',
      meaning: 'Krishna gives the ultimate instruction for spiritual success - constant remembrance, devotion, worship, and surrender.',
      practical_application: 'Practice constant remembrance through japa, dedicate your actions to Krishna, and maintain devotional attitude throughout the day.',
      category: 'bhakti'
    },
    {
      id: 'bg_4_7',
      chapter: 4,
      verse: 7,
      sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
      translation: 'Whenever there is decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.',
      meaning: 'The Divine manifests whenever dharma declines to restore righteousness and guide souls back to the spiritual path.',
      practical_application: 'When you feel spiritually weak or have fallen, remember that divine grace is always available to lift you up. Seek spiritual guidance and return to your practices.',
      category: 'dharma'
    },
    {
      id: 'bg_18_66',
      chapter: 18,
      verse: 66,
      sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
      translation: 'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
      meaning: 'The ultimate teaching - complete surrender to Krishna. When we let go of ego and surrender fully, Krishna takes care of everything.',
      practical_application: 'Practice surrender by offering all your actions, thoughts, and desires to Krishna. Trust in divine will rather than trying to control outcomes.',
      category: 'moksha'
    },
    {
      id: 'bg_2_48',
      chapter: 2,
      verse: 48,
      sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
      translation: 'Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.',
      meaning: 'True yoga is maintaining inner balance regardless of external circumstances. Success and failure are temporary - inner peace is eternal.',
      practical_application: 'Maintain equanimity in daily life. Whether facing praise or criticism, success or failure, remain centered in your spiritual identity.',
      category: 'karma'
    },
    {
      id: 'bg_4_38',
      chapter: 4,
      verse: 38,
      sanskrit: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते। तत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥',
      translation: 'In this world, there is nothing so sublime and pure as transcendental knowledge. Such knowledge is the mature fruit of all mysticism.',
      meaning: 'Self-knowledge is the highest purifier. Through spiritual practice, this wisdom naturally unfolds within us over time.',
      practical_application: 'Dedicate time daily to spiritual study and self-inquiry. Knowledge gained through practice is more valuable than theoretical learning.',
      category: 'jnana'
    },
    {
      id: 'bg_9_22',
      chapter: 9,
      verse: 22,
      sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
      translation: 'But those who always worship Me with exclusive devotion, meditating on My transcendental form—to them I carry what they lack, and I preserve what they have.',
      meaning: 'Krishna personally takes care of the needs of His devoted followers who think of Him constantly.',
      practical_application: 'Develop exclusive devotion through constant remembrance. Trust that Krishna will provide for all your genuine needs when you surrender to Him.',
      category: 'bhakti'
    }
  ];

  const categories = {
    karma: { label: 'Karma Yoga', icon: '⚡', color: 'bg-orange-600' },
    bhakti: { label: 'Bhakti Yoga', icon: '💖', color: 'bg-rose-600' },
    jnana: { label: 'Jnana Yoga', icon: '🧠', color: 'bg-purple-600' },
    dharma: { label: 'Dharma', icon: '⚖️', color: 'bg-blue-600' },
    moksha: { label: 'Moksha', icon: '✨', color: 'bg-amber-600' }
  };

  useEffect(() => {
    loadTodayVerse();
    loadGitaProgress();
  }, []);

  const loadTodayVerse = () => {
    // Use date as seed for consistent daily verse
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const verseIndex = dayOfYear % gitaVerses.length;

    setTodayVerse(gitaVerses[verseIndex]);
  };

  const loadGitaProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (!todayVerse) return;

      const q = query(
        collection(db, 'gita_progress'),
        where('user_id', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const allProgress = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GitaProgress));

      const today = new Date().toISOString().split('T')[0];
      const todayProgress = allProgress.find(p => p.verse_id === todayVerse.id && p.date_studied === today);
      setVerseProgress(todayProgress || null);

      const favoritesList = allProgress.filter(p => p.is_favorite);
      setFavorites(favoritesList);

      setStudyStats({
        totalStudied: allProgress.length,
        favoritesCount: favoritesList.length,
        reflectionsCount: allProgress.filter(p => p.is_reflected).length,
        currentStreak: calculateStudyStreak(allProgress)
      });
    } catch (error) {
      console.error('Error loading Gita progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStudyStreak = (progress: GitaProgress[]) => {
    if (!progress.length) return 0;

    const sortedDates = [...new Set(progress.map(p => p.date_studied))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check strict streak
    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    // If last study was before yesterday, streak is broken
    if (today.getTime() - mostRecent.getTime() > 86400000) {
      // Unless the most recent was yesterday?
      // Logic: 
      // Diff = 0 (Today) -> Valid
      // Diff = 86400000 (Yesterday) -> Valid
      // Diff > 86400000 -> Broken (0)
      if (today.getTime() - mostRecent.getTime() > 86400000) return 0;
    }

    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      d.setHours(0, 0, 0, 0);

      if (i === 0) {
        streak++;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        prev.setHours(0, 0, 0, 0);

        // Check if dates are consecutive (difference of 1 day)
        const diff = prev.getTime() - d.getTime();
        if (diff === 86400000) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  const markAsStudied = async (isFavorite: boolean = false, hasReflection: boolean = false) => {
    if (!todayVerse) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const newProgress: Omit<GitaProgress, 'id'> = {
        user_id: user.uid,
        verse_id: todayVerse.id,
        is_favorite: isFavorite,
        is_reflected: hasReflection,
        reflection_notes: hasReflection ? reflectionNotes.trim() : undefined,
        date_studied: today,
        created_at: new Date().toISOString()
      };

      // Check if entry exists for this verse today
      // Actually we query all at load, so we know. 
      // But for atomic safety, let's just addDoc. 
      // Wait, if I already studied today, I should update or replace?
      // Logic: upsert logic. Firestore doesn't have native upsert without ID.
      // I can generate ID based on user_verse_date or query and update.
      // Easiest is to query existing today entry in 'loadGitaProgress' (we have it in state if loaded).

      if (verseProgress?.id) {
        // Update existing
        await updateDoc(doc(db, 'gita_progress', verseProgress.id), {
          is_favorite: isFavorite,
          is_reflected: hasReflection,
          reflection_notes: hasReflection ? reflectionNotes.trim() : verseProgress.reflection_notes
        });
      } else {
        await addDoc(collection(db, 'gita_progress'), newProgress);
      }

      setVerseProgress({ ...newProgress, id: verseProgress?.id || 'temp-id' }); // Optimistic
      setShowReflectionForm(false);
      setReflectionNotes('');

      await loadGitaProgress();

      if (hasReflection) {
        alert('🙏 Your reflection on Krishna\'s wisdom has been saved!');
      } else {
        alert('📖 Verse marked as studied! Your Gita journey continues.');
      }
    } catch (error) {
      console.error('Error marking verse as studied:', error);
      alert('Error saving progress. Please try again.');
    }
  };

  const shareVerse = () => {
    if (!todayVerse) return;

    const shareText = `${todayVerse.sanskrit}\n\n"${todayVerse.translation}"\n\n${todayVerse.meaning}\n\n- Bhagavad Gita ${todayVerse.chapter}.${todayVerse.verse}`;

    if (navigator.share) {
      navigator.share({
        title: 'Daily Gita Verse from Sadhna Space',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard?.writeText(shareText);
      alert('🕉️ Verse copied to clipboard! Share Krishna\'s wisdom.');
    }
  };

  if (loading || !todayVerse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <div className="text-amber-100 text-xl">Loading today\'s divine wisdom...</div>
        </div>
      </div>
    );
  }

  const categoryInfo = categories[todayVerse.category];

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
          <h1 className="text-4xl font-bold text-amber-100 mb-4">📖 My Gita - Daily Dose</h1>
          <p className="sacred-text text-xl">Krishna's eternal wisdom for daily transformation</p>
        </div>

        {/* Study Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="spiritual-card rounded-xl p-4 text-center divine-glow">
            <div className="text-3xl font-bold text-amber-300 mb-1">{studyStats.totalStudied}</div>
            <p className="sacred-text text-sm">Verses Studied</p>
          </div>
          <div className="spiritual-card rounded-xl p-4 text-center divine-glow">
            <div className="text-3xl font-bold text-rose-300 mb-1">{studyStats.favoritesCount}</div>
            <p className="sacred-text text-sm">Favorites</p>
          </div>
          <div className="spiritual-card rounded-xl p-4 text-center divine-glow">
            <div className="text-3xl font-bold text-purple-300 mb-1">{studyStats.reflectionsCount}</div>
            <p className="sacred-text text-sm">Reflections</p>
          </div>
          <div className="spiritual-card rounded-xl p-4 text-center divine-glow">
            <div className="text-3xl font-bold text-emerald-300 mb-1">{studyStats.currentStreak}</div>
            <p className="sacred-text text-sm">Study Streak</p>
          </div>
        </div>

        {/* Today's Verse */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-amber-300 mr-3" />
              <h3 className="text-2xl font-bold text-amber-100">Today's Sacred Verse</h3>
              <BookOpen className="w-8 h-8 text-amber-300 ml-3" />
            </div>
            <div className="flex items-center justify-center space-x-4">
              <p className="text-emerald-300 font-medium">Bhagavad Gita {todayVerse.chapter}.{todayVerse.verse}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color} text-white`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            </div>
          </div>

          {/* Sanskrit Verse */}
          <div className="bg-gradient-to-r from-amber-600/10 to-emerald-600/10 rounded-xl p-6 border border-amber-300/20 mb-6">
            <p className="text-xl font-light text-amber-100 leading-relaxed text-center hindi-text mb-4">
              {todayVerse.sanskrit}
            </p>
            <div className="w-16 h-0.5 bg-amber-300/50 mx-auto"></div>
          </div>

          {/* Translation */}
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-emerald-300 mb-3">Translation:</h4>
            <p className="text-amber-100 leading-relaxed italic">
              "{todayVerse.translation}"
            </p>
          </div>

          {/* Meaning */}
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">Spiritual Meaning:</h4>
            <p className="sacred-text leading-relaxed">
              {todayVerse.meaning}
            </p>
          </div>

          {/* Practical Application */}
          <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-blue-300 mb-3">Daily Application:</h4>
            <p className="sacred-text leading-relaxed">
              {todayVerse.practical_application}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => markAsStudied(true, false)}
              disabled={verseProgress?.is_favorite}
              className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${verseProgress?.is_favorite
                ? 'bg-rose-600/50 text-rose-200 border border-rose-400/50 cursor-not-allowed'
                : 'bg-rose-600/80 hover:bg-rose-700/80 text-amber-100'
                }`}
            >
              <Heart className={`w-5 h-5 mr-2 ${verseProgress?.is_favorite ? 'fill-current' : ''}`} />
              {verseProgress?.is_favorite ? 'Favorited' : 'Add to Favorites'}
            </button>

            <button
              onClick={() => setShowReflectionForm(!showReflectionForm)}
              className="flex items-center justify-center px-4 py-3 bg-purple-600/80 hover:bg-purple-700/80 text-amber-100 font-medium rounded-xl transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              Write Reflection
            </button>

            <button
              onClick={shareVerse}
              className="flex items-center justify-center px-4 py-3 bg-blue-600/80 hover:bg-blue-700/80 text-amber-100 font-medium rounded-xl transition-all"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Wisdom
            </button>
          </div>

          {/* Study Status */}
          {verseProgress && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center bg-emerald-600/20 rounded-xl p-3 border border-emerald-400/50">
                <Star className="w-5 h-5 text-emerald-300 mr-2" />
                <span className="text-emerald-200 font-medium">
                  Studied on {new Date(verseProgress.date_studied).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reflection Form */}
        {showReflectionForm && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Sacred Reflection</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-amber-100 font-medium mb-3">
                  How does this verse speak to your spiritual journey?
                </label>
                <textarea
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full p-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all"
                  rows={4}
                  placeholder="This verse teaches me that..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => markAsStudied(false, true)}
                  disabled={!reflectionNotes.trim()}
                  className="flex-1 sacred-button text-amber-100 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Reflection
                </button>

                <button
                  onClick={() => setShowReflectionForm(false)}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-amber-100 font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center flex items-center justify-center">
              <Heart className="w-8 h-8 mr-3 text-rose-400" />
              My Favorite Verses
            </h3>

            <div className="space-y-4">
              {favorites.slice(0, 5).map((progress) => {
                const verse = gitaVerses.find(v => v.id === progress.verse_id);
                if (!verse) return null;

                return (
                  <div key={progress.verse_id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-rose-300 font-semibold">
                        Bhagavad Gita {verse.chapter}.{verse.verse}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categories[verse.category].color} text-white`}>
                        {categories[verse.category].icon} {categories[verse.category].label}
                      </span>
                    </div>
                    <p className="text-amber-100 text-sm italic">"{verse.translation}"</p>
                    {progress.reflection_notes && (
                      <p className="text-slate-300 text-xs mt-2">💭 {progress.reflection_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Study Guidance */}
        <div className="spiritual-card rounded-xl p-6 divine-glow">
          <h4 className="text-lg font-semibold text-amber-100 mb-4 text-center">
            🎯 Daily Gita Study Practice
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-amber-200/80 text-sm">
            <div className="space-y-2">
              <p>• Read the Sanskrit verse slowly and reverently</p>
              <p>• Contemplate the translation and meaning deeply</p>
              <p>• Apply the teaching to your current life situation</p>
            </div>
            <div className="space-y-2">
              <p>• Write personal reflections for deeper understanding</p>
              <p>• Share wisdom with fellow spiritual seekers</p>
              <p>• Return to favorite verses during challenges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BhagavadGitaDailyDose;