import React, { useState, useRef } from 'react';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { OrvixLogo } from './OrvixLogo';
import { Button } from './Button';
import { X, Download, Check, Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareBottomSheetProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
}


export function ShareBottomSheet({ token, isOpen, onClose }: ShareBottomSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const projectUrl = window.location.href;
  const isPositive = token.priceChange >= 0;
  const liquidityText = formatGlobalNumber(token.liquidityAdded || token.liquidityLockDuration || '100% Locked (Verified)');
  const marketCapText = formatGlobalNumber(token.marketCap || '$4.2M');
  const volumeText = formatGlobalNumber(token.volume24h || '$1.28M');
  const listedTimeText = token.listedAt || 'Just now';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopySuccess(true);
    window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Shareable link copied to clipboard!' }));
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        setTouchCurrentY(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchCurrentY > 100) {
      onClose();
    }
    setTouchStartY(null);
    setTouchCurrentY(0);
  };

  const handleDownloadCard = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // 1. Draw Wallpaper Image or Dark Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const wallpaperImg = new Image();
      wallpaperImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        wallpaperImg.onload = () => {
          ctx.drawImage(wallpaperImg, 0, 0, canvas.width, canvas.height);
          resolve(true);
        };
        wallpaperImg.onerror = () => resolve(true);
        wallpaperImg.src = token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80';
      });

      // Dark Overlay rgba(0,0,0,0.75)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Top Header: [Orvix Logo] Orvix Labs [timestamp]
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Orvix Labs', 100, 65);

      // Timestamp top right
      ctx.textAlign = 'right';
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#d4d4d8';
      ctx.fillText('2026-07-09 17:05 (UTC+8)', canvas.width - 60, 65);
      ctx.restore();

      // 3. Middle Section: [Token Icon] QAI [sparkline], QAI/USDT · BNB Chain
      ctx.save();
      // Draw token icon circle at x = 60, y = 160, r = 32
      ctx.beginPath();
      ctx.arc(92, 170, 32, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const tokenImg = new Image();
      tokenImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        tokenImg.onload = () => {
          ctx.drawImage(tokenImg, 60, 138, 64, 64);
          resolve(true);
        };
        tokenImg.onerror = () => resolve(true);
        tokenImg.src = token.logo || 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png';
      });
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(token.symbol, 145, 158);

      ctx.fillStyle = '#d4d4d8';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(`${token.pair} · BNB Chain`, 145, 196);

      // 4. Lower Section: PRICE, SINCE LISTED, QR Code
      ctx.save();
      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('PRICE', 60, 290);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(`$${formatGlobalNumber(token.price)}`, 60, 345);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('SINCE LISTED', 280, 290);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px Inter, sans-serif';
      ctx.fillText(`${token.priceChange >= 0 ? '+' : ''}${formatGlobalNumber(token.priceChange)}%`, 280, 345);
      ctx.restore();

      // QR Code bottom right
      const qrSize = 130;
      const qrX = canvas.width - 60 - qrSize;
      const qrY = 250;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 14);
      ctx.fill();

      const svgElement = document.getElementById(`share-qr-svg-${token.id}`);
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobURL = URL.createObjectURL(svgBlob);
        
        await new Promise((resolve) => {
          const qrImg = new Image();
          qrImg.onload = () => {
            ctx.drawImage(qrImg, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          qrImg.onerror = () => {
            URL.revokeObjectURL(blobURL);
            resolve(true);
          };
          qrImg.src = blobURL;
        });
      }

      // 5. Footer Line: LP: 100% Locked · AMM V2 · orvix.io
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 420);
      ctx.lineTo(canvas.width - 60, 420);
      ctx.stroke();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('LP: 100% Locked · AMM V2 · orvix.io', 60, 470);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${token.symbol.toLowerCase()}-orvix-share-card.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Official ORVIX Share Card downloaded successfully!' }));
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate share card:', err);
      window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Failed to generate share card. Please try again.' }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: touchCurrentY > 0 ? `translateY(${touchCurrentY}px)` : undefined,
          transition: touchCurrentY === 0 ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
        className="relative w-full max-w-xl bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 mb-1 sm:hidden cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-mono text-sm">▬</span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Share Token · {token.symbol}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Live Preview Card */}
          <div className="relative w-full aspect-[600/315] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between p-4 sm:p-5 font-sans font-bold text-white">
            {/* Token Wallpaper */}
            <img
              src={token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'}
              alt={token.name}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay rgba(0,0,0,0.75) */}
            <div className="absolute inset-0 bg-black/75" />

            {/* Top Row: [Orvix Logo] Orvix Labs [timestamp] */}
            <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <OrvixLogo className="w-5 h-5 text-white" />
                <span className="font-bold text-white tracking-wide">Orvix Labs</span>
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-zinc-300 font-bold">
                2026-07-09 17:05 (UTC+8)
              </div>
            </div>

            {/* Middle Row: [Token Icon] QAI [sparkline], QAI/USDT · BNB Chain */}
            <div className="relative z-10 flex items-start justify-between my-2">
              <div className="flex items-center gap-3">
                <img 
                  src={token.logo || 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'} 
                  alt={token.symbol}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                    {token.symbol}
                  </div>
                  <div className="text-[10px] sm:text-xs text-zinc-300 font-semibold">
                    {token.pair} · BNB Chain
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Row: PRICE, SINCE LISTED, [QR] */}
            <div className="relative z-10 flex items-end justify-between my-1">
              <div className="flex items-end gap-6 sm:gap-8">
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider">PRICE</div>
                  <div className="text-base sm:text-xl font-black font-mono text-white">${formatGlobalNumber(token.price)}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-400 tracking-wider">SINCE LISTED</div>
                  <div className={`text-sm sm:text-base font-black ${token.priceChange >= 0 ? 'text-white' : 'text-zinc-300'}`}>
                    {token.priceChange >= 0 ? '+' : ''}{formatGlobalNumber(token.priceChange)}%
                  </div>
                </div>
              </div>

              {/* QR Code Bottom Right */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center shrink-0">
                <QRCodeSVG
                  value={`https://orvix.io/token/${token.contract}`}
                  size={56}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Footer Line: LP: 100% Locked · AMM V2 · orvix.io */}
            <div className="relative z-10 text-[10px] sm:text-xs text-zinc-400 font-bold border-t border-white/10 pt-2 flex items-center justify-between">
              <span>LP: 100% Locked · AMM V2 · orvix.io</span>
            </div>
          </div>

          {/* Three iOS-style Circle Icon Buttons */}
          <div className="flex items-center justify-center gap-8 py-2">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                {copySuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownloadCard}
              disabled={isGenerating}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                ) : downloadSuccess ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                {isGenerating ? 'Saving...' : downloadSuccess ? 'Saved!' : 'Download'}
              </span>
            </button>

            {/* Share (Native) */}
            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `${token.name} (${token.symbol}) on Orvix`,
                      text: `Check out ${token.name} ($${token.symbol}) on Orvix Labs! Price: $${formatGlobalNumber(token.price)}`,
                      url: projectUrl,
                    });
                  } catch (e) {
                    // cancelled or failed
                  }
                } else {
                  handleCopyLink();
                }
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-all shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
                Share
              </span>
            </button>
          </div>

          <div className="text-center text-[11px] text-zinc-500 font-medium pb-1">
            Shareable on X · Telegram · Discord
          </div>
        </div>

        {/* Hidden QR code for canvas rendering */}
        <div className="hidden">
          <QRCodeSVG
            id={`share-qr-svg-${token.id}`}
            value={projectUrl}
            size={400}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    </div>
  );
}
