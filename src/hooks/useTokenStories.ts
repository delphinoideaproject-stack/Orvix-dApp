import { useState, useEffect } from 'react';
import { Story } from '../types';

export function useTokenStories(tokenId: string) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
      const raw = localStorage.getItem('orvix_stories');
      if (raw) {
        try {
          const allStories: Story[] = JSON.parse(raw);
          const now = Date.now();
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          
          const tokenActiveStories = allStories
            .filter(s => s.tokenId === tokenId && s.timestamp > oneDayAgo)
            .sort((a, b) => a.timestamp - b.timestamp);
            
          setStories(tokenActiveStories);
        } catch (e) {
          console.error('Error parsing stories', e);
        }
      }
    };

    handleStorageChange();
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('orvix_stories_updated', handleStorageChange);
    
    const interval = setInterval(handleStorageChange, 60000); // Check expiry every minute

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orvix_stories_updated', handleStorageChange);
      clearInterval(interval);
    };
  }, [tokenId]);

  return stories;
}
