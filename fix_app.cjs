const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { WatchlistPage } from './pages/WatchlistPage';", "import { WatchlistPage } from './pages/WatchlistPage';\nimport { formatGlobalNumber } from './lib/formatNumber';");
}

content = content.replace(/\(balWei \/ 1e18\)\.toFixed\(4\)/g, "formatGlobalNumber((balWei / 1e18), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");

fs.writeFileSync('src/App.tsx', content);
