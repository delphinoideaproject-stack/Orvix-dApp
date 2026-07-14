const fs = require('fs');
let content = fs.readFileSync('src/components/ShareBottomSheet.tsx', 'utf8');

content = content.replace("const liquidityText = token.liquidityAdded || token.liquidityLockDuration || '100% Locked (Verified)';", "const liquidityText = formatGlobalNumber(token.liquidityAdded || token.liquidityLockDuration || '100% Locked (Verified)');");
content = content.replace("const marketCapText = token.marketCap || '$4.2M';", "const marketCapText = formatGlobalNumber(token.marketCap || '$4.2M');");
content = content.replace("const volumeText = token.volume24h || '$1.28M';", "const volumeText = formatGlobalNumber(token.volume24h || '$1.28M');");

fs.writeFileSync('src/components/ShareBottomSheet.tsx', content);
