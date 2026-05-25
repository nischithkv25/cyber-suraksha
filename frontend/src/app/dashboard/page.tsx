'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, AlertTriangle, CheckCircle, 
  Map, BarChart3, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const threatData = [
  { time: '00:00', threats: 12 },
  { time: '04:00', threats: 19 },
  { time: '08:00', threats: 45 },
  { time: '12:00', threats: 82 },
  { time: '16:00', threats: 104 },
  { time: '20:00', threats: 67 },
  { time: '24:00', threats: 23 },
];

export default function Dashboard() {
  const [threatScore, setThreatScore] = useState(87);

  // Animate threat score on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setThreatScore(Math.floor(Math.random() * 20) + 75);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">COMMAND CENTER</h1>
          <p className="text-[#00f0ff]">Karnataka Cyber Defense Grid</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-2 border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400 font-mono">SYSTEM ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Threat Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 md:col-span-1 border-[#ff003c]/30"
        >
          <h2 className="text-sm text-gray-400 mb-2 font-mono">CURRENT THREAT LEVEL</h2>
          <div className="flex items-end gap-2 mb-4">
            <span className={`text-6xl font-bold font-heading ${threatScore > 80 ? 'text-[#ff003c] neon-text-red' : 'text-[#00f0ff] neon-text-blue'}`}>
              {threatScore}
            </span>
            <span className="text-xl text-gray-500 mb-1">/100</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2 mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${threatScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-2 rounded-full ${threatScore > 80 ? 'bg-[#ff003c]' : 'bg-[#00f0ff]'}`}
            />
          </div>
          <p className="text-xs text-red-400 font-mono">HIGH RISK IDENTIFIED IN SOUTHERN GRID</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="THREATS BLOCKED" value="12,450" icon={<ShieldCheck className="text-green-400" size={24}/>} trend="+14%" color="green" />
          <StatCard title="ACTIVE SCANS" value="3,211" icon={<Activity className="text-[#00f0ff]" size={24}/>} trend="+5%" color="blue" />
          <StatCard title="COMPLAINTS FILED" value="842" icon={<AlertTriangle className="text-[#b026ff]" size={24}/>} trend="-2%" color="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 md:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading text-white">THREAT VOLUME (24H)</h2>
            <BarChart3 className="text-gray-500" size={20} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatData}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#666" tick={{fill: '#666'}} />
                <YAxis stroke="#666" tick={{fill: '#666'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid #00f0ff' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Area type="monotone" dataKey="threats" stroke="#00f0ff" fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 flex flex-col h-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-heading text-white">LIVE INTERCEPTS</h2>
            <Activity className="text-[#ff003c] animate-pulse" size={20} />
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AlertItem type="CRITICAL" msg="Mass SMS phishing detected targeting SBI users" time="2 min ago" />
            <AlertItem type="WARNING" msg="Suspicious Telegram group identified" time="15 min ago" />
            <AlertItem type="SECURED" msg="Fraudulent UPI ID frozen (₹1.2L recovered)" time="42 min ago" />
            <AlertItem type="WARNING" msg="Fake customer care number reported 15x" time="1 hr ago" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-6 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-md bg-${color}-500/10 border border-${color}-500/30`}>
          {icon}
        </div>
        <span className={`text-xs font-mono ${trend.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white font-heading">{value}</h3>
        <p className="text-sm text-gray-400 font-mono mt-1">{title}</p>
      </div>
    </motion.div>
  );
}

function AlertItem({ type, msg, time }: any) {
  const getColors = () => {
    switch(type) {
      case 'CRITICAL': return 'border-red-500/30 text-red-400 bg-red-500/5';
      case 'WARNING': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5';
      case 'SECURED': return 'border-green-500/30 text-green-400 bg-green-500/5';
      default: return 'border-[#00f0ff]/30 text-[#00f0ff] bg-[#00f0ff]/5';
    }
  };

  return (
    <div className={`p-3 border rounded-md flex flex-col gap-2 ${getColors()}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold font-mono tracking-wider">[{type}]</span>
        <span className="text-xs opacity-60">{time}</span>
      </div>
      <p className="text-sm text-gray-300">{msg}</p>
    </div>
  );
}
