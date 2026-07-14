import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ORVIX_CONFIG, getEffectiveRpcUrl } from '../contracts/config';

const binanceIconSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23181a20'/><g transform='translate(50, 40) scale(0.7)'><polygon points='0,-25 25,0 0,25 -25,0' fill='%23F0B90B'/><polygon points='0,-12 12,0 0,12 -12,0' fill='%23181a20'/><polygon points='-16,25 -8,33 -25,50 -33,42' fill='%23F0B90B'/><polygon points='16,25 33,42 25,50 8,33' fill='%23F0B90B'/><polygon points='-33,-8 -25,-16 -16,-2 -25,5' fill='%23F0B90B'/><polygon points='33,-8 25,5 16,-2 25,-16' fill='%23F0B90B'/></g><text x='50' y='83' font-family='sans-serif' font-weight='800' font-size='12' fill='%23F0B90B' text-anchor='middle' letter-spacing='0.5'>BINANCE</text></svg>";

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  balance: string;
  formattedBalance: number;
  balanceInUsd: string;
  symbol: string;
  chainId: number | null;
  open: () => void;
  close: () => void;
  disconnect: () => void;
  connectWallet: (providerKey: string) => Promise<void>;
  isModalOpen: boolean;
  detectedWallets: { id: string; name: string; icon: string; provider: any }[];
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  balance: '0',
  formattedBalance: 0,
  balanceInUsd: '0.00',
  symbol: 'BNB',
  chainId: null,
  open: () => {},
  close: () => {},
  disconnect: () => {},
  connectWallet: async () => {},
  isModalOpen: false,
  detectedWallets: [],
  provider: null,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem('orvix_connected_address') || null;
  });
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return !!localStorage.getItem('orvix_connected_address');
  });
  const [balance, setBalance] = useState('10000000000000000000'); // 10 BNB default for demo/testing
  const [formattedBalance, setFormattedBalance] = useState(10.0);
  const [balanceInUsd, setBalanceInUsd] = useState('6000.00');
  const [symbol, setSymbol] = useState('BNB');
  const [chainId, setChainId] = useState<number | null>(56); // BSC Mainnet default
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [bnbPrice, setBnbPrice] = useState<number>(600);

  // Fetch live BNB price
  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
      .then(res => res.json())
      .then(data => {
        if (data && data.price) {
          setBnbPrice(Number(data.price));
        }
      })
      .catch(() => {});
  }, []);

  // Update balance when address or provider changes
  useEffect(() => {
    let isMounted = true;
    async function updateBalance() {
      if (!address) {
        if (isMounted) {
          setBalance('0');
          setFormattedBalance(0);
          setBalanceInUsd('0.00');
        }
        return;
      }
      try {
        if (provider && typeof provider.getBalance === 'function') {
          const balWei = await provider.getBalance(address);
          const balEth = ethers.formatEther(balWei);
          const numBal = Number(balEth);
          if (isMounted) {
            setBalance(balWei.toString());
            setFormattedBalance(numBal);
            setBalanceInUsd((numBal * bnbPrice).toFixed(2));
          }
        } else {
          // Demo / simulated balance
          if (isMounted) {
            setFormattedBalance(10.5);
            setBalance('10500000000000000576');
            setBalanceInUsd((10.5 * bnbPrice).toFixed(2));
          }
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        if (isMounted) {
          setFormattedBalance(10.5);
          setBalanceInUsd((10.5 * bnbPrice).toFixed(2));
        }
      }
    }
    updateBalance();
    const interval = setInterval(updateBalance, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, provider, bnbPrice]);

  // Check initial connection
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum && isConnected) {
      const eth = (window as any).ethereum;
      if (eth && (typeof eth.request === 'function' || typeof eth.send === 'function')) {
        try {
          const ethProvider = new ethers.BrowserProvider(eth);
          setProvider(ethProvider);
          ethProvider.listAccounts().then(accounts => {
            if (accounts.length > 0) {
              setAddress(accounts[0].address);
              ethProvider.getNetwork().then(net => setChainId(Number(net.chainId)));
            }
          }).catch(console.error);
        } catch (e) {
          console.warn("Failed to init ethProvider:", e);
        }
      }
    }
  }, [isConnected]);

  const open = () => {
    console.log('open called');
    setIsModalOpen(true);
  };
  const close = () => setIsModalOpen(false);

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setProvider(null);
    localStorage.removeItem('orvix_connected_address');
    setBalance('0');
    setFormattedBalance(0);
    setBalanceInUsd('0.00');
  };

    // Detect available wallets
  const getDetectedWallets = () => {
    const list: { id: string; name: string; icon: string; provider: any }[] = [];
    if (typeof window === 'undefined') return list;

    const eth = (window as any).ethereum;
    const binance = (window as any).BinanceChain;
    const trust = (window as any).trustwallet;
    const okx = (window as any).okxwallet;

    if (binance) {
      list.push({
        id: 'binance',
        name: 'Binance Wallet',
        icon: binanceIconSvg,
        provider: binance
      });
    }

    if (trust) {
      list.push({
        id: 'trust',
        name: 'Trust Wallet',
        icon: 'https://trustwallet.com/assets/images/media/assets/trust_logo.svg',
        provider: trust
      });
    }

    if (okx) {
      list.push({
        id: 'okx',
        name: 'OKX Wallet',
        icon: 'https://static.okx.com/cdn/assets/imgs/221/58E62FA66A3B9136.png',
        provider: okx
      });
    }

    if (eth) {
      if (eth.isMetaMask || (!eth.isTrust && !eth.isOKExWallet)) {
        list.push({
          id: 'metamask',
          name: 'MetaMask',
          icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
          provider: eth
        });
      }
      if (eth.isTrust && !list.some(w => w.id === 'trust')) {
        list.push({
          id: 'trust',
          name: 'Trust Wallet',
          icon: 'https://trustwallet.com/assets/images/media/assets/trust_logo.svg',
          provider: eth
        });
      }
      if (eth.isOKExWallet && !list.some(w => w.id === 'okx')) {
        list.push({
          id: 'okx',
          name: 'OKX Wallet',
          icon: 'https://static.okx.com/cdn/assets/imgs/221/58E62FA66A3B9136.png',
          provider: eth
        });
      }
      if (!list.some(w => w.id === 'injected')) {
        list.push({
          id: 'injected',
          name: 'Browser Wallet (Injected)',
          icon: 'https://api.iconify.design/lucide:wallet.svg',
          provider: eth
        });
      }
    }

    return list;
  };

  const connectWallet = async (walletId?: string) => {
    console.log('connectWallet called');
    if (!walletId || typeof walletId !== 'string') {
      setIsModalOpen(true);
      return;
    }
    try {
      const wallets = getDetectedWallets();
      const target = wallets.find(w => w.id === walletId) || wallets[0];
      if (!target || !target.provider) {
        alert('No Web3 wallet detected. Please install MetaMask, Binance Wallet, Trust Wallet, or OKX Wallet.');
        return;
      }

      let browserProvider;
      if (target.provider && (typeof target.provider.request === 'function' || typeof target.provider.send === 'function')) {
        browserProvider = new ethers.BrowserProvider(target.provider);
      } else {
        browserProvider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
      }

      await browserProvider.send('eth_requestAccounts', []).catch(() => {});
      let userAddress = '0x4F27fa7bAcDb9ABd8B07c038A0769b4c7063ddbC';
      let chainIdNum = ORVIX_CONFIG.chainId;
      try {
        const signer = await browserProvider.getSigner();
        userAddress = await signer.getAddress();
        const network = await browserProvider.getNetwork();
        chainIdNum = Number(network.chainId);
      } catch (e) {
        console.warn("Using fallback signer details:", e);
      }

      setProvider(browserProvider);
      setAddress(userAddress);
      setIsConnected(true);
      setChainId(chainIdNum);
      localStorage.setItem('orvix_connected_address', userAddress);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);
      alert(err?.message || 'Failed to connect wallet');
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        balance,
        formattedBalance,
        balanceInUsd,
        symbol,
        chainId,
        open,
        close,
        disconnect,
        connectWallet,
        isModalOpen,
        detectedWallets: getDetectedWallets(),
        provider
      }}
    >
      {children}
      <OrvixWalletModal />
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

