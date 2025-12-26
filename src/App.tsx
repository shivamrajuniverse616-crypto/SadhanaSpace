import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import EmergencyMode from './components/EmergencyMode';
import Progress from './components/Progress';
import Goals from './components/Goals';
import GratitudeJournal from './components/GratitudeJournal';
import MeditationTimer from './components/MeditationTimer';
import FocusBoard from './components/FocusBoard';
import JapaCounter from './components/JapaCounter';
import SpiritualOath from './components/SpiritualOath';
import MoodTracker from './components/MoodTracker';
import WisdomVault from './components/WisdomVault';
import FastingLog from './components/FastingLog';
import CrisisPlan from './components/CrisisPlan';
import RoutineTracker from './components/RoutineTracker';
import NatureWalkLog from './components/NatureWalkLog';
import BlessingsLog from './components/BlessingsLog';
import FocusTimer from './components/FocusTimer';
import BhajanMandir from './components/BhajanMandir';
import GitaAI from './components/GitaAI';
import Navigation from './components/Navigation';
import UserProfileSetup from './components/UserProfileSetup';
import LoadingSpinner from './components/LoadingSpinner';
import Leaderboard from './components/Leaderboard';
import GuidedMeditationPlayer from './components/GuidedMeditationPlayer';
import PersonalSadhnaJournal from './components/PersonalSadhnaJournal';
import BhagavadGitaDailyDose from './components/BhagavadGitaDailyDose';
import OfflineJapaCounter from './components/OfflineJapaCounter';
import SankalpTracker from './components/SankalpTracker';
import SpiritualGuide from './components/SpiritualGuide';
import AdminFix from './components/AdminFix';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkUserProfile(user.uid);
      } else {
        setProfileComplete(false);
        setCheckingProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string) => {
    try {
      // Check if user profile exists in Firestore 'users' collection
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      setProfileComplete(userSnap.exists());
    } catch (error) {
      console.error('Error checking user profile:', error);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleAuthSuccess = () => {
    // User state will be updated by the auth listener
  };

  const handleLogout = async () => {
    await auth.signOut();
    setProfileComplete(false);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Awakening your Inner Sanctum..." />;
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🪷</div>
          <div className="text-amber-100 text-xl">Preparing your spiritual journey...</div>
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    return <UserProfileSetup onProfileCreated={() => setProfileComplete(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navigation onLogout={handleLogout} />
        <main className="pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* ... other routes ... */}
            <Route path="/journal" element={<Journal />} />
            <Route path="/emergency" element={<EmergencyMode />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/gratitude" element={<GratitudeJournal />} />
            <Route path="/meditation" element={<MeditationTimer />} />
            <Route path="/focus-board" element={<FocusBoard />} />
            <Route path="/japa" element={<JapaCounter />} />
            <Route path="/oath" element={<SpiritualOath />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/wisdom" element={<WisdomVault />} />
            <Route path="/fasting" element={<FastingLog />} />
            <Route path="/crisis-plan" element={<CrisisPlan />} />
            <Route path="/routine" element={<RoutineTracker />} />
            <Route path="/nature" element={<NatureWalkLog />} />
            <Route path="/blessings" element={<BlessingsLog />} />
            <Route path="/focus-timer" element={<FocusTimer />} />
            <Route path="/bhajan-mandir" element={<BhajanMandir />} />
            <Route path="/gita-ai" element={<GitaAI />} />
            <Route path="/guided-meditation" element={<GuidedMeditationPlayer />} />
            <Route path="/sadhna-journal" element={<PersonalSadhnaJournal />} />
            <Route path="/gita-daily" element={<BhagavadGitaDailyDose />} />
            <Route path="/offline-japa" element={<OfflineJapaCounter />} />
            <Route path="/sankalp" element={<SankalpTracker />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/guide" element={<SpiritualGuide />} />
            <Route path="/admin-fix" element={<AdminFix />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;