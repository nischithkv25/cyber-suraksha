'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, ShieldCheck, MapPin, Building, 
  CreditCard, Eye, EyeOff, Save, Edit3, X, Award, ShieldAlert
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Form fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setUser(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setAadhaar(data.aadhaar || '');
      setCity(data.city || '');
      setState(data.state || '');
      setSecondaryPhone(data.secondaryPhone || '');
      setBloodGroup(data.bloodGroup || '');
      setAddress(data.address || '');
    } catch (err: any) {
      setError(err.message || 'Error loading profile data');
      if (err.message === 'Invalid token' || err.message === 'No token provided') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          aadhaar,
          city,
          state,
          secondaryPhone,
          bloodGroup,
          address
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile details saved successfully!');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      }));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatAadhaar = (val: string) => {
    if (!val) return 'Not Configured';
    if (showAadhaar) return val;
    return `XXXX-XXXX-${val.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00f0ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-mono tracking-wider">RETRIEVING CITIZEN METADATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-wide">SECURE PROFILE</h1>
        <p className="text-[#00f0ff] font-mono text-sm">Citizen Identity & Security Information</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-md text-sm font-mono flex items-center gap-2">
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-md text-sm font-mono flex items-center gap-2">
          <ShieldCheck size={18} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Digital ID Badge */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 border-[#00f0ff]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] to-[#b026ff]" />
            
            {/* Hologram Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-[#b026ff]/20 border border-[#00f0ff]/50 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <User size={48} className="text-[#00f0ff]" />
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#b026ff]/40 animate-spin" style={{ animationDuration: '15s' }} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-black px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 border border-black">
                  <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  ONLINE
                </div>
              </div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide uppercase font-heading">{user?.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-mono text-[#00f0ff]">
                <Award size={12} /> {user?.role || 'CITIZEN'}
              </div>
            </div>

            {/* Micro details */}
            <div className="space-y-4 border-t border-gray-800 pt-6 font-mono text-xs text-gray-400">
              <div className="flex justify-between">
                <span>IDENTITY HASH:</span>
                <span className="text-white text-right break-all max-w-[150px]">{user?._id?.slice(0, 8)}...{user?._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>SECURITY CLEARANCE:</span>
                <span className="text-[#b026ff] font-bold">LEVEL 1 (BASIC)</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE OTP STATUS:</span>
                <span className={user?.isVerified ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                  {user?.isVerified ? "VERIFIED" : "UNVERIFIED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>REGISTRATION DATE:</span>
                <span className="text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Cyber Grid Barcode Simulation */}
            <div className="mt-8 pt-4 border-t border-gray-800/50 flex flex-col items-center gap-2 opacity-65 hover:opacity-100 transition-opacity">
              <div className="w-full h-8 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent flex items-center justify-around overflow-hidden rounded px-2">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-[#00f0ff] h-6" 
                    style={{ width: `${Math.max(1, Math.floor(Math.random() * 4))}px` }} 
                  />
                ))}
              </div>
              <span className="text-[9px] text-[#00f0ff] font-mono tracking-[0.25em]">SECURE-ID-LINKED</span>
            </div>

          </motion.div>
        </div>

        {/* Right Column: Personal Details & Edit Form */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 md:p-8 space-y-6"
          >
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white font-heading">PERSONAL DETAILS</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit3 size={12} /> EDIT PROFILE
                </button>
              ) : (
                <button
                  onClick={() => { setIsEditing(false); fetchProfile(); }}
                  className="px-4 py-2 bg-transparent hover:bg-gray-800 text-gray-400 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                >
                  <X size={12} /> CANCEL
                </button>
              )}
            </div>

            {!isEditing ? (
              // Display Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                <DetailRow icon={<User className="text-[#00f0ff]" />} label="Full Name" value={user?.name} />
                <DetailRow icon={<Mail className="text-[#00f0ff]" />} label="Email Address" value={user?.email} />
                <DetailRow icon={<Phone className="text-[#00f0ff]" />} label="Phone Number" value={user?.phone || 'Not Provided'} />
                <DetailRow icon={<Phone className="text-[#00f0ff]" />} label="Secondary Contact" value={user?.secondaryPhone || 'Not Configured'} />
                
                <div className="flex items-start gap-3 p-3 bg-black/30 border border-gray-800 rounded-md">
                  <CreditCard className="text-[#00f0ff] mt-0.5" size={18} />
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block">AADHAAR CARD</span>
                    <span className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                      {formatAadhaar(user?.aadhaar)}
                      {user?.aadhaar && (
                        <button 
                          onClick={() => setShowAadhaar(!showAadhaar)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {showAadhaar ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </span>
                  </div>
                </div>

                <DetailRow icon={<Award className="text-[#00f0ff]" />} label="Blood Group" value={user?.bloodGroup || 'Not Specified'} />
                <DetailRow icon={<MapPin className="text-[#00f0ff]" />} label="City / Region" value={user?.city || 'Not Specified'} />
                <DetailRow icon={<Building className="text-[#00f0ff]" />} label="State" value={user?.state || 'Not Specified'} />
                
                <div className="md:col-span-2 flex items-start gap-3 p-3 bg-black/30 border border-gray-800 rounded-md">
                  <MapPin className="text-[#00f0ff] mt-0.5" size={18} />
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block">RESIDENTIAL ADDRESS</span>
                    <span className="text-sm text-gray-300">{user?.address || 'No residential address configured.'}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode Form
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Primary Phone</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="+91 XXXXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Secondary Phone</label>
                    <input 
                      type="text" 
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="Optional phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Aadhaar Card (12 Digits)</label>
                    <input 
                      type="text" 
                      maxLength={12}
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="12 digit Aadhaar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">City / Town</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="e.g. Mysuru"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="e.g. Karnataka"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase">Residential Address</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-black/50 border border-gray-700 rounded-md py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                      placeholder="Full home or office address"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchProfile(); }}
                    className="px-5 py-2.5 border border-gray-700 hover:bg-gray-800 text-gray-400 rounded-md text-sm font-mono transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2.5 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold rounded-md text-sm font-mono transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)] disabled:opacity-50"
                  >
                    <Save size={16} /> {saveLoading ? 'SAVING DATA...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            )}

          </motion.div>
        </div>

      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-black/30 border border-gray-800 rounded-md">
      <div className="mt-0.5">
        {icon}
      </div>
      <div className="space-y-1">
        <span className="text-[10px] text-gray-500 font-mono block uppercase">{label}</span>
        <span className="text-sm font-semibold text-white">{value}</span>
      </div>
    </div>
  );
}
