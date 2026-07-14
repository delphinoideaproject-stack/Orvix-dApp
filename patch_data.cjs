const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');

// Replace exports with Mainnet exports
content = content.replace('export const mockTokens: Token[] = [', 'export const mockTokensMainnet: Token[] = [');
content = content.replace('export const mockArchivedTokens: Token[] = [', 'export const mockArchivedTokensMainnet: Token[] = [');
content = content.replace('export const mockHistoryTokens: Token[] = [', 'export const mockHistoryTokensMainnet: Token[] = [');

const testnetCode = `
const network = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') : 'mainnet';
const isTestnet = network === 'testnet';

export const mockTokensTestnet: Token[] = [
  {
    id: 'testnet-bts',
    name: 'BTS',
    symbol: 'BTS',
    pair: 'BTS/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0xF504A700fe1eC44A565cd4b5a2f6c6f536b5FB98',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'tether'
  },
  {
    id: 'testnet-pvt',
    name: 'PVT',
    symbol: 'PVT',
    pair: 'PVT/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0x24b20A51Fd93F1F303d93caFf353EE8ec4868ef8',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'usd-coin'
  },
  {
    id: 'testnet-ntc',
    name: 'NTC',
    symbol: 'NTC',
    pair: 'NTC/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0xC6A18484d8d9FFA64F658616a1196da8f76B7d5a',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'binancecoin'
  },
  {
    id: 'testnet-fdv',
    name: 'FDV',
    symbol: 'FDV',
    pair: 'FDV/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0x2eB17E7c7F73315DDf8eB4b388931f7f10A8278a',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'binance-usd'
  },
  {
    id: 'testnet-trav',
    name: 'TRAV',
    symbol: 'TRAV',
    pair: 'TRAV/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0xE844E1201df67D3c4aAA5656b2296a775C9F844A',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'solana'
  },
  {
    id: 'testnet-oph',
    name: 'OPH',
    symbol: 'OPH',
    pair: 'OPH/WBNB',
    chain: 'BSC',
    price: '0.00',
    priceChange: 0,
    listedAt: 'Recently',
    contract: '0x63855c836594e6BD9814b882ADFf28546d74790A',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'tether'
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
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '100000000',
    logo: 'pancakeswap-token',
    exitType: 'V3 Migration'
  }
];

export const mockHistoryTokensTestnet: Token[] = [];

export const mockTokens = isTestnet ? mockTokensTestnet : mockTokensMainnet;
export const mockArchivedTokens = isTestnet ? mockArchivedTokensTestnet : mockArchivedTokensMainnet;
export const mockHistoryTokens = isTestnet ? mockHistoryTokensTestnet : mockHistoryTokensMainnet;
`;

content = content.replace("import { Token } from './types';", "import { Token } from './types';\n" + testnetCode);

fs.writeFileSync('src/data.ts', content);
