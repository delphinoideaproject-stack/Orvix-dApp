import React, { useState, useEffect } from 'react';
import { Search, ArrowDown, X, ChevronDown, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';
import { TokenModal } from '../components/TokenModal';
import { formatGlobalNumber } from '../lib/formatNumber';
import { OrvixLogo } from '../components/OrvixLogo';
import { Token } from '../types';
import { SwapTx } from '../lib/csvUtils';
import { useWeb3 } from '../lib/web3';
import { fetchPools, fetchBalance } from '../services/api';

export interface Pool {
  pool: string;
  output: string;
  liquidity: string;
  priceImpact: string;
  score: number;
  eligible: boolean;
  failReason: number;
  best?: boolean;
}

export function SwapPage({ embedded = false, 
  onModalOpenChange, 
  preselectedToken,
  onClearPreselectedToken 
}: { 
  embedded?: boolean; onModalOpenChange?: (isOpen: boolean) => void;
  preselectedToken?: Token | null;
  onClearPreselectedToken?: () => void;
}) {
  const [fromAmount, setFromAmount] = useState('');
  const [debouncedFromAmount, setDebouncedFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectingTokenFor, setSelectingTokenFor] = useState<'from' | 'to'>('from');
  const [activePercentage, setActivePercentage] = useState<string | null>(null);
  
  const [fromToken, setFromToken] = useState<Partial<Token>>({ symbol: 'BNB', contract: '0x0000000000000000000000000000000000000000', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' });
  const [toToken, setToToken] = useState<Partial<Token>>({ symbol: 'USDT', contract: '0x55d398326f99059ff775485246999027b3197955' });

  const isWrap = fromToken.symbol === 'BNB' && toToken.symbol === 'WBNB';
  const isUnwrap = fromToken.symbol === 'WBNB' && toToken.symbol === 'BNB';
  const isWrapOrUnwrap = isWrap || isUnwrap;

  const { address, isConnected, provider } = useWeb3();
  const [walletBalance, setWalletBalance] = useState('0.00');

  // State for Pool Assessment and Quotes from Backend
  const [discoveredPools, setDiscoveredPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [activeQuote, setActiveQuote] = useState<any>(null);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  const [swaps, setSwaps] = useState<SwapTx[]>(() => {
    try {
      const stored = localStorage.getItem('orvix_swaps');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('orvix_swaps', JSON.stringify(swaps));
  }, [swaps]);

  // Fetch balance from backend service API
  useEffect(() => {
    async function loadBalance() {
      if (isConnected && address) {
        try {
          const data = await fetchBalance(fromToken.contract || '', address);
          if (data.success) {
            const formatted = ethers.formatUnits(data.balance, data.decimals || 18);
            setWalletBalance(parseFloat(formatted).toFixed(4));
          }
        } catch (e) {
          console.error("Failed to fetch balance from backend API:", e);
          setWalletBalance('0.00');
        }
      } else {
        setWalletBalance('0.00');
      }
    }
    loadBalance();
  }, [isConnected, address, fromToken]);

  useEffect(() => {
    if (preselectedToken) {
      setToToken(preselectedToken);
      onClearPreselectedToken?.();
    }
  }, [preselectedToken, onClearPreselectedToken]);

  // Debouncing amount input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFromAmount(fromAmount);
    }, 400);
    return () => clearTimeout(handler);
  }, [fromAmount]);

  // Auto-run Pool Assessment via Backend API service when user inputs amount and tokens
  useEffect(() => {
    if (!debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0) {
      setDiscoveredPools([]);
      setSelectedPool(null);
      setActiveQuote(null);
      setToAmount('');
      return;
    }

    const runPoolAssessment = async () => {
      if (isWrapOrUnwrap) {
        setQuoteLoading(false);
        return;
      }

      setQuoteLoading(true);
      try {
        const decimalsIn = 18;
        const amountInWei = ethers.parseUnits(debouncedFromAmount, decimalsIn).toString();

        const tokenInAddr = fromToken.contract || '0x0000000000000000000000000000000000000000';
        const tokenOutAddr = toToken.contract || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';

        const data = await fetchPools(tokenInAddr, tokenOutAddr, amountInWei);

        if (data.success && data.assessments) {
          const eligiblePools: Pool[] = data.assessments
            .filter((a) => a.eligible)
            .map((a, idx) => ({
              pool: a.pool,
              output: ethers.formatUnits(a.output, 18),
              liquidity: ethers.formatUnits(a.liquidity, 18),
              priceImpact: (Number(a.priceImpact) / 100).toFixed(2),
              score: Number(a.score),
              eligible: a.eligible,
              failReason: Number(a.failReason),
              best: idx === 0
            }))
            .sort((a, b) => b.score - a.score);

          if (eligiblePools.length > 0) {
            eligiblePools[0].best = true;
            setDiscoveredPools(eligiblePools);
            setSelectedPool(eligiblePools[0]);
            setToAmount(eligiblePools[0].output);
          } else {
            setDiscoveredPools([]);
            setSelectedPool(null);
            setToAmount('');
          }
        }
      } catch (err) {
        console.error("Pool assessment service error:", err);
        setDiscoveredPools([]);
        setSelectedPool(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    runPoolAssessment();
  }, [debouncedFromAmount, fromToken, toToken, isWrapOrUnwrap]);

  // Update active quote when selected pool changes
  useEffect(() => {
    if (isWrapOrUnwrap) {
      setActiveQuote({
        rate: '1.0000',
        priceImpact: '0.00',
        minReceive: fromAmount || '0.0',
        pool: isWrap ? 'Native BNB Wrapper' : 'WBNB Unwrapper',
        gas: '0.00012',
        providerFee: '0%'
      });
      setToAmount(fromAmount);
    } else if (selectedPool) {
      setToAmount(selectedPool.output);
      setActiveQuote({
        rate: formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(debouncedFromAmount || '1')), { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        priceImpact: selectedPool.priceImpact,
        minReceive: formatGlobalNumber((parseFloat(selectedPool.output) * (1 - parseFloat(slippage)/100)), { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        pool: selectedPool.pool,
        gas: '0.00015',
        providerFee: '0.25%'
      });
    } else {
      setActiveQuote(null);
    }
  }, [selectedPool, debouncedFromAmount, isWrapOrUnwrap, isWrap, fromAmount, slippage]);

  useEffect(() => {
    onModalOpenChange?.(isPoolModalOpen);
  }, [isPoolModalOpen, onModalOpenChange]);

  const handleSelectToken = (token: Token) => {
    if (selectingTokenFor === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setIsTokenModalOpen(false);
  };

  const handlePercentageClick = (pct: string) => {
    setActivePercentage(pct);
    if (!walletBalance || walletBalance === '0.00') return;
    const balanceNum = parseFloat(walletBalance);
    let calculatedAmount = 0;
    if (pct === '25%') calculatedAmount = balanceNum * 0.25;
    else if (pct === '50%') calculatedAmount = balanceNum * 0.50;
    else if (pct === '75%') calculatedAmount = balanceNum * 0.75;
    else if (pct === 'MAX') calculatedAmount = Math.max(0, balanceNum - 0.005);
    setFromAmount(calculatedAmount.toFixed(4));
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    const tempAmt = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmt);
  };

  return (
    <div className={embedded ? "w-full" : "max-w-[520px] w-full mx-auto px-4 py-12"} style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <div className={embedded ? "relative z-10 w-full" : "relative z-10 border border-slate-200 rounded-2xl bg-white p-6 shadow-xl"}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
              <OrvixLogo className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Trade Terminal</h2>
              <p className="text-xs text-slate-500">Decentralized Liquidity Aggregator</p>
            </div>
          </div>
          <div className="text-xs font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            Backend API Connected
          </div>
        </div>

        {/* From Container */}
        <div className="bg-slate-50 p-4 rounded-2xl mb-2 border border-slate-200 focus-within:border-blue-500 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">From</span>
            <span className="text-xs text-slate-500">Balance: {walletBalance}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input 
              type="text" 
              value={fromAmount}
              onChange={(e) => {
                let val = e.target.value.replace(/,/g, '');
                if (/^\d*\.?\d*$/.test(val)) {
                  setFromAmount(val);
                  setActivePercentage(null);
                }
              }}
              className="bg-transparent text-2xl text-slate-900 font-semibold outline-none w-full placeholder:text-slate-400"
              placeholder="0.0"
            />
            <button 
              onClick={() => { setSelectingTokenFor('from'); setIsTokenModalOpen(true); }}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 shrink-0 cursor-pointer transition-colors shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-[#f3ba2f] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {fromToken.logo ? <img src={fromToken.logo} alt={fromToken.symbol} className="w-full h-full object-cover" /> : fromToken.symbol?.[0]}
              </div>
              <span className="text-sm">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
            {['25%', '50%', '75%', 'MAX'].map(pct => {
              const isActive = activePercentage === pct;
              return (
                <button 
                  key={pct} 
                  onClick={() => handlePercentageClick(pct)}
                  className={`flex-1 border rounded-xl py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 border-blue-500 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {pct}
                </button>
              );
            })}
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center my-[-10px] relative z-10">
          <button 
            onClick={handleSwapTokens}
            className="bg-white hover:bg-slate-50 border-2 border-slate-200 w-10 h-10 rounded-xl flex justify-center items-center text-blue-600 transition-colors shadow-md cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Container */}
        <div className="bg-slate-50 p-4 rounded-2xl mt-2 border border-slate-200 focus-within:border-blue-500 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">To (Estimated)</span>
            <span className="text-xs text-slate-500">Backend Routed</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input 
              type="text" 
              value={toAmount}
              readOnly
              className="bg-transparent text-2xl text-slate-900 font-semibold outline-none w-full placeholder:text-slate-400 opacity-90"
              placeholder="0.0"
            />
            <button 
              onClick={() => { setSelectingTokenFor('to'); setIsTokenModalOpen(true); }}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 shrink-0 cursor-pointer transition-colors shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-[#2775ca] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {toToken.logo ? <img src={toToken.logo} alt={toToken.symbol} className="w-full h-full object-cover" /> : toToken.symbol?.[0]}
              </div>
              <span className="text-sm">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="mt-5">
          <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Slippage Tolerance</div>
          <div className="grid grid-cols-5 gap-2">
            {['0.1', '0.5', '1.0', '3.0'].map(val => (
              <button 
                key={val}
                onClick={() => setSlippage(val)}
                className={`border rounded-xl py-2 text-xs font-semibold cursor-pointer transition-colors ${
                  slippage === val 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {val}%
              </button>
            ))}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 focus-within:border-blue-500">
              <input 
                type="text" 
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none text-center py-2 placeholder:text-slate-400"
                placeholder="Custom"
                value={!['0.1', '0.5', '1.0', '3.0'].includes(slippage) ? slippage : ''}
                onChange={(e) => {
                  let val = e.target.value.replace(/,/g, '');
                  if (/^\d*\.?\d*$/.test(val)) setSlippage(val);
                }}
              />
            </div>
          </div>
        </div>

        {/* Live Quote & Pool Assessment Panel */}
        {activeQuote && (
          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Exchange Rate</span>
              <span className="text-slate-900 font-mono">1 {fromToken.symbol} = {activeQuote.rate} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Price Impact</span>
              <span className="text-blue-600 font-mono">{activeQuote.priceImpact}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Minimum Received</span>
              <span className="text-slate-900 font-mono">{activeQuote.minReceive} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Optimal Pool Route</span>
              <span className="text-slate-900 font-mono truncate max-w-[200px]" title={activeQuote.pool}>{activeQuote.pool}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Gas Fee</span>
              <span className="text-slate-900 font-mono">{activeQuote.gas} BNB</span>
            </div>
          </div>
        )}

        {/* Pool Assessment List Preview */}
        {discoveredPools.length > 0 && !isWrapOrUnwrap && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span>Pool Assessment (Backend Source of Truth)</span>
              <span className="text-blue-600">{discoveredPools.length} Pools Found</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {discoveredPools.map((p, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedPool(p)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedPool?.pool === p.pool 
                      ? 'bg-blue-50 border-blue-500 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2 text-xs">
                      <span className="font-mono text-blue-600">Pool {i+1}</span>
                      {p.best && <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">BEST</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Liq: {formatGlobalNumber(Number(p.liquidity), { maximumFractionDigits: 2 })} | Impact: {p.priceImpact}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 font-mono">{parseFloat(p.output).toFixed(4)} {toToken.symbol}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Score: {p.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          {!isConnected ? (
            <button 
              onClick={() => {
                const event = new CustomEvent('open_wallet_modal');
                window.dispatchEvent(event);
              }}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-lg"
            >
              Connect Wallet to Trade
            </button>
          ) : isWrapOrUnwrap ? (
            <button 
              onClick={() => alert(isWrap ? 'Wrapping BNB to WBNB via backend route' : 'Unwrapping WBNB to BNB via backend route')}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-lg"
            >
              {isWrap ? 'Wrap BNB → WBNB' : 'Unwrap WBNB → BNB'}
            </button>
          ) : (
            <button 
              onClick={() => {
                if (!selectedPool) return;
                alert(`Executing swap via backend route on pool ${selectedPool.pool}`);
              }}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !selectedPool || quoteLoading}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {quoteLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {quoteLoading ? 'Assessing Pools & Generating Quote...' : 'Execute Swap via Backend'}
            </button>
          )}
        </div>

      </div>

      <TokenModal 
        isOpen={isTokenModalOpen} 
        onClose={() => setIsTokenModalOpen(false)} 
        onSelect={handleSelectToken} 
      />
    </div>
  );
}
