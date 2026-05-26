'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Phone, Key, Mail, Lock, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] to-[#b026ff]" />
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading mb-2 neon-text-blue">SYSTEM LOGIN</h1>
          <p className="text-gray-400 text-sm">Authenticate to access Cyber Suraksha Command Center</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-gray-800 rounded-md p-1 bg-black/40 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('password'); setError(''); setOtpSent(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${
              activeTab === 'password' 
                ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Access Key
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('otp'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${
              activeTab === 'otp' 
                ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            OTP Verification
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'password' ? (
            <motion.form
              key="password-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasswordLogin}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Citizen Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#00f0ff]" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Access Key (Password)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#00f0ff]" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)] disabled:opacity-50 mt-6"
              >
                {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-[#00f0ff]" />
                      </div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)] disabled:opacity-50 mt-6"
                  >
                    {loading ? 'GENERATING SECURE KEY...' : 'REQUEST LOGIN OTP'}
                    {!loading && <Key size={18} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center bg-[#00f0ff]/5 border border-[#00f0ff]/20 p-3 rounded-md text-sm text-gray-400 mb-4">
                    OTP sent to <span className="text-[#00f0ff]">{phone}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Verification OTP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-[#00f0ff]" />
                      </div>
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-gray-400 hover:text-white transition-all flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Change Phone Number
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#00f0ff] hover:underline"
                    >
                      Resend OTP?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)] disabled:opacity-50 mt-6"
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY & ACCESS'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-sm text-gray-400">
          Not registered in the network?{' '}
          <Link href="/register" className="text-[#00f0ff] hover:underline">
            Request Access
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
