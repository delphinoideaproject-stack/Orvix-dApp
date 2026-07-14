const fs = require('fs');
let code = fs.readFileSync('src/pages/NewAlphaPage.tsx', 'utf-8');

code = code.replace(
  /const emptySlotsCount = isNewAlpha && !searchQuery \? Math\.max\(0, maxSlots - activeCount\) : 0;/,
  `const emptySlotsCount = isNewAlpha ? Math.max(0, maxSlots - activeCount) : 0;`
);

code = code.replace(
  /\{isNewAlpha && !searchQuery && Array\.from\(\{ length: emptySlotsCount \}\)\.map\(\(_, i\) => \(/,
  `{isNewAlpha && Array.from({ length: emptySlotsCount }).map((_, i) => (`
);

code = code.replace(
  /\{filteredTokens\.length === 0 && \(!isNewAlpha \|\| searchQuery\) && \(/,
  `{filteredTokens.length === 0 && (!isNewAlpha) && (`
);

fs.writeFileSync('src/pages/NewAlphaPage.tsx', code);
