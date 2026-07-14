const getNetworkConfig = () => {
  const network = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') : 'mainnet';
  const isTestnet = network === 'testnet';
  return {
    aggregator: '0xA4Bf191D53B880cA49F1ceD0C0C840378bdDef42',
    chainId: isTestnet ? 97 : 56,
    rpcDefault: isTestnet ? 'https://data-seed-prebsc-1-s1.binance.org:8545/' : 'https://bsc-dataseed.binance.org/',
    treasury: '0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc',
    protocolFee: 25,
    explorerUrl: isTestnet ? 'https://testnet.bscscan.com' : 'https://bscscan.com',
  };
};

export const ORVIX_CONFIG = getNetworkConfig();

export function getExplorerUrl() {
  return ORVIX_CONFIG.explorerUrl;
}

export function getEffectiveRpcUrl() {
  const network = typeof window !== 'undefined' ? localStorage.getItem('orvix_network') : 'mainnet';
  const isTestnet = network === 'testnet';
  
  const settingsStr = typeof window !== 'undefined' ? localStorage.getItem('orvix_settings') : null;
  let customRpc = null;
  if (settingsStr) {
    try {
      const settings = JSON.parse(settingsStr);
      if (isTestnet && settings.rpcUrlTestnet) customRpc = settings.rpcUrlTestnet;
      if (!isTestnet && settings.rpcUrlMainnet) customRpc = settings.rpcUrlMainnet;
    } catch(e) {}
  }
  
  return customRpc || ORVIX_CONFIG.rpcDefault;
}

