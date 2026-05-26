'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PhoneCall, ShieldAlert, X, Activity } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export default function EmergencyDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<any | null>(null);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState('Monitoring Systems Normal');

  useEffect(() => {
    // Initialize Socket Connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Cyber Suraksha Emergency Network');
    });

    newSocket.on('emergency-alert', (payload) => {
      console.log('EMERGENCY ALERT RECEIVED:', payload);
      setEmergencyAlert(payload);
      setSystemStatus('THREAT DETECTED - ACTIVE RESPONSE REQUIRED');
      
      if (payload.severity === 'HIGH') {
        // Vibrate if supported
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        // Auto-show call prompt for HIGH severity, but DO NOT call automatically
        setShowCallPrompt(true);
      }
      
      // Add to local history for demo
      setIncidentHistory(prev => [payload, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSimulateThreat = async (severity: string) => {
    try {
      const res = await fetch(`${API_URL}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '60d5ecb8b392d7001f3e9a4f', // Mock user ID for demo
          scamType: severity === 'HIGH' ? 'High-Risk UPI Scam' : 'Phishing Email',
          confidenceScore: severity === 'HIGH' ? 0.95 : 0.6,
          description: 'Simulated threat vector from Emergency Dashboard'
        })
      });
      if (!res.ok) throw new Error('Simulation failed');
    } catch (err) {
      console.error(err);
      alert('Backend server not reachable for simulation');
    }
  };

  const handleEmergencyAction = async (action: string) => {
    alert(`User Action Authorized: ${action}. Processing securely...`);
    // In production, this would hit /api/emergency/action
    setEmergencyAlert(null);
    setShowCallPrompt(false);
    setSystemStatus('Threat Mitigated. Systems Normal.');
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] p-6 transition-colors duration-500 ${emergencyAlert?.severity === 'HIGH' ? 'bg-red-950/20' : ''}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-heading text-red-500 flex items-center gap-2">
              <ShieldAlert className="w-8 h-8" />
              EMERGENCY RESPONSE CENTER
            </h1>
            <p className="text-gray-400 font-mono mt-1 flex items-center gap-2">
              <Activity className={`w-4 h-4 ${emergencyAlert ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
              {systemStatus}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => handleSimulateThreat('MEDIUM')} className="btn-secondary text-sm">
              Simulate Medium Threat
            </button>
            <button onClick={() => handleSimulateThreat('HIGH')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all">
              Simulate High-Risk Threat
            </button>
          </div>
        </div>

        {/* Real-time Alert Banner */}
        <AnimatePresence>
          {emergencyAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-6 rounded-lg border-2 shadow-2xl relative overflow-hidden ${
                emergencyAlert.severity === 'HIGH' 
                ? 'bg-red-900/30 border-red-500 shadow-red-500/20' 
                : 'bg-yellow-900/30 border-yellow-500 shadow-yellow-500/20'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <AlertTriangle className={`w-10 h-10 ${emergencyAlert.severity === 'HIGH' ? 'text-red-500 animate-bounce' : 'text-yellow-500'}`} />
                  <div>
                    <h2 className={`text-2xl font-bold ${emergencyAlert.severity === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {emergencyAlert.severity} SEVERITY THREAT DETECTED
                    </h2>
                    <p className="text-white text-lg mt-1">{emergencyAlert.scamType}</p>
                    <p className="text-gray-300 mt-2">{emergencyAlert.description}</p>
                  </div>
                </div>
                <button onClick={() => setEmergencyAlert(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 flex gap-4">
                {emergencyAlert.recommendedActions?.map((action: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => handleEmergencyAction(action)}
                    className="bg-black/50 hover:bg-black/80 border border-current px-4 py-2 rounded text-sm font-bold transition-all"
                    style={{ color: emergencyAlert.severity === 'HIGH' ? '#ef4444' : '#eab308' }}
                  >
                    AUTHORIZE: {action}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Call Modal Overlay */}
        <AnimatePresence>
          {showCallPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-red-950 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 to-transparent pointer-events-none animate-pulse" />
                
                <PhoneCall className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-2">URGENT ASSISTANCE</h3>
                <p className="text-red-200 mb-8">High-risk fraud detected. Would you like to connect to the National Cybercrime Helpline immediately?</p>
                
                <div className="space-y-4">
                  <a href="tel:1930" className="block w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all">
                    DIAL 1930 NOW
                  </a>
                  <button 
                    onClick={() => setShowCallPrompt(false)}
                    className="w-full bg-transparent border border-gray-600 text-gray-300 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel / Handle Later
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-4 font-mono uppercase">
                  Automatic dialing is disabled. User authorization required.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local History Panel */}
        <div className="glass-panel p-6 mt-8">
          <h3 className="text-xl font-heading mb-4 text-[#00f0ff]">INCIDENT LOGS (Local Session)</h3>
          {incidentHistory.length === 0 ? (
            <p className="text-gray-500 italic">No incidents recorded in this session.</p>
          ) : (
            <div className="space-y-3">
              {incidentHistory.map((inc, i) => (
                <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded flex justify-between items-center">
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold mr-3 ${inc.severity === 'HIGH' ? 'bg-red-900/50 text-red-500' : 'bg-yellow-900/50 text-yellow-500'}`}>
                      {inc.severity}
                    </span>
                    <span className="text-white font-medium">{inc.scamType}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
