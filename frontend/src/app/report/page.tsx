'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, CreditCard, Lock, Smartphone, FileText, CheckCircle, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

export default function EmergencyReportPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState('');
  const [customIncidentType, setCustomIncidentType] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [upiId, setUpiId] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [bankName, setBankName] = useState('');
  
  // Complaint state
  const [financialLoss, setFinancialLoss] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [platform, setPlatform] = useState('');
  const [suspectDetails, setSuspectDetails] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [generatedComplaint, setGeneratedComplaint] = useState<any>(null);

  // Govt Sync State
  const [govtSyncStatus, setGovtSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [govtAckNo, setGovtAckNo] = useState('');
  
  const handleNext = () => setStep(step + 1);

  const simulateAction = () => {
    setActionStatus('processing');
    setTimeout(() => {
      setActionStatus('success');
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'call') {
      window.location.href = 'tel:1930';
      return;
    }
    setActiveAction(action);
  };

  const handleSimulateUpload = async () => {
    setIsUploading(true);
    try {
      const finalType = incidentType === 'Other' ? customIncidentType : incidentType;
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          incidentType: finalType,
          description: description || `Emergency report for ${finalType}`,
          dateOfIncident: incidentDate || new Date().toISOString().split('T')[0],
          financialLoss: Number(financialLoss) || 0,
          platform: platform || 'Web',
          suspectDetails: suspectDetails || 'Not specified'
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to file complaint');
      }

      const data = await res.json();
      setGeneratedComplaint({
        id: data.complaint._id,
        hash: data.complaint.blockchainHash,
        timestamp: new Date(data.complaint.createdAt).toLocaleString()
      });
      setStep(4);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred while saving complaint to database.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGovtSync = () => {
    setGovtSyncStatus('syncing');
    setTimeout(() => {
      setGovtAckNo('GOVT-' + new Date().getFullYear() + '-' + Math.floor(1000000 + Math.random() * 9000000));
      setGovtSyncStatus('success');
    }, 3500);
  };

  const closeActionModal = () => {
    setActiveAction(null);
    setActionStatus('idle');
    setUpiId('');
    setAccountNum('');
    setBankName('');
  };

  const incidentTypes = [
    { id: 'UPI Fraud', labelKey: 'upiFraud' as const },
    { id: 'OTP Scam', labelKey: 'otpScam' as const },
    { id: 'Phishing Link', labelKey: 'phishingLink' as const },
    { id: 'Fake Customer Care', labelKey: 'fakeCustomerCare' as const },
    { id: 'Sextortion', labelKey: 'sextortion' as const },
    { id: 'Other', labelKey: 'other' as const }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 border-b border-red-500/30 pb-4">
        <h1 className="text-3xl font-heading font-bold text-red-500 flex items-center gap-3">
          <ShieldAlert className="text-red-500 animate-pulse" size={32} />
          {t('repTitle')}
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm">{t('repSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Rapid Response Actions */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-heading text-white mb-4 border-b border-gray-800 pb-2">{t('repQuickActions')}</h2>
          
          <ActionCard icon={<Phone />} title={t('repCallTitle')} desc={t('repCallDesc')} color="red" onClick={() => handleQuickAction('call')} />
          <ActionCard icon={<CreditCard />} title={t('repFreezeTitle')} desc={t('repFreezeDesc')} color="blue" onClick={() => handleQuickAction('freeze')} />
          <ActionCard icon={<Lock />} title={t('repUpiTitle')} desc={t('repUpiDesc')} color="purple" onClick={() => handleQuickAction('upi')} />
          <ActionCard icon={<Smartphone />} title={t('repDeviceTitle')} desc={t('repDeviceDesc')} color="green" onClick={() => handleQuickAction('device')} />
        </div>

        {/* Auto Complaint Generator */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 border-cyan-500/20">
            <h2 className="text-xl font-heading text-[#00f0ff] mb-6 flex items-center gap-2">
              <FileText /> {t('repGeneratorTitle')}
            </h2>
            
            {/* Progress Bar */}
            <div className="flex mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 relative">
                  <div className={`h-2 rounded-full ${step >= i ? 'bg-[#00f0ff]' : 'bg-gray-800'} transition-all mx-1`}></div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-500 hidden sm:block">
                    {t('repStep')} {i}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 min-h-[300px]">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h3 className="text-lg text-white mb-4">{t('repClassify')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {incidentTypes.map(type => (
                      <button 
                        key={type.id}
                        onClick={() => setIncidentType(type.id)}
                        className={`p-4 rounded border text-left transition-all ${incidentType === type.id ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-white' : 'border-gray-800 bg-black/50 text-gray-400 hover:border-gray-500'}`}
                      >
                        {t(type.labelKey)}
                      </button>
                    ))}
                  </div>
                  {incidentType === 'Other' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                      <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repSpecify')}</label>
                      <input 
                        type="text" 
                        value={customIncidentType}
                        onChange={(e) => setCustomIncidentType(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none" 
                        placeholder={t('repSpecifyPlaceholder')}
                      />
                    </motion.div>
                  )}
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={handleNext} 
                      disabled={!incidentType || (incidentType === 'Other' && !customIncidentType.trim())} 
                      className="bg-[#00f0ff] text-black font-bold py-2 px-6 rounded hover:bg-[#00f0ff]/80 disabled:opacity-50 flex items-center gap-2"
                    >
                      {t('repContinue')} <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg text-white mb-4">{t('repDetails')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repDate')}</label>
                      <input 
                        type="date" 
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none [color-scheme:dark]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repLoss')}</label>
                      <input 
                        type="number" 
                        value={financialLoss}
                        onChange={(e) => setFinancialLoss(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none" 
                        placeholder="e.g. 50000" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repPlatform')}</label>
                      <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none" 
                      >
                        <option value="" disabled className="text-gray-500">{t('repSelectPlatform')}</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telegram">Telegram</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Facebook / Instagram">Facebook / Instagram</option>
                        <option value="Website">Website</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repSuspect')}</label>
                      <input 
                        type="text" 
                        value={suspectDetails}
                        onChange={(e) => setSuspectDetails(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none" 
                        placeholder={t('repSuspectPlaceholder')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-mono">{t('repDesc')}</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-[#00f0ff] outline-none h-32" 
                      placeholder={t('repDescPlaceholder')}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white px-4 py-2">{t('repBack')}</button>
                    <button onClick={handleNext} className="bg-[#00f0ff] text-black font-bold py-2 px-6 rounded hover:bg-[#00f0ff]/80 flex items-center gap-2">
                      {t('repUploadEv')} <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                  <div className="border-2 border-dashed border-[#00f0ff]/50 rounded-lg p-12 bg-[#00f0ff]/5">
                    <FileText className="text-[#00f0ff] mx-auto mb-4" size={48} />
                    <h3 className="text-lg text-white mb-2">{t('repUploadBoxTitle')}</h3>
                    <p className="text-sm text-gray-400 mb-6">{t('repUploadBoxDesc')}</p>
                    <button 
                      onClick={handleSimulateUpload} 
                      disabled={isUploading}
                      className="border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 px-6 py-2 rounded flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                          {t('repUploadingHashing')}
                        </>
                      ) : (
                        t('repUploadSimulate')
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-heading text-white mb-2">{t('repSuccessTitle')}</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">{t('repSuccessDesc')}</p>
                  
                  {generatedComplaint && (
                    <div className="bg-black/50 border border-gray-800 rounded-md p-4 mb-8 text-left max-w-sm mx-auto space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-mono text-xs">{t('scanId')}</span>
                        <span className="text-[#00f0ff] font-mono text-xs">{generatedComplaint.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-mono text-xs">{t('scanHash')}</span>
                        <span className="text-green-400 font-mono text-xs truncate max-w-[150px]">{generatedComplaint.hash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-mono text-xs">{t('timestamp')}</span>
                        <span className="text-gray-300 font-mono text-xs">{generatedComplaint.timestamp}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 flex-wrap">
                    <button 
                      onClick={() => {
                        const finalType = incidentType === 'Other' ? customIncidentType : incidentType;
                        const payload = `Incident Type: ${finalType}\nDate: ${incidentDate}\nPlatform: ${platform}\nSuspect Details: ${suspectDetails}\nFinancial Loss: INR ${financialLoss}\nDescription: ${description}`;
                        navigator.clipboard.writeText(payload);
                        window.open('https://www.cybercrime.gov.in/', '_blank');
                      }}
                      className="bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-2 px-6 rounded flex items-center gap-2"
                    >
                      <FileText size={18} /> {t('repCopyPortal')}
                    </button>
                    <button 
                      onClick={handleGovtSync}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,60,0.4)] w-full sm:w-auto justify-center mt-2 sm:mt-0"
                    >
                      <ShieldAlert size={18} /> {t('repAutoFile')}
                    </button>
                    {generatedComplaint?.id && (
                      <button 
                        onClick={() => {
                          window.open(`${API_URL}/complaints/${generatedComplaint.id}/pdf`, '_blank');
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <FileText size={18} /> {t('scanDownload')}
                      </button>
                    )}
                    <button onClick={() => setStep(1)} className="border border-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded w-full sm:w-auto mt-2 sm:mt-0">
                      {t('repReset')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Govt Sync Modal */}
      <AnimatePresence>
        {govtSyncStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="glass-panel p-8 max-w-lg w-full border-[#00f0ff]/50"
            >
              {govtSyncStatus === 'syncing' ? (
                <div className="text-center space-y-6">
                  <ShieldAlert className="mx-auto text-red-500 animate-pulse" size={56} />
                  <h2 className="text-xl font-heading text-white">{t('repGovtConnecting')}</h2>
                  
                  <div className="space-y-3 text-left bg-black/50 p-4 rounded-md border border-gray-800 font-mono text-xs text-gray-400">
                    <p className="animate-pulse">{t('repGovtLog1')}</p>
                    <p className="animate-pulse" style={{animationDelay: '0.5s'}}>{t('repGovtLog2')}</p>
                    <p className="animate-pulse" style={{animationDelay: '1.2s'}}>{t('repGovtLog3')}</p>
                    <p className="animate-pulse text-[#00f0ff]" style={{animationDelay: '2.0s'}}>{t('repGovtLog4')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <CheckCircle className="mx-auto text-green-500" size={56} />
                  <h2 className="text-2xl font-heading text-green-400">{t('repGovtRegistered')}</h2>
                  <p className="text-gray-300">{t('repGovtSuccessDesc')}</p>
                  
                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-md">
                    <p className="text-sm text-gray-400 mb-1">{t('repGovtAckNo')}</p>
                    <p className="text-2xl font-mono text-green-400 font-bold tracking-widest">{govtAckNo}</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <a href="https://www.cybercrime.gov.in/" target="_blank" rel="noreferrer" className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded text-sm text-center">
                      {t('repGovtViewPortal')}
                    </a>
                    <button onClick={() => { setGovtSyncStatus('idle'); setStep(1); }} className="flex-1 bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 rounded text-sm">
                      {t('repClose')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {activeAction && (
          <motion.div 
            key="action-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 max-w-md w-full relative border-[#ff003c]/30"
            >
              <button onClick={closeActionModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                {activeAction === 'call' && <Phone className="mx-auto text-red-500 mb-4 animate-pulse" size={48} />}
                {activeAction === 'freeze' && <CreditCard className="mx-auto text-[#00f0ff] mb-4" size={48} />}
                {activeAction === 'upi' && <Lock className="mx-auto text-[#b026ff] mb-4" size={48} />}
                {activeAction === 'device' && <Smartphone className="mx-auto text-green-500 mb-4" size={48} />}
                
                <h2 className="text-2xl font-heading text-white">
                  {activeAction === 'call' && t('repActionConnecting')}
                  {activeAction === 'freeze' && t('repActionFreeze')}
                  {activeAction === 'upi' && t('repActionUpi')}
                  {activeAction === 'device' && t('repActionDevice')}
                </h2>
                
                {actionStatus === 'idle' && (
                  <p className="text-gray-400 mt-2">
                    {activeAction === 'call' ? t('repActionCallDesc') : t('repActionGenericDesc')}
                  </p>
                )}
              </div>

              {actionStatus === 'idle' ? (
                <div className="space-y-4 text-left">
                  {activeAction === 'upi' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('repActionTargetUpi')}</label>
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@ybl"
                        className="w-full bg-black/50 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#b026ff] focus:ring-1 focus:ring-[#b026ff] transition-all"
                      />
                    </div>
                  )}

                  {activeAction === 'freeze' && (
                    <div className="mb-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('repActionBankName')}</label>
                        <input 
                          type="text" 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. State Bank of India"
                          className="w-full bg-black/50 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('repActionAccountNum')}</label>
                        <input 
                          type="text" 
                          value={accountNum}
                          onChange={(e) => setAccountNum(e.target.value)}
                          placeholder={t('repActionFreezePlaceholder')}
                          className="w-full bg-black/50 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {activeAction !== 'call' && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded text-sm text-red-400 flex items-start gap-3">
                      <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                      <p>{t('repActionWarning')}</p>
                    </div>
                  )}
                  <button 
                    onClick={simulateAction}
                    disabled={(activeAction === 'upi' && !upiId) || (activeAction === 'freeze' && (!accountNum || !bankName))}
                    className={`w-full font-bold py-3 px-4 rounded-md transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                      ${activeAction === 'call' ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]' : 
                        activeAction === 'freeze' ? 'bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' :
                        activeAction === 'upi' ? 'bg-[#b026ff] hover:bg-[#b026ff]/80 text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]' :
                        'bg-green-500 hover:bg-green-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                      }`}
                  >
                    {t('repActionConfirm')}
                  </button>
                </div>
              ) : actionStatus === 'processing' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00f0ff] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#00f0ff] font-mono animate-pulse">{t('repActionExecuting')}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-xl font-heading text-green-400 mb-2">{t('repActionCompleted')}</h3>
                  <p className="text-gray-400 text-sm mb-6">{t('repActionSuccess')}</p>
                  <button onClick={closeActionModal} className="border border-gray-600 hover:bg-gray-800 text-white py-2 px-6 rounded transition-all">
                    {t('repClose')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionCard({ icon, title, desc, color, onClick }: any) {
  const getColors = () => {
    switch(color) {
      case 'red': return 'border-red-500/30 text-red-500 hover:bg-red-500/10';
      case 'blue': return 'border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10';
      case 'purple': return 'border-[#b026ff]/30 text-[#b026ff] hover:bg-[#b026ff]/10';
      case 'green': return 'border-green-500/30 text-green-500 hover:bg-green-500/10';
      default: return 'border-gray-500/30 text-gray-500';
    }
  };

  return (
    <button onClick={onClick} className={`w-full text-left glass-panel p-4 flex items-center gap-4 transition-all ${getColors()}`}>
      <div className={`p-3 rounded-full bg-black/50 border border-current`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white font-heading">{title}</h3>
        <p className="text-xs opacity-80 mt-1 font-mono">{desc}</p>
      </div>
    </button>
  );
}
