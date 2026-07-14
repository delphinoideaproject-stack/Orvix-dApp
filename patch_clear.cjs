const fs = require('fs');
let content = fs.readFileSync('src/components/TokenModal.tsx', 'utf8');

content = content.replace("  const handleClearSearch = () => {\n    setSearchQuery('');\n    searchInputRef.current?.focus();\n  };", "  const handleClearSearch = () => {\n    setSearchQuery('');\n    setDebouncedQuery('');\n    searchInputRef.current?.focus();\n  };");

fs.writeFileSync('src/components/TokenModal.tsx', content);
