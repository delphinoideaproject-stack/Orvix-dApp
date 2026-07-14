const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');

// remove the assignments
content = content.replace('export const mockTokens = isTestnet ? mockTokensTestnet : mockTokensMainnet;\n', '');
content = content.replace('export const mockArchivedTokens = isTestnet ? mockArchivedTokensTestnet : mockArchivedTokensMainnet;\n', '');
content = content.replace('export const mockHistoryTokens = isTestnet ? mockHistoryTokensTestnet : mockHistoryTokensMainnet;\n', '');

// add them to the end of the file
content += '\nexport const mockTokens = isTestnet ? mockTokensTestnet : mockTokensMainnet;\n';
content += 'export const mockArchivedTokens = isTestnet ? mockArchivedTokensTestnet : mockArchivedTokensMainnet;\n';
content += 'export const mockHistoryTokens = isTestnet ? mockHistoryTokensTestnet : mockHistoryTokensMainnet;\n';

fs.writeFileSync('src/data.ts', content);
