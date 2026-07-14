import { Token } from '../types';
import { mockTokens, mockArchivedTokens, mockHistoryTokens } from '../data';

const CACHE_KEY = 'orvix_token_metadata_cache_v4';
const CACHE_TIMESTAMP_KEY = 'orvix_token_metadata_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours


const network = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') : 'mainnet';
const isTestnet = network === 'testnet';

const DEFAULT_TOKENS_TESTNET: Token[] = [
  {
    id: 'testnet-bnb',
    name: 'BNB',
    symbol: 'BNB',
    pair: 'BNB/USDT',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0x0000000000000000000000000000000000000000',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '0',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
  },
  {
    id: 'testnet-wbnb',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    pair: 'WBNB/USDT',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '0',
    logo: 'https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png'
  },
  {
    id: 'testnet-usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    pair: 'USDT/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '0',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    id: 'testnet-usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    pair: 'USDC/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0x64544969ed7EBf5f083679233325356EbE738930',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '0',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  }
];

const DEFAULT_TOKENS_MAINNET: Token[] = [

  {
    id: 'default-bnb',
    name: 'BNB',
    symbol: 'BNB',
    pair: 'BNB/USDT',
    chain: 'BSC',
    price: '610.50',
    priceChange: 3.4,
    listedAt: 'Genesis',
    contract: '0x0000000000000000000000000000000000000000',
    creator: '0x0000...0000',
    addLpTx: '0x0000...0000',
    renounceTx: '0x0000...0000',
    lockLpTx: '0x0000...0000',
    ammVersion: 'AMM V2 · BNB Chain',
    totalSupply: '150,000,000',
    logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
  },
  {
    id: 'default-wbnb',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    pair: 'WBNB/USDT',
    chain: 'BSC',
    price: '610.50',
    priceChange: 3.4,
    listedAt: 'Genesis',
    contract: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    creator: '0xbb4c...db9c',
    addLpTx: '0x1234...5678',
    renounceTx: '0x1234...5678',
    lockLpTx: '0x1234...5678',
    ammVersion: 'AMM V2 · BNB Chain',
    totalSupply: '10,000,000',
    logo: 'https://assets.coingecko.com/coins/images/12591/small/binance-coin-logo.png'
  },
  {
    id: 'default-usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    pair: 'USDT/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0.0,
    listedAt: 'Genesis',
    contract: '0x55d398326f99059ff775485246999027b3197955',
    creator: '0x55d3...7955',
    addLpTx: '0x2345...6789',
    renounceTx: '0x2345...6789',
    lockLpTx: '0x2345...6789',
    ammVersion: 'AMM V2 · BNB Chain',
    totalSupply: '50,000,000,000',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    id: 'default-usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    pair: 'USDC/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0.01,
    listedAt: 'Genesis',
    contract: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    creator: '0x8ac7...580d',
    addLpTx: '0x3456...7890',
    renounceTx: '0x3456...7890',
    lockLpTx: '0x3456...7890',
    ammVersion: 'AMM V2 · BNB Chain',
    totalSupply: '30,000,000,000',
    logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  {
    id: 'default-busd',
    name: 'Binance USD',
    symbol: 'BUSD',
    pair: 'BUSD/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0.0,
    listedAt: 'Genesis',
    contract: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    creator: '0xe9e7...87d5',
    addLpTx: '0x4567...8901',
    renounceTx: '0x4567...8901',
    lockLpTx: '0x4567...8901',
    ammVersion: 'AMM V2 · BNB Chain',
    totalSupply: '5,000,000,000',
    logo: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png'
  }
];

export async function fetchTrustedTokenList(): Promise<Token[]> {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    if (cached && cachedTime && (now - parseInt(cachedTime, 10) < CACHE_DURATION)) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((t: Token) => t.id));
          const existingContracts = new Set(parsed.map((t: Token) => t.contract?.toLowerCase()));
          const freshAdditions = [
            ...mockTokens,
            ...mockArchivedTokens,
            ...mockHistoryTokens
          ].filter(t => !existingIds.has(t.id) && !existingContracts.has(t.contract?.toLowerCase()));

          return [...freshAdditions, ...parsed];
        }
      } catch {
        // invalid cache
      }
    }

    // Try fetching from PancakeSwap token list
    const response = await fetch('https://tokens.pancakeswap.finance/pancakeswap-extended.json');
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.tokens)) {
        const fetchedTokens: Token[] = data.tokens
          .filter((t: any) => t.chainId === 56 || t.chainId === '56')
          .slice(0, 100)
          .map((t: any, idx: number) => ({
            id: `pancake-${idx}-${t.address}`,
            name: t.name || t.symbol,
            symbol: t.symbol,
            pair: `${t.symbol}/USDT`,
            chain: 'BSC',
            price: '1.00',
            priceChange: 0,
            listedAt: 'Verified List',
            contract: t.address,
            creator: '0x0000...0000',
            addLpTx: '0x0000...0000',
            renounceTx: '0x0000...0000',
            lockLpTx: '0x0000...0000',
            ammVersion: 'AMM V2 · BNB Chain',
            logo: t.logoURI || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`
          }));

        const rawCombined = [
          ...(isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET),
          ...fetchedTokens.filter(ft => !(isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET).some(dt => dt.symbol.toLowerCase() === ft.symbol.toLowerCase())),
          ...mockTokens,
          ...mockArchivedTokens,
          ...mockHistoryTokens
        ];

        const seen = new Set();
        const combined = rawCombined.filter(token => {
          if (seen.has(token.id)) return false;
          seen.add(token.id);
          return true;
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(combined));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
        return combined;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch remote token list, falling back to local metadata:', err);
  }

  const fallbackList = [
    ...(isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET),
    ...mockTokens,
    ...mockArchivedTokens,
    ...mockHistoryTokens
  ];
  return fallbackList;
}
