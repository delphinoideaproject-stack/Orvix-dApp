import React, { useState } from 'react';
import { Menu, X, Search, Wallet, Sun, Moon, Monitor } from 'lucide-react';
import { Page } from '../types';
import { OrvixLogo } from './OrvixLogo';
import { useTheme, Theme } from './ThemeToggle';
import { cn } from '../lib/utils';
import { Button } from './Button';
import { useWeb3 } from '../lib/web3';

export function Header({ 
  currentPage, 
  setCurrentPage,
  searchQuery,
  setSearchQuery
}: { 
  currentPage: Page; 
  setCurrentPage: (p: Page) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address, balanceInUsd, open } = useWeb3();
  const shortAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  const { theme, setTheme } = useTheme();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const navItems: { label: string, page: Page }[] = [
    { label: 'Home', page: 'HOME' },
    { label: 'New Alpha', page: 'NEW_ALPHA' },
    { label: 'Watchlist', page: 'WATCHLIST' },
    { label: 'Archive', page: 'ARCHIVE' },
    { label: 'Trade', page: 'SWAP' },
    { label: 'History', page: 'HISTORY' },
    { label: 'Submit', page: 'SUBMIT' },
    { label: 'Docs', page: 'DOCS' },
    { label: 'Whitepaper', page: 'WHITEPAPER' },
    { label: 'Contact Us', page: 'CONTACT' },
    { label: 'Privacy & Policy', page: 'PRIVACY' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('HOME')}>
            <OrvixLogo className="h-8 text-zinc-900 dark:text-zinc-100 w-auto" />
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or contract..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.filter(item => item.page !== 'HOME').slice(0, 6).map(item => (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.page)}
                className={cn("px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer", 
                  currentPage === item.page 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="px-3 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
              AI (Future)
            </span>
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              <ThemeIcon className="w-5 h-5" />
            </button>
            <Button size="sm" className="hidden lg:flex items-center gap-2" onClick={open} variant={isConnected ? 'secondary' : 'primary'}>
              <Wallet className="w-4 h-4 text-emerald-400" />
              {isConnected ? (
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold text-emerald-400">${balanceInUsd}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{shortAddress}</span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </div>

          <div className="flex items-center md:hidden gap-2">
            <Button size="sm" className="flex items-center gap-2" variant={isConnected ? 'secondary' : 'outline'} onClick={open}>
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{isConnected ? `$${balanceInUsd}` : 'Connect'}</span>
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 absolute w-full max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg pb-4">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or contract..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setCurrentPage(item.page);
                  setMobileMenuOpen(false);
                }}
                className={cn("block w-full text-left px-3 py-3 rounded-md text-base font-medium cursor-pointer",
                  currentPage === item.page
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
              AI (Future)
            </span>
          </div>
          
          <div className="px-5 pt-4 pb-2 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Theme Settings</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={cn("flex flex-col items-center justify-center py-2 rounded-lg border cursor-pointer transition-colors", theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}
              >
                <Sun className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn("flex flex-col items-center justify-center py-2 rounded-lg border cursor-pointer transition-colors", theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}
              >
                <Moon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn("flex flex-col items-center justify-center py-2 rounded-lg border cursor-pointer transition-colors", theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800')}
              >
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">System</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
