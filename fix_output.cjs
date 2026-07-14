const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

// fix p.output
content = content.replace(
  /output: formatGlobalNumber\(\(parseFloat\(fromAmount\) \* 1\.5\), \{ minimumFractionDigits: 4, maximumFractionDigits: 4 \}\)/g,
  "output: Number((parseFloat(fromAmount) * 1.5).toFixed(6)).toString()"
);
content = content.replace(
  /output: formatGlobalNumber\(\(parseFloat\(fromAmount\) \* 1\.48\), \{ minimumFractionDigits: 4, maximumFractionDigits: 4 \}\)/g,
  "output: Number((parseFloat(fromAmount) * 1.48).toFixed(6)).toString()"
);

// fix percentage buttons if there are any remaining or just double check
content = content.replace(
  /const val = pct === 'MAX' \? '12\.4' : \(12\.4 \* parseInt\(pct\) \/ 100\)\.toString\(\);/g,
  "const val = pct === 'MAX' ? '12.4' : Number((12.4 * parseInt(pct) / 100).toFixed(6)).toString();"
);

fs.writeFileSync('src/pages/SwapPage.tsx', content);
