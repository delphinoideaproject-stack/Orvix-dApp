const fs = require('fs');
let content = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

// add debouncedQuery state
content = content.replace("  const [searchQuery, setSearchQuery] = useState('');", "  const [searchQuery, setSearchQuery] = useState('');\n  const [debouncedQuery, setDebouncedQuery] = useState('');");

// add debounce effect
const debounceEffect = `  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);`;

content = content.replace("  useEffect(() => {\n    if (isOpen) {", debounceEffect + "\n\n  useEffect(() => {\n    if (isOpen) {");

// when isOpen changes to false, also clear debouncedQuery
content = content.replace("      setSearchQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n      setLoading(true);", "      setSearchQuery('');\n      setDebouncedQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n      setLoading(true);");

content = content.replace("      setSearchQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n    }\n  }, [isOpen, provider]);", "      setSearchQuery('');\n      setDebouncedQuery('');\n      setDynamicToken(null);\n      setLoadingDynamic(false);\n    }\n  }, [isOpen, provider]);");

// use debouncedQuery for dynamic token fetch
content = content.replace("  useEffect(() => {\n    const address = searchQuery.trim();", "  useEffect(() => {\n    const address = debouncedQuery.trim();");
content = content.replace("  }, [searchQuery, tokens]);", "  }, [debouncedQuery, tokens]);");

// use debouncedQuery for filtering
content = content.replace("  let filteredTokens = tokens.filter(t => \n    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || \n    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||\n    t.contract.toLowerCase().includes(searchQuery.toLowerCase())\n  );", "  let filteredTokens = tokens.filter(t => \n    t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || \n    t.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||\n    t.contract.toLowerCase().includes(debouncedQuery.toLowerCase())\n  );");

fs.writeFileSync('src/components/TokenModal.tsx', content);
