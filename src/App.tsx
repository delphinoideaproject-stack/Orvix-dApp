/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Page, Token } from './types';
import { OrvixLogo } from './components/OrvixLogo';
import { HomePage } from './pages/HomePage';
import { TokenListPage } from './pages/NewAlphaPage';
import { ArchivePage } from './pages/ArchivePage';
import { HistoryPage } from './pages/HistoryPage';
import { SwapPage } from './pages/SwapPage';
import { SubmitWizard } from './pages/SubmitWizard';
import { CreatorPortalPage } from './pages/CreatorPortalPage';
import { StaticPage } from './pages/StaticPage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { SettingsModal } from './components/SettingsModal';
import { OrvixPromptModal } from './components/OrvixPromptModal';
import { ShareBottomSheet } from './components/ShareBottomSheet';
import { useAppKit, useAppKitAccount, useBalance, WalletModal, useWeb3 } from './lib/web3';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HybridBackground } from './components/HybridBackground';
import { mockTokens, mockArchivedTokens, mockHistoryTokens } from './data';
import { 
  Home, 
  Sparkles, 
  Archive, 
  History, 
  ArrowLeftRight, 
  Send, 
  FileText, 
  BookOpen, 
  Mail, 
  Shield, 
  Search, 
  Wallet, 
  Menu, 
  X,
  Settings
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/Button';
import { formatGlobalNumber } from './lib/formatNumber';


export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const currentNetwork = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') || 'mainnet' : 'mainnet';
  
  const handleNetworkChange = (net: string) => {
    localStorage.setItem('orvix_network', net);
    window.location.reload();
  };

  const { open: appKitOpen } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { isModalOpen, close, open: openWallet } = useWeb3();
  const { data: balanceData } = useBalance({ 
    address: address as `0x${string}`,
    query: { enabled: !!address }
  });
  const [bnbPrice, setBnbPrice] = useState<number>(600);

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
      .then(res => res.json())
      .then(data => {
        if (data && data.price) setBnbPrice(Number(data.price));
      })
      .catch(console.error);
  }, []);
  
  const formattedBalance = balanceData ? Number(balanceData.value) / (10 ** balanceData.decimals) : 0;
  const balanceInUsd = balanceData ? (formattedBalance * bnbPrice).toFixed(2) : '0.00';
  
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('orvix_theme') as 'dark' | 'light' | 'system') || 'light';
  });
  const [language, setLanguage] = useState('EN');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalShareToken, setGlobalShareToken] = useState<Token | null>(null);
  const [quickTradeToken, setQuickTradeToken] = useState<Token | null>(null);

  const handleQuickTrade = (token: Token) => {
    setQuickTradeToken(token);
    setSelectedToken(null);
    setCurrentPage('SWAP');
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const message = customEvent.detail || 'Contract address copied to clipboard!';
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('orvix-toast', handleToastEvent);

    const handleOpenShare = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setGlobalShareToken(customEvent.detail);
      }
    };
    window.addEventListener('orvix-open-share', handleOpenShare);

    return () => {
      window.removeEventListener('orvix-toast', handleToastEvent);
      window.removeEventListener('orvix-open-share', handleOpenShare);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('orvix_theme', theme);
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedToken(null);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, selectedToken]);

  const navItems: { label: string; page: Page; icon: any }[] = [
    { label: 'Home', page: 'HOME', icon: Home },
            { label: 'History', page: 'HISTORY', icon: History },
    { label: 'Trade Terminal', page: 'SWAP', icon: ArrowLeftRight },
    { label: 'Creator Portal', page: 'CREATOR_PORTAL', icon: Send },
    { label: 'Documentation', page: 'DOCS', icon: BookOpen },
    { label: 'Whitepaper', page: 'WHITEPAPER', icon: FileText },
    { label: 'Contact Us', page: 'CONTACT', icon: Mail },
    { label: 'Privacy & Policy', page: 'PRIVACY', icon: Shield },
  ];

  const renderPage = () => {
    if (selectedToken) {
      return (
        <TokenDetailPage 
          token={selectedToken} 
          onBack={() => setSelectedToken(null)}
          onSwap={() => handleNavigate('SWAP')}
        />
      );
    }

    switch (currentPage) {
      case 'HOME':
        return (
          <HomePage 
            setCurrentPage={handleNavigate} 
            searchQuery={searchQuery} 
            onSelectToken={setSelectedToken}
          />
        );
      case 'NEW_ALPHA':
        return (
          <TokenListPage 
            title="New Alpha" 
            description="Active curated tokens currently passing all AMM V2 security and structural audits on BNB Chain." 
            tokens={mockTokens} 
            setCurrentPage={handleNavigate}
            searchQuery={searchQuery}
            onSelectToken={setSelectedToken}
          />
        );
      case 'ARCHIVE':
        return (
          <ArchivePage 
            tokens={mockArchivedTokens} 
            setCurrentPage={handleNavigate}
            searchQuery={searchQuery}
            onSelectToken={setSelectedToken}
          />
        );
      case 'HISTORY':
        return (
          <HistoryPage 
            tokens={mockHistoryTokens} 
            searchQuery={searchQuery}
            setCurrentPage={handleNavigate}
            onSelectToken={setSelectedToken}
          />
        );
      case 'SWAP':
        return (
          <SwapPage 
            onModalOpenChange={setIsSwapModalOpen} 
            preselectedToken={quickTradeToken}
            onClearPreselectedToken={() => setQuickTradeToken(null)}
          />
        );
      case 'CREATOR_PORTAL':
        return (
          <CreatorPortalPage 
            walletConnected={isConnected}
            walletAddress={address}
            onOpenWalletModal={() => open()}
            onNavigate={handleNavigate}
          />
        );
      case 'SUBMIT':
        return (
          <SubmitWizard 
            walletConnected={isConnected}
            walletAddress={address}
            onOpenWalletModal={() => open()}
          />
        );
      case 'DOCS':
        return (
          <StaticPage title="Documentation">
            <p>Welcome to the Orvix Protocol documentation. Orvix is a deterministic discovery protocol for verified Web3 assets operating exclusively on AMM V2 BNB Chain.</p>
            <h2>Overview</h2>
            <p>We algorithmically identify, manually review, and present early-stage blockchain projects with guaranteed liquidity locking.</p>
          </StaticPage>
        );
      case 'WHITEPAPER':
        return (
          <StaticPage title="Whitepaper">
            <p>The thesis behind Orvix Labs and our approach to token curation on BNB Chain.</p>
            <h2>The Problem</h2>
            <p>The current landscape of token discovery is filled with noise and unverified contracts.</p>
            <h2>The Solution</h2>
            <p>A deterministic approach to contract verification and AMM V2 liquidity locking analysis.</p>
          </StaticPage>
        );
      case 'CONTACT':
        return (
          <StaticPage title="Contact Us">
            <p>Reach out to the Orvix curation team.</p>
            <p>Email: security@orvix.labs</p>
            <p>Telegram: @orvix_support</p>
          </StaticPage>
        );
      case 'PRIVACY':
        return (
          <StaticPage title="Privacy Policy">
            <p>We respect your privacy. Orvix does not track personal wallet activity beyond submitted application data.</p>
            <h2>Data Collection</h2>
            <p>We only store information explicitly provided during the token submission process on BNB Chain.</p>
          </StaticPage>
        );
      default:
        return <HomePage setCurrentPage={handleNavigate} searchQuery={searchQuery} onSelectToken={setSelectedToken} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col lg:flex-row antialiased selection:bg-blue-600 selection:text-white relative">
      <HybridBackground />
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('HOME')}>
          <OrvixLogo className="h-7 w-auto text-[var(--text)]" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)} className="text-[var(--text)] hover:text-white transition-colors p-1">
              <Settings className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
            
            {networkDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 mb-2 px-2">Pilih Jaringan</div>
                <button 
                  onClick={() => { handleNetworkChange('mainnet'); setNetworkDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-zinc-800 transition-colors ${currentNetwork === 'mainnet' ? 'text-[#f3ba2f]' : 'text-[var(--text)]'}`}
                >
                  BNB Mainnet {currentNetwork === 'mainnet' && <span className="w-2 h-2 rounded-full bg-[#f3ba2f] animate-pulse" />}
                </button>
                <button 
                  onClick={() => { handleNetworkChange('testnet'); setNetworkDropdownOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-zinc-800 transition-colors ${currentNetwork === 'testnet' ? 'text-blue-400' : 'text-[var(--text)]'}`}
                >
                  tBNB Testnet {currentNetwork === 'testnet' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                </button>
              </div>
            )}
          </div>

            <button onClick={() => { console.log('Mobile wallet button clicked'); openWallet(); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer z-50">
              {isConnected && balanceData ? (
                <>
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-xs font-bold text-white">${balanceInUsd}</span>
                    <span className="text-[10px] text-blue-200">{formattedBalance.toFixed(4)} {balanceData.symbol}</span>
                  </div>
                  <div className="relative">
                    <Wallet className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Connect</span>
                </>
              )}
            </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[var(--text)]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="lg:hidden fixed inset-x-0 top-[65px] bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] z-40 p-4 space-y-2 max-h-[85vh] overflow-y-auto shadow-2xl"
        >
          <div className="px-3 py-2 bg-[var(--card)] rounded-xl border border-[var(--border)] mb-3 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Network:</span>
            <span className="text-green-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {currentNetwork === 'testnet' ? 'AMM V2 · tBNB Testnet' : 'AMM V2 · BNB Chain'}
            </span>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.page;
            return (
              <motion.button
                key={item.page}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.page)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left relative overflow-hidden",
                  active 
                    ? "bg-blue-600/10 border border-blue-500/30 text-[var(--text)]" 
                    : "text-zinc-400 hover:text-[var(--text)] hover:bg-[var(--card)] border border-transparent"
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="mobileActiveIndicator"
                    className="absolute inset-0 bg-blue-600/10 border border-blue-500/30 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10", active ? "text-blue-500" : "text-zinc-500")} />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
          <button
            onClick={() => { setMobileMenuOpen(false); setSettingsOpen(true); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left bg-blue-600/10 border border-blue-500/30 text-[var(--text)] mt-2"
          >
            <Settings className="w-4 h-4 text-blue-500" />
            App Settings (Theme & Language)
          </button>
        </motion.div>
      )}

      {/* DESKTOP LEFT SIDEBAR (LUSTRO SPLIT-SCREEN AMBIENT FRAMING) */}
      <aside className="hidden lg:flex w-80 shrink-0 h-screen sticky top-0 bg-[var(--bg)]/85 backdrop-blur-md border-r border-[var(--border)] flex-col justify-between p-6 overflow-y-auto select-none">
        <div className="space-y-8">
          {/* Logo & Tagline */}
          <div className="cursor-pointer space-y-2" onClick={() => handleNavigate('HOME')}>
            <OrvixLogo className="h-9 w-auto text-[var(--text)]" />
            <div className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase pl-0.5">
              Deterministic Discovery
            </div>
          </div>

          {/* Network Badge */}
          <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Platform</span>
            <span className="text-green-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              AMM V2 · BSC
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigate(item.page)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer border relative overflow-hidden",
                    active 
                      ? "bg-blue-600/10 border-blue-500/30 text-[var(--text)] font-semibold" 
                      : "text-zinc-400 hover:text-[var(--text)] hover:bg-[var(--card)] border-transparent"
                  )}
                >
                  {active && (
                    <motion.div 
                      layoutId="desktopActiveIndicator"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute inset-0 bg-blue-600/10 border border-blue-500/30 rounded-xl z-0"
                    />
                  )}
                  <Icon className={cn("w-4 h-4 relative z-10", active ? "text-blue-500" : "text-zinc-500")} />
                  <motion.span 
                    className="relative z-10"
                    animate={{ x: active ? 4 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {item.label}
                  </motion.span>
                </button>
              );
            })}
          </nav>

          {/* Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer border border-[var(--border)] bg-[var(--card)] text-zinc-400 hover:text-[var(--text)] hover:bg-zinc-800/50 mt-4"
          >
            <Settings className="w-4 h-4" />
            Settings ({theme}, {language})
          </button>
        </div>

        {/* Sidebar Footer Stats & Copyright */}
        <div className="pt-6 border-t border-[var(--border)] space-y-4">
          <div className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Active Slots</span>
              <span className="text-[var(--text)] font-bold">5 / 5 Max</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Protocol Fee</span>
              <span className="text-[var(--text)] font-bold">0.25%</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono text-center">
            Orvix Labs ©2026. AMM V2 BNB Chain.
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN TERMINAL CONTENT AREA */}
      <main className="flex-1 bg-[var(--bg)]/80 backdrop-blur-sm flex flex-col justify-between overflow-x-hidden">
        
        {/* Top Terminal Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-[var(--border)] sticky top-0 z-30 bg-[var(--bg)]/90 backdrop-blur">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold font-sans tracking-tight text-[var(--text)]">
              {navItems.find(i => i.page === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-zinc-800 transition-all text-zinc-300 flex items-center justify-center cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-blue-400" />
            </button>

            <button 
              onClick={() => handleNavigate('SUBMIT')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Token
            </button>

            <div className="relative">
              <button onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)} className="text-zinc-300 hover:text-white transition-colors p-1">
                <Settings className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
              
              {networkDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 mb-2 px-2">Pilih Jaringan</div>
                  <button 
                    onClick={() => { handleNetworkChange('mainnet'); setNetworkDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-zinc-800 transition-colors ${currentNetwork === 'mainnet' ? 'text-[#f3ba2f]' : 'text-[var(--text)]'}`}
                  >
                    BNB Mainnet {currentNetwork === 'mainnet' && <span className="w-2 h-2 rounded-full bg-[#f3ba2f] animate-pulse" />}
                  </button>
                  <button 
                    onClick={() => { handleNetworkChange('testnet'); setNetworkDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-zinc-800 transition-colors ${currentNetwork === 'testnet' ? 'text-blue-400' : 'text-[var(--text)]'}`}
                  >
                    tBNB Testnet {currentNetwork === 'testnet' && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => { console.log('Desktop wallet button clicked'); openWallet(); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer z-50">
              {isConnected && balanceData ? (
                <>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white">${balanceInUsd}</span>
                    <span className="text-[10px] text-blue-200">{formattedBalance.toFixed(4)} {balanceData.symbol}</span>
                  </div>
                  <div className="relative">
                    <Wallet className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Connect Wallet</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Page View Container */}
        <div className={selectedToken ? "flex-1" : "flex-1 px-4 lg:px-12 py-8"}>
          {renderPage()}
        </div>

        {!isSwapModalOpen && (
          <Footer setCurrentPage={handleNavigate} />
        )}
      </main>

      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        onOpenPromptModal={() => setPromptModalOpen(true)}
      />

      <OrvixPromptModal 
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />

      

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {globalShareToken && (
        <ShareBottomSheet 
          token={globalShareToken} 
          isOpen={!!globalShareToken} 
          onClose={() => setGlobalShareToken(null)} 
        />
      )}

      <WalletModal isOpen={isModalOpen} onClose={close} />
    </div>
  );
}


