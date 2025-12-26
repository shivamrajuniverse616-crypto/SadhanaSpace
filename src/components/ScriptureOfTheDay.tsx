import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Save, Share2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface Scripture {
  verse: string;
  translation: string;
  meaning: string;
  source: string;
  chapter?: string;
}

const ScriptureOfTheDay: React.FC = () => {
  const [todayScripture, setTodayScripture] = useState<Scripture | null>(null);
  const [isReflected, setIsReflected] = useState(false);
  const [loading, setLoading] = useState(true);

  const scriptures: Scripture[] = [
    {
      verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      translation: "You have a right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
      meaning: "This verse teaches us about Nishkama Karma - performing actions without attachment to results. Focus on your spiritual practice without worrying about outcomes.",
      source: "Bhagavad Gita",
      chapter: "Chapter 2, Verse 47"
    },
    {
      verse: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु। मामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे॥",
      translation: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
      meaning: "Krishna promises that constant remembrance and devotion will lead us to Him. This is the essence of Bhakti Yoga - loving devotion to the Divine.",
      source: "Bhagavad Gita",
      chapter: "Chapter 18, Verse 65"
    },
    {
      verse: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
      translation: "Whenever there is decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.",
      meaning: "The Divine manifests whenever dharma declines. In our personal lives, when we stray from righteousness, divine grace appears to guide us back.",
      source: "Bhagavad Gita",
      chapter: "Chapter 4, Verse 7"
    },
    {
      verse: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
      translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
      meaning: "The ultimate teaching - complete surrender to the Divine. When we let go of ego and surrender fully, Krishna takes care of everything.",
      source: "Bhagavad Gita",
      chapter: "Chapter 18, Verse 66"
    },
    {
      verse: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
      translation: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
      meaning: "True yoga is maintaining inner balance regardless of external circumstances. Success and failure are temporary - inner peace is eternal.",
      source: "Bhagavad Gita",
      chapter: "Chapter 2, Verse 48"
    },
    {
      verse: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते। तत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥",
      translation: "In this world, there is nothing so sublime and pure as transcendental knowledge. Such knowledge is the mature fruit of all mysticism.",
      meaning: "Self-knowledge is the highest purifier. Through spiritual practice, this wisdom naturally unfolds within us over time.",
      source: "Bhagavad Gita",
      chapter: "Chapter 4, Verse 38"
    },
    {
      verse: "ध्यानात्मनि पश्यन्ति केचिदात्मानमात्मना। अन्ये सांख्येन योगेन कर्मयोगेन चापरे॥",
      translation: "Some perceive the Supersoul within themselves through meditation, others through the cultivation of knowledge, and still others through working without fruitive desires.",
      meaning: "There are many paths to the Divine - meditation, knowledge, and selfless service. Choose the path that resonates with your nature.",
      source: "Bhagavad Gita",
      chapter: "Chapter 13, Verse 25"
    }
  ];

  useEffect(() => {
    loadTodayScripture();
    checkReflectionStatus();
  }, []);

  const loadTodayScripture = () => {
    // Use date as seed for consistent daily scripture
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const scriptureIndex = dayOfYear % scriptures.length;

    setTodayScripture(scriptures[scriptureIndex]);
    setLoading(false);
  };

  const checkReflectionStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'journal_entries'),
        where('user_id', '==', user.uid),
        where('date', '==', today),
        where('reason', '==', 'Scripture Reflection - Daily Shloka')
      );

      const querySnapshot = await getDocs(q);
      setIsReflected(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking reflection status:', error);
    }
  };

  const markAsReflected = async () => {
    if (!todayScripture) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const journalEntry = {
        user_id: user.uid,
        date: new Date().toISOString().split('T')[0],
        reason: 'Scripture Reflection - Daily Shloka',
        feeling: 'Contemplative and blessed',
        plan: `Reflect deeply on: "${todayScripture.translation}" - ${todayScripture.meaning}`,
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'journal_entries'), journalEntry);

      setIsReflected(true);
      alert('🙏 Scripture reflection saved to your journal! May this wisdom guide your day.');
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Error saving reflection. Please try again.');
    }
  };

  const shareScripture = () => {
    if (!todayScripture) return;

    const shareText = `${todayScripture.verse}\n\n"${todayScripture.translation}"\n\n${todayScripture.meaning}\n\n- ${todayScripture.source} ${todayScripture.chapter}`;

    if (navigator.share) {
      navigator.share({
        title: 'Daily Scripture from Sadhna Space',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard?.writeText(shareText);
      alert('🕉️ Scripture copied to clipboard! Share this divine wisdom.');
    }
  };

  if (loading || !todayScripture) {
    return (
      <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
        <div className="text-center">
          <BookOpen className="w-8 h-8 text-amber-300 mx-auto mb-4 animate-pulse" />
          <p className="sacred-text">Receiving today's divine wisdom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-amber-300 mr-3" />
          <h3 className="text-2xl font-bold text-amber-100">Today's Sacred Shloka</h3>
          <BookOpen className="w-8 h-8 text-amber-300 ml-3" />
        </div>
        <p className="text-emerald-300 font-medium">{todayScripture.source} {todayScripture.chapter}</p>
      </div>

      {/* Sanskrit Verse */}
      <div className="bg-gradient-to-r from-amber-600/10 to-emerald-600/10 rounded-xl p-6 border border-amber-300/20 mb-6">
        <p className="text-xl font-light text-amber-100 leading-relaxed text-center hindi-text mb-4">
          {todayScripture.verse}
        </p>
        <div className="w-16 h-0.5 bg-amber-300/50 mx-auto"></div>
      </div>

      {/* Translation */}
      <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold text-emerald-300 mb-3">Translation:</h4>
        <p className="text-amber-100 leading-relaxed italic">
          "{todayScripture.translation}"
        </p>
      </div>

      {/* Meaning & Application */}
      <div className="bg-slate-700/30 rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold text-purple-300 mb-3">Spiritual Meaning:</h4>
        <p className="sacred-text leading-relaxed">
          {todayScripture.meaning}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={markAsReflected}
          disabled={isReflected}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all ${isReflected
            ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/50 cursor-not-allowed'
            : 'sacred-button text-amber-100'
            }`}
        >
          {isReflected ? (
            <>
              <Heart className="w-5 h-5 mr-2 fill-current" />
              Reflected Upon
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Mark as Reflected
            </>
          )}
        </button>

        <button
          onClick={shareScripture}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600/80 hover:bg-purple-700/80 text-amber-100 font-medium rounded-xl transition-all"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Wisdom
        </button>
      </div>

      {isReflected && (
        <div className="mt-4 text-center">
          <p className="text-emerald-300 text-sm">
            ✨ You have contemplated today's divine teaching. Let it guide your actions.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScriptureOfTheDay;