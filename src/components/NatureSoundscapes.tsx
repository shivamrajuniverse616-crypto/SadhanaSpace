import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

interface Soundscape {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
}

interface NatureSoundscapesProps {
  isTimerActive?: boolean;
  onTimerComplete?: () => void;
}

const NatureSoundscapes: React.FC<NatureSoundscapesProps> = ({
  isTimerActive = false,
  onTimerComplete
}) => {
  const [selectedSoundscape, setSelectedSoundscape] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [timerDuration, setTimerDuration] = useState(10); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const soundscapes: Soundscape[] = [
    {
      id: 'forest',
      name: 'Sacred Forest',
      icon: '🌲',
      description: 'Gentle forest sounds with birds',
      url: 'https://www.dropbox.com/scl/fi/qbsesnvp5hbyx0och263q/forest-ambience-296528.mp3?rlkey=mpv7kjmy0ll3u46pk1kczh1hw&st=yru8kfz2&raw=1'
    },
    {
      id: 'water',
      name: 'Flowing River',
      icon: '🌊',
      description: 'Pure Theta 4-7Hz (Water Flow)',
      url: 'https://www.dropbox.com/scl/fi/10qtx7ze634etda26jtyg/pure-theta-4-7hz-gentle-water-flow-351397.mp3?rlkey=dedcdo2061musa1mwkivtws6s&st=5kbehpz7&raw=1'
    },
    {
      id: 'rain',
      name: 'Gentle Rain',
      icon: '🌧️',
      description: 'Relaxing rain sounds',
      url: 'https://www.dropbox.com/scl/fi/liilnm3ebimezz5w10e4a/relaxing-rain-444802.mp3?rlkey=9znohl9xks59uyf54xk1jzwop&st=osocm25w&raw=1'
    },
    {
      id: 'tanpura',
      name: 'Tanpura Drone',
      icon: '🎵',
      description: 'Divine Tanpura meditation',
      url: 'https://www.dropbox.com/scl/fi/f2k13cpj2rv3s4j5aex7w/drone-of-the-divine-tanpura-367354.mp3?rlkey=fucdbru3sozuzyjp4y8cilnnd&st=wnyel1e7&raw=1'
    },
    {
      id: 'tibetan',
      name: 'Tibetan Bowls',
      icon: '🔔',
      description: 'Healing singing bowls',
      url: 'https://www.dropbox.com/scl/fi/m29pr7u743a6ax07o3e6g/tibetan-singing-bowl-relaxation-journey-384707.mp3?rlkey=0kcmsubpsvu5db4lza4n1ocxs&st=2uw8b4is&raw=1'
    },
    {
      id: 'om',
      name: 'Om Chanting',
      icon: '🕉️',
      description: 'Sacred Om vibrations',
      url: 'https://www.dropbox.com/scl/fi/8keuuvpolypoa0sfc2ot3/deep-om-chants-with-reverb-229614.mp3?rlkey=rdd6t015ue7k3s4xr9xbrgc5f&st=6a0d193h&raw=1'
    }
  ];

  useEffect(() => {
    if (isTimerActive && !timerRunning) {
      startTimer();
    } else if (!isTimerActive && timerRunning) {
      stopTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerActive]); // Reverted dependencies to avoid potential loop

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [selectedSoundscape]);

  // Handle timer completion side effects safely
  useEffect(() => {
    if (timeRemaining === 0 && timerRunning) {
      stopTimer();
      onTimerComplete?.();
    }
  }, [timeRemaining, timerRunning, onTimerComplete]);

  const startTimer = () => {
    if (timerRef.current) return;

    setTimeRemaining(timerDuration * 60);
    setTimerRunning(true);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
    // Don't separate setTimeRemaining(0) here if it triggers the effect loop?
    // Actually if we just setTimerRunning(false), the effect [timeRemaining, timerRunning] won't re-run for completion.
    // Ensure time shows 0
    if (timeRemaining > 0) setTimeRemaining(0);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
    setTimeRemaining(timerDuration * 60);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !selectedSoundscape) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSoundscapeChange = (soundscapeId: string) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    setSelectedSoundscape(soundscapeId);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedSoundscapeData = soundscapes.find(s => s.id === selectedSoundscape);

  return (
    <div className="spiritual-card rounded-2xl p-8 divine-glow">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-amber-100 mb-3">🎵 Sacred Soundscapes</h3>
        <p className="sacred-text">Enhance your meditation with divine sounds</p>
      </div>

      {/* Timer Display (when active) */}
      {(timerRunning || timeRemaining > 0) && (
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-300 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <p className="sacred-text">Meditation Timer</p>
        </div>
      )}

      {/* Timer Duration Selection */}
      {!timerRunning && (
        <div className="mb-6">
          <label className="block text-amber-100 font-medium mb-3">Meditation Duration</label>
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 15, 20, 30].map((duration) => (
              <button
                key={duration}
                onClick={() => setTimerDuration(duration)}
                className={`p-3 rounded-xl transition-all ${timerDuration === duration
                  ? 'bg-blue-600/50 border-2 border-blue-400 text-blue-200'
                  : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                  }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Soundscape Selection */}
      <div className="mb-6">
        <label className="block text-amber-100 font-medium mb-3">Choose Sacred Soundscape</label>
        <div className="grid grid-cols-2 gap-3">
          {soundscapes.map((soundscape) => (
            <button
              key={soundscape.id}
              onClick={() => handleSoundscapeChange(soundscape.id)}
              className={`p-4 rounded-xl transition-all text-left ${selectedSoundscape === soundscape.id
                ? 'bg-emerald-600/50 border-2 border-emerald-400 text-emerald-200'
                : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                }`}
            >
              <div className="text-2xl mb-2">{soundscape.icon}</div>
              <div className="font-medium">{soundscape.name}</div>
              <div className="text-xs opacity-75">{soundscape.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Controls */}
      {selectedSoundscape && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            {timerRunning && (
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-600 hover:bg-slate-700 text-amber-100 rounded-full transition-all"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <VolumeX className="w-5 h-5 text-amber-200" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <Volume2 className="w-5 h-5 text-amber-200" />
          </div>

          {/* Current Soundscape Info */}
          {selectedSoundscapeData && (
            <div className="bg-slate-700/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{selectedSoundscapeData.icon}</div>
              <div className="text-amber-100 font-medium">{selectedSoundscapeData.name}</div>
              <div className="sacred-text text-sm">{selectedSoundscapeData.description}</div>
            </div>
          )}
        </div>
      )}

      {/* Audio Element */}
      {selectedSoundscape && (
        <audio
          ref={audioRef}
          src={soundscapes.find(s => s.id === selectedSoundscape)?.url}
          loop
          volume={volume}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default NatureSoundscapes;