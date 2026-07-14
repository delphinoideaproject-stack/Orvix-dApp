import { Token } from '../types';

export interface SwapTx {
  id: string;
  timestamp: string;
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
  rate: string;
  pool: string;
  fee: string;
  gasUsed: string;
  txHash: string;
}

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  // Use UTF-8 BOM to ensure compatibility with Excel etc.
  const BOM = '\uFEFF';
  const csvContent = BOM + [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(val => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTokensToCSV(tokens: Token[], title: string) {
  const headers = [
    'ID', 'Name', 'Symbol', 'Pair', 'Chain', 'Price', 'Price Change (%)',
    'Listed At', 'Contract', 'Creator', 'Add LP TX', 'Renounce TX', 'Lock LP TX',
    'AMM Version', 'Exit Type'
  ];

  const rows = tokens.map(token => [
    token.id,
    token.name,
    token.symbol,
    token.pair,
    token.chain,
    token.price,
    String(token.priceChange),
    token.listedAt,
    token.contract,
    token.creator,
    token.addLpTx || '',
    token.renounceTx || '',
    token.lockLpTx || '',
    token.ammVersion,
    token.exitType || ''
  ]);

  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  downloadCSV(`orvix_${sanitizedTitle}_list.csv`, headers, rows);
}

export function exportSwapsToCSV(swaps: SwapTx[]) {
  const headers = [
    'ID', 'Date & Time', 'Sold Amount', 'Sold Token', 'Received Amount', 'Received Token',
    'Exchange Rate', 'Pool Address', 'Provider Fee (%)', 'Gas Used', 'Tx Hash'
  ];

  const rows = swaps.map(swap => [
    swap.id,
    new Date(swap.timestamp).toLocaleString('en-US'),
    swap.fromAmount,
    swap.fromSymbol,
    swap.toAmount,
    swap.toSymbol,
    swap.rate,
    swap.pool,
    swap.fee,
    swap.gasUsed,
    swap.txHash
  ]);

  downloadCSV('orvix_swap_history.csv', headers, rows);
}