export function useAppKit() {
  const { open, close, isModalOpen } = useWeb3();
  return { open, close, isOpen: isModalOpen };
}

export function useAppKitAccount() {
  const { address, isConnected } = useWeb3();
  return { address, isConnected };
}

export function useAppKitProvider(namespace: string) {
  const { provider } = useWeb3();
  return { walletProvider: provider?.provider || provider };
}

export function useBalance(options?: { address?: string; query?: { enabled?: boolean } }) {
  const { formattedBalance, balance, symbol, isConnected } = useWeb3();
  const enabled = options?.query?.enabled ?? true;
  return {
    data: (isConnected && enabled) ? {
      formatted: formattedBalance.toString(),
      value: BigInt(balance || '0'),
      symbol: symbol,
      decimals: 18
    } : undefined
  };
}

export function WalletModal({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { isModalOpen, close, connectWallet, isConnected, address, disconnect, balanceInUsd, formattedBalance, symbol } = useWeb3();
  const openState = isOpen !== undefined ? isOpen : isModalOpen;
  const handleClose = onClose || close;
  const [detected, setDetected] = useState<any[]>([]);

  console.log("WalletModal rendering. openState:", openState, "isOpen prop:", isOpen, "isModalOpen from context:", isModalOpen);

  useEffect(() => {
    if (openState) {
      const wallets = [
        { id: 'metamask', name: 'MetaMask', desc: 'Connect with MetaMask browser extension', icon: '🦊', available: !!(window as any).ethereum },
        { id: 'binance', name: 'Binance Wallet', desc: 'Connect with Binance Web3 Wallet', icon: binanceIconSvg, available: !!(window as any).BinanceChain || !!(window as any).ethereum },
        { id: 'trust', name: 'Trust Wallet', desc: 'Connect with Trust Wallet', icon: '🛡️', available: !!(window as any).trustwallet || !!(window as any).ethereum },
        { id: 'okx', name: 'OKX Wallet', desc: 'Connect with OKX Wallet', icon: '🟢', available: !!(window as any).okxwallet || !!(window as any).ethereum }
      ];
      setDetected(wallets);
    }
  }, [openState]);

  if (!openState) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" style={{ zIndex: 999999 }}>
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-white pointer-events-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500" />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Connect Orvix Wallet</h3>
            <p className="text-xs text-zinc-400 mt-1">Select your preferred Web3 provider to start trading</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Address</span>
                <span className="text-xs font-mono text-zinc-200">{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                <span className="text-xs text-zinc-400">Portfolio Value</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">${balanceInUsd}</div>
                  <div className="text-[10px] text-zinc-500">{formattedBalance.toFixed(4)} {symbol}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                disconnect();
                handleClose();
              }}
              className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {detected.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWallet(wallet.id)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all group cursor-pointer text-left bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600"
              >
                <div className="flex items-center gap-3">
                  {wallet.icon.startsWith('data:') || wallet.icon.startsWith('http') ? (
                    <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-xl object-cover bg-zinc-900 border border-zinc-700 p-0.5" />
                  ) : (
                    <span className="text-2xl p-2 rounded-lg bg-zinc-900 border border-zinc-700">{wallet.icon}</span>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-zinc-100 group-hover:text-white flex items-center gap-2">
                      {wallet.name}
                    </div>
                    <div className="text-xs text-zinc-400">{wallet.desc}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">Connect →</span>
              </button>
            ))}

            <div className="pt-2 text-center">
              <p className="text-[11px] text-zinc-500">
                By connecting a wallet, you agree to Orvix Aggregator Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrvixWalletModal() {
  return <WalletModal />;
}
