import React, { useState, useEffect } from 'react';
import { Scroll, Save, Edit3 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SpiritualOath as SpiritualOathType } from '../lib/types';

const SpiritualOath: React.FC = () => {
  const [oath, setOath] = useState<SpiritualOathType | null>(null);
  const [oathText, setOathText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultOathTemplate = `I, a divine soul on the path of self-mastery, solemnly vow before Krishna and my highest self:

🕉️ I commit to living with purity of mind, body, and spirit
🙏 I will channel my energy toward spiritual growth and service
💪 I choose discipline over momentary pleasure
🌟 I will remember my true nature as an eternal soul
📿 I will practice daily Naam Japa and meditation
🌱 I will treat my body as a sacred temple
✨ I will seek Krishna's guidance in moments of weakness
🎯 I will focus on my dharma and life's higher purpose

This oath is my sacred contract with my future self.

Signed with devotion and determination,
[Your Name]
Date: ${new Date().toLocaleDateString()}`;

  useEffect(() => {
    loadOath();
  }, []);

  const loadOath = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'spiritual_oath', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SpiritualOathType;
        setOath(data);
        setOathText(data.oath_text);
      } else {
        setOathText(defaultOathTemplate);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading spiritual oath:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOath = async () => {
    if (!oathText.trim()) {
      alert('Please write your sacred oath');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const oathData: SpiritualOathType = {
        user_id: user.uid,
        oath_text: oathText.trim(),
        signed_date: new Date().toISOString().split('T')[0]
      };

      await setDoc(doc(db, 'spiritual_oath', user.uid), oathData);

      setOath(oathData);
      setIsEditing(false);
      alert('🙏 Your sacred oath has been sealed with divine witness!');
    } catch (error) {
      console.error('Error saving spiritual oath:', error);
      alert('Error saving oath. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your sacred oath...</div>
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

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-full flex items-center justify-center">
            <Scroll className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">📜 Spiritual Oath</h1>
          <p className="sacred-text text-xl">Your sacred contract with your highest self</p>
        </div>

        {/* Sacred Oath Display/Editor */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 divine-glow border-2 border-amber-300/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-100 mb-3">⚡ Sacred Vow of Self-Mastery ⚡</h2>
            <div className="text-6xl mb-4">🕉️</div>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <textarea
                value={oathText}
                onChange={(e) => setOathText(e.target.value)}
                className="w-full h-96 p-6 bg-slate-800/50 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20 resize-none transition-all font-medium leading-relaxed"
                placeholder="Write your sacred oath..."
              />

              <div className="flex justify-center space-x-4">
                <button
                  onClick={saveOath}
                  disabled={saving}
                  className="sacred-button text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center disabled:opacity-50"
                >
                  <Save className="w-6 h-6 mr-3" />
                  {saving ? 'Sealing Sacred Oath...' : 'Seal Sacred Oath'}
                </button>

                {oath && (
                  <button
                    onClick={() => {
                      setOathText(oath.oath_text);
                      setIsEditing(false);
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-700/30 rounded-xl p-6 border border-amber-300/30">
                <pre className="text-amber-100 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                  {oathText}
                </pre>
              </div>

              {oath && (
                <div className="text-center">
                  <div className="bg-emerald-600/20 rounded-xl p-4 border border-emerald-400/50 mb-6">
                    <p className="text-emerald-200 font-semibold">
                      ✨ Oath Sealed on: {new Date(oath.signed_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600/80 hover:bg-blue-700/80 text-amber-100 font-semibold py-3 px-6 rounded-xl transition-all flex items-center mx-auto"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Revise Sacred Oath
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Oath Guidance */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">🌟 Guidance for Your Sacred Oath</h3>

          <div className="space-y-4 sacred-text">
            <div className="flex items-start">
              <span className="text-2xl mr-4">💫</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Make it Personal</h4>
                <p>Write in your own words what self-mastery means to you. Include your specific challenges and aspirations.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">🎯</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Be Specific</h4>
                <p>Include concrete practices like daily meditation time, Naam Japa rounds, or study commitments.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">🔥</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Invoke Divine Witness</h4>
                <p>Call upon Krishna, your Guru, or the Divine as witness to your commitment.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">📅</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Review Regularly</h4>
                <p>Read your oath daily, especially during moments of weakness or temptation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritualOath;