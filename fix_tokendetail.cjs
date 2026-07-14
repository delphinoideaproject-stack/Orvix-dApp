const fs = require('fs');
let content = fs.readFileSync('src/pages/TokenDetailPage.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { Token } from '../types';", "import { Token } from '../types';\nimport { formatGlobalNumber } from '../lib/formatNumber';");
}

content = content.replace(/\$\{token\.price\}/g, "${formatGlobalNumber(token.price)}");
content = content.replace(/value=\{token\.totalSupply \|\| '700M'\}/g, "value={formatGlobalNumber(token.totalSupply || '700M')}");
content = content.replace(/value=\{token\.liquidityAdded \|\| '\$50,000'\}/g, "value={formatGlobalNumber(token.liquidityAdded || '$50,000')}");
content = content.replace(/value=\{token\.volume24h \|\| '\$324,580'\}/g, "value={formatGlobalNumber(token.volume24h || '$324,580')}");

fs.writeFileSync('src/pages/TokenDetailPage.tsx', content);
