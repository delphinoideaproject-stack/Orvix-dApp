const fs = require('fs');
let content = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { fetchTrustedTokenList } from '../lib/tokenMetadata';", "import { fetchTrustedTokenList } from '../lib/tokenMetadata';\nimport { formatGlobalNumber } from '../lib/formatNumber';");
}

content = content.replace(/\$\{token\.price\}/g, "${formatGlobalNumber(token.price)}");
content = content.replace(/\{token\.priceChange\}/g, "{formatGlobalNumber(token.priceChange)}");

fs.writeFileSync('src/components/TokenModal.tsx', content);
