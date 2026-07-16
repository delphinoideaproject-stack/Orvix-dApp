import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Send, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { mockTokens } from '../data';
import { Token, Story } from '../types';

interface CreatorPortalPageProps {
  walletConnected: boolean;
  walletAddress?: string;
  onOpenWalletModal: () => void;
  onNavigate?: (page: any) => void;
}

export function CreatorPortalPage({ walletConnected, walletAddress, onOpenWalletModal, onNavigate }: CreatorPortalPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  // Fake login check
  useEffect(() => {
    if (walletConnected && walletAddress) {
      const savedAuth = localStorage.getItem(`auth_${walletAddress}`);
      if (savedAuth) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [walletConnected, walletAddress]);

  const handleSign = async () => {
    if (!walletConnected || !walletAddress) {
      onOpenWalletModal();
      return;
    }
    
    setIsSigning(true);
    // Simulate signature delay
    setTimeout(() => {
      localStorage.setItem(`auth_${walletAddress}`, 'true');
      setIsAuthenticated(true);
      setIsSigning(false);
    }, 1500);
  };

  const handleLogout = () => {
    if (walletAddress) {
      localStorage.removeItem(`auth_${walletAddress}`);
    }
    setIsAuthenticated(false);
  };

  if (!walletConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[80vh]">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Wallet</h2>
        <p className="text-slate-600 max-w-md mb-8">
          You must connect your wallet to access the Creator Portal, submit new tokens, and manage stories.
        </p>
        <Button onClick={onOpenWalletModal} variant="primary" size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[80vh]">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Send className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Authenticate</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Please sign a message to verify you own this wallet. This signature does not cost any gas.
        </p>
        <Button onClick={handleSign} variant="primary" size="lg" disabled={isSigning}>
          {isSigning ? 'Waiting for signature...' : 'Sign to Login'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Creator Portal</h1>
          <p className="text-slate-500 mt-1">Manage your projects and engage your community</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Send className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Submit New Token</h3>
          <p className="text-slate-500 mb-6 text-sm">
            Launch your project on Orvix. Pass our deterministic AMM V2 liquidity locking checks to be listed.
          </p>
          <Button onClick={() => onNavigate?.('SUBMIT')} variant="primary" className="mt-auto">
            Start Submission
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6">Manage My Projects</h2>
      <ProjectManager walletAddress={walletAddress} />
    </div>
  );
}

function ProjectManager({ walletAddress }: { walletAddress: string }) {
  const [myTokens, setMyTokens] = useState<Token[]>([]);
  const [selectedTokenForStory, setSelectedTokenForStory] = useState<Token | null>(null);

  useEffect(() => {
    // For demo purposes, if wallet is connected, just assign them the first token in mockTokens
    // In reality, we would fetch tokens created by this wallet.
    const demoTokens = [mockTokens[0]];
    setMyTokens(demoTokens);
  }, [walletAddress]);

  if (myTokens.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        You haven't submitted any projects yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myTokens.map(token => (
        <div key={token.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <img src={token.logo} alt={token.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
            <div>
              <h4 className="font-bold text-slate-900">{token.name} <span className="text-slate-500 text-sm font-normal">({token.symbol})</span></h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{token.contract}</p>
            </div>
          </div>
          <Button onClick={() => setSelectedTokenForStory(token)} variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Story
          </Button>
        </div>
      ))}

      <AnimatePresence>
        {selectedTokenForStory && (
          <StoryUploadModal 
            token={selectedTokenForStory} 
            onClose={() => setSelectedTokenForStory(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryUploadModal({ token, onClose }: { token: Token; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = () => {
    if (!imageUrl) {
      setError('Please provide an image URL');
      return;
    }

    // Check rate limit (max 3 per 24 hours)
    const existingStoriesRaw = localStorage.getItem('orvix_stories');
    const existingStories: Story[] = existingStoriesRaw ? JSON.parse(existingStoriesRaw) : [];
    
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const recentStories = existingStories.filter(s => s.tokenId === token.id && s.timestamp > oneDayAgo);
    
    if (recentStories.length >= 3) {
      setError('Limit reached: Maximum 3 stories per 24 hours.');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const newStory: Story = {
        id: Math.random().toString(36).substr(2, 9),
        tokenId: token.id,
        imageUrl,
        text,
        timestamp: now
      };
      
      const updatedStories = [...existingStories, newStory];
      localStorage.setItem('orvix_stories', JSON.stringify(updatedStories));
      window.dispatchEvent(new Event('orvix_stories_updated'));
      
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Create Story</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {imageUrl && (
            <div className="aspect-[9/16] w-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Caption (Optional)</label>
            <textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What's new?"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          <Button onClick={handleUpload} variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Story'}
          </Button>
          <p className="text-xs text-center text-slate-500 mt-2">Max 3 stories per 24 hours. Stories expire after 24h.</p>
        </div>
      </motion.div>
    </div>
  );
}
