import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { Lock, Mail, Eye, EyeOff, Phone, Smartphone, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Recaptcha when switching to phone auth
    if (authMethod === 'phone' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            setError('Recaptcha expired. Please try again.');
          }
        });
        window.recaptchaVerifier.render();
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }
  }, [authMethod]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult);
      setPhoneStep('otp');
      alert('OTP sent to ' + phoneNumber);
    } catch (error: any) {
      console.error("SMS Error:", error);
      if (error.code === 'auth/billing-not-enabled') {
        setError('Phone auth requires Firebase Blaze plan. For development, use test phone numbers (Firebase Console > Auth > Sign-in method).');
      } else {
        setError(error.message || 'Failed to send SMS. Ensure phone number includes country code (e.g., +91...)');
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        // Re-init logic might be needed or page reload
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!verificationId || !otp) {
      setError("Invalid OTP or session expired");
      return;
    }

    try {
      await verificationId.confirm(otp);
      onAuthSuccess();
    } catch (error: any) {
      console.error("OTP Error:", error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Please check your inbox.');
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error("Password Reset Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center mandala-bg">
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

      <div className="spiritual-card p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 divine-glow relative z-10 glass-effect">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner">
            <span className="text-3xl filter drop-shadow-md">🕉️</span>
          </div>
          <h1 className="text-3xl font-bold text-amber-100 mb-2">Sadhna Space</h1>
          <p className="sacred-text text-lg text-amber-200/80">
            {isForgotPassword
              ? 'Reset your sacred key'
              : isSignUp
                ? 'Begin your sacred journey'
                : 'Enter your temple of transformation'}
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-slate-800 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mb-6 flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900/50 px-4 text-xs text-slate-400 uppercase tracking-widest backdrop-blur-sm">Or continue with</span>
          </div>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <div className="relative group">
                <Mail className="w-5 h-5 text-amber-200/70 absolute left-4 top-4 transition-colors group-focus-within:text-amber-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/40 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-slate-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        ) : (
          <>
            {/* Method Toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-white/10">
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMethod === 'email'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Mail className="w-4 h-4 inline-block mr-2" />
                Email
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMethod === 'phone'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Phone className="w-4 h-4 inline-block mr-2" />
                Phone
              </button>
            </div>

            {authMethod === 'email' ? (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-amber-200/70 absolute left-4 top-4 transition-colors group-focus-within:text-amber-400" />
                    <input
                      type="email"
                      placeholder="Sacred email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-900/40 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative group">
                    <Lock className="w-5 h-5 text-amber-200/70 absolute left-4 top-4 transition-colors group-focus-within:text-amber-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-slate-900/40 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-slate-500 hover:text-amber-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {!isSignUp && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-amber-200/60 hover:text-amber-200 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isSignUp ? 'Begin Journey' : 'Enter Space'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {phoneStep === 'input' ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="relative group">
                      <Smartphone className="w-5 h-5 text-amber-200/70 absolute left-4 top-4 transition-colors group-focus-within:text-amber-400" />
                      <input
                        type="tel"
                        placeholder="Phone Number (e.g., +91 9876543210)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/40 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-2 ml-1">Include country code (e.g. +1 or +91)</p>
                    </div>

                    <div id="recaptcha-container" className="flex justify-center my-4"></div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="relative group">
                      <Lock className="w-5 h-5 text-amber-200/70 absolute left-4 top-4 transition-colors group-focus-within:text-amber-400" />
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/40 text-amber-100 rounded-xl border border-slate-600/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Verify & Enter
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneStep('input')}
                      className="w-full text-slate-400 hover:text-white text-sm transition-colors pt-2"
                    >
                      Change Phone Number
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-200/80 hover:text-amber-100 font-medium transition-colors"
          >
            {isSignUp
              ? 'Already a seeker? Sign in'
              : 'New to the path? Begin journey'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-shake">
            <div className="min-w-[4px] h-full bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;