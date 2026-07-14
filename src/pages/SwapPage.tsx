import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowDown, X, ChevronDown } from 'lucide-react';
import { TokenModal } from '../components/TokenModal';
import { formatGlobalNumber } from '../lib/formatNumber';
import { OrvixLogo } from '../components/OrvixLogo';
import { Token } from '../types';
import { SwapTx } from '../lib/csvUtils';
import { useAppKitProvider, useWeb3 } from '../lib/web3';
import { ethers } from 'ethers';
import { ORVIX_CONFIG, getExplorerUrl, getEffectiveRpcUrl } from '../contracts/config';
import { OrvixAggregatorABI } from '../contracts/OrvixAggregatorABI';

export interface Pool {
  pool: string;
  output: string;
  liquidity: string;
  liq: string;
  impact: string;
  priceImpact: string;
  score: number;
  fee: string;
  best: boolean;
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
  
  const [fromToken, setFromToken] = useState<Partial<Token>>({ symbol: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' });
  const [toToken, setToToken] = useState<Partial<Token>>({ symbol: 'USDT' });

  const isWrap = fromToken.symbol === 'BNB' && toToken.symbol === 'WBNB';
  const isUnwrap = fromToken.symbol === 'WBNB' && toToken.symbol === 'BNB';
  const isWrapOrUnwrap = isWrap || isUnwrap;

  const { address, isConnected, provider } = useWeb3();
  const [walletBalance, setWalletBalance] = useState('0.00');

  // State for Quote Management
  const [discoveredPools, setDiscoveredPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [activeQuote, setActiveQuote] = useState<any>(null);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  
  // Re-added balance fetching and preselection logic removed by mistake
  useEffect(() => {
    async function fetchBalance() {
      if (isConnected && address && provider) {
        try {
          if (fromToken.contract && fromToken.contract !== '0x0000000000000000000000000000000000000000' && fromToken.symbol !== 'BNB') {
            const erc20 = new ethers.Contract(fromToken.contract, [
              'function balanceOf(address owner) view returns (uint256)',
              'function decimals() view returns (uint8)'
            ], provider);
            const bal = await erc20.balanceOf(address);
            const decimals = await erc20.decimals();
            const formatted = ethers.formatUnits(bal, decimals);
            setWalletBalance(parseFloat(formatted).toFixed(4));
          } else {
            const balance = await provider.getBalance(address);
            const formatted = ethers.formatEther(balance);
            setWalletBalance(parseFloat(formatted).toFixed(4));
          }
        } catch (e) {
          console.error("Failed to fetch balance:", e);
          setWalletBalance('0.00');
        }
      } else {
        setWalletBalance('0.00');
      }
    }
    fetchBalance();
  }, [isConnected, address, provider, fromToken]);

  useEffect(() => {
    if (preselectedToken) {
      setToToken(preselectedToken);
      onClearPreselectedToken?.();
    }
  }, [preselectedToken, onClearPreselectedToken]);

  // Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFromAmount(fromAmount);
    }, 500);
    return () => clearTimeout(handler);
  }, [fromAmount]);

  // Fetch Quotes
  useEffect(() => {
    if (!debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0) {
      setDiscoveredPools([]);
      setSelectedPool(null);
      setActiveQuote(null);
      setToAmount('');
      return;
    }

    const fetchQuotes = async () => {
      if (isWrapOrUnwrap) {
        setQuoteLoading(false);
        return;
      }

      setQuoteLoading(true);
      try {
        const rpcUrl = getEffectiveRpcUrl();

        const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(ORVIX_CONFIG.aggregator, OrvixAggregatorABI, rpcProvider);

        let wrappedNative = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
        try {
          wrappedNative = await contract.WRAPPED_NATIVE();
        } catch (e) {
          console.warn("Failed to get WRAPPED_NATIVE from contract, using default");
        }

        const tokenInAddr = fromToken.symbol === 'BNB' ? wrappedNative : (fromToken.contract || wrappedNative);
        const tokenOutAddr = toToken.symbol === 'BNB' ? wrappedNative : (toToken.contract || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd');

        let decimalsIn = 18;
        if (fromToken.contract && fromToken.symbol !== 'BNB') {
           try {
              const erc20 = new ethers.Contract(fromToken.contract, ["function decimals() view returns (uint8)"], rpcProvider);
              decimalsIn = await erc20.decimals();
           } catch(e) {}
        }
        
        let decimalsOut = 18;
        if (toToken.contract && toToken.symbol !== 'BNB') {
           try {
              const erc20 = new ethers.Contract(toToken.contract, ["function decimals() view returns (uint8)"], rpcProvider);
              decimalsOut = await erc20.decimals();
           } catch(e) {}
        }

        const amountInWei = ethers.parseUnits(debouncedFromAmount, decimalsIn);

        const factories = await contract.getAllWhitelistedFactories();
        
        const assessments = await contract.assessPools(tokenInAddr, tokenOutAddr, amountInWei, factories, false);
        
        const parsed: Pool[] = assessments
          .filter((a: any) => a.eligible)
          .map((a: any) => ({
            pool: a.pool,
            output: ethers.formatUnits(a.output, decimalsOut),
            liquidity: ethers.formatUnits(a.liquidity, decimalsOut),
            liq: ethers.formatUnits(a.liquidity, decimalsOut),
            impact: (Number(a.priceImpact) / 100).toFixed(2),
            priceImpact: (Number(a.priceImpact) / 100).toFixed(2),
            score: Number(a.score),
            fee: (ORVIX_CONFIG.protocolFee / 100).toString(),
            best: false
          }))
          .sort((a: any, b: any) => b.score - a.score);

        if (parsed.length > 0) {
          parsed[0].best = true;
          setDiscoveredPools(parsed);
          setSelectedPool(parsed[0]);
        } else {
          throw new Error("No eligible pools found");
        }
      } catch (err) {
        console.warn("Contract assessPools failed.", err);
        setDiscoveredPools([]);
        setSelectedPool(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    fetchQuotes();
  }, [debouncedFromAmount, fromToken, toToken]);

  // Update UI when selectedPool changes
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
        rate: formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(debouncedFromAmount)), { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        priceImpact: selectedPool.priceImpact,
        minReceive: formatGlobalNumber((parseFloat(selectedPool.output) * 0.99), { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
        pool: selectedPool.pool,
        gas: '0.00015',
        providerFee: '0.25%'
      });
    } else {
      setActiveQuote(null);
    }
  }, [selectedPool, debouncedFromAmount, isWrapOrUnwrap, isWrap, fromAmount]);

  useEffect(() => {
    onModalOpenChange?.(isPoolModalOpen);
  }, [isPoolModalOpen, onModalOpenChange]);
  let walletProvider: any = null;
  try {
    const appKitProvider = useAppKitProvider('eip155');
    walletProvider = appKitProvider?.walletProvider || (window as any).ethereum;
  } catch {
    walletProvider = (window as any).ethereum;
  }
  const [poolFlowStep, setPoolFlowStep] = useState<'loading' | 'list' | 'review' | 'wallet' | 'success'>('loading');
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

  const handleSelectToken = (token: Token) => {
    if (selectingTokenFor === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setIsTokenModalOpen(false);
  };

  const handlePercentageClick = async (pct: string) => {
    setActivePercentage(pct);
    if (!walletBalance || walletBalance === '0.00') return;
    
    const balanceNum = parseFloat(walletBalance);
    let calculatedAmount = 0;
    
    if (pct === '25%') calculatedAmount = balanceNum * 0.25;
    else if (pct === '50%') calculatedAmount = balanceNum * 0.50;
    else if (pct === '75%') calculatedAmount = balanceNum * 0.75;
    else if (pct === 'MAX') calculatedAmount = balanceNum;
    
    const formattedAmount = calculatedAmount.toFixed(4);
    
    setFromAmount(formattedAmount);
  };

  const handleDiscoverRoute = async () => {
    setIsPoolModalOpen(true);
    setSwapError(null);
    setPoolFlowStep('list');
  };


  const handleSwapExecute = async () => {
    setSwapError(null);
    setQuoteLoading(true);
    
        try {
      if (!walletProvider) throw new Error("No crypto wallet found");
      
      let provider;
      if (walletProvider && typeof (walletProvider as any).request === 'function') {
        provider = new ethers.BrowserProvider(walletProvider as any);
      } else {
        provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
      }
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(ORVIX_CONFIG.aggregator, OrvixAggregatorABI, signer);
      
      let wrappedNative;
      try {
        wrappedNative = await contract.WRAPPED_NATIVE();
      } catch (e) {
        wrappedNative = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
      }
      const tokenInAddr = fromToken.symbol === 'BNB' ? wrappedNative : (fromToken.contract || wrappedNative);
      const tokenOutAddr = toToken.symbol === 'BNB' ? wrappedNative : (toToken.contract || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd');
      
      const amountInWei = ethers.parseUnits(fromAmount || '0', 18);
      
      let slippageNum = parseFloat(slippage) || 0.5;
      const minOutStr = (parseFloat(selectedPool.output) * (1 - slippageNum/100)).toFixed(18);
      const minOutWei = ethers.parseUnits(minOutStr, 18);
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const path = "0x";
      
      const tx = await contract.swapExactInput(
        tokenInAddr,
        tokenOutAddr,
        amountInWei,
        minOutWei,
        await signer.getAddress(),
        deadline,
        path,
        ORVIX_CONFIG.treasury,
        await signer.getAddress(),
        {
          value: fromToken.symbol === 'BNB' ? amountInWei : 0n
        }
      );
      
      const receipt = await tx.wait();
      
      setQuoteLoading(false);
      setPoolFlowStep('success');
      
      const newTx: SwapTx = {
        id: tx.hash.substring(2, 11).toUpperCase(),
        timestamp: new Date().toISOString(),
        fromAmount: fromAmount,
        fromSymbol: fromToken.symbol || '',
        toAmount: selectedPool.output,
        toSymbol: toToken.symbol || '',
        rate: formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 6, maximumFractionDigits: 6 }),
        pool: selectedPool.pool,
        fee: selectedPool.fee,
        gasUsed: receipt.gasUsed.toString(),
        txHash: receipt.hash
      };
      setSwaps(prev => [newTx, ...prev]);

    } catch (err: any) {
      console.error("Swap execution failed:", err);
      setQuoteLoading(false);
      // fallback to wallet state, maybe show alert
      setSwapError(err.message || "Unknown error");
      setPoolFlowStep('wallet');
    }
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
    <div className={embedded ? "w-full" : "max-w-[560px] w-full mx-auto px-4 py-12 sm:py-24"}>
      <div className={embedded ? "relative overflow-hidden w-full" : "border border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-white dark:bg-zinc-900 p-6 shadow-sm relative overflow-hidden"}>
        
        <div className="flex justify-between items-center mb-5 relative z-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 m-0">Trade</h2>
        </div>

        {/* From */}
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl mb-1 border border-zinc-200 dark:border-zinc-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors relative z-10">
          <span className="text-[13px] text-zinc-500 font-medium mb-2 block">From</span>
          <div className="flex items-center justify-between gap-3">
            <input 
              type="text" 
              value={fromAmount}
              onChange={(e) => {
                let val = e.target.value.replace(/,/g, '');
                // Allow only numbers and a single decimal point
                if (/^\d*\.?\d*$/.test(val)) {
                  setFromAmount(val);
                  setActivePercentage(null);
                }
              }}
              className="bg-transparent text-[28px] text-zinc-900 dark:text-zinc-100 font-semibold outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              placeholder="0.0"
            />
            <button 
              onClick={() => { setSelectingTokenFor('from'); setIsTokenModalOpen(true); }}
              className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full bg-[#f3ba2f] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {fromToken.logo ? <img src={fromToken.logo} alt={fromToken.symbol} className="w-full h-full object-cover" /> : fromToken.symbol?.[0]}
              </div>
              <span className="text-base">{fromToken.symbol}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-[13px] text-zinc-500 font-medium flex items-center gap-1.5">Balance: {walletBalance}</span>
            <div className="flex gap-1.5">
              {['25%', '50%', '75%', 'MAX'].map(pct => {
                const isActive = activePercentage === pct;
                return (
                  <button 
                    key={pct} 
                    onClick={() => handlePercentageClick(pct)}
                    className={`border rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-500 hover:border-blue-500'
                    }`}
                  >
                    {pct}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Swap Divider */}
        <div className="flex justify-center items-center h-0 relative z-10 my-2">
          <button 
            onClick={handleSwapTokens}
            className="bg-white dark:bg-zinc-900 border-[4px] border-white dark:border-zinc-900 w-10 h-10 rounded-full flex justify-center items-center text-blue-600 dark:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer z-10"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Receive */}
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl mt-1 border border-zinc-200 dark:border-zinc-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors relative z-10">
          <span className="text-[13px] text-zinc-500 font-medium mb-2 block">Receive</span>
          <div className="flex items-center justify-between gap-3">
            <input 
              type="text" 
              value={toAmount}
              readOnly
              className="bg-transparent text-[28px] text-zinc-900 dark:text-zinc-100 font-semibold outline-none w-full placeholder:text-zinc-300 dark:placeholder:text-zinc-700 opacity-70"
              placeholder="0.0"
            />
            <button 
              onClick={() => { setSelectingTokenFor('to'); setIsTokenModalOpen(true); }}
              className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full bg-[#2775ca] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {toToken.logo ? <img src={toToken.logo} alt={toToken.symbol} className="w-full h-full object-cover" /> : toToken.symbol?.[0]}
              </div>
              <span className="text-base">{toToken.symbol}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-[13px] text-zinc-500 font-medium flex items-center gap-1.5">Balance: {walletBalance}</span>
          </div>
        </div>

        {/* Slippage */}
        <div className="mt-5 px-1 relative z-10">
          <div className="text-[13px] text-zinc-500 font-medium mb-2.5">Slippage Tolerance</div>
          <div className="flex gap-2 flex-wrap">
            {['0.1', '0.5', '1', '5'].map(val => (
              <button 
                key={val}
                onClick={() => setSlippage(val)}
                className={`flex-1 min-w-[50px] border rounded-xl py-2 text-[13px] font-semibold cursor-pointer transition-colors ${
                  slippage === val 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-blue-500'
                }`}
              >
                {val}%
              </button>
            ))}
            <div className="flex-[1.5] min-w-[120px] flex items-center bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 focus-within:border-blue-500 transition-colors">
              <input 
                type="text" 
                className="w-full bg-transparent text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 outline-none text-right py-2 placeholder:text-zinc-500 placeholder:font-medium"
                placeholder="Custom Slippage"
                value={!['0.1', '0.5', '1', '5'].includes(slippage) ? slippage : ''}
                onChange={(e) => {
                let val = e.target.value.replace(/,/g, '');
                if (/^\d*\.?\d*$/.test(val)) {
                  setSlippage(val);
                }
              }}
              />
              <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 ml-1">%</span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        {activeQuote && (
          <div className="mt-5 p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center transition-colors">
            <div className="w-full space-y-2.5">
              <div className="flex justify-between text-[13px]">
                 <span className="text-zinc-500 font-medium">Rate</span>
                 <span className="text-zinc-900 dark:text-zinc-100 font-semibold">1 {fromToken.symbol} = {activeQuote.rate} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                 <span className="text-zinc-500 font-medium">Price Impact</span>
                 <span className="text-green-500 font-semibold">{activeQuote.priceImpact}%</span>
              </div>
              {!isWrapOrUnwrap && (
                <div className="flex justify-between text-[13px]">
                   <span className="text-zinc-500 font-medium">Minimum Receive</span>
                   <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeQuote.minReceive} {toToken.symbol}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                 <span className="text-zinc-500 font-medium">{isWrapOrUnwrap ? 'Method' : 'Best Pool'}</span>
                 <span className="text-zinc-500 font-medium">{activeQuote.pool}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                 <span className="text-zinc-500 font-medium">Gas Fee</span>
                 <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeQuote.gas} BNB</span>
              </div>
              {!isWrapOrUnwrap && (
                <>
                  <div className="flex justify-between text-[13px]">
                     <span className="text-zinc-500 font-medium">Provider</span>
                     <span className="text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-1">
                       <OrvixLogo className="w-5 h-5 inline-block shrink-0" /> Orvix
                     </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                     <span className="text-zinc-500 font-medium">Provider Fee</span>
                     <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeQuote.providerFee}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 relative z-10">
          {isWrapOrUnwrap ? (
            <>
              <button 
                onClick={() => {
                  setSelectedPool({
                    pool: isWrap ? 'Native BNB Wrapper' : 'WBNB Unwrapper',
                    output: fromAmount,
                    liquidity: 'Infinite',
                    liq: 'Infinite',
                    impact: '0.00',
                    priceImpact: '0.00',
                    score: 100,
                    fee: '0',
                    best: true
                  });
                  setIsPoolModalOpen(true);
                  setPoolFlowStep('wallet');
                }}
                disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                className={`p-[14px] rounded-2xl text-[17px] font-bold w-full transition-colors flex items-center justify-center gap-2 ${
                  !fromAmount || parseFloat(fromAmount) <= 0 
                    ? 'bg-blue-600/50 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {isWrap ? 'Wrap BNB' : 'Unwrap WBNB'}
              </button>
              <div className="text-center text-[12px] text-zinc-500 px-1">
                {isWrap 
                  ? 'Wrapping converts Native BNB into Wrapped BNB (WBNB) at a 1:1 ratio.' 
                  : 'Unwrapping converts WBNB back into Native BNB at a 1:1 ratio.'}
              </div>
            </>
          ) : !activeQuote ? (
            <button 
              onClick={handleDiscoverRoute}
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
              className={`p-[14px] rounded-2xl text-[15px] font-semibold w-full transition-colors flex items-center justify-center gap-2 ${
                !fromAmount || parseFloat(fromAmount) <= 0 
                  ? 'bg-transparent text-blue-600/50 dark:text-blue-500/50 border border-blue-600/50 dark:border-blue-500/50 cursor-not-allowed'
                  : 'bg-transparent text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white cursor-pointer'
              }`}
            >
              <Search className="w-4 h-4" />
              Discover Best Route
            </button>
          ) : (
            <button 
              onClick={() => {
                setIsPoolModalOpen(true);
                setSwapError(null);
                setPoolFlowStep('wallet');
              }}
              className="p-[14px] rounded-2xl text-[17px] font-bold w-full transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              TRADE
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center mt-3 text-[13px] text-zinc-500 flex items-center justify-center gap-1.5">
        <span>Provider</span>
        <OrvixLogo className="w-5 h-5 inline-block shrink-0" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Orvix</span>
      </div>

      {/* Recent Swaps Widget removed */}
      
      <TokenModal 
        isOpen={isTokenModalOpen} 
        onClose={() => setIsTokenModalOpen(false)} 
        onSelect={handleSelectToken} 
      />

      {/* Pool / Swap Modal */}
      {isPoolModalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-[480px] rounded-[24px] shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh]">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {poolFlowStep === 'wallet' ? 'Wallet Confirmation' : poolFlowStep === 'success' ? 'Swap Success' : 'Select Pool for Swap'}
              </h3>
              <button onClick={() => setIsPoolModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {poolFlowStep === 'loading' && (
                 <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
                   <div className="text-[14px] font-medium text-zinc-500">Scanning Pools...</div>
                 </div>
              )}

              {poolFlowStep === 'list' && (
                 <div className="space-y-2">
                   {discoveredPools.map((p, i) => (
                     <div 
                       key={i}
                       onClick={() => {
                         setSelectedPool(p);
                         setPoolFlowStep('review');
                         setToAmount(p.output);

                       }}
                       className="flex justify-between items-center p-4 rounded-xl border-2 border-transparent bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                     >
                       <div className="flex flex-col gap-1.5">
                         <div className="font-semibold text-[14px] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                           Pool {p.pool}
                           {p.best && <span className="text-[10px] bg-[#f59e0b] text-white px-2 py-0.5 rounded-full font-bold">BEST</span>}
                         </div>
                         <div className="flex gap-4 text-[12px] text-zinc-500">
                           <span className="flex items-center gap-1">Output: <strong className="text-green-500">{p.output}</strong></span>
                           <span>Liq: {p.liq}</span>
                           <span>Impact: {p.impact}%</span>
                         </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-1.5">
                         <div className="text-[15px] font-bold text-green-500">{p.output}</div>
                         <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">● Healthy</div>
                       </div>
                     </div>
                   ))}
                 </div>
              )}

              {poolFlowStep === 'review' && selectedPool && (
                 <div>
                   <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">From</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{fromAmount} {fromToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Receive</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPool.output} {toToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Exchange Rate</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">1 {fromToken.symbol} = {formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Selected Pool</span><span className="text-zinc-500">{selectedPool.pool}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Liquidity</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPool.liq}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Price Impact</span><span className="font-semibold text-green-500">{selectedPool.impact}%</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Swap Fee</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPool.fee}%</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Estimated Gas</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">0.00015 BNB</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Minimum Receive</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatGlobalNumber((parseFloat(selectedPool.output) * 0.99), { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toToken.symbol}</span></div>
                   </div>

                   <div className="flex gap-3 mt-4">
                     <button onClick={() => {
                       setIsPoolModalOpen(false);
                     }} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3.5 transition-colors cursor-pointer">Confirm Pool</button>
                     <button onClick={() => setIsPoolModalOpen(false)} className="flex-1 bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold rounded-xl py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">Cancel</button>
                   </div>
                 </div>
              )}

              {poolFlowStep === 'wallet' && (
                 <div>
                   <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 mb-4">
                     <div className="flex justify-between text-[13px] border-b border-zinc-200 dark:border-zinc-800 pb-2"><span className="text-zinc-500 font-medium">Allowance</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">Unlimited</span></div>
                     <div className="flex justify-between text-[13px] border-b border-zinc-200 dark:border-zinc-800 pb-2"><span className="text-zinc-500 font-medium">Estimated Gas</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">0.00015 BNB</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 font-medium">Gas Cost</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">~$0.04</span></div>
                   </div>
                   
                   {!quoteLoading ? (
                     <>
                       {swapError ? (
                         <div className="text-center text-[14px] text-red-500 mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-200 dark:border-red-500/20">{swapError}</div>
                       ) : (
                         <div className="text-center text-[14px] text-zinc-500 mb-4">Waiting for confirmation...</div>
                       )}
                       <div className="flex gap-3">
                         <button onClick={handleSwapExecute} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3.5 transition-colors cursor-pointer">Confirm Transaction</button>
                         <button onClick={() => setIsPoolModalOpen(false)} className="flex-1 bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold rounded-xl py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">Cancel</button>
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-6 gap-3">
                       <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
                       <div className="text-[14px] text-blue-500 font-medium">Sending Transaction...</div>
                     </div>
                   )}
                 </div>
              )}

              {poolFlowStep === 'success' && selectedPool && (
                 <div>
                   <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5 mb-4">
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Sold</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{fromAmount} {fromToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Received</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPool.output} {toToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Avg Price</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 6, maximumFractionDigits: 6 })} {toToken.symbol}/{fromToken.symbol}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Pool</span><span className="text-zinc-500 text-[12px]">{selectedPool.pool}</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Route</span><span className="text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-1.5"><OrvixLogo className="w-5 h-5 inline-block shrink-0" />Orvix</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Provider Fee</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPool.fee}%</span></div>
                     <div className="flex justify-between text-[13px]"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Gas Used</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">157,209</span></div>
                     <div className="flex justify-between text-[13px] items-center"><span className="text-zinc-500 dark:text-zinc-400 font-medium">Tx Hash</span><span className="text-zinc-900 dark:text-zinc-100 font-semibold flex items-center gap-1.5"><span className="font-mono text-[12px]">{swaps[0]?.txHash ? swaps[0].txHash.substring(0, 18) + '...' : '0xabcdef0123456789...'}</span><a href={`${getExplorerUrl()}/tx/${swaps[0]?.txHash || '0xabcdef0123456789'}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 text-[12px]">[View explorer]</a></span></div>
                   </div>
                   
                   <button onClick={() => {
                     setIsPoolModalOpen(false);
                     setFromAmount('');
                     setToAmount('');

                   }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3.5 transition-colors cursor-pointer">Done</button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
