import React from 'react';
import { Page } from '../types';
import { OrvixLogo } from './OrvixLogo';

export function Footer({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) {
  return (
    <footer className="py-12 mt-auto text-zinc-600 dark:text-zinc-400">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('HOME')}>
                <OrvixLogo className="h-8 w-auto text-zinc-900 dark:text-zinc-100" />
              </div>
              <p className="text-[#8da3ba] text-sm leading-relaxed">
                Curated Discovery Infrastructure for BSC.
              </p>
            </div>
          </div>
          


          {/* Platform Column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-[#1e3a5f] dark:text-[#8da3ba]">Platform</h4>
            <a href="#" target="_blank" rel="noreferrer" className="text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm">
              BscScan
            </a>

            <a href="#" target="_blank" rel="noreferrer" className="text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm">
              GitHub
            </a>
          </div>

          {/* Legal & Docs Column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase tracking-[0.08em] font-semibold text-[#1e3a5f] dark:text-[#8da3ba]">Legal & Docs</h4>
            <button onClick={() => setCurrentPage('DOCS')} className="text-left text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm cursor-pointer">
              Docs
            </button>
            <button onClick={() => setCurrentPage('WHITEPAPER')} className="text-left text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm cursor-pointer">
              Whitepaper
            </button>
            <button onClick={() => setCurrentPage('TERMS')} className="text-left text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm cursor-pointer">
              Terms of Use
            </button>
            <button onClick={() => setCurrentPage('PRIVACY')} className="text-left text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => setCurrentPage('CONTACT')} className="text-left text-[#8da3ba] hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline text-sm cursor-pointer">
              Contact
            </button>
          </div>

        </div>

        {/* Divider */}
        <div className="pt-8 border-t border-[rgba(30,58,95,0.15)] dark:border-[rgba(30,58,95,0.40)] flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-[#8da3ba] text-xs">
            Built by Orvix Labs
          </div>
        </div>
      </div>
    </footer>
  );
}

