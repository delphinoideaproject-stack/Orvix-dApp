const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { TokenModal } from '../components/TokenModal';", "import { TokenModal } from '../components/TokenModal';\nimport { formatGlobalNumber } from '../lib/formatNumber';");
}

content = content.replace(/\(12\.4 \* parseInt\(pct\) \/ 100\)\.toFixed\(4\)/g, "formatGlobalNumber((12.4 * parseInt(pct) / 100), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");
content = content.replace(/\(parseFloat\(fromAmount\) \* 1\.5\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(fromAmount) * 1.5), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");
content = content.replace(/\(parseFloat\(fromAmount\) \* 1\.48\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(fromAmount) * 1.48), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");

content = content.replace(/\(parseFloat\(p\.output\) \/ parseFloat\(fromAmount\)\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(p.output) / parseFloat(fromAmount)), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");
content = content.replace(/\(parseFloat\(p\.output\) \* 0\.99\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(p.output) * 0.99), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");

content = content.replace(/\(parseFloat\(selectedPool\.output\) \/ parseFloat\(fromAmount\)\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");
content = content.replace(/\(parseFloat\(selectedPool\.output\) \* 0\.99\)\.toFixed\(4\)/g, "formatGlobalNumber((parseFloat(selectedPool.output) * 0.99), { minimumFractionDigits: 4, maximumFractionDigits: 4 })");

content = content.replace(/\(parseFloat\(selectedPool\.output\) \/ parseFloat\(fromAmount\)\)\.toFixed\(6\)/g, "formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 6, maximumFractionDigits: 6 })");

fs.writeFileSync('src/pages/SwapPage.tsx', content);
