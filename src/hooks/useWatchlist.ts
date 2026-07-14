import { useState, useEffect } from 'react';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('orvix_watchlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('orvix_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (tokenId: string) => {
    setWatchlist(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const isInWatchlist = (tokenId: string) => watchlist.includes(tokenId);

  return { watchlist, toggleWatchlist, isInWatchlist };
}
