import React, { useState } from 'react';

export function OrvixLogo({ className }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <svg viewBox="0 0 120 50" width="90" height="38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Orvix Logo">
        <path d="M35 8 A20 20 0 1 0 35 42"
              stroke="#1e3a5f" strokeWidth="6"
              strokeLinecap="round" fill="none"/>
        <text x="48" y="36"
              fontFamily="Inter,sans-serif"
              fontWeight="700"
              fontSize="26"
              fill="url(#sg)">RIX</text>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b8299"/>
            <stop offset="100%" stopColor="#b8ccd8"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center ${className || ''}`}>
      <img 
        src="https://raw.githubusercontent.com/orvix-labs/Orvix-Icon/main/orvix.svg" 
        alt="ORVIX Logo"
        className="h-8 w-auto object-contain"
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}


