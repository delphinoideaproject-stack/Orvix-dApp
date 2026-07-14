import { Token } from './types';

const network = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') : 'mainnet';
const isTestnet = network === 'testnet';

export const mockTokensTestnet: Token[] = [
  {
    id: 'testnet-bts',
    name: 'BlockTech Syndicate',
    symbol: 'BTS',
    pair: 'BTS/USST',
    chain: 'BSC',
    price: '0.0042',
    priceChange: 12.5,
    listedAt: 'Recently',
    contract: '0xF504A700fe1eC44A565cd4b5a2f6c6f536b5FB98',
    creator: '0x0000...0000',
    addLpTx: '0x0b826aFC12380Cd138ED9e7211631033fa51716F', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'tether',
    wallpaper: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'testnet-pvt',
    name: 'Private Token',
    symbol: 'PVT',
    pair: 'PVT/USST',
    chain: 'BSC',
    price: '1.24',
    priceChange: -2.4,
    listedAt: 'Recently',
    contract: '0x24b20A51Fd93F1F303d93caFf353EE8ec4868ef8',
    creator: '0x0000...0000',
    addLpTx: '0x0b826aFC12380Cd138ED9e7211631033fa51716F', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'usd-coin',
    wallpaper: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'testnet-ntc',
    name: 'Network Token',
    symbol: 'NTC',
    pair: 'NTC/USST',
    chain: 'BSC',
    price: '0.000084',
    priceChange: 156.2,
    listedAt: 'Recently',
    contract: '0xC6A18484d8d9FFA64F658616a1196da8f76B7d5a',
    creator: '0x0000...0000',
    addLpTx: '0x0b826aFC12380Cd138ED9e7211631033fa51716F', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'binancecoin',
    wallpaper: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'testnet-trav',
    name: 'Travel Token',
    symbol: 'TRAV',
    pair: 'TRAV/USST',
    chain: 'BSC',
    price: '0.51',
    priceChange: 5.1,
    listedAt: 'Recently',
    contract: '0xE844E1201df67D3c4aAA5656b2296a775C9F844A',
    creator: '0x0000...0000',
    addLpTx: '0x0b826aFC12380Cd138ED9e7211631033fa51716F', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'solana',
    wallpaper: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'testnet-oph',
    name: 'Orion Protocol Health',
    symbol: 'OPH',
    pair: 'OPH/USST',
    chain: 'BSC',
    price: '12.40',
    priceChange: -1.2,
    listedAt: 'Recently',
    contract: '0x63855c836594e6BD9814b882ADFf28546d74790A',
    creator: '0x0000...0000',
    addLpTx: '0x0b826aFC12380Cd138ED9e7211631033fa51716F', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'tether',
    wallpaper: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80'
  }
];

export const mockArchivedTokensTestnet: Token[] = [
  {
    id: 'testnet-cake',
    name: 'CAKE',
    symbol: 'CAKE',
    pair: 'CAKE/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Archived',
    contract: '0x8d008B313C1d6C7fE2982F62d32Da7507cF43551',
    creator: '0x0000...0000',
    addLpTx: '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'pancakeswap-token',
    exitType: 'V3 Migration'
  },
  {
    id: 'testnet-fdv',
    name: 'Fully Diluted Value',
    symbol: 'FDV',
    pair: 'FDV/USD',
    chain: 'BSC',
    price: '0.002',
    priceChange: 4.5,
    listedAt: 'Recently',
    contract: '0x2eB17E7c7F73315DDF8eB4b388931f7f10A8278a',
    creator: '0x0000...0000',
    addLpTx: '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'binance-usd',
    wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  }
];

export const mockHistoryTokensTestnet: Token[] = [];

export const mockTokensMainnet: Token[] = [];

export const mockArchivedTokensMainnet: Token[] = [];

export const mockHistoryTokensMainnet: Token[] = [];

export const mockTokens = isTestnet ? mockTokensTestnet : mockTokensMainnet;
export const mockArchivedTokens = isTestnet ? mockArchivedTokensTestnet : mockArchivedTokensMainnet;
export const mockHistoryTokens = isTestnet ? mockHistoryTokensTestnet : mockHistoryTokensMainnet;
