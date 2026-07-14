export type Page = 
  | 'HOME' 
  | 'NEW_ALPHA' 
  | 'ARCHIVE' 
  | 'HISTORY' 
  | 'SWAP' 
  | 'SUBMIT' 
  | 'DOCS' 
  | 'WHITEPAPER' 
  | 'CONTACT' 
  | 'PRIVACY'
  | 'TERMS'
  | 'TOKEN_DETAIL'
  | 'WATCHLIST';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  pair: string;
  chain: string;
  price: string;
  priceChange: number;
  listedAt: string;
  contract: string;
  creator: string;
  addLpTx: string;
  renounceTx: string;
  lockLpTx: string;
  ammVersion: string;
  exitType?: 'V3 Migration' | 'Major Exchange' | 'Removed' | 'CEX listing' | 'V3 migration';
  logo: string;
  wallpaper?: string;
  liquidityLockDuration?: string;
  renounceStatus?: string;
  allTimeHigh?: string;
  volume24h?: string;
  marketCap?: string;
  totalSupply?: string;
  liquidityAdded?: string;
  website?: string;
  x?: string;
  telegram?: string;
  github?: string;
  documentation?: string;
}
