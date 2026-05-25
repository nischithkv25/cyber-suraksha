'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="fixed w-full z-50 glass border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#00f0ff] animate-pulse" />
              <span className="text-xl font-bold font-heading neon-text-blue tracking-wider">
                CYBER SURAKSHA
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/dashboard" className={`hover:text-[#00f0ff] px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-[#00f0ff]' : ''}`}>
                Dashboard
              </Link>
              <Link href="/report" className={`hover:text-[#00f0ff] px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/report' ? 'text-[#00f0ff]' : ''}`}>
                Report Scam
              </Link>
              <Link href="/scan" className={`hover:text-[#00f0ff] px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/scan' ? 'text-[#00f0ff]' : ''}`}>
                AI Scanner
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className={`hover:text-[#00f0ff] px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${pathname === '/profile' ? 'text-[#00f0ff]' : ''}`}>
                    <User size={16} /> {user.name}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/20 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2">
                  <User size={16} /> Login
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel border-x-0 border-b-0 rounded-none"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#00f0ff]">Dashboard</Link>
            <Link href="/report" className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#00f0ff]">Report Scam</Link>
            <Link href="/scan" className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#00f0ff]">AI Scanner</Link>
            {user ? (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:text-[#00f0ff]">Profile ({user.name})</Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-[#00f0ff]">Login</Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
