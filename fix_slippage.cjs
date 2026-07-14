const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

const slippageOld = `onChange={(e) => setSlippage(e.target.value)}`;
const slippageNew = `onChange={(e) => {
                let val = e.target.value.replace(/,/g, '');
                if (/^\\d*\\.?\\d*$/.test(val)) {
                  setSlippage(val);
                }
              }}`;

content = content.replace(slippageOld, slippageNew);
fs.writeFileSync('src/pages/SwapPage.tsx', content);
