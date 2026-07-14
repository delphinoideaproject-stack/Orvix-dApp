import React, { useState } from 'react';
import { Page, Token } from '../types';
import { TokenLogo } from '../components/TokenLogo';
import { Button } from '../components/Button';
import { CopyButton } from '../components/CopyButton';
import { ArrowRight, Info } from 'lucide-react';
import { formatGlobalNumber } from '../lib/formatNumber';
import { getExplorerUrl } from '../contracts/config';


interface ArchivePageProps {
  tokens: Token[];
  searchQuery?: string;
  setCurrentPage?: (p: Page) => void;
  onSelectToken?: (t: Token) => void;
}

export function ArchivePage({
  tokens,
  searchQuery = '',
  setCurrentPage,
  onSelectToken
}: ArchivePageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTokens = tokens.filter(t =>
    !searchQuery ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Archive</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl whitespace-pre-line">
          Tokens that have completed their time in New Alpha.{'\n'}Still active. Still tradeable.
        </p>
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
        {filteredTokens.length > 0 ? (
          filteredTokens.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <div key={t.id} className="py-4 transition-colors">
                <div 
                  className="flex items-center justify-between cursor-pointer group py-2"
                  onClick={() => onSelectToken?.(t)}
                >
                  {/* Left: Icon + Pair */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <TokenLogo tokenId={t.logo || t.id} className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {t.pair}
                        <span className="text-xs font-normal text-zinc-500">({t.name})</span>
                      </div>
                      <div className="text-xs text-zinc-400">{t.listedAt}</div>
                    </div>
                  </div>

                  {/* Middle: Current Price */}
                  <div className="text-right sm:text-left font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    ${formatGlobalNumber(t.price)}
                  </div>

                  {/* Right: Swap Button + Arrow */}
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs py-1.5 px-3 rounded-xl"
                      onClick={() => setCurrentPage?.('SWAP')}
                    >
                      Trade
                    </Button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : t.id);
                      }}
                      className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Toggle Details"
                    >
                      <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Inline Expanded Detail View */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="text-xs font-semibold text-zinc-500">Contract</div>
                          <div className="relative group/tooltip inline-flex items-center">
                            <Info className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col gap-1 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-30 text-xs font-sans text-zinc-200 pointer-events-none">
                              <span className="font-bold text-zinc-100">Smart Contract Address</span>
                              <span className="text-zinc-400">Decentralized smart contract on BNB Chain governing token transfers, liquidity pools, and AMM V2 trading rules.</span>
                              <span className="text-[11px] font-mono text-blue-400 break-all mt-0.5">{t.contract}</span>
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mb-2">{t.contract}</div>
                        <div className="flex gap-2">
                          <CopyButton text={t.contract} label="Copy" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
                          <a href={`${getExplorerUrl()}/address/${t.contract}`} target="_blank" rel="noreferrer" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">BscScan</a>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 mb-1">Creator</div>
                        <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all mb-2">{t.creator}</div>
                        <div className="flex gap-2">
                          <CopyButton text={t.creator} label="Copy" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800" />
                          <a href={`${getExplorerUrl()}/address/${t.creator}`} target="_blank" rel="noreferrer" className="text-xs py-1 px-2.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">BscScan</a>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-500 mb-1">AMM Version</div>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 font-medium">{t.ammVersion}</div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => onSelectToken?.(t)}>
                            Open Full Modal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No archived tokens found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
