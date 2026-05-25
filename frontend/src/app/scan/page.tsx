'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ShieldAlert, Scan, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AIScanPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      router.push('/report');
    }
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleScan = () => {
    if (!file && !url) return;
    
    setIsScanning(true);
    
    // Mock API Call delay
    setTimeout(() => {
      setIsScanning(false);
      const mockResult = {
        threatScore: 92,
        classification: 'PHISHING_SCAM',
        confidence: 96.5,
        details: [
          'Suspicious URL formatting detected',
          'Urgency words used: "Immediate Action Required"',
          'Sender email does not match domain'
        ]
      };
      setResult(mockResult);

      if (mockResult.threatScore > 50) {
        setCountdown(4);
      }
    }, 3000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Scan className="text-[#00f0ff]" size={32} />
          AI SCAM DETECTION ENGINE
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">Upload screenshots, SMS texts, or enter URLs for deep neural analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UploadCloud className="text-[#b026ff]" /> EVIDENCE UPLOAD
            </h2>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#b026ff] transition-colors bg-black/30 cursor-pointer">
              <input type="file" className="hidden" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="text-gray-500 mb-2" size={40} />
                <span className="text-gray-300 font-medium">Drag & Drop or Click to Browse</span>
                <span className="text-xs text-gray-500 mt-2">Supports JPG, PNG, PDF (Max 5MB)</span>
                {file && <span className="mt-4 text-[#00f0ff] font-mono border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 rounded">{file.name}</span>}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-gray-800 flex-1"></div>
            <span className="text-gray-500 font-mono text-xs">OR INITIALIZE SCAN ON URL</span>
            <div className="h-px bg-gray-800 flex-1"></div>
          </div>

          <div className="glass-panel p-6">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all mb-4"
              placeholder="https://suspicious-link.com"
            />
            <button 
              onClick={handleScan}
              disabled={isScanning || (!file && !url)}
              className="w-full bg-gradient-to-r from-[#00f0ff] to-[#b026ff] text-white font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {isScanning ? (
                <>
                  <Scan className="animate-spin" size={20} /> ANALYZING PATTERNS...
                </>
              ) : (
                'INITIALIZE NEURAL SCAN'
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative">
          <AnimatePresence>
            {!result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 glass-panel border-dashed"
              >
                <Scan size={64} className="mb-4 opacity-50" />
                <p className="font-mono text-sm text-center px-8">Awaiting input data. Our AI model trained on over 5M+ cyber crime records is standing by.</p>
              </motion.div>
            )}

            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center glass-panel border-[#00f0ff]/50 bg-[#00f0ff]/5"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-t-2 border-[#00f0ff] rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-[#b026ff] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-4 border-b-2 border-white rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <Scan size={40} className="absolute inset-0 m-auto text-[#00f0ff] animate-pulse" />
                </div>
                <div className="font-mono text-[#00f0ff] text-sm tracking-widest animate-pulse">EXTRACTING METADATA...</div>
                <div className="font-mono text-[#b026ff] text-xs tracking-widest mt-2">RUNNING HEURISTICS</div>
              </motion.div>
            )}

            {result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 glass-panel p-6 overflow-y-auto ${result.threatScore > 80 ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'}`}
              >
                <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="font-heading text-xl text-white">ANALYSIS COMPLETE</h3>
                    <p className={`font-mono text-sm ${result.threatScore > 80 ? 'text-red-400' : 'text-green-400'}`}>
                      {result.classification} DETECTED
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${result.threatScore > 80 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    {result.threatScore > 80 ? <ShieldAlert className="text-red-500" size={32} /> : <ShieldCheck className="text-green-500" size={32} />}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2 font-mono">
                    <span className="text-gray-400">THREAT SCORE</span>
                    <span className={result.threatScore > 80 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{result.threatScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-3">
                    <div className={`h-3 rounded-full ${result.threatScore > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${result.threatScore}%` }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-mono text-sm text-gray-400 border-b border-gray-800 pb-1">AI DETECTIONS</h4>
                  {result.details.map((detail: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded border border-gray-800">
                      <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-300">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-800">
                  <button onClick={() => router.push('/report')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2">
                    <ShieldAlert size={18} /> GENERATE OFFICIAL COMPLAINT
                  </button>
                  {countdown !== null && (
                    <p className="text-center text-xs text-red-400 mt-3 font-mono animate-pulse">
                      Auto-redirecting to complaint generator in {countdown}s...
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
