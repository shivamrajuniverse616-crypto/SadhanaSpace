import React, { useState, useEffect } from 'react';
import { Heart, RotateCcw, Wifi, WifiOff, Upload } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

interface OfflineJapaData {
  date: string;
  count: number;
  mantra_type: string;
  timestamp: number;
  synced: boolean;
}

const OfflineJapaCounter: React.FC = () => {
  const [todayCount, setTodayCount] = useState<{ count: number; last_reset: string }>({
    count: 0,
    last_reset: new Date().toISOString().split('T')[0]
  });
  const [offlineData, setOfflineData] = useState<OfflineJapaData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [mantraType, setMantraType] = useState('Hare Krishna');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const mantras = [
    'Hare Krishna',
    'Om Namah Shivaya',
    'Om Namo Bhagavate Vasudevaya',
    'Gayatri Mantra',
    'Sri Ram Jai Ram'
  ];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const user = auth.currentUser;

      // Load from LocalStorage first (source of truth for offline-first app)
      const userId = user ? user.uid : 'guest';
      const offlineKey = `offline_japa_${userId}`;
      const savedData = localStorage.getItem(offlineKey);

      if (savedData) {
        const offlineEntries: OfflineJapaData[] = JSON.parse(savedData);
        setOfflineData(offlineEntries);
        const pending = offlineEntries.filter(e => !e.synced).length;
        setPendingSyncCount(pending);
      }

      // Load today's count from LocalStorage
      const savedToday = localStorage.getItem('japa_today');
      const today = new Date().toISOString().split('T')[0];

      if (savedToday) {
        const parsed = JSON.parse(savedToday);
        if (parsed.last_reset === today) {
          setTodayCount(parsed);
        } else {
          // Reset if new day
          const resetData = { count: 0, last_reset: today };
          setTodayCount(resetData);
          localStorage.setItem('japa_today', JSON.stringify(resetData));
        }
      }

      // Check last sync
      const lastSync = localStorage.getItem(`last_sync_${userId}`);
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }

      // Attempt background sync if online
      if (navigator.onLine && user) {
        syncPendingData();
      }

    } catch (error) {
      console.error('Error loading japa data:', error);
    }
  };

  const syncToFirestore = async (entry: OfflineJapaData) => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // 1. Add log entry
      const logData = {
        user_id: user.uid,
        count: entry.count,
        date: entry.date,
        timestamp: new Date(entry.timestamp).toISOString(),
        source: 'offline_sync',
        mantra_type: entry.mantra_type
      };

      await addDoc(collection(db, 'japa_logs'), logData);

      // 2. Update Daily Count
      const q = query(
        collection(db, 'japa_counter'),
        where('user_id', '==', user.uid),
        where('date', '==', entry.date)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, 'japa_counter', snapshot.docs[0].id);
        const currentTotal = snapshot.docs[0].data().japa_count || 0;
        await updateDoc(docRef, { japa_count: currentTotal + entry.count });
      } else {
        await addDoc(collection(db, 'japa_counter'), {
          user_id: user.uid,
          date: entry.date,
          japa_count: entry.count,
          mantra_type: entry.mantra_type,
          created_at: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error syncing entry:', error);
      return false;
    }
  };

  const syncPendingData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const offlineKey = `offline_japa_${user.uid}`;
      const savedData = localStorage.getItem(offlineKey);

      if (savedData) {
        const offlineEntries: OfflineJapaData[] = JSON.parse(savedData);
        const pendingEntries = offlineEntries.filter(e => !e.synced);
        let syncedCount = 0;

        for (const entry of pendingEntries) {
          const success = await syncToFirestore(entry);
          if (success) {
            entry.synced = true;
            syncedCount++;
          }
        }

        if (syncedCount > 0) {
          localStorage.setItem(offlineKey, JSON.stringify(offlineEntries));
          setOfflineData([...offlineEntries]);
          setPendingSyncCount(prev => Math.max(0, prev - syncedCount));
          setLastSyncTime(new Date());
          localStorage.setItem(`last_sync_${user.uid}`, new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Error syncing pending data:', error);
    }
  };

  const incrementCount = () => {
    const newCount = todayCount.count + 1;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Update State
    const newData = { count: newCount, last_reset: today };
    setTodayCount(newData);

    // Save to LocalStorage
    localStorage.setItem('japa_today', JSON.stringify(newData));

    // Add to offline log
    const user = auth.currentUser;
    const userId = user ? user.uid : 'guest';

    const entry: OfflineJapaData = {
      date: today,
      count: 1,
      mantra_type: mantraType,
      timestamp: now.getTime(),
      synced: false
    };

    const offlineKey = `offline_japa_${userId}`;
    const entries = [...offlineData, entry];
    setOfflineData(entries);
    setPendingSyncCount(prev => prev + 1);
    localStorage.setItem(offlineKey, JSON.stringify(entries));

    // Try immediate sync if online & logged in
    if (navigator.onLine && user) {
      syncToFirestore(entry).then(success => {
        if (success) {
          entry.synced = true;
          // Update storage with synced status
          const updatedEntries = entries.map(e => e.timestamp === entry.timestamp ? entry : e);
          localStorage.setItem(offlineKey, JSON.stringify(updatedEntries));
          setOfflineData(updatedEntries);
          setPendingSyncCount(prev => Math.max(0, prev - 1));
          setLastSyncTime(new Date());
          localStorage.setItem(`last_sync_${user.uid}`, new Date().toISOString());
        }
      });
    }
  };

  const manualSync = async () => {
    if (!navigator.onLine) {
      alert('You are offline. Please connect to the internet to sync.');
      return;
    }

    setIsSyncing(true);
    await syncPendingData();
    setIsSyncing(false);
    alert('Sync process completed.');
  };

  const resetTodayCount = () => {
    if (!confirm('Reset today\'s japa count?')) return;

    const today = new Date().toISOString().split('T')[0];
    const newData = { count: 0, last_reset: today };
    setTodayCount(newData);
    localStorage.setItem('japa_today', JSON.stringify(newData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg">
      <div className="container mx-auto px-4 py-8 max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg relative">
            <Heart className="w-10 h-10 text-white animate-pulse" fill="white" />
            <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`}>
              {isOnline ? <Wifi className="w-3 h-3 text-white" /> : <WifiOff className="w-3 h-3 text-white" />}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-amber-100">Japa Counter</h1>
          <p className="text-amber-200/70">Chant & Be Happy</p>
        </div>

        {/* Counter Card */}
        <div className="spiritual-card rounded-2xl p-8 mb-6 text-center divine-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-purple-500/10 pointer-events-none"></div>

          <div className="mb-6">
            <h2 className="text-7xl font-bold text-amber-100 japa-glow transition-all duration-200" style={{ transform: 'scale(1)' }}>
              {todayCount.count}
            </h2>
            <p className="text-purple-300 font-medium mt-2">Today's Sacred Chants</p>
          </div>

          <button
            onClick={incrementCount}
            className="w-full bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transform active:scale-95 transition-all duration-100 flex items-center justify-center text-lg mb-6"
          >
            <Heart className="w-6 h-6 mr-3 fill-current animate-bounce-slight" />
            Chant One Bead
          </button>

          <div className="flex justify-between items-center text-sm">
            <button onClick={resetTodayCount} className="text-slate-400 hover:text-white flex items-center transition-colors">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </button>

            <div className="text-slate-400">
              {mantraType}
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${pendingSyncCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-amber-100 text-sm font-medium">
                {pendingSyncCount > 0 ? `${pendingSyncCount} unsynced chants` : 'All synced'}
              </span>
            </div>

            {lastSyncTime && (
              <span className="text-xs text-slate-400">
                Last sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {pendingSyncCount > 0 && (
            <button
              onClick={manualSync}
              disabled={isSyncing || !isOnline}
              className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${isSyncing || !isOnline
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
            >
              {isSyncing ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Sync Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Mantra Selector */}
        <div className="mt-6">
          <h3 className="text-amber-100 font-medium mb-3 text-center text-sm uppercase tracking-wider">Select Mantra</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {mantras.map(m => (
              <button
                key={m}
                onClick={() => setMantraType(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mantraType === m
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
              >
                {m}
              </button>
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
        
        .animate-bounce-slight {
            animation: bounce-slight 2s infinite;
        }
        
        @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default OfflineJapaCounter;