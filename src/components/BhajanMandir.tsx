import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { FavoriteBhajan } from '../lib/types';

interface Bhajan {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const BhajanMandir: React.FC = () => {
  const [currentBhajan, setCurrentBhajan] = useState<Bhajan | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [favorites, setFavorites] = useState<FavoriteBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ... (bhajans array remains same) ...
  const bhajans: Bhajan[] = [
    {
      id: '1',
      title: 'Shree Rama Ashtakam',
      artist: 'Ameya Records',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/ameyarecords_rama_ashtakam_shrii_raamaassttkm_ameya_records_bhaj.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9hbWV5YXJlY29yZHNfcmFtYV9hc2h0YWthbV9zaHJpaV9yYWFtYWFzc3R0a21fYW1leWFfcmVjb3Jkc19iaGFqLm00YSIsImlhdCI6MTc1NDAyMjAzMywiZXhwIjoxNzI5NzU0MDIyMDMzfQ.H0aNN3CvcUNuXX0wmmhs1osObmOv0ciPKsAvyYlUJ3w'
    },
    {
      id: '2',
      title: 'Shiv Tandav Stotram',
      artist: 'Armonian',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/armonian-shiv-tandav-stotram.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzL2FybW9uaWFuLXNoaXYtdGFuZGF2LXN0b3RyYW0ubTRhIiwiaWF0IjoxNzUxOTc3ODEzLCJleHAiOjE3NDU1MTk3NzgxM30.YglKvQ8t0Yr5vNi0jUniaWPAJFhbb4hDu5LlTc7w9v4'
    },
    {
      id: '3',
      title: 'Shree Krishna Govind Hare Murari',
      artist: 'Devotional Sangeet',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/devotional_sangeet_shree_krishna_govind_hare_murari_ii_shree_kri.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9kZXZvdGlvbmFsX3NhbmdlZXRfc2hyZWVfa3Jpc2huYV9nb3ZpbmRfaGFyZV9tdXJhcmlfaWlfc2hyZWVfa3JpLm00YSIsImlhdCI6MTc1NDAyMjA5MSwiZXhwIjo0MzIxNzU0MDIyMDkxfQ.5qQhNilrZRfDoU9isxUU1RLLC9NZ7Wkho2ETLlRBb3M'
    },
    {
      id: '4',
      title: 'Ram Naam Ke Sabun Se Narayan Mil Jaye',
      artist: 'Pujya Prembhushan Ji Maharaj',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/pujya_prembhushanji_maharaj_ram_naam_ke_sabun_se_narayan_mil_jay.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9wdWp5YV9wcmVtYmh1c2hhbmppX21haGFyYWpfcmFtX25hYW1fa2Vfc2FidW5fc2VfbmFyYXlhbl9taWxfamF5Lm00YSIsImlhdCI6MTc1NDAyMjEyNywiZXhwIjoxNTc4NTU0MDIyMTI3fQ.mmkJgxOmleZSRmIKFFgBqUIF2dFz2gFFgr25SJojBa4'
    },
    {
      id: '5',
      title: 'Agr Naath Dekhoge Avgunn Hmaare',
      artist: 'Pujya Rajan Ji',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/pujya_rajan_jee_agr_naath_dekhoge_avgunn_hmaare_pujya_rajan_jee_.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9wdWp5YV9yYWphbl9qZWVfYWdyX25hYXRoX2Rla2hvZ2VfYXZndW5uX2htYWFyZV9wdWp5YV9yYWphbl9qZWVfLm00YSIsImlhdCI6MTc1NDAyMjE1OSwiZXhwIjo0MzIxNzU0MDIyMTU5fQ.JRC9WMHbwaotFcr75cOFkRR9P6KN2nec4K3SweXCvB4'
    },
    {
      id: '6',
      title: 'Terii Mnd Mnd Musukniyaa Pr Blihaar Raa',
      artist: 'Pujya Rajan Ji',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/pujya_rajan_jee_official_terii_mnd_mnd_musukniyaa_pr_blihaar_raa.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9wdWp5YV9yYWphbl9qZWVfb2ZmaWNpYWxfdGVyaWlfbW5kX21uZF9tdXN1a25peWFhX3ByX2JsaWhhYXJfcmFhLm00YSIsImlhdCI6MTc1NDAyMjE5OCwiZXhwIjo0MzIxNzU0MDIyMTk4fQ.yYjN2RP8oWgsfGml7jIPLF66sQfa_re4R8DJjygYUis'
    },
    {
      id: '7',
      title: 'Mithila Vivah Aaj Mithilaa Ngriyaa',
      artist: 'Pujya Rajan Ji',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/pujya_rajan_jee_pujyarajanji_mithila_vivah_aaj_mithilaa_ngriyaa_.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9wdWp5YV9yYWphbl9qZWVfcHVqeWFyYWphbmppX21pdGhpbGFfdml2YWhfYWFqX21pdGhpbGFhX25ncml5YWFfLm00YSIsImlhdCI6MTc1NDAyMjIyOCwiZXhwIjo0MzIxNzU0MDIyMjI4fQ.pwb3ET01-ghlG0izlTILI5p_eb_NG44_430gc8SH8nI'
    },
    {
      id: '8',
      title: 'Aaii Ge Rghunndn Sjvaa Do Dvaar Dvaar Aa',
      artist: 'Pujya Rajan Ji',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/pujya_rajan_ji_official_aaii_ge_rghunndn_sjvaa_do_dvaar_dvaar_aa.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzL3B1anlhX3JhamFuX2ppX29mZmljaWFsX2FhaWlfZ2VfcmdodW5uZG5fc2p2YWFfZG9fZHZhYXJfZHZhYXJfYWEubTRhIiwiaWF0IjoxNzUxOTc3OTE5LCJleHAiOjE3Mjk3NTE5Nzc5MTl9.V_MTdFGeNqKrnhHODbHn99gLyyVBz8kU4aSqkSVp8Ys'
    },
    {
      id: '9',
      title: 'Radha Shringar - Lgaa Ke Aas Men Baitthaa Huun',
      artist: 'Pujya Prembhushan Ji Maharaj',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/shri_radha_shringar_lgaa_ke_aas_men_baitthaa_huun_aik_jmaane_se_.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzL3NocmlfcmFkaGFfc2hyaW5nYXJfbGdhYV9rZV9hYXNfbWVuX2JhaXR0aGFhX2h1dW5fYWlrX2ptYWFuZV9zZV8ubTRhIiwiaWF0IjoxNzUxOTc3OTMxLCJleHAiOjE3Mjk3NTE5Nzc5MzF9.jls008URE--T3R7LUWCOE0EwUYNw_f9KFY-qfy3iLRc'
    },
    {
      id: '10',
      title: 'Shri Ram ko Dekhkar',
      artist: 'Pujya Prembhushan Ji Maharaj',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/Pujya%20Prembhushanji%20Maharaj%20-%20Shri%20Ram%20ko%20Dekhkar.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzL1B1anlhIFByZW1iaHVzaGFuamkgTWFoYXJhaiAtIFNocmkgUmFtIGtvIERla2hrYXIubXAzIiwiaWF0IjoxNzUyMTUyNzQxLCJleHAiOjE3Mjk3NTIxNTI3NDF9.--LYJmuQmmMnM18HIdoYAjMW-dO4N8opePQxxGK8xNs'
    },
    {
      id: '11',
      title: 'Jo Prem Gali Me Aaye Nahi',
      artist: 'Pujya Rajan Jee',
      url: 'https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Bhajan%20Mandir/pujya_rajan_jee_jo_prem_glii_men_aaye_nhii_jo_prem_gali_me_aaye_.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvQmhhamFuIE1hbmRpci9wdWp5YV9yYWphbl9qZWVfam9fcHJlbV9nbGlpX21lbl9hYXllX25oaWlfam9fcHJlbV9nYWxpX21lX2FheWVfLm00YSIsImlhdCI6MTc1NDAyMjMzNiwiZXhwIjo2MDc0MDIyMzM2fQ.v9MeJi5r9wOe0YdIGZHTtT4RYBkxBL_2OP0hmZP2Hro'
    },
    {
      id: '12',
      title: 'Gaurav Gautam Bhajan',
      artist: 'Gaurav Gautam',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/Gaurav%20Gautam%20-.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzL0dhdXJhdiBHYXV0YW0gLS5tcDMiLCJpYXQiOjE3NTIxNTI2OTQsImV4cCI6MTcyOTc1MjE1MjY5NH0.DaHkf01QW4S5pKs3M-8dWpodYgbaNyUOKE-exllUdhY'
    },
    {
      id: '13',
      title: 'Pujya Rajan Ji Maharaj Bhajan',
      artist: 'Pujya Rajan Ji Maharaj',
      url: 'https://dvmcrhemxsogudfzxubo.supabase.co/storage/v1/object/sign/ssss/,,%20%20%20,Pujya%20Rajan%20Ji%20Maharaj.m4a?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85M2NkNzlmZS00Mjk4LTRiNDQtYjQwNS04Njk3OWMwN2Y5NzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3NzLywsICAgLFB1anlhIFJhamFuIEppIE1haGFyYWoubTRhIiwiaWF0IjoxNzUyMTUyNjg0LCJleHAiOjE3NDU1MjE1MjY4NH0.-6eKFx4fSBJWR9tfg9ksqanJNN_ehhx19SbQj5wi4pw'
    }
  ];

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'favorite_bhajans'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FavoriteBhajan));

      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (bhajan: Bhajan) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const existingFavorite = favorites.find(f => f.bhajan_id === bhajan.id);

      if (existingFavorite) {
        // Remove from favorites
        if (existingFavorite.id) {
          await deleteDoc(doc(db, 'favorite_bhajans', existingFavorite.id));
          setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        }
      } else {
        // Add to favorites
        const favorite: FavoriteBhajan = {
          user_id: user.uid,
          bhajan_id: bhajan.id,
          title: bhajan.title,
          artist: bhajan.artist,
          url: bhajan.url,
          created_at: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'favorite_bhajans'), favorite);
        setFavorites(prev => [{ ...favorite, id: docRef.id }, ...prev]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const playBhajan = (bhajan: Bhajan) => {
    if (currentBhajan?.id === bhajan.id) {
      togglePlayPause();
    } else {
      setCurrentBhajan(bhajan);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentBhajan) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentBhajan) return;
    const currentIndex = bhajans.findIndex(b => b.id === currentBhajan.id);
    const nextIndex = (currentIndex + 1) % bhajans.length;
    setCurrentBhajan(bhajans[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (!currentBhajan) return;
    const currentIndex = bhajans.findIndex(b => b.id === currentBhajan.id);
    const prevIndex = currentIndex === 0 ? bhajans.length - 1 : currentIndex - 1;
    setCurrentBhajan(bhajans[prevIndex]);
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

  const isFavorite = (bhajanId: string) => {
    return favorites.some(f => f.bhajan_id === bhajanId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <div className="text-amber-100 text-xl">Loading sacred bhajans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-amber-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-emerald-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🎵</span>
          </div>
          <h1 className="text-5xl font-bold text-amber-100 mb-4 font-display">🏛️ Bhajan Mandir</h1>
          <p className="text-xl text-amber-200/80 font-light">Digital Satsang Vault - Sacred Melodies for the Soul</p>
        </div>

        {/* Favorite Bhajans Section */}
        {favorites.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-amber-100 mb-6 text-center font-display">❤️ My Sacred Favorites</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => {
                const bhajan = bhajans.find(b => b.id === favorite.bhajan_id);
                if (!bhajan) return null;

                return (
                  <div
                    key={favorite.id}
                    className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-2xl p-6 border border-amber-300/20 hover:border-amber-300/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-300/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => playBhajan(bhajan)}
                        className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg group-hover:scale-110"
                        aria-label={`Play ${bhajan.title}`}
                      >
                        {currentBhajan?.id === bhajan.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleFavorite(bhajan)}
                        className="p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-5 h-5 text-red-400 fill-current" />
                      </button>
                    </div>

                    <h3 className="text-amber-100 font-semibold text-lg mb-2 leading-tight">{bhajan.title}</h3>
                    <p className="text-amber-200/70 text-sm">{bhajan.artist}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Bhajans Section */}
        <div className="mb-32">
          <h2 className="text-3xl font-bold text-amber-100 mb-8 text-center font-display">🎼 Sacred Collection</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bhajans.map((bhajan) => (
              <div
                key={bhajan.id}
                className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/30 hover:border-amber-300/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-300/10 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => playBhajan(bhajan)}
                    className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg group-hover:scale-110"
                    aria-label={`Play ${bhajan.title}`}
                  >
                    {currentBhajan?.id === bhajan.id && isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleFavorite(bhajan)}
                    className="p-3 rounded-full hover:bg-slate-700/50 transition-all duration-200"
                    aria-label={isFavorite(bhajan.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-6 h-6 transition-all duration-200 ${isFavorite(bhajan.id)
                      ? 'text-red-400 fill-current'
                      : 'text-slate-400 hover:text-red-400'
                      }`} />
                  </button>
                </div>

                <h3 className="text-amber-100 font-semibold text-lg mb-2 leading-tight">{bhajan.title}</h3>
                <p className="text-amber-200/70 text-sm">{bhajan.artist}</p>

                {currentBhajan?.id === bhajan.id && (
                  <div className="mt-4 pt-4 border-t border-slate-600/30">
                    <div className="text-xs text-emerald-300 font-medium">Now Playing</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audio Element */}
        {currentBhajan && (
          <audio
            ref={audioRef}
            src={currentBhajan.url}
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
                audioRef.current.volume = volume;
              }
            }}
          />
        )}

        {/* Fixed Bottom Player */}
        {currentBhajan && (
          <div className="fixed bottom-0 md:bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 to-indigo-900/95 backdrop-blur-lg border-t border-amber-300/20 p-4 z-50 pb-safe">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-amber-100 font-semibold truncate">{currentBhajan.title}</h4>
                  <p className="text-amber-200/70 text-sm truncate">{currentBhajan.artist}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={playPrevious}
                    className="p-2 text-amber-200 hover:text-amber-100 transition-colors"
                    aria-label="Previous bhajan"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg"
                    aria-label={isPlaying ? "Pause" : "Play"}
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
                    aria-label="Next bhajan"
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

export default BhajanMandir;