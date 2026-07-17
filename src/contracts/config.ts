const getNetworkConfig = () => {
  return {
    aggregator: '0xA4Bf191D53B880cA49F1ceD0C0C840378bdDef42',
    chainId: 97,
    rpcDefault: 'https://bsc-testnet.bnbchain.org',
    treasury: '0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc',
    protocolFee: 25,
    explorerUrl: 'https://testnet.bscscan.com',
  };
};

export const ORVIX_CONFIG = getNetworkConfig();

export function getExplorerUrl() {
  return ORVIX_CONFIG.explorerUrl;
}

export function getEffectiveRpcUrl() {
  const settingsStr = typeof window !== 'undefined' ? localStorage.getItem('orvix_settings') : null;
  let customRpc = null;
  if (settingsStr) {
    try {
      const settings = JSON.parse(settingsStr);
      if (settings.rpcUrlTestnet) customRpc = settings.rpcUrlTestnet;
    } catch(e) {}
  }
  return customRpc || ORVIX_CONFIG.rpcDefault;
}

