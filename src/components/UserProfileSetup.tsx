import React, { useState, useEffect } from 'react';
import { User, Save, Camera, Loader } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserProfileSetupProps {
  onProfileCreated: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ onProfileCreated }) => {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Profile exists, proceed to app
        onProfileCreated();
      } else {
        // Set default username from email
        const defaultUsername = user.email?.split('@')[0] || `Seeker${Date.now()}`;
        setUsername(defaultUsername);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setChecking(false);
    }
  };

  const createProfile = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Calculate initial spiritual score - For migration, we assume 0 or need to query collections if they exist
      // Since we are migrating, we might want to just start fresh or query new collections if we migrated data
      // For now, let's keep it simple and set to 0 or migrating from existing if possible
      // But since we are moving away from Supabase, we can't query Supabase here anymore.

      const spiritualScore = 0; // Reset score for new system or implement detailed migration later if needed

      const profile: UserProfile = {
        id: user.uid,
        username: username.trim(),
        avatar_url: avatarUrl.trim() || null,
        spiritual_score: spiritualScore,
        last_score_update: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile);

      onProfileCreated();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      alert('Error creating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Loader className="w-16 h-16 text-amber-500 animate-spin mb-4" />
          <div className="text-amber-100 text-xl">Preparing your spiritual profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg flex items-center justify-center">
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

      <div className="spiritual-card p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 divine-glow relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20">
            <img
              src="https://ukplaspnsoylpkoryjzr.supabase.co/storage/v1/object/sign/sss/Elegant%20Lotus%20and%20Sadhna%20Space%20Logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lZTY0MWZkYy02YzMxLTQ5M2QtOWUwMy1mNzY4OTFhNzU1YmEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzc3MvRWxlZ2FudCBMb3R1cyBhbmQgU2FkaG5hIFNwYWNlIExvZ28ucG5nIiwiaWF0IjoxNzU0MDIzMDkwLCJleHAiOjQzMzc1NDAyMzA5MH0.jpBGcjAd6WBS2Dn_ryaDvSinAFA5CG9PSTOhR7-A5ZU"
              alt="Sadhna Space Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-amber-100 mb-3">Complete Your Spiritual Profile</h1>
          <p className="sacred-text text-lg">Join the community of spiritual seekers</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-amber-100 font-medium mb-3">Choose Your Spiritual Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-amber-200 absolute left-4 top-4" />
              <input
                type="text"
                placeholder="e.g., DevotedSeeker, LotusHeart, etc."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
                required
                maxLength={20}
              />
            </div>
            <p className="text-amber-200/60 text-sm mt-2">
              This name will appear on the spiritual leaderboard
            </p>
          </div>

          <div>
            <label className="block text-amber-100 font-medium mb-3">Avatar URL (Optional)</label>
            <div className="relative">
              <Camera className="w-5 h-5 text-amber-200 absolute left-4 top-4" />
              <input
                type="url"
                placeholder="https://example.com/your-avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 transition-all"
              />
            </div>
            <p className="text-amber-200/60 text-sm mt-2">
              Leave empty to use the default lotus icon
            </p>
          </div>

          <button
            onClick={createProfile}
            disabled={loading || !username.trim()}
            className="w-full sacred-button text-amber-100 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            <Save className="w-6 h-6 mr-3" />
            {loading ? 'Creating spiritual profile...' : 'Enter Sacred Community'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-amber-300/60 text-sm">
            Your spiritual journey will be tracked and celebrated with fellow seekers
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSetup;