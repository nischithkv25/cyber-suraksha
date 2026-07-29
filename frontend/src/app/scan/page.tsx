'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ShieldAlert, Scan, CheckCircle, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function AIScanPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Auto-filing complaint states
  const [isFiling, setIsFiling] = useState(false);
  const [filedComplaint, setFiledComplaint] = useState<{ id: string; hash: string } | null>(null);

  const handleScan = async () => {
    if (!file && !url) return;
    
    setIsScanning(true);
    setResult(null);
    setFiledComplaint(null);
    setIsFiling(false);
    
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('text', file.name);
        res = await fetch(`${API_URL}/ai/scan-image`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/ai/analyze-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: url }),
        });
      }

      if (!res.ok) {
        throw new Error('AI Scam Service returned an error response');
      }

      const data = await res.json();
      setResult(data);

      // Auto-file complaint if high threat detected
      if (data.threatScore > 50) {
        setIsFiling(true);
        try {
          const token = localStorage.getItem('token');
          let classificationType = 'Online Fraud';
          if (data.classification === 'PHISHING_SCAM') classificationType = 'Phishing';
          else if (data.classification === 'UPI_IMPERSONATION') classificationType = 'UPI Fraud';
          else if (data.classification === 'SUPPORT_SCAM') classificationType = 'Impersonation Scam';
          else if (data.classification === 'LOTTERY_FRAUD') classificationType = 'Lottery Scam';

          const complaintDescription = `Auto-filed by AI Scam Detection Engine.\nThreat Score: ${data.threatScore}/100\nConfidence: ${data.confidence}%\n\nScanned Source: ${url || file?.name || 'Evidence screenshot'}\n\nIdentified Threat Indicators:\n${data.details.map((d: string) => `- ${d}`).join('\n')}`;

          const fileRes = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              incidentType: classificationType,
              description: complaintDescription,
              dateOfIncident: new Date().toISOString().split('T')[0],
              financialLoss: 0,
              platform: url ? 'Web' : 'Evidence Upload',
              suspectDetails: url || file?.name || 'Not specified'
            })
          });

          if (fileRes.ok) {
            const fileData = await fileRes.json();
            setFiledComplaint({
              id: fileData.complaint._id,
              hash: fileData.complaint.blockchainHash
            });
          } else {
            console.error('Failed to auto-file complaint.');
          }
        } catch (fileErr) {
          console.error('Error auto-filing complaint:', fileErr);
        } finally {
          setIsFiling(false);
        }
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      alert(err.message || 'AI Scam analysis failed.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Scan className="text-[#00f0ff]" size={32} />
          {t('scanTitle')}
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">{t('scanSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UploadCloud className="text-[#b026ff]" /> {t('scanEvidenceUpload')}
            </h2>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#b026ff] transition-colors bg-black/30 cursor-pointer">
              <input type="file" className="hidden" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="text-gray-500 mb-2" size={40} />
                <span className="text-gray-300 font-medium">{t('scanDragDrop')}</span>
                <span className="text-xs text-gray-500 mt-2">{t('scanUploadLimits')}</span>
                {file && <span className="mt-4 text-[#00f0ff] font-mono border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 rounded">{file.name}</span>}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-gray-800 flex-1"></div>
            <span className="text-gray-500 font-mono text-xs">{t('scanOrUrl')}</span>
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
                  <Scan className="animate-spin" size={20} /> {t('scanAnalyzing')}
                </>
              ) : (
                t('scanInitBtn')
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative font-sans">
          <AnimatePresence>
            {!result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 glass-panel border-dashed"
              >
                <Scan size={64} className="mb-4 opacity-50" />
                <p className="font-mono text-sm text-center px-8">{t('scanAwaiting')}</p>
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
                <div className="font-mono text-[#00f0ff] text-sm tracking-widest animate-pulse">{t('scanExtracting')}</div>
                <div className="font-mono text-[#b026ff] text-xs tracking-widest mt-2">{t('scanHeuristics')}</div>
              </motion.div>
            )}

            {result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 glass-panel p-6 overflow-y-auto ${result.threatScore > 50 ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'}`}
              >
                <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                  <div>
                    <h3 className="font-heading text-xl text-white">{t('scanComplete')}</h3>
                    <p className={`font-mono text-sm ${result.threatScore > 50 ? 'text-red-400' : 'text-green-400'}`}>
                      {result.classification} DETECTED
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${result.threatScore > 50 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    {result.threatScore > 50 ? <ShieldAlert className="text-red-500" size={32} /> : <ShieldCheck className="text-green-500" size={32} />}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2 font-mono">
                    <span className="text-gray-400">{t('scanScore')}</span>
                    <span className={result.threatScore > 50 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{result.threatScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-3">
                    <div className={`h-3 rounded-full ${result.threatScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${result.threatScore}%` }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-mono text-sm text-gray-400 border-b border-gray-800 pb-1">{t('scanDetections')}</h4>
                  {result.details.map((detail: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded border border-gray-800">
                      <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-300">{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-800">
                  {result.threatScore > 50 ? (
                    filedComplaint ? (
                      <div className="space-y-3">
                        <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-md">
                          <h5 className="text-green-400 font-bold flex items-center gap-2 mb-2">
                            <CheckCircle size={18} /> {t('scanSuccess')}
                          </h5>
                          <div className="space-y-2 text-xs font-mono text-gray-300">
                            <div>
                              <span className="text-gray-400">{t('scanId')}</span>{' '}
                              <span className="text-white">{filedComplaint.id}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">{t('scanHash')}</span>{' '}
                              <span className="text-emerald-400 break-all">{filedComplaint.hash}</span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`${API_URL}/complaints/${filedComplaint.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 text-center"
                        >
                          <FileText size={18} /> {t('scanDownload')}
                        </a>
                      </div>
                    ) : isFiling ? (
                      <div className="p-4 border border-[#00f0ff]/30 bg-[#00f0ff]/10 rounded-md text-center">
                        <p className="text-[#00f0ff] font-mono text-sm tracking-wider animate-pulse">
                          {t('scanFiling')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-red-400 font-mono">
                        Failed to auto-file complaint. Please file manually.
                      </p>
                    )
                  ) : (
                    <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-md text-center">
                      <p className="text-green-400 font-mono text-sm">
                        {t('scanSecured')}
                      </p>
                    </div>
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
