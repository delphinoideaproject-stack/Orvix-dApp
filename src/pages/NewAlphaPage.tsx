import React from 'react';
import { Page, Token } from '../types';
import { TokenRow, NewAlphaRow, NewAlphaSkeletonCard, TokenAction } from '../components/TokenRow';
import { AvailableSlotCard } from '../components/AvailableSlotCard';
import { Button } from '../components/Button';
import { Download, AlertCircle } from 'lucide-react';
import { exportTokensToCSV } from '../lib/csvUtils';
import { useAlphaData } from '../hooks/useAlphaData';

export function TokenListPage({ 
  title, 
  description, 
  tokens: initialTokens, 
  showSwap = true,
  showExportButton = true,
  showExitType = true,
  searchQuery = '',
  setCurrentPage,
  onSelectToken
}: { 
  title: string; 
  description: string; 
  tokens: Token[]; 
  showSwap?: boolean;
  showExportButton?: boolean;
  showExitType?: boolean;
  searchQuery?: string;
  setCurrentPage?: (p: Page) => void;
  onSelectToken?: (t: Token) => void;
}) {
  // Data-UI Separated via useAlphaData hook (handling loading and error states)
  const { tokens, loading, error, refetch } = useAlphaData(initialTokens);

  const filteredTokens = tokens.filter(t => 
    !searchQuery || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNewAlpha = title === 'New Alpha';
  const maxSlots = 7;
  const activeCount = tokens.length;
  const emptySlotsCount = isNewAlpha ? Math.max(0, maxSlots - activeCount) : 0;

  // Custom action generator for Action Injection
  const getActionsForToken = (token: Token): TokenAction[] => {
    const isStable = token.pair.includes('USDT') || token.pair.includes('USDC') || token.pair.includes('BUSD');
    const actions: TokenAction[] = [];

    if (showSwap) {
      actions.push({
        label: isStable ? 'Swap Stablecoin' : 'Swap Token',
        variant: 'primary',
        onClick: () => setCurrentPage?.('SWAP')
      });
    }

    if (token.ammVersion || token.addLpTx) {
      actions.push({
        label: 'Manage LP',
        variant: 'outline',
        onClick: () => setCurrentPage?.('SWAP')
      });
    }

    return actions;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">{title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 w-full whitespace-pre-line">{description}</p>
        </div>
        {showExportButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 self-start sm:self-auto shrink-0" 
            onClick={() => exportTokensToCSV(filteredTokens, title)}
            disabled={filteredTokens.length === 0 || loading}
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Conditional Rendering: Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between my-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Failed to load data</div>
              <div className="text-xs opacity-80">{error}</div>
            </div>
          </div>
          <Button size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Loaded or Loading Content with Skeletons */}
      <div className="space-y-4">
        {loading ? (
          <>
            <NewAlphaSkeletonCard />
            <NewAlphaSkeletonCard />
            <NewAlphaSkeletonCard />
          </>
        ) : (
          <>
            {filteredTokens.length > 0 ? (
              filteredTokens.map((t, index) => (
                <NewAlphaRow 
                  key={`${t.id}-${index}`} 
                  index={index} 
                  token={t} 
                  showSwap={showSwap} 
                  showExitType={showExitType} 
                  onNavigate={setCurrentPage} 
                  onSelect={onSelectToken}
                  actions={getActionsForToken(t)}
                />
              ))
            ) : null}

            {/* Conditional Rendering: Empty Slots for New Alpha */}
            {isNewAlpha && Array.from({ length: emptySlotsCount }).map((_, i) => (
              <AvailableSlotCard key={`empty-slot-${i}`} setCurrentPage={setCurrentPage} />
            ))}

            {/* Conditional Rendering: No search results */}
            {filteredTokens.length === 0 && (!isNewAlpha) && (
              <div className="text-center py-20 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                <p className="text-zinc-500">No tokens found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

