'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, MessageSquare, Heart, Search, Plus, X, 
  Calendar, DollarSign, Filter, BookOpen, AlertTriangle, ArrowRight, UserCheck, EyeOff, User
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

interface Comment {
  _id?: string;
  authorName: string;
  commentText: string;
  createdAt: string;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  scamType: string;
  financialLoss: number;
  authorName: string;
  isAnonymous: boolean;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export default function StoryBoardPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState('');
  const [scamType, setScamType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // New Story Form State
  const [newTitle, setNewTitle] = useState('');
  const [newScamType, setNewScamType] = useState('UPI Fraud');
  const [newLoss, setNewLoss] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [customName, setCustomName] = useState('');
  const [submittingStory, setSubmittingStory] = useState(false);

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Current logged in user context
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Read user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        scamType,
        search,
        sortBy
      });
      const res = await fetch(`${API_URL}/stories?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch stories');
      const data = await res.json();
      setStories(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load stories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [scamType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories();
  };

  const handleLike = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/stories/${storyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to upvote');
      const data = await res.json();
      
      // Update local state
      setStories(prev => prev.map(s => {
        if (s._id === storyId) {
          return { ...s, likes: data.likes };
        }
        return s;
      }));

      // Update activeStory details if currently viewing
      if (activeStory && activeStory._id === storyId) {
        setActiveStory(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating upvotes. Please try again.');
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newScamType) {
      alert('Title, Description and Scam Type are required.');
      return;
    }

    setSubmittingStory(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        title: newTitle,
        description: newDesc,
        scamType: newScamType,
        financialLoss: Number(newLoss) || 0,
        isAnonymous,
        customAuthorName: isAnonymous ? (customName.trim() || 'Anonymous Citizen') : (customName.trim() || currentUser?.name || 'Anonymous Citizen')
      };

      const res = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit experience');
      }

      await res.json();
      
      // Reset form
      setNewTitle('');
      setNewLoss('');
      setNewDesc('');
      setCustomName('');
      setIsAnonymous(true);
      setIsShareModalOpen(false);

      // Refresh list
      fetchStories();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred while sharing experience.');
    } finally {
      setSubmittingStory(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory) return;
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/stories/${activeStory._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          commentText,
          customAuthorName: commentAuthor.trim() || currentUser?.name || 'Anonymous Citizen'
        })
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();

      // Update activeStory local list
      setActiveStory(prev => prev ? { ...prev, comments: data.comments } : null);
      
      // Update main list reference comments length
      setStories(prev => prev.map(s => {
        if (s._id === activeStory._id) {
          return { ...s, comments: data.comments };
        }
        return s;
      }));

      setCommentText('');
      setCommentAuthor('');
    } catch (err) {
      console.error(err);
      alert('Could not submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getScamTypeStyles = (type: string) => {
    switch (type) {
      case 'UPI Fraud': return 'border-[#00f0ff]/30 text-[#00f0ff] bg-[#00f0ff]/5';
      case 'OTP Scam': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5';
      case 'Phishing Link': return 'border-orange-500/30 text-orange-400 bg-orange-500/5';
      case 'Fake Customer Care': return 'border-pink-500/30 text-pink-400 bg-pink-500/5';
      case 'Sextortion': return 'border-[#ff003c]/30 text-[#ff003c] bg-[#ff003c]/5';
      case 'Job Offer': return 'border-[#b026ff]/30 text-[#b026ff] bg-[#b026ff]/5';
      case 'WhatsApp Scam': return 'border-green-500/30 text-green-400 bg-green-500/5';
      default: return 'border-gray-500/30 text-gray-400 bg-gray-500/5';
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#b026ff]/30 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-wide">
            CITIZEN SHIELD STORY BOARD
          </h1>
          <p className="text-[#b026ff] font-mono text-sm">Karnataka Cyber Defense Grid - Citizen Warning Forum</p>
        </div>
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="bg-[#b026ff] hover:bg-[#b026ff]/80 text-white font-bold py-3 px-6 rounded-md transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(176,38,255,0.4)]"
        >
          <Plus size={18} /> SHARE YOUR STORY
        </button>
      </div>

      {/* Cyber Warning Alert Ticker */}
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md mb-8 flex items-start gap-3">
        <ShieldAlert className="text-red-500 shrink-0 mt-0.5 animate-pulse" size={20} />
        <div>
          <h4 className="text-sm font-bold text-white font-heading">CRITICAL WARNING FOR CITIZENS</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Scammers are heavily using "Part-time Job Offers" via WhatsApp and Telegram. Never pay money upfront for completing "tasks" or to unlock money. Treat all unsolicited UPI/OTP requests as high risk.
          </p>
        </div>
      </div>

      {/* Filter and Control Panel */}
      <div className="glass-panel p-4 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center border-[#00f0ff]/20">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search keyword (e.g. WhatsApp, refund, SBI)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-gray-800 rounded p-2.5 pl-10 text-white focus:border-[#00f0ff] outline-none" 
            />
          </div>
          <button type="submit" className="bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] px-5 py-2.5 font-bold transition-all">
            SEARCH
          </button>
        </form>

        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-gray-500 shrink-0" size={16} />
            <select 
              value={scamType} 
              onChange={(e) => setScamType(e.target.value)}
              className="w-full sm:w-44 bg-black/40 border border-gray-800 rounded p-2.5 text-white focus:border-[#00f0ff] outline-none"
            >
              <option value="All">All Scam Types</option>
              <option value="UPI Fraud">UPI Fraud</option>
              <option value="OTP Scam">OTP Scam</option>
              <option value="Phishing Link">Phishing Link</option>
              <option value="Fake Customer Care">Fake Customer Care</option>
              <option value="Job Offer">Job Offer</option>
              <option value="WhatsApp Scam">WhatsApp Scam</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Sorter */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-44 bg-black/40 border border-gray-800 rounded p-2.5 text-white focus:border-[#00f0ff] outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="likes">Most Alerted (Likes)</option>
            <option value="financialLoss">Highest Financial Loss</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-[#b026ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">LOADING STORIES...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400 bg-red-950/20 border border-red-900 rounded-md">
          <AlertTriangle className="mx-auto mb-3" size={32} />
          <p>{error}</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="py-24 text-center glass-panel border-gray-800">
          <BookOpen className="text-gray-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl text-white mb-2 font-heading">NO STORIES FOUND</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-6">Be the first to share your experience and warn others about new scam methods.</p>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="border border-[#b026ff] text-[#b026ff] hover:bg-[#b026ff]/10 font-bold px-6 py-2.5 rounded transition-all"
          >
            SHARE AN EXPERIENCE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <motion.div 
              key={story._id}
              whileHover={{ y: -4, borderColor: 'rgba(0,240,255,0.4)' }}
              onClick={() => setActiveStory(story)}
              className="glass-panel p-6 border-[#b026ff]/20 flex flex-col justify-between cursor-pointer transition-all h-[320px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <span className={`px-2.5 py-1 text-xs font-mono border rounded ${getScamTypeStyles(story.scamType)}`}>
                    {story.scamType}
                  </span>
                  {story.financialLoss > 0 && (
                    <span className="text-xs font-mono text-red-400 font-bold">
                      Loss: ₹{story.financialLoss.toLocaleString()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white font-heading mb-2 line-clamp-2 hover:text-[#00f0ff] transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-4 leading-relaxed">
                  {story.description}
                </p>
              </div>

              <div className="border-t border-gray-800/80 pt-4 flex items-center justify-between text-xs text-gray-500 font-mono mt-auto">
                <span className="flex items-center gap-1.5 truncate max-w-[130px]" title={story.authorName}>
                  {story.isAnonymous ? <EyeOff size={13} className="opacity-60" /> : <UserCheck size={13} className="opacity-60" />}
                  {story.authorName}
                </span>

                <div className="flex items-center gap-4 shrink-0">
                  <button 
                    onClick={(e) => handleLike(story._id, e)}
                    className="flex items-center gap-1 hover:text-[#00f0ff] transition-colors group"
                  >
                    <Heart size={14} className="group-hover:scale-110 text-red-500 fill-red-500/20" />
                    <span>{story.likes}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} className="text-[#b026ff]" />
                    <span>{story.comments.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Story Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 md:p-8 max-w-2xl w-full border-[#b026ff]/40 my-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
                <h2 className="text-xl font-heading text-[#b026ff] flex items-center gap-2">
                  <Plus /> SHARE COMPROMISE EXPERIENCE
                </h2>
                <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddStory} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2">SCAM METHOD / TITLE</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. WhatsApp Job Scam asking for money task"
                    className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#b026ff] outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">SCAM TYPE</label>
                    <select 
                      value={newScamType} 
                      onChange={(e) => setNewScamType(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#b026ff] outline-none"
                    >
                      <option value="UPI Fraud">UPI Fraud</option>
                      <option value="OTP Scam">OTP Scam</option>
                      <option value="Phishing Link">Phishing Link</option>
                      <option value="Fake Customer Care">Fake Customer Care</option>
                      <option value="Job Offer">Job Offer</option>
                      <option value="WhatsApp Scam">WhatsApp Scam</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">FINANCIAL LOSS (INR, OPTIONAL)</label>
                    <input 
                      type="number" 
                      value={newLoss}
                      onChange={(e) => setNewLoss(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#b026ff] outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2">HOW DID IT HAPPEN? (BE DETAILED TO INFORM OTHERS)</label>
                  <textarea 
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details on step-by-step occurrence: messages received, links clicked, phone numbers, warning signs you missed, or how you protected yourself."
                    className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#b026ff] outline-none h-44" 
                  />
                </div>

                <div className="bg-black/40 p-4 border border-gray-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="anon"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4.5 h-4.5 text-[#b026ff] bg-black border-gray-700 rounded focus:ring-[#b026ff] accent-[#b026ff]" 
                    />
                    <label htmlFor="anon" className="text-sm text-gray-300 font-mono select-none cursor-pointer">
                      Post Anonymously
                    </label>
                  </div>

                  <div className="flex-1 sm:max-w-xs">
                    <label className="block text-xs font-mono text-gray-500 mb-1">
                      {isAnonymous ? 'ALIAS NAME (OPTIONAL)' : 'AUTHOR NAME'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={isAnonymous ? 'e.g. Alert Citizen' : (currentUser?.name || 'Anonymous')}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-black/50 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:border-[#b026ff] outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingStory}
                  className="w-full bg-[#b026ff] hover:bg-[#b026ff]/80 text-white font-bold py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingStory ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      PUBLISHING REPORT...
                    </>
                  ) : (
                    'PUBLISH STORY TO BOARD'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Details & Comments Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 md:p-8 max-w-3xl w-full border-[#00f0ff]/40 my-8 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-3 shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`px-2.5 py-1 text-xs font-mono border rounded ${getScamTypeStyles(activeStory.scamType)}`}>
                      {activeStory.scamType}
                    </span>
                    {activeStory.financialLoss > 0 && (
                      <span className="text-sm font-mono text-red-500 font-bold">
                        Loss: ₹{activeStory.financialLoss.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-heading text-white">{activeStory.title}</h2>
                </div>
                <button onClick={() => setActiveStory(null)} className="text-gray-400 hover:text-white transition-colors shrink-0 ml-4">
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
                
                {/* Meta details */}
                <div className="flex flex-wrap justify-between items-center gap-4 py-2 border-y border-gray-900 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-2">
                    {activeStory.isAnonymous ? <EyeOff size={14} /> : <User size={14} />}
                    Shared by: <strong className="text-gray-300">{activeStory.authorName}</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(activeStory.createdAt).toLocaleDateString()} at {new Date(activeStory.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Main description */}
                <div className="bg-black/30 border border-gray-900 rounded p-5 text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                  {activeStory.description}
                </div>

                {/* Upvotes bar */}
                <div className="flex items-center gap-4 bg-gray-950/40 p-4 border border-gray-900 rounded">
                  <button 
                    onClick={(e) => handleLike(activeStory._id, e)}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded font-mono text-xs font-bold transition-all flex items-center gap-2 shrink-0"
                  >
                    <Heart size={14} className="fill-red-500/20" />
                    UPVOTE ALERT ({activeStory.likes})
                  </button>
                  <p className="text-xs text-gray-400 leading-normal">
                    Upvote this alert if you found this informative or have observed a similar fraud attempt. Helps push the story to citizen tickers.
                  </p>
                </div>

                {/* Comment Section */}
                <div>
                  <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#00f0ff]" />
                    CITIZEN WARNINGS & RESPONSES ({activeStory.comments.length})
                  </h3>

                  {activeStory.comments.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 text-xs border border-dashed border-gray-900 rounded">
                      No warning comments yet. Have advice or query? Let the community know.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeStory.comments.map((comment, index) => (
                        <div key={comment._id || index} className="bg-black/20 border border-gray-900 rounded p-4 space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                            <span className="text-[#00f0ff] font-bold">{comment.authorName}</span>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">{comment.commentText}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mt-6 space-y-3">
                    <h4 className="text-xs font-heading font-bold text-gray-400">ADD ADVICE OR WARNING COMMENT</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <textarea 
                          required
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Provide advice, warning tips, or question..."
                          className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#00f0ff] outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-between">
                        <input 
                          type="text"
                          placeholder="Your Name (optional)"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-[#00f0ff] outline-none text-xs"
                        />
                        <button 
                          type="submit"
                          disabled={submittingComment}
                          className="w-full bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black font-bold py-3 rounded text-xs transition-all flex justify-center items-center gap-1.5"
                        >
                          {submittingComment ? (
                            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'POST COMMENT'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
