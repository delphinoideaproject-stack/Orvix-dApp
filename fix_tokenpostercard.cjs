const fs = require('fs');
let content = fs.readFileSync('src/components/TokenPosterCard.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { Token } from '../types';", "import { Token } from '../types';\nimport { formatGlobalNumber } from '../lib/formatNumber';");
}

content = content.replace(/\$\{token\.price\}/g, "${formatGlobalNumber(token.price)}");

fs.writeFileSync('src/components/TokenPosterCard.tsx', content);
