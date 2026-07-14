const fs = require('fs');
let content = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

// add useRef
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");

// add searchInputRef
content = content.replace("  const { provider } = useWeb3();", "  const { provider } = useWeb3();\n  const searchInputRef = useRef<HTMLInputElement>(null);");

// reset query on isOpen
content = content.replace(/  useEffect\(\(\) => \{\n    if \(isOpen\) \{\n      setLoading\(true\);/g, "  useEffect(() => {\n    if (isOpen) {\n      setSearchQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n      setLoading(true);");

content = content.replace(/      loadList\(\);\n    \}\n  \}, \[isOpen, provider\]\);/g, "      loadList();\n    } else {\n      setSearchQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n    }\n  }, [isOpen, provider]);");

// add handleClearSearch
content = content.replace("  if (!isOpen) return null;", "  const handleClearSearch = () => {\n    setSearchQuery('');\n    searchInputRef.current?.focus();\n  };\n\n  if (!isOpen) return null;");

// add X button to input
content = content.replace(/          <input \n            type="text" \n            placeholder="Search name, symbol, or paste contract address\.\.\."\n            value=\{searchQuery\}\n            onChange=\{e => setSearchQuery\(e\.target\.value\)\}\n            className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-\[#1a1f2a\] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"\n          \/>/g, `          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search name, symbol, or paste contract address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 dark:bg-[#1a1f2a] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}`);

fs.writeFileSync('src/components/TokenModal.tsx', content);
