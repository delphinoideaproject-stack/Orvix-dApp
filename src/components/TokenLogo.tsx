import React, { useState, useEffect } from 'react';
import { CircleHelp } from 'lucide-react';
import { cn } from '../lib/utils';

interface TokenLogoProps {
  tokenId: string; // e.g. 'tether', 'usd-coin', 'binancecoin'
  className?: string;
}

export function TokenLogo({ tokenId, className }: TokenLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokenId === 'UNKNOWN') {
      setError(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    // Attempt to fetch from coingecko
    fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load logo');
        return res.json();
      })
      .then(data => {
        if (isMounted && data.image?.small) {
          setLogoUrl(data.image.small);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [tokenId]);

  if (loading) {
    return <div className={cn("rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse", className)} />;
  }

  if (error || !logoUrl) {
    return (
      <div className={cn("rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-300 dark:border-zinc-700", className)}>
        <CircleHelp className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <img src={logoUrl} alt="Token Logo" className={cn("rounded-full bg-white object-cover border border-zinc-200 dark:border-zinc-700", className)} />
  );
}
