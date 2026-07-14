const fs = require('fs');
let content = fs.readFileSync('src/lib/tokenMetadata.ts.test', 'utf8');

content = content.replace('const (isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET)_TESTNET: Token[] = [', 'const DEFAULT_TOKENS_TESTNET: Token[] = [');
content = content.replace('const (isTestnet ? DEFAULT_TOKENS_TESTNET : DEFAULT_TOKENS_MAINNET)_MAINNET = [', 'const DEFAULT_TOKENS_MAINNET: Token[] = [');

fs.writeFileSync('src/lib/tokenMetadata.ts', content);
