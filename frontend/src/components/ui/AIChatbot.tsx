'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, ShieldCheck, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export default function AIChatbot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [chatLang, setChatLang] = useState<Language>(language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync with global language on initialization or when it changes
  useEffect(() => {
    setChatLang(language);
  }, [language]);

  // Set or update initial welcome message based on language
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'ai')) {
      setMessages([{ role: 'ai', text: t('chatWelcomeMsg') }]);
    }
  }, [language, t]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup speech synthesis and speech recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // Stop speaking if user is typing/sending new message
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIdx(null);
    }

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, lang: chatLang })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      console.error('[CHATBOT-SEND]', err);
      const fallbackMsg = chatLang === 'kn'
        ? 'ಕ್ಷಮಿಸಿ, ಸರ್ವರ್‌ನೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ.'
        : 'Unable to reach the security network. Please verify connection.';
      setMessages(prev => [...prev, { role: 'ai', text: fallbackMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(chatLang === 'kn' 
        ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ.'
        : 'Speech Recognition not supported in this browser. Please use Chrome or Safari.'
      );
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = chatLang === 'kn' ? 'kn-IN' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' : '') + transcript);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const speakText = (text: string, idx: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (currentlySpeakingIdx === idx) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = chatLang === 'kn' ? 'kn-IN' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(chatLang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setCurrentlySpeakingIdx(idx);
    };

    utterance.onend = () => {
      setCurrentlySpeakingIdx(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingIdx(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#b026ff] text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 transition-all z-40"
      >
        <MessageSquare />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] glass-panel border-[#00f0ff]/30 z-50 flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-black/70 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                  <Bot className="text-[#00f0ff] h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-[#00f0ff] text-sm font-semibold tracking-wide">
                    {t('chatBotTitle')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ONLINE
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Language Switcher for Chatbot */}
                <div className="flex items-center bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-xs">
                  <button 
                    onClick={() => {
                      setChatLang('en');
                      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${chatLang === 'en' ? 'bg-[#00f0ff] text-black' : 'text-gray-400'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => {
                      setChatLang('kn');
                      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${chatLang === 'kn' ? 'bg-[#b026ff] text-white' : 'text-gray-400'}`}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>

                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/30">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-white rounded-tr-none shadow-[0_0_10px_rgba(0,240,255,0.05)]' 
                      : 'bg-gray-800/40 border border-gray-700/50 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <ShieldCheck size={14} className="text-[#b026ff]" />
                        
                        {/* Text-to-Speech button */}
                        <button 
                          onClick={() => speakText(msg.text, idx)}
                          className="text-gray-500 hover:text-[#00f0ff] p-0.5 rounded transition-all focus:outline-none"
                          title="Speak response"
                        >
                          {currentlySpeakingIdx === idx ? (
                            <VolumeX size={14} className="text-red-400 animate-pulse" />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      </div>
                    )}
                    <span className="whitespace-pre-line leading-relaxed">{msg.text}</span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/30 border border-gray-800 p-3 rounded-lg text-sm rounded-tl-none flex items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin text-[#00f0ff] h-4 w-4" />
                    <span>Analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-800 bg-black/60 relative">
              {isListening && (
                <div className="absolute -top-10 left-0 right-0 bg-[#00f0ff]/10 border-t border-[#00f0ff]/20 py-2 px-4 flex items-center justify-between text-xs text-[#00f0ff] animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                    <span>{t('chatListening')}</span>
                  </div>
                  {/* Speech Wave Animation */}
                  <div className="flex gap-0.75 items-end h-4">
                    <span className="w-[3px] bg-[#00f0ff] animate-wave-bar animation-delay-100 h-2"></span>
                    <span className="w-[3px] bg-[#00f0ff] animate-wave-bar animation-delay-300 h-3"></span>
                    <span className="w-[3px] bg-[#00f0ff] animate-wave-bar animation-delay-200 h-1.5"></span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="flex gap-2 items-center">
                {/* Speech Input Switcher (Microphone) */}
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-md border transition-all ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-[#00f0ff]/40'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatInputPlaceholder')}
                  className="flex-1 bg-gray-900/80 border border-gray-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]/60 placeholder-gray-500 font-sans"
                  disabled={loading}
                />

                <button 
                  type="submit" 
                  className="p-2 bg-[#00f0ff] text-black rounded-md hover:bg-[#00f0ff]/80 transition-colors disabled:opacity-50"
                  disabled={!input.trim() || loading}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
