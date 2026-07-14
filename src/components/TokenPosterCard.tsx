import React from 'react';
import { motion } from 'motion/react';
import { Token, Page } from '../types';
import { cn } from '../lib/utils';
import { formatGlobalNumber } from '../lib/formatNumber';

interface TokenPosterCardProps {
  token: Token;
  index?: number;
  onNavigate?: (page: Page) => void;
  onSelect?: (token: Token) => void;
}

export const TokenPosterCard: React.FC<TokenPosterCardProps> = ({
  token,
  index = 0,
  onNavigate,
  onSelect
}) => {
  const isPositive = token.priceChange >= 0;

  return (
    <motion.div
      onClick={() => onSelect?.(token)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min(index, 8) * 0.05 
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 aspect-[3/4] flex flex-col justify-between cursor-pointer group shadow-sm transition-all duration-300 hover:border-blue-500"
      )}
    >
      {/* Project Wallpaper (Cover Image) */}
      <img
        src={token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'}
        alt={token.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

      {/* Top badges / symbol */}
      <div className="relative z-10 p-2.5 sm:p-3 flex justify-between items-start">
        <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white">
          {token.symbol}
        </span>
        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-md ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isPositive ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
        </span>
      </div>

      {/* Bottom Overlay with Token Information */}
      <div className="relative z-10 p-3 sm:p-4 flex flex-col justify-end space-y-1 sm:space-y-1.5 pb-3 sm:pb-4">
        <div>
          {/* Token Pair */}
          <div className="text-xs sm:text-sm font-bold text-white truncate">{token.pair}</div>
          {/* Listed Time */}
          <div className="text-[10px] sm:text-xs text-zinc-300 font-medium">Listed {token.listedAt}</div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          {/* Current Price */}
          <div className="text-xs sm:text-sm font-mono font-bold text-white">${formatGlobalNumber(token.price)}</div>
        </div>
      </div>
    </motion.div>
  );
};
