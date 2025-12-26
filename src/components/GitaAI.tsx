import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import { generateGitaResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "Find peace in chaos",
  "How to deal with anger?",
  "What is my true duty?",
  "Overcoming fear of failure"
];

const GitaAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Radhe Radhe! 🙏\n\nI am the voice of the Gita. What burden does your soul carry today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history (exclude welcome message)
      const history = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.role,
          parts: msg.text
        }));

      const responseText = await generateGitaResponse(history, userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I cannot connect to the divine source right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pt-20 pb-4 relative overflow-hidden mandala-bg">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-900 to-slate-900"></div>

      <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col h-[85vh] relative z-10">

        {/* Chat Interface */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-900/90 to-transparent z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center space-x-2 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Krishna's Wisdom</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pt-20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden border border-white/10 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-transparent'
                  }`}>
                  {msg.role === 'user' ? (
                    <User size={16} className="text-indigo-200" />
                  ) : (
                    <img src="/gita-avatar.png" alt="Gita AI" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-md text-[15px] leading-relaxed relative group ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800/80 text-slate-100 border border-white/5 rounded-bl-none'
                  }`}>

                  {msg.role === 'model' && (
                    <div className="absolute -top-3 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-4 h-4 text-amber-400/50" />
                    </div>
                  )}

                  <div className="prose prose-invert prose-p:my-1 prose-p:leading-relaxed max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-end gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-lg">
                  <img src="/gita-avatar.png" alt="Gita AI" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {!input && messages.length < 3 && !isLoading && (
            <div className="px-6 pb-2">
              <p className="text-xs text-slate-500 mb-3 ml-1 uppercase tracking-wider">Seek Guidance On</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-sm bg-slate-800/50 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-white/5 text-slate-300 hover:text-indigo-200 px-4 py-2 rounded-full transition-all duration-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
            <div className="relative flex items-center bg-slate-800/50 rounded-2xl border border-white/10 focus-within:border-indigo-500/30 focus-within:bg-slate-800 transition-all duration-300">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your question..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-5 py-4 text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-0 disabled:scale-75 transition-all duration-200 shadow-lg shadow-indigo-600/20"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-3 font-medium tracking-wide">
              AI GUIDANCE BASED ON SCRIPTURE • MAY CONTAIN ERRORS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitaAI;