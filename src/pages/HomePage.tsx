import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Token } from '../types';
import { mockTokens, mockArchivedTokens } from '../data';
import { TokenRow } from '../components/TokenRow';
import { TokenPosterCard } from '../components/TokenPosterCard';
import { AvailableSlotCard } from '../components/AvailableSlotCard';
import { TokenLogo } from '../components/TokenLogo';
import { Button } from '../components/Button';
import { CopyButton } from '../components/CopyButton';
import { cn } from '../lib/utils';
import { ArrowUp, ArrowRight, Info, Globe, Send, Github, BookOpen, ExternalLink, Check, Copy, ChevronUp, Download, Share2, ChevronDown } from 'lucide-react';
import { formatGlobalNumber } from '../lib/formatNumber';
import { getExplorerUrl } from '../contracts/config';


const IconCopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Address copied to clipboard!' }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export function HomePage({ 
  setCurrentPage, 
  searchQuery = '', 
  onSelectToken,
  onQuickTrade 
}: { 
  setCurrentPage: (p: Page) => void, 
  searchQuery?: string, 
  onSelectToken?: (t: Token) => void,
  onQuickTrade?: (t: Token) => void 
}) {
  const [activeTab, setActiveTab] = useState<'new-alpha' | 'archive'>('new-alpha');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const newAlphaRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      const panelScroll = (activeTab === 'new-alpha' ? newAlphaRef.current?.scrollTop : archiveRef.current?.scrollTop) || 0;
      if (scrollPos > 400 || panelScroll > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    const nRef = newAlphaRef.current;
    const aRef = archiveRef.current;
    nRef?.addEventListener('scroll', handleScroll);
    aRef?.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      nRef?.removeEventListener('scroll', handleScroll);
      aRef?.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeTab === 'new-alpha' && newAlphaRef.current) {
      newAlphaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (activeTab === 'archive' && archiveRef.current) {
      archiveRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && activeTab === 'archive') {
        setActiveTab('new-alpha');
      } else if (deltaX < 0 && activeTab === 'new-alpha') {
        setActiveTab('archive');
      }
    }
    touchStartRef.current = null;
  };

  const filteredNewAlpha = mockTokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchive = mockArchivedTokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emptySlotsCount = Math.max(0, 6 - filteredNewAlpha.length);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-[900] tracking-tight mb-4 gradient-text" style={{ fontFamily: "'Inter', sans-serif" }}>
          Smarter Discovery Starts Here
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-medium">
          Built for discovering project launches, identifying early crypto assets, and executing efficient trades through intelligent AMM V2 aggregation.
        </p>
      </div>

      {/* Tabs Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6"
      >
        <button
          onClick={() => setActiveTab('new-alpha')}
          className={cn(
            "pb-3 px-6 text-sm font-semibold transition-colors relative cursor-pointer",
            activeTab === 'new-alpha' 
              ? "text-zinc-900 dark:text-zinc-100" 
              : "text-[#8da3ba] hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          New Alpha
          {activeTab === 'new-alpha' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a5f] dark:bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={cn(
            "pb-3 px-6 text-sm font-semibold transition-colors relative cursor-pointer",
            activeTab === 'archive' 
              ? "text-zinc-900 dark:text-zinc-100" 
              : "text-[#8da3ba] hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          Archive
          {activeTab === 'archive' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a5f] dark:bg-blue-500" />
          )}
        </button>
      </motion.div>

      {/* Swipe Container */}
      <div 
        className="overflow-hidden w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={cn(
          "flex w-[200%] transition-transform duration-300 ease-in-out will-change-transform",
          activeTab === 'archive' ? '-translate-x-[50%]' : 'translate-x-0'
        )}>
          {/* New Alpha Panel */}
          <div ref={newAlphaRef} className="w-1/2 shrink-0 overflow-y-auto pr-2 max-h-[75vh]">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 pb-6">
              {filteredNewAlpha.length > 0 ? (
                filteredNewAlpha.map((t, index) => (
                  <TokenPosterCard 
                    key={`${t.id}-${index}`} 
                    token={t} 
                    index={index} 
                    onNavigate={setCurrentPage} 
                    onSelect={onSelectToken} 
                  />
                ))
              ) : null}

              {Array.from({ length: emptySlotsCount }).map((_, i) => (
                <motion.div 
                  key={`empty-slot-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 * (filteredNewAlpha.length + i) }}
                  onClick={() => setCurrentPage?.('SUBMIT')}
                  className="aspect-[3/4] border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl sm:rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors group shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-blue-600 group-hover:text-white text-zinc-500 flex items-center justify-center transition-colors mb-1.5">
                    <span className="text-base font-bold">+</span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300">Available Slot</div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 mt-0.5">Submit Token</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Archive Panel */}
          <div ref={archiveRef} className="w-1/2 shrink-0 overflow-y-auto pl-2 max-h-[75vh]">
            <div className="mb-6">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                Tokens that have completed their time in New Alpha.{'\n'}Still active. Still tradeable.
              </p>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800 pb-12">
              {filteredArchive.length > 0 ? (
                filteredArchive.map((t, index) => {
                  const isExpanded = expandedId === t.id;
                  return (
                    <motion.div 
                      key={t.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="py-4 transition-colors"
                    >
                      <div 
                        className="flex items-center justify-between cursor-pointer group py-2"
                        onClick={() => onSelectToken?.(t)}
                      >
                        {/* Left: Icon + Pair */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <TokenLogo tokenId={t.logo || t.id} className="w-8 h-8" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              {t.pair}
                              <span className="text-xs font-normal text-zinc-500">({t.name})</span>
                            </div>
                            <div className="text-xs text-zinc-400">{t.listedAt}</div>
                          </div>
                        </div>

                        {/* Middle: Current Price */}
                        <div className="text-right sm:text-left font-mono font-medium text-zinc-900 dark:text-zinc-100">
                          ${formatGlobalNumber(t.price)}
                        </div>

                        {/* Right: Swap Button + Arrow */}
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1.5 px-3 rounded-xl"
                            onClick={() => setCurrentPage?.('SWAP')}
                          >
                            Trade
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : t.id);
                            }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Toggle Details"
                          >
                            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Inline Expanded Detail View */}
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl space-y-4 text-sm"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="text-xs font-semibold text-zinc-500">Contract</div>
                                <div className="relative group/tooltip inline-flex items-center">
                                  <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col gap-1 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-30 text-xs font-sans text-zinc-200 pointer-events-none">
                                    <span className="font-bold text-zinc-100">Smart Contract Address</span>
                                    <span className="text-zinc-400">Decentralized smart contract on BNB Chain governing token transfers, liquidity pools, and AMM V2 trading rules.</span>
                                    <span className="text-[11px] font-mono text-blue-400 break-all mt-0.5">{t.contract}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mb-2">{t.contract}</div>
                              <div className="flex gap-2">
                                <CopyButton text={t.contract} label="Copy" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
                                <a href={`${getExplorerUrl()}/address/${t.contract}`} target="_blank" rel="noreferrer" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">BscScan</a>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-zinc-500 mb-1">Creator</div>
                              <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mb-2">{t.creator}</div>
                              <div className="flex gap-2">
                                <CopyButton text={t.creator} label="Copy" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
                                <a href={`${getExplorerUrl()}/address/${t.creator}`} target="_blank" rel="noreferrer" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">BscScan</a>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-zinc-500 mb-1">AMM Version</div>
                              <div className="text-xs text-zinc-900 dark:text-zinc-100 font-medium">{t.ammVersion}</div>
                              <div className="mt-3">
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => onSelectToken?.(t)}>
                                  Open Full Modal
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  No archived tokens found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
