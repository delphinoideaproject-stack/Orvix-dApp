const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

code = code.replace(
  /\{!searchQuery && Array\.from\(\{ length: emptySlotsCount \}\)\.map\(\(_, i\) => \(/,
  `{Array.from({ length: emptySlotsCount }).map((_, i) => (`
);

code = code.replace(
  /\{filteredNewAlpha\.length === 0 && searchQuery && \([\s\S]*?<\/div>\s*\)\}/m,
  ""
);

fs.writeFileSync('src/pages/HomePage.tsx', code);
