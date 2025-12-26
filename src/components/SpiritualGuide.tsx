import React from 'react';
import { Book, Star, Activity, Heart, Shield, Target, Award, Info, Code } from 'lucide-react';

const SpiritualGuide: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 mandala-bg pb-20">
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
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400/20 to-purple-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                        <Book className="w-10 h-10 text-amber-200" />
                    </div>
                    <h1 className="text-4xl font-bold text-amber-100 mb-4">Spiritual Guide</h1>
                    <p className="text-xl text-amber-200/80 font-light max-w-2xl mx-auto">
                        Understanding your journey, the sacred scoring system, and how to use Sadhna Space to deepen your practice.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Scoring System Section */}
                    <div className="spiritual-card p-8 rounded-2xl divine-glow md:col-span-2">
                        <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center">
                            <Star className="w-6 h-6 mr-3 text-yellow-400" />
                            The Sacred Scoring System
                        </h2>
                        <p className="text-slate-300 mb-6">
                            Your Spiritual Score is a reflection of your dedication to various practices. It is calculated automatically to track your growth and is used for your Lotus Level and Leaderboard ranking.
                        </p>

                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { activity: "Naam Japa", points: "1 Point", unit: "per mantra", icon: <Activity className="w-5 h-5 text-rose-400" /> },
                                { activity: "Meditation", points: "5 Points", unit: "per minute", icon: <Activity className="w-5 h-5 text-blue-400" /> },
                                { activity: "Journaling", points: "50 Points", unit: "per entry", icon: <Heart className="w-5 h-5 text-pink-400" /> },
                                { activity: "Daily Streak", points: "100 Points", unit: "per day", icon: <Target className="w-5 h-5 text-orange-400" /> },
                                { activity: "Consistency", points: "25 Points", unit: "per active day", icon: <Shield className="w-5 h-5 text-emerald-400" /> },
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                                    <div className="mb-2 p-2 bg-white/5 rounded-full">{item.icon}</div>
                                    <h3 className="font-bold text-amber-100">{item.activity}</h3>
                                    <div className="text-xl font-bold text-amber-400 my-1">{item.points}</div>
                                    <p className="text-xs text-slate-400">{item.unit}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-slate-800/50 p-4 rounded-xl border border-amber-500/20 flex items-start">
                            <Info className="w-5 h-5 text-amber-400 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-sm text-amber-100/80">
                                <strong>Note:</strong> Your score updates automatically as you engage with features. Consistency is key—the "Daily Active" bonus rewards you simply for showing up on your spiritual path each day.
                            </p>
                        </div>
                    </div>

                    {/* Lotus Levels */}
                    <div className="spiritual-card p-8 rounded-2xl divine-glow">
                        <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center">
                            <Award className="w-6 h-6 mr-3 text-pink-400" />
                            Lotus Progression
                        </h2>
                        <p className="text-slate-300 mb-4 text-sm">
                            As your score grows, your consciousness blooms like a lotus.
                        </p>
                        <div className="space-y-4">
                            {[
                                { name: "Seed of Devotion", score: "0", icon: "🌱" },
                                { name: "Sprouting Bud", score: "500", icon: "🌿" },
                                { name: "Opening Petals", score: "1,500", icon: "🌸" },
                                { name: "Sacred Lotus", score: "3,500", icon: "🪷" },
                                { name: "Golden Lotus", score: "7,500", icon: "🌟" },
                                { name: "Thousand-Petaled", score: "15,000", icon: "✨" },
                            ].map((level, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-white/5">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{level.icon}</span>
                                        <span className="font-medium text-slate-200">{level.name}</span>
                                    </div>
                                    <span className="text-xs font-mono text-amber-400">{level.score}+ pts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Guide */}
                    <div className="spiritual-card p-8 rounded-2xl divine-glow">
                        <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center">
                            <Shield className="w-6 h-6 mr-3 text-emerald-400" />
                            Key Practices
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-amber-200 mb-1">Sankalp (Sacred Vow)</h3>
                                <p className="text-sm text-slate-300">
                                    Set a powerful intention or vow (e.g., "Brahmacharya for 30 days"). Mark it complete daily to build your <strong>Streak</strong>. This acts as the anchor for your practice.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-200 mb-1">Naam Japa</h3>
                                <p className="text-sm text-slate-300">
                                    Use the digital counter locally or offline. Every mantra chanted purifies the mind and adds to your score.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-200 mb-1">Leaderboard</h3>
                                <p className="text-sm text-slate-300">
                                    See how you compare with fellow seekers. The ranking is based purely on your Total Spiritual Score.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Developer Info */}
                <div className="mt-8 spiritual-card p-8 rounded-2xl divine-glow border-2 border-indigo-500/30">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-400/50 flex-shrink-0">
                            <Code className="w-10 h-10 text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-amber-100 mb-2">Architect of the Sanctum</h2>
                            <h3 className="text-lg font-semibold text-indigo-300 mb-2">Shivam</h3>
                            <p className="text-slate-300 italic">
                                "Built with devotion and code, Sadhna Space is a humble offering to help you align with your highest self. May this digital sanctum serve as a steadfast companion on your spiritual journey."
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SpiritualGuide;
