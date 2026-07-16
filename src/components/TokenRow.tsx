import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { TokenLogo } from './TokenLogo';
import { Badge } from './Badge';
import { Button } from './Button';
import { Star, Globe, Send, Github, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { getExplorerUrl } from '../contracts/config';
import { useTokenStories } from '../hooks/useTokenStories';
import { StoryViewerModal } from './StoryViewerModal';


export interface TokenAction {
  label: string;
  variant?: 'primary' | 'outline' | 'secondary';
  onClick: (token: Token) => void;
}

export interface TokenRowProps {
  token: Token;
  showSwap?: boolean;
  showExitType?: boolean;
  onNavigate?: (page: any) => void;
  onSelect?: (token: Token) => void;
  index?: number;
  actions?: TokenAction[];
}

// Icon-only copy button component without text
const IconCopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

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
      className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
    </button>
  );
};

export const TokenRow: React.FC<TokenRowProps> = ({ 
  token, 
  showExitType = true, 
  onNavigate, 
  onSelect, 
  index = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const isPositive = token.priceChange >= 0;
  const isWatched = isInWatchlist(token.id);
  const stories = useTokenStories(token.id);
  const hasActiveStories = stories.length > 0;

  return (
    <>
      {showStory && <StoryViewerModal token={token} stories={stories} onClose={() => setShowStory(false)} />}
      <motion.div 
        onClick={() => onSelect?.(token)}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.16, 1, 0.3, 1],
          delay: Math.min(index, 8) * 0.05 
        }}
        whileHover={{ 
          y: -3,
          scale: 1.01,
          boxShadow: "0 12px 30px -10px rgba(0,0,0,0.08)",
        }}
        className="border border-[var(--border)] rounded-3xl bg-[var(--card)] p-4 sm:p-6 mb-6 flex flex-col hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all duration-300 cursor-pointer group relative shadow-sm"
      >
        {/* Watchlist Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(token.id);
          }}
          className={`absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-full transition-colors z-10 ${
            isWatched 
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
              : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Star className="w-5 h-5" fill={isWatched ? "currentColor" : "none"} />
        </button>

        {/* 1, 2, 3, 4, 5. Layout Priority: Project Name, Pair, Listed Time, Price, Change % */}
        <div className="relative mb-4 sm:mb-6">
          <div 
            className={`inline-block mb-3 sm:mb-4 rounded-full p-[3px] transition-transform ${hasActiveStories ? 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:scale-105 cursor-pointer' : ''}`}
            onClick={(e) => {
              if (hasActiveStories) {
                e.stopPropagation();
                setShowStory(true);
              }
            }}
          >
            <div className={`rounded-full ${hasActiveStories ? 'bg-[var(--card)] p-[2px]' : ''}`}>
              <TokenLogo tokenId={token.logo} className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="pr-12 sm:pr-0">
            {/* 1. Project Name */}
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">{token.name}</h3>
            {/* 2. Pair */}
            <div className="text-zinc-600 dark:text-zinc-400 font-medium text-sm sm:text-base mb-1.5">{token.symbol} ({token.pair})</div>
            {/* 3. Listed Time */}
            <div className="text-xs sm:text-sm text-zinc-500">Listed {token.listedAt}</div>
          </div>
          
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0">
            {/* 4. Price */}
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">${formatGlobalNumber(token.price)}</div>
            {/* 5. Change % */}
            <div className={`text-base sm:text-lg font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
            </div>
          </div>
        </div>
      </div>

      {showExitType && token.exitType && (
        <div className="mb-4">
          <Badge variant={token.exitType === 'Removed' ? 'destructive' : 'success'}>
            {token.exitType}
          </Badge>
        </div>
      )}

      {/* 6. Trade Button & View Details button at bottom-right */}
      <div className="mt-2 mb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button 
          variant="primary"
          className="flex-1 justify-center text-sm sm:text-base py-3.5 sm:py-4 font-semibold rounded-2xl" 
          size="lg" 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('SWAP');
          }}
        >
          Trade
        </Button>

        {/* View Details / Hide Details button at bottom-right / action area */}
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* CSS Grid Accordion for smooth auto-height (0fr to 1fr) for token detail container */}
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-5 border-t border-zinc-100 dark:border-zinc-800 pt-5 mt-2">
            
            {/* 7. Contract */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 mb-1">Contract</div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                <span className="font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">{token.contract}</span>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <IconCopyButton text={token.contract} />
                  <a 
                    href={`${getExplorerUrl()}/address/${token.contract}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="View on BscScan"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* 8. Creator */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 mb-1">Creator</div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                <span className="font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">{token.creator}</span>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <IconCopyButton text={token.creator} />
                  <a 
                    href={`${getExplorerUrl()}/address/${token.creator}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="View Creator on BscScan"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* 9. Liquidity */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 mb-1">Liquidity Added</div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-line leading-relaxed">
                {token.liquidityAdded || `100,000,000 ${token.symbol}\n+\n10,000 USDT`}
              </div>
            </div>

            {/* 10. Transaction History (Add LP TX, Lock LP TX, Renounce TX) */}
            <div className="space-y-3">
              <div className="text-xs sm:text-sm font-semibold text-zinc-500">Transaction History</div>
              
              {/* Add LP TX */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400">Add LP TX</div>
                  <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{token.addLpTx}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <IconCopyButton text={token.addLpTx} />
                  <a 
                    href={`${getExplorerUrl()}/tx/${token.addLpTx}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="View Transaction"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Lock LP TX */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400">Lock LP TX</div>
                  <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{token.lockLpTx}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <IconCopyButton text={token.lockLpTx} />
                  <a 
                    href={`${getExplorerUrl()}/tx/${token.lockLpTx}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="View Transaction"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Renounce TX */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400">Renounce TX</div>
                  <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{token.renounceTx}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <IconCopyButton text={token.renounceTx} />
                  <a 
                    href={`${getExplorerUrl()}/tx/${token.renounceTx}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="View Transaction"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* 11. AMM Version */}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-500 mb-1">AMM Version</div>
              <div className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-semibold font-mono">
                {token.ammVersion || 'AMM V2'} · BNB Chain
              </div>
            </div>

            {/* 12. Official Links (Moved to the VERY BOTTOM) */}
            {(token.website || token.x || token.telegram || token.github || token.documentation) && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-xs sm:text-sm font-semibold text-zinc-500 mb-2">Official Project</div>
                <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                  {token.website && (
                    <a
                      href={token.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-zinc-500" />
                      <span>Website</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  )}
                  {token.x && (
                    <a
                      href={token.x}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <svg className="w-5 h-5 fill-current text-zinc-500" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  )}
                  {token.telegram && (
                    <a
                      href={token.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <Send className="w-5 h-5 text-blue-500" />
                      <span>Telegram</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  )}
                  {token.github && (
                    <a
                      href={token.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <Github className="w-5 h-5 text-zinc-500" />
                      <span>GitHub</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  )}
                  {token.documentation && (
                    <a
                      href={token.documentation}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <span>Documentation</span>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export const NewAlphaRow = TokenRow;

export const NewAlphaSkeletonCard: React.FC = () => {
  return (
    <div className="border border-[var(--border)] rounded-3xl bg-[var(--card)] p-4 sm:p-6 mb-6 flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/5" />
      </div>
      <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full" />
    </div>
  );
};

