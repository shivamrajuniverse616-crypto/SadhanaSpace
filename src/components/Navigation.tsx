import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, User, LogOut, Menu, X, Book, Heart, Users, Calendar, Activity, Shield, Feather, Music, Volume2, Sparkles, Compass, Target } from 'lucide-react';

interface NavigationProps {
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems = [
    { path: '/', label: 'Sanctum', icon: <Home className="w-5 h-5" /> },
    { path: '/focus-board', label: 'Focus', icon: <Target className="w-5 h-5" /> },
    { path: '/gita-ai', label: 'Gita AI', icon: <Sparkles className="w-5 h-5" /> },
    { path: '/leaderboard', label: 'Rankings', icon: <Users className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { path: '/emergency', label: 'Stillness', icon: <Shield className="w-5 h-5" /> },
  ];

  const allNavItems = [
    { path: '/', label: 'Sanctum', icon: <Home className="w-6 h-6" />, desc: 'Sacred Dashboard' },
    { path: '/focus-board', label: 'Focus', icon: <Target className="w-6 h-6" />, desc: 'Sacred Tasks' },
    { path: '/gita-ai', label: 'Gita AI', icon: <Sparkles className="w-6 h-6" />, desc: 'Krishna\'s Wisdom' },
    { path: '/gita-daily', label: 'My Gita', icon: <Book className="w-6 h-6" />, desc: 'Daily Gita Study' },
    { path: '/emergency', label: 'Stillness', icon: <Shield className="w-6 h-6" />, desc: 'Emergency Mode' },
    { path: '/journal', label: 'Mirror', icon: <Feather className="w-6 h-6" />, desc: 'Self Reflection' },
    { path: '/sadhna-journal', label: 'Sādhanā', icon: <Book className="w-6 h-6" />, desc: 'Personal Journal' },
    { path: '/gratitude', label: 'Gratitude', icon: <Heart className="w-6 h-6" />, desc: 'Blessing Journal' },
    { path: '/meditation', label: 'Dhyana', icon: <Activity className="w-6 h-6" />, desc: 'Meditation Timer' },
    { path: '/guided-meditation', label: 'Guided', icon: <Volume2 className="w-6 h-6" />, desc: 'Audio Meditations' },
    { path: '/japa', label: 'Japa', icon: <Activity className="w-6 h-6" />, desc: 'Mantra Counter' }, // reused Activity or simpler
    { path: '/offline-japa', label: 'Offline Japa', icon: <Activity className="w-6 h-6" />, desc: 'Offline Counter' },
    { path: '/sankalp', label: 'Sankalp', icon: <Target className="w-6 h-6" />, desc: 'Sacred Vows' },
    { path: '/oath', label: 'Oath', icon: <Feather className="w-6 h-6" />, desc: 'Sacred Vow' },
    { path: '/mood', label: 'Mood', icon: <Activity className="w-6 h-6" />, desc: 'Emotional Log' },
    { path: '/wisdom', label: 'Wisdom', icon: <Book className="w-6 h-6" />, desc: 'Satsang Vault' },
    { path: '/fasting', label: 'Tapasya', icon: <Activity className="w-6 h-6" />, desc: 'Fasting Log' },
    { path: '/crisis-plan', label: 'Crisis', icon: <Shield className="w-6 h-6" />, desc: 'Emergency Plan' },
    { path: '/routine', label: 'Sādhanā', icon: <Calendar className="w-6 h-6" />, desc: 'Daily Routine' },
    { path: '/nature', label: 'Nature', icon: <Feather className="w-6 h-6" />, desc: 'Nature Walks' },
    { path: '/blessings', label: 'Blessings', icon: <Heart className="w-6 h-6" />, desc: 'Divine Grace' },
    { path: '/focus-timer', label: 'Karma', icon: <Target className="w-6 h-6" />, desc: 'Focus Timer' },
    { path: '/goals', label: 'Dharma', icon: <Target className="w-6 h-6" />, desc: 'Sacred Goals' },
    { path: '/progress', label: 'Progress', icon: <Activity className="w-6 h-6" />, desc: 'Journey Path' },
    { path: '/bhajan-mandir', label: 'Bhajan Mandir', icon: <Music className="w-6 h-6" />, desc: 'Sacred Music' },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Users className="w-6 h-6" />, desc: 'Spiritual Rankings' },
    { path: '/profile', label: 'My Journey', icon: <User className="w-6 h-6" />, desc: 'Detailed Statistics' },
    { path: '/guide', label: 'Guide', icon: <Book className="w-6 h-6" />, desc: 'Manual & Scoring' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Top Navigation - Floating Glass */}
      <nav
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
          ? 'bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl py-3'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-purple-500/20 backdrop-blur-sm border border-white/10 group-hover:border-amber-400/50 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] overflow-hidden">
                <img src="/logo.png" alt="Sadhna Space Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-amber-100 font-bold text-lg tracking-wide group-hover:text-amber-50 transition-colors">Sadhna Space</h1>
                <p className="text-amber-200/60 text-[10px] uppercase tracking-[0.2em] group-hover:text-amber-200/80 transition-colors">Digital Temple</p>
              </div>
            </Link>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1 lg:space-x-2 bg-slate-800/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-lg">
              {mainNavItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive(path)
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className={`text-base lg:text-lg transition-transform duration-300 ${isActive(path) ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
                  <span className="font-medium text-sm">{label}</span>
                  {isActive(path) && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse-slow rounded-xl"></div>
                  )}
                </Link>
              ))}

              <div className="w-px h-6 bg-white/10 mx-2"></div>

              <button
                onClick={() => setMenuOpen(true)}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span className="font-medium text-sm">Explore</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Glass Island */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex justify-around items-center">
          {mainNavItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all relative ${isActive(path)
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg -translate-y-2'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <span className="text-xl">{icon}</span>
              {isActive(path) && (
                <span className="absolute -bottom-6 text-[10px] font-medium text-amber-100/80 tracking-wide animate-fade-in">{label}</span>
              )}
            </Link>
          ))}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay - Premium Backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"
            onClick={() => setMenuOpen(false)}
          ></div>

          <div className="relative z-10 flex flex-col h-full overflow-hidden">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-500/30 overflow-hidden">
                  <img src="/logo.png" alt="Sadhna Space Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-amber-100 font-bold text-xl">Sanctum Menu</h2>
                  <p className="text-amber-200/50 text-xs uppercase tracking-wider">Navigate your path</p>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full bg-white/5 text-amber-100 hover:bg-white/10 transition-all border border-white/5 hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {allNavItems.map(({ path, label, icon, desc }, index) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className="group"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <div className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-br from-amber-900/40 to-slate-900/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-amber-500/30'
                        }`}>

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isActive ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                          {icon}
                        </div>

                        <div className="flex-1 min-w-0 z-10">
                          <div className={`font-semibold text-lg ${isActive ? 'text-amber-200' : 'text-slate-200 group-hover:text-amber-100'}`}>{label}</div>
                          <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate">{desc}</div>
                        </div>

                        {isActive && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500"></div>
                        )}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Logout Button */}
              <div className="max-w-4xl mx-auto mt-8 border-t border-white/10 pt-6">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-500/30 text-red-200 hover:from-red-900/60 hover:to-red-800/60 transition-all group"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">Exit Sacred Space</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacers to prevent content overlap */}
      <div className="hidden md:block h-24"></div> {/* For fixed desktop header */}
      <div className="md:hidden h-0"></div> {/* Mobile nav is floating */}
    </>
  );
};

export default Navigation;