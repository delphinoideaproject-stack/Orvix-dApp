const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

// add swapError state
content = content.replace("  const [quoteLoading, setQuoteLoading] = useState(false);", "  const [quoteLoading, setQuoteLoading] = useState(false);\n  const [swapError, setSwapError] = useState<string | null>(null);");

// reset swapError when opening pool modal
content = content.replace("    setIsPoolModalOpen(true);\n    setPoolFlowStep('loading');", "    setIsPoolModalOpen(true);\n    setSwapError(null);\n    setPoolFlowStep('loading');");
content = content.replace("                setIsPoolModalOpen(true);\n                setPoolFlowStep('wallet');", "                setIsPoolModalOpen(true);\n                setSwapError(null);\n                setPoolFlowStep('wallet');");

// in try catch of handleSwapExecute
content = content.replace(`      alert("Swap failed: " + (err.message || "Unknown error"));\n      setPoolFlowStep('wallet');`, `      setSwapError(err.message || "Unknown error");\n      setPoolFlowStep('wallet');`);

// in wallet step view
content = content.replace(`                   {!quoteLoading ? (\n                     <>\n                       <div className="text-center text-[14px] text-zinc-500 mb-4">Waiting for confirmation...</div>`, `                   {!quoteLoading ? (\n                     <>\n                       {swapError ? (\n                         <div className="text-center text-[14px] text-red-500 mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-200 dark:border-red-500/20">{swapError}</div>\n                       ) : (\n                         <div className="text-center text-[14px] text-zinc-500 mb-4">Waiting for confirmation...</div>\n                       )}`);

fs.writeFileSync('src/pages/SwapPage.tsx', content);
