import React, { useState, useEffect } from 'react';
import { Heart, RotateCcw, Award, Volume2, VolumeX } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';


const JapaCounter: React.FC = () => {
  const [todayCount, setTodayCount] = useState(0);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [selectedMantra, setSelectedMantra] = useState('Hare Krishna');
  const [isChanting, setIsChanting] = useState(false);
  const [loading, setLoading] = useState(true);

  const mantras = [
    'Hare Krishna',
    'Om Namah Shivaya',
    'Om Gam Ganapataye Namaha',
    'Gayatri Mantra',
    'Mahamrityunjaya Mantra'
  ];

  const milestones = [
    { count: 108, title: "Sacred Mala", icon: "📿", desc: "One complete round" },
    { count: 1008, title: "Divine Devotee", icon: "🙏", desc: "Ten rounds of devotion" },
    { count: 10008, title: "Spiritual Warrior", icon: "⚔️", desc: "Hundred rounds of discipline" },
    { count: 100008, title: "Krishna's Beloved", icon: "💖", desc: "Thousand rounds of love" }
  ];

  useEffect(() => {
    loadJapaData();
  }, []);

  const loadJapaData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Load today's count
      const japaRef = collection(db, 'japa_counter');

      const todaySnap = await getDocs(query(japaRef, where('user_id', '==', user.uid), where('date', '==', today)));

      let currentTodayCount = 0;
      if (!todaySnap.empty) {
        currentTodayCount = todaySnap.docs[0].data().japa_count || 0;
      }

      // Load lifetime count
      // We can query all records for user and sum japa_count
      const lifetimeSnap = await getDocs(query(japaRef, where('user_id', '==', user.uid)));
      const lifetime = lifetimeSnap.docs.reduce((sum, doc) => sum + (doc.data().japa_count || 0), 0);

      setTodayCount(currentTodayCount);
      setLifetimeCount(lifetime);
    } catch (error) {
      console.error('Error loading japa data:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementCount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const newCount = todayCount + 1;
      const todayDocId = `${user.uid}_${today}`;

      await setDoc(doc(db, 'japa_counter', todayDocId), {
        user_id: user.uid,
        date: today,
        japa_count: newCount,
        mantra_type: selectedMantra,
        created_at: new Date().toISOString()
      }, { merge: true });

      setTodayCount(newCount);
      setLifetimeCount(prev => prev + 1);

      // Trigger dashboard data refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('japaUpdated'));

      // Also trigger streak update for progress page
      window.dispatchEvent(new CustomEvent('streakUpdated'));

      // Check for milestone achievement
      const milestone = milestones.find(m => lifetimeCount + 1 === m.count);
      if (milestone) {
        alert(`🎉 Milestone Achieved: ${milestone.title}! ${milestone.desc}`);
      }
    } catch (error) {
      console.error('Error updating japa count:', error);
    }
  };

  const resetTodayCount = async () => {
    if (!confirm('Reset today\'s japa count?')) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const todayDocId = `${user.uid}_${today}`;

      await setDoc(doc(db, 'japa_counter', todayDocId), {
        user_id: user.uid,
        date: today,
        japa_count: 0,
        mantra_type: selectedMantra
      }, { merge: true });

      setTodayCount(0);
      setLifetimeCount(prev => prev - todayCount);
    } catch (error) {
      console.error('Error resetting japa count:', error);
    }
  };

  const toggleChanting = () => {
    const audio = document.getElementById('mantra-audio') as HTMLAudioElement;
    if (audio) {
      if (isChanting) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsChanting(!isChanting);
    }
  };

  const getNextMilestone = () => {
    return milestones.find(m => m.count > lifetimeCount) || milestones[milestones.length - 1];
  };

  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    return Math.min((lifetimeCount / nextMilestone.count) * 100, 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your sacred mala...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      {/* Background Mantra Audio */}
      <audio id="mantra-audio" loop className="hidden">
        <source src="https://www.dl.dropboxusercontent.com/scl/fi/8z957n4jh0pxthl558i2c/relaxing-krishna-flute-music-deep-sleep-relaxing-music-292793.mp3?rlkey=9b9ftp4oyvqhonlzz9dsqra57&st=uwv38qe0&dl=0" type="audio/mpeg" />
      </audio>

      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
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
          <h1 className="text-4xl font-bold text-amber-100 mb-4">📿 Japa Mala</h1>
          <p className="sacred-text text-xl">Digital sacred counter for divine mantras</p>
        </div>

        {/* Mantra Selection */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Choose Your Sacred Mantra</h3>
          <div className="grid grid-cols-1 gap-3">
            {mantras.map((mantra) => (
              <button
                key={mantra}
                onClick={() => setSelectedMantra(mantra)}
                className={`p-4 rounded-xl transition-all ${selectedMantra === mantra
                  ? 'bg-rose-600/50 border-2 border-rose-400 text-rose-200'
                  : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                  }`}
              >
                {mantra}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={toggleChanting}
              className="bg-purple-600/80 hover:bg-purple-700/80 text-amber-100 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center mx-auto"
            >
              {isChanting ? <VolumeX className="w-5 h-5 mr-2" /> : <Volume2 className="w-5 h-5 mr-2" />}
              {isChanting ? 'Stop Background Chanting' : 'Play Background Chanting'}
            </button>
          </div>
        </div>

        {/* Main Counter */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6">Today's Sacred Count</h3>

          <div className="mb-8">
            <div className="text-8xl font-bold text-rose-300 mb-4 japa-glow">
              {todayCount}
            </div>
            <p className="sacred-text text-xl">{selectedMantra}</p>
          </div>

          <button
            onClick={incrementCount}
            className="w-32 h-32 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-full text-6xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-2xl mb-6"
          >
            +1
          </button>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetTodayCount}
              className="bg-slate-600 hover:bg-slate-700 text-amber-100 font-semibold py-3 px-6 rounded-xl transition-all flex items-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Today
            </button>
          </div>
        </div>

        {/* Lifetime Progress */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Lifetime Sacred Journey</h3>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-amber-300 mb-2">{lifetimeCount.toLocaleString()}</div>
            <p className="sacred-text">Total mantras chanted</p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-100">Progress to {getNextMilestone().title}</span>
              <span className="text-amber-300">{Math.round(getMilestoneProgress())}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-rose-500 to-rose-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getMilestoneProgress()}%` }}
              ></div>
            </div>
            <p className="text-sm sacred-text mt-2">
              {getNextMilestone().count - lifetimeCount} mantras to {getNextMilestone().title}
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 flex items-center justify-center">
            <Award className="w-8 h-8 mr-3" />
            Sacred Milestones
          </h3>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.count}
                className={`flex items-center p-4 rounded-xl transition-all ${lifetimeCount >= milestone.count
                  ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-700/30 border border-emerald-400/50'
                  : 'bg-slate-700/30 border border-slate-600/50'
                  }`}
              >
                <span className="text-3xl mr-4">{milestone.icon}</span>
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${lifetimeCount >= milestone.count ? 'text-emerald-300' : 'text-slate-400'
                    }`}>
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-slate-400">{milestone.desc}</p>
                  <p className="text-xs text-slate-500 mt-1">{milestone.count.toLocaleString()} mantras</p>
                </div>
                {lifetimeCount >= milestone.count && (
                  <div className="text-emerald-300 text-2xl">✨</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .japa-glow {
          text-shadow: 0 0 20px rgba(244, 114, 182, 0.5);
          animation: gentle-pulse 3s ease-in-out infinite;
        }
        
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default JapaCounter;