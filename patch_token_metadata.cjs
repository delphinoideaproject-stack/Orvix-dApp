const fs = require('fs');
let content = fs.readFileSync('src/lib/tokenMetadata.ts', 'utf8');

const testnetTokensCode = `
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
    id: 'testnet-usd',
    name: 'USD',
    symbol: 'USD',
    pair: 'USD/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0xBCf4FBE06fe75c4B95F393918Ed53dD9A18d3b95',
    creator: '0x0000...0000',
    addLpTx: '', renounceTx: '', lockLpTx: '', ammVersion: 'AMM V2', totalSupply: '0',
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
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
    id: 'testnet-usst',
    name: 'USST',
    symbol: 'USST',
    pair: 'USST/BNB',
    chain: 'BSC',
    price: '1.00',
    priceChange: 0,
    listedAt: 'Genesis',
    contract: '0x0b826aFC12380Cd138ED9e7211631033fa51716F',
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

const DEFAULT_TOKENS_MAINNET = [
`;

content = content.replace("const DEFAULT_TOKENS: Token[] = [", testnetTokensCode);

content = content.replace(/DEFAULT_TOKENS/g, "(isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET)");

// but wait, we need to make sure we don't accidentally mess up the definition. Let's do it carefully.
fs.writeFileSync('src/lib/tokenMetadata.ts.test', content);
