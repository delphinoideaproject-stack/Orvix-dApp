import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Token } from '../types';
import { fetchTrustedTokenList } from '../lib/tokenMetadata';
import { formatGlobalNumber } from '../lib/formatNumber';
import { ethers } from 'ethers';
import { ORVIX_CONFIG, getEffectiveRpcUrl } from '../contracts/config';
import { useWeb3 } from '../lib/web3';
import { mockTokens, mockArchivedTokens, mockHistoryTokens } from '../data';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}

export function TokenModal({ isOpen, onClose, onSelect }: TokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [dynamicToken, setDynamicToken] = useState<Token | null>(null);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const { provider } = useWeb3();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setDebouncedQuery('');
      setDynamicToken(null);
      setLoadingDynamic(false);
      setLoading(true);
      const loadList = async () => {
        try {
          let currentChainId = 56;
          if (provider) {
            const net = await provider.getNetwork();
            currentChainId = Number(net.chainId);
          }
          
          if (currentChainId === 97) {
            // load testnet token list
            const allTokens = [...mockTokens, ...mockArchivedTokens, ...mockHistoryTokens];
            const seen = new Set();
            const uniqueTokens = allTokens.filter(t => {
              if (seen.has(t.id)) return false;
              seen.add(t.id);
              return true;
            });
            setTokens(uniqueTokens);
            setLoading(false);
          } else {
            // load mainnet token list
            const list = await fetchTrustedTokenList();
            setTokens(list);
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      };
      loadList();
    } else {
      setSearchQuery('');
      setDebouncedQuery('');
      setDynamicToken(null);
      setLoadingDynamic(false);
    }
  }, [isOpen, provider]);

  useEffect(() => {
    const address = debouncedQuery.trim();
    const isAddress = /^0x[a-fA-F0-9]{40}$/i.test(address);
    
    if (!isAddress) {
      setDynamicToken(null);
      setLoadingDynamic(false);
      return;
    }
    
    // Check if it already exists in local tokens list
    if (tokens.some(t => t.contract.toLowerCase() === address.toLowerCase())) {
      setDynamicToken(null);
      setLoadingDynamic(false);
      return;
    }

    let isMounted = true;
    setLoadingDynamic(true);
    setDynamicToken(null);

    const fetchToken = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
        const contract = new ethers.Contract(
          address,
          [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)"
          ],
          provider
        );

        const [name, symbol, totalSupplyRaw, decimals] = await Promise.all([
          contract.name().catch(() => 'Unknown Token'),
          contract.symbol().catch(() => 'UNKNOWN'),
          contract.totalSupply().catch(() => 0),
          contract.decimals().catch(() => 18)
        ]);

        if (!isMounted) return;

        const humanSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));

        setDynamicToken({
          id: `custom-${address}`,
          name: name,
          symbol: symbol,
          pair: `${symbol}/BNB`,
          chain: 'BSC',
          price: '0.00',
          priceChange: 0,
          listedAt: 'Unknown',
          contract: address,
          creator: '',
          addLpTx: '',
          renounceTx: '',
          lockLpTx: '',
          ammVersion: 'AMM V2',
          totalSupply: humanSupply.toString(),
          logo: ''
        });
      } catch (err) {
        console.error("Failed to fetch token dynamically", err);
        if (!isMounted) return;
        setDynamicToken({
          id: `custom-${address}`,
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          pair: 'UNKNOWN/BNB',
          chain: 'BSC',
          price: '0.00',
          priceChange: 0,
          listedAt: 'Unknown',
          contract: address,
          creator: '',
          addLpTx: '',
          renounceTx: '',
          lockLpTx: '',
          ammVersion: 'AMM V2',
          totalSupply: '0',
          logo: ''
        });
      } finally {
        if (isMounted) {
          setLoadingDynamic(false);
        }
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, tokens]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    searchInputRef.current?.focus();
  };

  if (!isOpen) return null;

  let filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
    t.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  if (dynamicToken && filteredTokens.length === 0) {
    filteredTokens = [dynamicToken];
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-[#141820] w-full max-w-[480px] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[92vh] border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 m-0">Select a token</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search name, symbol, or paste contract address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 dark:bg-[#1a1f2a] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
            <span className="text-xs">Loading verified tokens...</span>
          </div>
        ) : loadingDynamic ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
            <span className="text-xs">Fetching token from blockchain...</span>
          </div>
        ) : (
          <div className="overflow-y-auto -mx-2 max-h-[340px] pr-2 space-y-1 custom-scrollbar">
            {filteredTokens.length > 0 ? filteredTokens.map(token => (
              <button
                key={token.id}
                onClick={() => onSelect(token)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1f2633] transition-colors group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                     {token.logo ? (
                       <img 
                         src={token.logo} 
                         alt={token.symbol} 
                         className="w-full h-full object-cover" 
                         onError={(e) => {
                           // Fallback to text initial if image fails
                           (e.target as HTMLElement).style.display = 'none';
                         }}
                       />
                     ) : (
                       token.symbol[0]
                     )}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-100 truncate">{token.name} — {token.symbol}</span>
                    <span className="text-[12px] text-zinc-500 font-mono truncate">{token.contract.substring(0, 10)}...</span>
                  </div>
                </div>
                <div className="text-right text-[14px] font-medium text-zinc-900 dark:text-zinc-100 shrink-0">
                  {token.symbol}
                </div>
              </button>
            )) : (
              <div className="text-center py-8 text-zinc-500 text-sm">No tokens found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


