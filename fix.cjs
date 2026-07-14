const fs = require('fs');
let code = fs.readFileSync('src/pages/TokenDetailPage.tsx', 'utf-8');
const patch = fs.readFileSync('patch.txt', 'utf-8');
code = code.replace(/\{\/\* On-Chain Info \*\/\}[\s\S]*?\{\/\* Official Links \*\/\}/, patch + '\n              {/* Official Links */}');
fs.writeFileSync('src/pages/TokenDetailPage.tsx', code);
