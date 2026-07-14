const fs = require('fs');
let code = fs.readFileSync('src/pages/TokenDetailPage.tsx', 'utf-8');

// Update imports
code = code.replace(
  /import \{ ArrowLeft, Share2, Copy, Check, Globe, Github, Send, ExternalLink, BookOpen, Search, ArrowUpRight \} from 'lucide-react';/,
  "import { ArrowLeft, Share2, Copy, Check, Globe, Github, Send, ExternalLink, BookOpen, Search, ArrowUpRight, ZoomIn, ZoomOut } from 'lucide-react';"
);

// Add activeTimeframe state to the component
code = code.replace(
  /const \[isTradeOpen, setIsTradeOpen\] = useState\(false\);/,
  "const [isTradeOpen, setIsTradeOpen] = useState(false);\n  const [activeTimeframe, setActiveTimeframe] = useState('1H');"
);

// Update Price Chart Card Container Header
const newChartHeader = `          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{token.pair}</div>
              <div className="text-3xl sm:text-4xl font-bold font-sans text-zinc-900 dark:text-white tracking-tight">\${token.price}</div>
              <div className={cn("text-sm font-semibold mt-1 flex items-center gap-1", isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                {isPositive ? '▲' : '▼'} {Math.abs(token.priceChange)}%
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto shrink-0">
              <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1 shrink-0">
                {['1H', '4H', '1D', '1W'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={cn(
                      "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                      activeTimeframe === tf 
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 ml-auto sm:ml-2 shrink-0">
                <button className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>`;

code = code.replace(
  /<div className="flex items-start justify-between mb-6">[\s\S]*?<\/div>\s*<\/div>/,
  newChartHeader
);

fs.writeFileSync('src/pages/TokenDetailPage.tsx', code);
