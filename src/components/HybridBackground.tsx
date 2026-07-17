import React from 'react';

export const HybridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050b14]">
      {/* Radial gradient background blur */}
      <div 
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(30, 58, 95, 0.4) 0%, transparent 45%),
            radial-gradient(circle at 90% 10%, rgba(92, 206, 255, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 50% 80%, rgba(13, 31, 53, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 80% 90%, rgba(30, 58, 95, 0.3) 0%, transparent 45%)
          `
        }}
      />
      
      {/* GPU-accelerated animated radial glows */}
      <div className="absolute top-[5%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#1e3a5f]/15 blur-[120px] animate-aurora-1 will-change-transform transform-gpu" />
      <div className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-[#5cceff]/08 blur-[130px] animate-aurora-2 will-change-transform transform-gpu" />
      
      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
