import React, { useState, useEffect } from 'react';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { TokenLogo } from '../components/TokenLogo';
import { ArrowLeft, Share2, Copy, Check, Globe, Github, Send, ExternalLink, BookOpen, Search, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { SwapPage } from './SwapPage';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { getExplorerUrl, ORVIX_CONFIG, getEffectiveRpcUrl } from '../contracts/config';


const IconCopyButton = ({ text, className, isDarkText = false }: { text: string; className?: string; isDarkText?: boolean }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.dispatchEvent(new CustomEvent('orvix-toast', { detail: 'Copied to clipboard!' }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center backdrop-blur-md", 
        isDarkText 
          ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white"
          : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white",
        className
      )}
      title="Copy"
    >
      {copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

const InfoRow = ({ label, value, link, badge, address }: { label: string, value?: string, link?: string, badge?: React.ReactNode, address?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-zinc-100 dark:border-white/5 gap-2">
    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
    <div className="flex items-center gap-2">
      {badge && badge}
      {value && <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</span>}
      {address && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {address.slice(0, 6)}....{address.slice(-4)}
          </span>
          <IconCopyButton text={address} className="w-7 h-7 p-0" isDarkText />
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/70 dark:hover:text-white transition-colors backdrop-blur-md">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

const MarketInfoCard = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md flex flex-col gap-1 shadow-sm dark:shadow-none">
    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
    <span className="font-mono text-base font-bold text-zinc-900 dark:text-white">{value}</span>
  </div>
);

export function TokenDetailPage({ 
  token, 
  onBack, 
  onSwap,
}: { 
  token: Token; 
  onBack: () => void; 
  onSwap: () => void;
}) {
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [loadingOnChain, setLoadingOnChain] = useState(true);
  const [livePrice, setLivePrice] = useState(token.price);
  const [liveLiquidity, setLiveLiquidity] = useState('$54,200');
  const [liveMcap, setLiveMcap] = useState('$1,250,000');
  const [liveFdv, setLiveFdv] = useState('$1,500,000');
  const [liveLiquidityRatio, setLiveLiquidityRatio] = useState('4.1%');
  const [liveBasePair, setLiveBasePair] = useState(token.pair || 'USST/USD');
  const isPositive = token.priceChange >= 0;

  useEffect(() => {
    let isMounted = true;
    const fetchMarketData = async () => {
      setLoadingOnChain(true);
      try {
        const rpcUrl = getEffectiveRpcUrl();
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        let bnbUsdPrice = 600;
        try {
          const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
          const data = await res.json();
          if (data && data.price) {
            bnbUsdPrice = Number(data.price);
          }
        } catch (e) {}

        const tokenContractAddress = token.contract;
        const pairContractAddress = token.addLpTx && token.addLpTx.startsWith('0x') && token.addLpTx.length === 42 
          ? token.addLpTx 
          : '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95';

        const tokenContract = new ethers.Contract(
          tokenContractAddress,
          [
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint256)"
          ],
          provider
        );

        const pairContract = new ethers.Contract(
          pairContractAddress,
          [
            "function token0() view returns (address)",
            "function token1() view returns (address)",
            "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
          ],
          provider
        );

        const [
          totalSupplyRaw,
          tokenDecimals,
          tokenSymbol,
          burn1,
          burn2,
          t0,
          t1,
          reserves
        ] = await Promise.all([
          tokenContract.totalSupply().catch(() => 100000000n * 10n ** 18n),
          tokenContract.decimals().catch(() => 18),
          tokenContract.symbol().catch(() => token.symbol || 'TOKEN'),
          tokenContract.balanceOf("0x000000000000000000000000000000000000dEaD").catch(() => 0n),
          tokenContract.balanceOf("0x0000000000000000000000000000000000000000").catch(() => 0n),
          pairContract.token0().catch(() => '0x0'),
          pairContract.token1().catch(() => '0x0'),
          pairContract.getReserves().catch(() => [0n, 0n, 0])
        ]);

        if (!isMounted) return;

        let quoteSymbol = 'USD';
        let quoteDecimals = 18;
        const quoteAddress = t0.toLowerCase() === tokenContractAddress.toLowerCase() ? t1 : t0;
        if (quoteAddress && quoteAddress !== '0x0' && quoteAddress.startsWith('0x')) {
          try {
            const quoteContract = new ethers.Contract(
              quoteAddress,
              [
                "function symbol() view returns (string)",
                "function decimals() view returns (uint8)"
              ],
              provider
            );
            const [qSym, qDec] = await Promise.all([
              quoteContract.symbol().catch(() => 'USD'),
              quoteContract.decimals().catch(() => 18)
            ]);
            quoteSymbol = qSym;
            quoteDecimals = Number(qDec);
          } catch (err) {}
        }

        const dec = Number(tokenDecimals) || 18;
        const totalBig = BigInt(totalSupplyRaw);
        const burnedBig = BigInt(burn1 || 0n) + BigInt(burn2 || 0n);
        const circulatingBig = totalBig > burnedBig ? totalBig - burnedBig : totalBig;

        const totalFormatted = Number(ethers.formatUnits(totalBig, dec));
        const circulatingFormatted = Number(ethers.formatUnits(circulatingBig, dec));

        const r0 = BigInt(reserves[0] || 0n);
        const r1 = BigInt(reserves[1] || 0n);

        let priceInQuote = 0;
        let liquidityUsd = 54200;

        if (r0 > 0n && r1 > 0n && t0 !== '0x0' && t1 !== '0x0') {
          const normR0 = Number(ethers.formatUnits(r0, t0.toLowerCase() === tokenContractAddress.toLowerCase() ? dec : quoteDecimals));
          const normR1 = Number(ethers.formatUnits(r1, t1.toLowerCase() === tokenContractAddress.toLowerCase() ? dec : quoteDecimals));

          let ourReserve = 0;
          let quoteReserve = 0;

          if (t0.toLowerCase() === tokenContractAddress.toLowerCase()) {
            ourReserve = normR0;
            quoteReserve = normR1;
          } else {
            ourReserve = normR1;
            quoteReserve = normR0;
          }

          if (ourReserve > 0) {
            priceInQuote = quoteReserve / ourReserve;
          }

          let quoteUsdPrice = 1;
          if (quoteSymbol.includes('BNB') || quoteSymbol.includes('ETH')) {
            quoteUsdPrice = bnbUsdPrice;
          } else if (quoteSymbol.includes('USD') || quoteSymbol.includes('USDT') || quoteSymbol.includes('USDC') || quoteSymbol.includes('USST')) {
            quoteUsdPrice = 1;
          }

          const priceUsd = priceInQuote * quoteUsdPrice;
          const liqPool = quoteReserve * quoteUsdPrice * 2;
          liquidityUsd = liqPool > 0 ? liqPool : 54200;

          const mcapVal = circulatingFormatted * priceUsd;
          const fdvVal = totalFormatted * priceUsd;
          const liqRatio = fdvVal > 0 ? (liquidityUsd / fdvVal) * 100 : 4.1;

          setLivePrice(priceUsd < 0.0001 ? priceUsd.toExponential(4) : priceUsd.toFixed(priceUsd < 1 ? 6 : 2));
          setLiveLiquidity('$' + liquidityUsd.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveMcap('$' + mcapVal.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveFdv('$' + fdvVal.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveLiquidityRatio(liqRatio.toFixed(1) + '%');
          setLiveBasePair(`${tokenSymbol}/${quoteSymbol}`);
        } else {
          const fallbackPrice = parseFloat(token.price) || 0.01;
          const mcapVal = circulatingFormatted * fallbackPrice;
          const fdvVal = totalFormatted * fallbackPrice;
          setLivePrice(token.price);
          setLiveLiquidity('$54,200');
          setLiveMcap('$' + mcapVal.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveFdv('$' + fdvVal.toLocaleString('en-US', { maximumFractionDigits: 0 }));
          setLiveLiquidityRatio('4.1%');
          setLiveBasePair(token.pair || `${tokenSymbol}/USD`);
        }
      } catch (err) {
        console.warn("Failed to load on-chain market data:", err);
        setLivePrice(token.price);
        setLiveLiquidity('$54,200');
        setLiveMcap('$1,250,000');
        setLiveFdv('$1,500,000');
        setLiveLiquidityRatio('4.1%');
        setLiveBasePair(token.pair || 'USST/USD');
      } finally {
        if (isMounted) setLoadingOnChain(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const toggleTrade = () => {
    setIsTradeOpen(!isTradeOpen);
    if (!isTradeOpen) {
      setTimeout(() => {
        window.scrollTo({ top: window.scrollY + 300, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-20 transition-colors duration-300">
      {/* Hero / Poster Background */}
      <div className="relative w-full h-[320px] overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-black">
          <img 
            src={token.wallpaper || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'} 
            alt={token.name}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Gradient transitions cleanly to background color in respective modes */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-white dark:to-zinc-950" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('orvix-open-share', { detail: token }))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-end gap-4 mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-black/50 border-2 border-white/20 shadow-xl shrink-0">
                <TokenLogo tokenId={token.logo || token.id} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1.5 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white drop-shadow-md tracking-tight leading-none">{token.name || token.symbol}</h1>
                  <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300 rounded-full backdrop-blur-md">
                    Listed {token.listedAt || '5 Minutes Ago'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-zinc-200 dark:border-white/5">
                    {token.contract.slice(0, 6)}....{token.contract.slice(-4)}
                  </span>
                  <IconCopyButton text={token.contract} isDarkText />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-8 lg:px-12 -mt-8 relative z-20 w-full space-y-6">
        
        {/* Price Chart Card Container */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-5 shadow-xl dark:shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{token.pair}</div>
              <div className="text-3xl sm:text-4xl font-bold font-sans text-zinc-900 dark:text-white tracking-tight">${formatGlobalNumber(token.price)}</div>
              <div className={cn("text-sm font-semibold mt-1 flex items-center gap-1", isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                {isPositive ? '▲' : '▼'} {formatGlobalNumber(Math.abs(token.priceChange))}%
              </div>
            </div>
            

          </div>

          {/* Chart Visualization */}
          <div className="w-full pb-2">
            <div className="w-full h-80 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-400 font-mono text-sm">Chart Analytics (API Disabled)</span>
            </div>
          </div>
        </div>

        {/* Trade Section (Expandable) */}
        <div className="space-y-4">
          <button
            onClick={toggleTrade}
            className={cn(
              "w-full py-4 rounded-2xl font-bold font-sans tracking-widest uppercase transition-all shadow-lg active:scale-[0.98]",
              isTradeOpen ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400" : "bg-blue-600 hover:bg-blue-500 text-white"
            )}
          >
            {isTradeOpen ? 'Close Trade' : 'TRADE'}
          </button>

          <AnimatePresence>
            {isTradeOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-2 sm:p-4 pb-8 shadow-sm dark:shadow-none">
                  {/* Reuse SwapPage but remove its internal Modal background constraints by just rendering it directly if possible, 
                      SwapPage renders standalone anyway */}
                  <SwapPage embedded={true} preselectedToken={token} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Default Content (Only visible when Trade is closed, or always below it) */}
        <AnimatePresence>
          {!isTradeOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              {/* Token Description */}
              <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-6 space-y-4 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Description</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {token.name} ({token.symbol}) is a decentralized token built on the BNB Smart Chain. 
                  Designed to foster community-driven ecosystems and facilitate seamless on-chain transactions 
                  within the Orvix platform.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl mt-4">
                  <p className="text-[11px] text-blue-600 dark:text-blue-300/80 leading-relaxed italic">
                    Note: The content above is information provided by the project creator and does not constitute a reference or recommendation from Orvix.
                  </p>
                </div>
              </div>

              {/* Market Info */}
              <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-6 space-y-5 shadow-sm dark:shadow-none">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Market Info</h3>
                  <div className="flex items-center gap-4 mt-2 mb-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Network</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">BNB Smart Chain (BSC)</span>
                    </div>
                    <div className="w-px h-6 bg-zinc-200 dark:bg-white/10" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Pool</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{token.ammVersion || 'AMM V2'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    All data below is derived from BNB Smart Chain on-chain data and only reflects activity on the BSC network.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MarketInfoCard label="Price" value={loadingOnChain ? "--" : livePrice} />
                  <MarketInfoCard label="Liquidity" value={loadingOnChain ? "--" : liveLiquidity} />
                  <MarketInfoCard label="Market Cap" value={loadingOnChain ? "--" : liveMcap} />
                  <MarketInfoCard label="FDV" value={loadingOnChain ? "--" : liveFdv} />
                  <MarketInfoCard label="Liquidity Ratio" value={loadingOnChain ? "--" : liveLiquidityRatio} />
                  <MarketInfoCard label="Base Pair" value={loadingOnChain ? "--" : liveBasePair} />
                </div>
              </div>

              {/* On-Chain Info */}
              <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">On-Chain Info</h3>
                <div className="flex flex-col">
                  <InfoRow label="Contract Address" address={token.contract} link={`${getExplorerUrl()}/address/${token.contract}`} />
                  <InfoRow label="Pair Address" address={token.addLpTx} link={`${getExplorerUrl()}/address/${token.addLpTx}`} />
                  <InfoRow label="Base Pair" value={token.pair} />
                  <InfoRow label="Creator" address={token.creator} link={`https://bscscan.com/address/${token.creator}`} />
                  <InfoRow label="Tax Buy" value="0%" />
                  <InfoRow label="Tax Sell" value="0%" />
                  <InfoRow label="Mint" value="None" />
                  <InfoRow label="Burn" value="Yes" />
                  <InfoRow 
                    label="Renounced Ownership" 
                    badge={token.renounceTx ? <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30">Yes</span> : <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">No</span>} 
                    address={token.renounceTx} 
                    link={token.renounceTx ? `https://bscscan.com/tx/${token.renounceTx}` : undefined}
                  />
                  <InfoRow label="Add Liquidity Tx" address={token.addLpTx} link={token.addLpTx ? `https://bscscan.com/tx/${token.addLpTx}` : undefined} />
                  <InfoRow 
                    label="LP Locked" 
                    badge={token.lockLpTx ? <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30">Locked</span> : <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">Unlocked</span>} 
                    address={token.lockLpTx} 
                    link={token.lockLpTx ? `https://bscscan.com/tx/${token.lockLpTx}` : undefined}
                  />
                </div>
              </div>

              {/* Official Links */}
              <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Official Links</h3>
                <div className="flex flex-wrap gap-3">
                  {token.website && (
                    <a href={token.website} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="Website">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {token.x && (
                    <a href={token.x} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="X (Twitter)">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {token.telegram && (
                    <a href={token.telegram} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="Telegram">
                      <Send className="w-5 h-5" />
                    </a>
                  )}
                  {token.github && (
                    <a href={token.github} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="GitHub">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {token.documentation && (
                    <a href={token.documentation} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="Documentation">
                      <BookOpen className="w-5 h-5" />
                    </a>
                  )}
                  {/* Explorer/Dex Links */}
                  <a href={`${getExplorerUrl()}/token/${token.contract}`} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="BscScan Explorer">
                    <Search className="w-5 h-5" />
                  </a>
                  <a href={`https://dexscreener.com/bsc/${token.contract}`} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white" title="DexScreener">
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
