import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Play, Pause, RotateCcw, Target, Volume2, VolumeX } from 'lucide-react';
import { emergencyWisdom } from '../lib/constants';

const EmergencyMode: React.FC = () => {
  const navigate = useNavigate();
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentWisdom, setCurrentWisdom] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(true);

  useEffect(() => {
    // Rotate emergency wisdom every 10 seconds
    const wisdomInterval = setInterval(() => {
      setCurrentWisdom((prev) => (prev + 1) % emergencyWisdom.length);
    }, 10000);

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      clearInterval(wisdomInterval);
    };
  }, [timerInterval]);

  const startTimer = () => {
    if (timerInterval) return;

    setTimerActive(true);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          setTimerInterval(null);
          alert('🕉️ Beautiful, brother. You have found your center. Krishna is proud of your strength.');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setTimerActive(false);
    }
  };

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimerActive(false);
    setTimeRemaining(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMusic = () => {
    const audio = document.getElementById('krishna-flute') as HTMLAudioElement;
    if (audio) {
      if (musicPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      {/* Krishna Flute Music */}
      <audio id="krishna-flute" autoPlay loop className="hidden">
        <source src="https://www.dl.dropboxusercontent.com/scl/fi/8z957n4jh0pxthl558i2c/relaxing-krishna-flute-music-deep-sleep-relaxing-music-292793.mp3?rlkey=9b9ftp4oyvqhonlzz9dsqra57&st=uwv38qe0&dl=0" type="audio/mpeg" />
      </audio>

      <div className="floating-particles">
        {[...Array(30)].map((_, i) => (
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
        {/* Music Control */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleMusic}
            className="bg-slate-800/80 text-amber-200 p-3 rounded-full hover:bg-slate-700/80 transition-all"
          >
            {musicPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🧘 The Stillness Room</h1>
          <h2 className="text-2xl text-emerald-300 font-light">Return to Your Divine Nature</h2>
        </div>

        {/* Emergency Spiritual Intervention */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 text-center divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6">🛑 STOP. BREATHE. REMEMBER KRISHNA.</h3>
          <div className="text-6xl mb-6">🕉️</div>
          <p className="text-amber-100 text-xl leading-relaxed mb-6">
            "{emergencyWisdom[currentWisdom]}"
          </p>
          <div className="bg-slate-700/50 rounded-xl p-6 border border-amber-300/30">
            <p className="text-emerald-200 text-lg font-medium mb-3">Maharaj Ji's Emergency Guidance:</p>
            <p className="text-amber-100 leading-relaxed">
              Close your eyes. Take three deep breaths. Remember: You are not the body, not the mind—you are the eternal soul.
              This urge is temporary. Krishna's love is eternal. Choose wisely, my brother.
            </p>
          </div>
        </div>

        {/* Sacred Video Wisdom */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">
            🎥 Premanand Maharaj Ji's Wisdom - Watch NOW
          </h3>
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/zN9ygYIBRus?rel=0&autoplay=1"
              title="Premanand Maharaj Ji - Lust Control Discourse"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl"
            ></iframe>
          </div>
          <p className="text-emerald-200 text-center">
            Let Maharaj Ji's divine wisdom penetrate your soul. You are being called to greatness.
          </p>
        </div>

        {/* Sacred Breathing Meditation */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">
            🌬️ Pranayama - Sacred Breath Control
          </h3>
          <p className="sacred-text text-center mb-8 text-lg">
            Breathe with Krishna's name. 5 minutes of sacred stillness. This is your gift to your soul.
          </p>

          <div className="text-center">
            <div className="text-8xl font-bold text-emerald-300 mb-6">
              {formatTime(timeRemaining)}
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {!timerActive ? (
                <button
                  onClick={startTimer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Begin Sacred Pranayama
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg"
                >
                  <Pause className="w-6 h-6 mr-3" />
                  Pause
                </button>
              )}

              <button
                onClick={resetTimer}
                className="bg-slate-600 hover:bg-slate-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center shadow-lg"
              >
                <RotateCcw className="w-6 h-6 mr-3" />
                Reset
              </button>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-6">
              <p className="sacred-text text-lg mb-4">
                <strong>Breathing Pattern:</strong>
              </p>
              <div className="space-y-2 text-amber-100">
                <p>🌬️ Inhale for 4 counts while chanting "Hare Krishna"</p>
                <p>⏸️ Hold for 4 counts in divine silence</p>
                <p>🌬️ Exhale for 6 counts while chanting "Hare Rama"</p>
                <p>✨ Feel your divine nature awakening</p>
              </div>
            </div>
          </div>
        </div>

        {/* Immediate Spiritual Actions */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">
            ⚡ Immediate Spiritual Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/japa')}
              className="bg-rose-600/80 hover:bg-rose-700/80 text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <span className="text-2xl mr-3">📿</span>
              Start Naam Japa
            </button>

            <button
              onClick={() => navigate('/gratitude')}
              className="bg-emerald-600/80 hover:bg-emerald-700/80 text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <span className="text-2xl mr-3">🙏</span>
              Count Blessings
            </button>

            <button
              onClick={() => navigate('/meditation')}
              className="bg-blue-600/80 hover:bg-blue-700/80 text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <span className="text-2xl mr-3">🧘‍♂️</span>
              Meditate Now
            </button>

            <button
              onClick={() => navigate('/future-self')}
              className="bg-purple-600/80 hover:bg-purple-700/80 text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
            >
              <span className="text-2xl mr-3">🔮</span>
              See Future Self
            </button>
          </div>
        </div>

        {/* Return to Sacred Purpose */}
        <div className="text-center">
          <p className="sacred-text mb-6 text-lg">
            When you feel centered and connected to Krishna, return to your sacred dharma.
          </p>
          <button
            onClick={() => navigate('/goals')}
            className="sacred-button text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center justify-center mx-auto shadow-lg"
          >
            <Target className="w-6 h-6 mr-3" />
            Return to My Sacred Dharma
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;