'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, ShieldCheck } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Initiating secure channel... How can I assist you today, Citizen?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let aiResponse = "I'm analyzing your request against our cyber threat database.";
      if (userMsg.toLowerCase().includes('scam') || userMsg.toLowerCase().includes('fraud')) {
        aiResponse = "If you suspect a scam, please use the EMERGENCY REPORT feature immediately or call 1930. Do not share OTPs.";
      } else if (userMsg.toLowerCase().includes('help')) {
        aiResponse = "I can help you scan links, check suspicious numbers, or guide you through filing an official FIR.";
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#b026ff] text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform z-40"
      >
        <MessageSquare />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] glass-panel border-[#00f0ff]/30 z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-black/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="text-[#00f0ff]" />
                <div>
                  <h3 className="font-heading text-[#00f0ff] text-sm">SURAKSHA AI</h3>
                  <div className="flex items-center gap-1 text-xs text-green-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ONLINE
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-white rounded-tr-none' 
                      : 'bg-gray-800/50 border border-gray-700 text-gray-300 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' && <ShieldCheck size={14} className="text-[#b026ff] mb-1" />}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-800 bg-black/60">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for assistance..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                />
                <button type="submit" className="p-2 bg-[#00f0ff] text-black rounded-md hover:bg-[#00f0ff]/80">
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
