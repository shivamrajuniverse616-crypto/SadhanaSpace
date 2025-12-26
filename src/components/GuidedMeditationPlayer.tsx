import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, Heart } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface FavoriteTrack {
  id: string;
  track_id: string;
  user_id: string;
  created_at: string;
}

interface MeditationTrack {
  id: string;
  title: string;
  category: 'calm' | 'focus' | 'sleep';
  duration: number; // in minutes
  description: string;
  url: string;
  instructor: string;
}

const GuidedMeditationPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<MeditationTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'calm' | 'focus' | 'sleep'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);

  const meditationTracks: MeditationTrack[] = [
    {
      id: '1',
      title: 'Morning Peace Meditation',
      category: 'calm',
      duration: 10,
      description: 'Start your day with inner peace and divine connection',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Spiritual Guide'
    },
    {
      id: '2',
      title: 'Krishna Consciousness Focus',
      category: 'focus',
      duration: 15,
      description: 'Deepen your concentration through divine remembrance',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Devotional Teacher'
    },
    {
      id: '3',
      title: 'Sacred Sleep Preparation',
      category: 'sleep',
      duration: 20,
      description: 'Peaceful transition to divine rest',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Sleep Guide'
    },
    {
      id: '4',
      title: 'Breath of Divinity',
      category: 'calm',
      duration: 8,
      description: 'Connect with your divine essence through sacred breathing',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Pranayama Master'
    },
    {
      id: '5',
      title: 'Laser Focus Meditation',
      category: 'focus',
      duration: 12,
      description: 'Sharpen your mind for spiritual study and work',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Concentration Expert'
    },
    {
      id: '6',
      title: 'Deep Rest in Krishna',
      category: 'sleep',
      duration: 25,
      description: 'Surrender to divine peace for restorative sleep',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
      instructor: 'Rest Guide'
    }
  ];

  const categories = {
    all: { label: 'All Meditations', icon: '🧘‍♂️', color: 'bg-purple-600' },
    calm: { label: 'Calm Mind', icon: '🕊️', color: 'bg-blue-600' },
    focus: { label: 'Focus Booster', icon: '🎯', color: 'bg-emerald-600' },
    sleep: { label: 'Sleep Harmony', icon: '🌙', color: 'bg-indigo-600' }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const updateDuration = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    playNext();
  };

  const loadFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'favorite_meditations'),
        where('user_id', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FavoriteTrack));

      setFavorites(data.map(f => f.track_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const toggleFavorite = async (trackId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (favorites.includes(trackId)) {
        // Remove from favorites
        // Need to find the doc ID first
        const q = query(
          collection(db, 'favorite_meditations'),
          where('user_id', '==', user.uid),
          where('track_id', '==', trackId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          await deleteDoc(doc(db, 'favorite_meditations', snapshot.docs[0].id));
          setFavorites(prev => prev.filter(id => id !== trackId));
        }
      } else {
        // Add to favorites
        const favorite = {
          user_id: user.uid,
          track_id: trackId,
          created_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'favorite_meditations'), favorite);
        setFavorites(prev => [...prev, trackId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const playTrack = (track: MeditationTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack) return;
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % filteredTracks.length;
    setCurrentTrack(filteredTracks[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    const filteredTracks = getFilteredTracks();
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(filteredTracks[prevIndex]);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFilteredTracks = () => {
    return selectedCategory === 'all'
      ? meditationTracks
      : meditationTracks.filter(track => track.category === selectedCategory);
  };

  const getCategoryStats = () => {
    return {
      calm: meditationTracks.filter(t => t.category === 'calm').length,
      focus: meditationTracks.filter(t => t.category === 'focus').length,
      sleep: meditationTracks.filter(t => t.category === 'sleep').length
    };
  };

  const stats = getCategoryStats();
  const filteredTracks = getFilteredTracks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧘‍♂️</div>
          <div className="text-amber-100 text-xl">Loading guided meditations...</div>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🧘‍♂️</span>
          </div>
          <h1 className="text-5xl font-bold text-amber-100 mb-4 font-display">🎧 Guided Meditation Library</h1>
          <p className="text-xl text-amber-200/80 font-light">Sacred audio journeys for mind, body, and soul</p>
        </div>

        {/* Category Filter */}
        <div className="spiritual-card rounded-2xl p-8 mb-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">Choose Your Sacred Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`p-4 rounded-xl transition-all ${selectedCategory === key
                  ? `${category.color} text-white border-2 border-white/50`
                  : 'bg-slate-700/30 border border-slate-600/50 text-amber-100 hover:bg-slate-600/30'
                  }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-medium">{category.label}</div>
                <div className="text-xs opacity-75">
                  {key === 'all' ? meditationTracks.length : stats[key as keyof typeof stats] || 0} tracks
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Meditation Tracks */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-32">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="group spiritual-card rounded-2xl p-6 divine-glow hover:shadow-2xl hover:shadow-amber-300/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => playTrack(track)}
                  className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg group-hover:scale-110"
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => toggleFavorite(track.id)}
                  className="p-3 rounded-full hover:bg-slate-700/50 transition-all duration-200"
                >
                  <Heart className={`w-6 h-6 transition-all duration-200 ${favorites.includes(track.id)
                    ? 'text-red-400 fill-current'
                    : 'text-slate-400 hover:text-red-400'
                    }`} />
                </button>
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${categories[track.category].color} text-white`}>
                {categories[track.category].icon} {categories[track.category].label}
              </div>

              <h3 className="text-amber-100 font-semibold text-lg mb-2 leading-tight">{track.title}</h3>
              <p className="text-amber-200/70 text-sm mb-3">{track.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {track.duration} min
                </div>
                <span className="text-slate-400">{track.instructor}</span>
              </div>

              {currentTrack?.id === track.id && (
                <div className="mt-4 pt-4 border-t border-slate-600/30">
                  <div className="text-xs text-emerald-300 font-medium">Now Playing</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Audio Element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.volume = volume;
              }
              updateDuration();
            }}
          />
        )}

        {/* Fixed Bottom Player */}
        {currentTrack && (
          <div className="fixed bottom-0 md:bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 to-indigo-900/95 backdrop-blur-lg border-t border-amber-300/20 p-4 z-50">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-amber-100 font-semibold truncate">{currentTrack.title}</h4>
                  <p className="text-amber-200/70 text-sm truncate">{currentTrack.instructor}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={playPrevious}
                    className="p-2 text-amber-200 hover:text-amber-100 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={playNext}
                    className="p-2 text-amber-200 hover:text-amber-100 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <div className="hidden md:flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-amber-200" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3">
                <span className="text-xs text-amber-200/70 min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-xs text-amber-200/70 min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Spacer */}
      <div className="md:hidden h-32"></div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
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

export default GuidedMeditationPlayer;