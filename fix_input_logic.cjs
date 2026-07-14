const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

// Replace the onChange handler for fromAmount
const oldOnChange = `onChange={(e) => {
                setFromAmount(e.target.value);
                setQuoteData(null);
              }}`;

const newOnChange = `onChange={(e) => {
                let val = e.target.value.replace(/,/g, '');
                // Allow only numbers and a single decimal point
                if (/^\\d*\\.?\\d*$/.test(val)) {
                  setFromAmount(val);
                  setQuoteData(null);
                }
              }}`;

content = content.replace(oldOnChange, newOnChange);

// Also replace the percentage buttons logic
// From: const val = pct === 'MAX' ? '12.4' : formatGlobalNumber((12.4 * parseInt(pct) / 100), { minimumFractionDigits: 4, maximumFractionDigits: 4 });
// To: const val = pct === 'MAX' ? '12.4' : (12.4 * parseInt(pct) / 100).toString();
const oldPctLogic = `const val = pct === 'MAX' ? '12.4' : formatGlobalNumber((12.4 * parseInt(pct) / 100), { minimumFractionDigits: 4, maximumFractionDigits: 4 });`;
const newPctLogic = `const val = pct === 'MAX' ? '12.4' : (12.4 * parseInt(pct) / 100).toString();`;

content = content.replace(oldPctLogic, newPctLogic);

fs.writeFileSync('src/pages/SwapPage.tsx', content);
