'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, Mail, User, Phone, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setOtpSent(true);
      setSuccess(data.message || 'Verification OTP sent to your phone.');
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
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(data.message || 'Verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b026ff] to-[#00f0ff]" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading mb-2 text-[#b026ff] neon-text-blue" style={{ textShadow: '0 0 10px #b026ff' }}>
            {otpSent ? t('authVerifyPhone') : t('authJoinNetwork')}
          </h1>
          <p className="text-gray-400 text-sm">
            {otpSent 
              ? t('authRegisterOtpSentDesc')
              : t('authRegisterDefaultDesc')}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm mb-5 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-md text-sm mb-5 text-center">
            {success}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('authCitizenName')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#b026ff]" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all"
                  placeholder={t('authCitizenNamePlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('profEmail')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#b026ff]" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all"
                  placeholder={t('authEmailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('authRegisterPhoneLabel')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-[#b026ff]" />
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all"
                  placeholder={t('authPhonePlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('authRegisterPasswordLabel')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#b026ff]" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-md py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#b026ff] hover:bg-[#b026ff]/80 text-white font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.4)] disabled:opacity-50 mt-4"
            >
              {loading ? t('authEncrypting') : t('authEstablishIdentity')}
              {!loading && <ShieldCheck size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                {t('authOtpSentTo')} <span className="text-[#b026ff] font-semibold">{phone}</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/50 border border-gray-700 rounded-md py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all font-mono"
                  placeholder="000000"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              {loading ? t('authVerifyingSecurity') : t('authVerifyRegisterBtn')}
              {!loading && <ShieldCheck size={18} />}
            </button>

            <button 
              type="button" 
              onClick={() => setOtpSent(false)}
              className="w-full bg-transparent hover:bg-gray-800 text-gray-400 py-2 text-sm rounded-md transition-all mt-2"
            >
              {t('authBackRegister')}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          {t('authAlreadyRegistered')}{' '}
          <Link href="/login" className="text-[#b026ff] hover:underline">
            {t('authAuthenticateHere')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
