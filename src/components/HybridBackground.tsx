import React from 'react';

export const HybridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Theme-aware base background */}
      <div className="absolute inset-0 bg-[var(--bg)] transition-colors duration-500" />

      {/* 2. Soft Mesh Gradient Orbs with GPU-accelerated smooth animations */}
      <div className="absolute -top-[25%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[130px] animate-aurora-1 will-change-transform transform-gpu" />
      <div className="absolute top-[25%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[150px] animate-aurora-2 will-change-transform transform-gpu" />
      <div className="absolute -bottom-[25%] left-[15%] w-[65vw] h-[65vw] rounded-full bg-indigo-500/10 dark:bg-indigo-600/12 blur-[160px] animate-aurora-3 will-change-transform transform-gpu" />

      {/* 3. Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
