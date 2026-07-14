const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

content = content.replace("  const handleSwapExecute = async () => {\n    setQuoteLoading(true);", "  const handleSwapExecute = async () => {\n    setSwapError(null);\n    setQuoteLoading(true);");

fs.writeFileSync('src/pages/SwapPage.tsx', content);
