'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Fingerprint, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
              PROTECT. <span className="neon-text-blue text-[#00f0ff]">DETECT.</span> REPORT.
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              India's Most Advanced AI-Powered Cybercrime Defense Command Center. 
              Secure your digital identity with military-grade intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/scan" className="bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-4 px-8 rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                <ShieldCheck size={20} /> START AI SCAN
              </Link>
              <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,60,0.5)]">
                <ShieldAlert size={20} /> EMERGENCY REPORT
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Threat Ticker */}
      <div className="bg-[#00f0ff]/10 border-y border-[#00f0ff]/30 py-3 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex whitespace-nowrap gap-10 text-sm font-mono text-[#00f0ff]"
        >
          <span>[ALERT] Phishing attempt detected in Karnataka (IP: 192.168.***)</span>
          <span>[SECURED] Fake UPI transaction blocked (Value: ₹50,000)</span>
          <span>[WARNING] New WhatsApp scam pattern identified</span>
          <span>[ALERT] Phishing attempt detected in Karnataka (IP: 192.168.***)</span>
          <span>[SECURED] Fake UPI transaction blocked (Value: ₹50,000)</span>
        </motion.div>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-white mb-4">AI POWERED <span className="text-[#b026ff]">DEFENSE MODULES</span></h2>
            <div className="h-1 w-24 bg-[#b026ff] mx-auto rounded-full shadow-[0_0_10px_#b026ff]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Fingerprint className="text-[#00f0ff]" size={40} />}
              title="Fraud Classification AI"
              desc="Upload screenshots or enter suspicious links. Our AI instantly analyzes for social engineering and phishing patterns."
            />
            <FeatureCard 
              icon={<Activity className="text-[#39ff14]" size={40} />}
              title="Real-time Threat Monitoring"
              desc="Live tracking of scam trends across India. Get notified immediately if your data appears in our threat intelligence feeds."
            />
            <FeatureCard 
              icon={<ShieldAlert className="text-red-500" size={40} />}
              title="Auto FIR Generation"
              desc="Generates officially formatted cybercrime complaints with blockchain-hashed evidence ready for submission."
            />
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-20 border-t border-[#00f0ff]/20 bg-gradient-to-t from-[#00f0ff]/5 to-black">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-2xl font-heading mb-6">JOIN THE CYBER SURAKSHA NETWORK</h3>
          <p className="text-gray-400 mb-8">Create an account to track complaints, save evidence securely, and receive personalized threat alerts.</p>
          <Link href="/register" className="inline-flex items-center gap-2 text-[#00f0ff] hover:text-white border border-[#00f0ff] hover:bg-[#00f0ff]/20 px-6 py-3 rounded-sm transition-all">
            Create Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, borderColor: 'rgba(0,240,255,0.5)' }}
      className="glass-panel p-8 transition-all group"
    >
      <div className="mb-4 bg-black/50 p-4 rounded-full inline-block border border-gray-800 group-hover:border-[#00f0ff]/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
