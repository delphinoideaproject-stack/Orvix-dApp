const fs = require('fs');
const files = [
  'src/components/TokenRow.tsx',
  'src/components/ShareBottomSheet.tsx',
  'src/components/TokenPosterCard.tsx',
  'src/pages/TokenDetailPage.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{token\.priceChange\}/g, "{formatGlobalNumber(token.priceChange)}");
  content = content.replace(/\{Math\.abs\(token\.priceChange\)\}/g, "{formatGlobalNumber(Math.abs(token.priceChange))}");
  fs.writeFileSync(file, content);
}
