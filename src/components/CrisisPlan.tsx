import React, { useState, useEffect } from 'react';
import { Shield, Save, Edit3, X } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { CrisisPlan as CrisisPlanType } from '../lib/types';

const CrisisPlan: React.FC = () => {
  const [crisisPlan, setCrisisPlan] = useState<CrisisPlanType | null>(null);
  const [triggers, setTriggers] = useState<string[]>(['']);
  const [emergencyActions, setEmergencyActions] = useState<string[]>(['']);
  const [motivations, setMotivations] = useState<string[]>(['']);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultTriggers = [
    'Late night browsing',
    'Stress and anxiety',
    'Loneliness',
    'Boredom',
    'Social media',
    'Certain locations',
    'Specific times of day',
    'Emotional distress'
  ];

  const defaultActions = [
    'Start 108 rounds of Naam Japa immediately',
    'Call a spiritual friend or mentor',
    'Take a cold shower',
    'Go for a walk in nature',
    'Read Bhagavad Gita verses',
    'Listen to Premanand Maharaj discourse',
    'Practice pranayama breathing',
    'Write in gratitude journal'
  ];

  const defaultMotivations = [
    'I am seeking permanent happiness, not temporary pleasure',
    'My future self will thank me for this choice',
    'Krishna is watching and guiding me',
    'I am stronger than any urge',
    'This moment of discipline builds my spiritual strength',
    'I choose the path of the soul over the body',
    'My purity is my greatest treasure',
    'I am becoming the person I was meant to be'
  ];

  useEffect(() => {
    loadCrisisPlan();
  }, []);

  const loadCrisisPlan = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'crisis_plan', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CrisisPlanType;
        setCrisisPlan(data);
        setTriggers(data.triggers);
        setEmergencyActions(data.emergency_actions);
        setMotivations(data.motivations);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading crisis plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCrisisPlan = async () => {
    const filteredTriggers = triggers.filter(t => t.trim());
    const filteredActions = emergencyActions.filter(a => a.trim());
    const filteredMotivations = motivations.filter(m => m.trim());

    if (filteredTriggers.length === 0 || filteredActions.length === 0 || filteredMotivations.length === 0) {
      alert('Please add at least one item in each section');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const planData: CrisisPlanType = {
        user_id: user.uid,
        triggers: filteredTriggers,
        emergency_actions: filteredActions,
        motivations: filteredMotivations,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'crisis_plan', user.uid), planData);

      setCrisisPlan(planData);
      setIsEditing(false);
      alert('🛡️ Your crisis plan has been saved! This is your shield in moments of weakness.');
    } catch (error) {
      console.error('Error saving crisis plan:', error);
      alert('Error saving crisis plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'triggers' | 'actions' | 'motivations') => {
    if (type === 'triggers') {
      setTriggers([...triggers, '']);
    } else if (type === 'actions') {
      setEmergencyActions([...emergencyActions, '']);
    } else {
      setMotivations([...motivations, '']);
    }
  };

  const updateItem = (type: 'triggers' | 'actions' | 'motivations', index: number, value: string) => {
    if (type === 'triggers') {
      const newTriggers = [...triggers];
      newTriggers[index] = value;
      setTriggers(newTriggers);
    } else if (type === 'actions') {
      const newActions = [...emergencyActions];
      newActions[index] = value;
      setEmergencyActions(newActions);
    } else {
      const newMotivations = [...motivations];
      newMotivations[index] = value;
      setMotivations(newMotivations);
    }
  };

  const removeItem = (type: 'triggers' | 'actions' | 'motivations', index: number) => {
    if (type === 'triggers') {
      setTriggers(triggers.filter((_, i) => i !== index));
    } else if (type === 'actions') {
      setEmergencyActions(emergencyActions.filter((_, i) => i !== index));
    } else {
      setMotivations(motivations.filter((_, i) => i !== index));
    }
  };

  const addSuggestion = (type: 'triggers' | 'actions' | 'motivations', suggestion: string) => {
    if (type === 'triggers' && !triggers.includes(suggestion)) {
      setTriggers([...triggers.filter(t => t.trim()), suggestion]);
    } else if (type === 'actions' && !emergencyActions.includes(suggestion)) {
      setEmergencyActions([...emergencyActions.filter(a => a.trim()), suggestion]);
    } else if (type === 'motivations' && !motivations.includes(suggestion)) {
      setMotivations([...motivations.filter(m => m.trim()), suggestion]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center text-amber-100">Loading your crisis plan...</div>
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-200 to-red-400 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-indigo-900" />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 mb-4">🛡️ Crisis Plan</h1>
          <p className="sacred-text text-xl">Your personalized shield against spiritual weakness</p>
        </div>

        {/* Crisis Plan Display/Editor */}
        <div className="spiritual-gradient rounded-2xl p-8 mb-8 divine-glow border-2 border-red-300/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-amber-100 mb-3">⚡ Emergency Spiritual Protocol ⚡</h2>
            <p className="sacred-text">When urges arise, follow this sacred plan</p>
          </div>

          {isEditing ? (
            <div className="space-y-8">
              {/* Triggers Section */}
              <div>
                <h3 className="text-xl font-bold text-red-300 mb-4">🚨 My Triggers (Know Your Enemy)</h3>
                <div className="space-y-3">
                  {triggers.map((trigger, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={trigger}
                        onChange={(e) => updateItem('triggers', index, e.target.value)}
                        className="flex-1 p-3 bg-slate-800/50 text-amber-100 rounded-lg border border-slate-600/50 focus:border-amber-300 focus:outline-none transition-all"
                        placeholder="What triggers your urges?"
                      />
                      <button
                        onClick={() => removeItem('triggers', index)}
                        className="p-3 text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem('triggers')}
                    className="w-full p-3 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-amber-300 hover:text-amber-300 transition-all"
                  >
                    + Add Trigger
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-amber-200 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultTriggers.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => addSuggestion('triggers', suggestion)}
                        className="px-3 py-1 bg-slate-700/50 text-amber-200 rounded-full text-sm hover:bg-slate-600/50 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Actions Section */}
              <div>
                <h3 className="text-xl font-bold text-emerald-300 mb-4">⚡ Emergency Actions (Your Weapons)</h3>
                <div className="space-y-3">
                  {emergencyActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={action}
                        onChange={(e) => updateItem('actions', index, e.target.value)}
                        className="flex-1 p-3 bg-slate-800/50 text-amber-100 rounded-lg border border-slate-600/50 focus:border-amber-300 focus:outline-none transition-all"
                        placeholder="What will you do immediately?"
                      />
                      <button
                        onClick={() => removeItem('actions', index)}
                        className="p-3 text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem('actions')}
                    className="w-full p-3 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-amber-300 hover:text-amber-300 transition-all"
                  >
                    + Add Action
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-amber-200 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultActions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => addSuggestion('actions', suggestion)}
                        className="px-3 py-1 bg-slate-700/50 text-amber-200 rounded-full text-sm hover:bg-slate-600/50 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Motivations Section */}
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-4">💪 Sacred Motivations (Your Why)</h3>
                <div className="space-y-3">
                  {motivations.map((motivation, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={motivation}
                        onChange={(e) => updateItem('motivations', index, e.target.value)}
                        className="flex-1 p-3 bg-slate-800/50 text-amber-100 rounded-lg border border-slate-600/50 focus:border-amber-300 focus:outline-none transition-all"
                        placeholder="Why do you choose purity?"
                      />
                      <button
                        onClick={() => removeItem('motivations', index)}
                        className="p-3 text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem('motivations')}
                    className="w-full p-3 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-amber-300 hover:text-amber-300 transition-all"
                  >
                    + Add Motivation
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-amber-200 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultMotivations.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => addSuggestion('motivations', suggestion)}
                        className="px-3 py-1 bg-slate-700/50 text-amber-200 rounded-full text-sm hover:bg-slate-600/50 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={saveCrisisPlan}
                  disabled={saving}
                  className="sacred-button text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all flex items-center disabled:opacity-50"
                >
                  <Save className="w-6 h-6 mr-3" />
                  {saving ? 'Saving Crisis Plan...' : 'Save Crisis Plan'}
                </button>

                {crisisPlan && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-amber-100 font-semibold py-4 px-8 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Display Crisis Plan */}
              <div className="bg-red-900/20 rounded-xl p-6 border border-red-400/50">
                <h3 className="text-xl font-bold text-red-300 mb-4">🚨 My Triggers</h3>
                <ul className="space-y-2">
                  {triggers.filter(t => t.trim()).map((trigger, index) => (
                    <li key={index} className="text-amber-100 flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-400/50">
                <h3 className="text-xl font-bold text-emerald-300 mb-4">⚡ Emergency Actions</h3>
                <ol className="space-y-2">
                  {emergencyActions.filter(a => a.trim()).map((action, index) => (
                    <li key={index} className="text-amber-100 flex items-center">
                      <span className="w-6 h-6 bg-emerald-600 text-white rounded-full mr-3 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-400/50">
                <h3 className="text-xl font-bold text-amber-300 mb-4">💪 Sacred Motivations</h3>
                <ul className="space-y-2">
                  {motivations.filter(m => m.trim()).map((motivation, index) => (
                    <li key={index} className="text-amber-100 flex items-center">
                      <span className="text-amber-400 mr-3">✨</span>
                      {motivation}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600/80 hover:bg-blue-700/80 text-amber-100 font-semibold py-3 px-6 rounded-xl transition-all flex items-center mx-auto"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Crisis Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="spiritual-card rounded-2xl p-8 divine-glow">
          <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">🎯 How to Use Your Crisis Plan</h3>

          <div className="space-y-4 sacred-text">
            <div className="flex items-start">
              <span className="text-2xl mr-4">1️⃣</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Recognize the Trigger</h4>
                <p>When you notice one of your triggers, immediately acknowledge it without judgment.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">2️⃣</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Execute Emergency Actions</h4>
                <p>Follow your emergency actions in order. Don't think, just act with discipline.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">3️⃣</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Remember Your Why</h4>
                <p>Read your motivations aloud. Connect with your deeper purpose and spiritual goals.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">4️⃣</span>
              <div>
                <h4 className="font-semibold text-amber-100 mb-2">Stay Connected</h4>
                <p>Return to this plan regularly. Update it as you grow and learn about yourself.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisPlan;