const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove SearchModal import
code = code.replace(/import \{ SearchModal \} from '\.\/components\/SearchModal';\n/, '');

// Remove isSearchModalOpen state
code = code.replace(/  const \[isSearchModalOpen, setIsSearchModalOpen\] = useState\(false\);\n/, '');

// Remove SearchModal component
code = code.replace(/      <SearchModal isOpen=\{isSearchModalOpen\} onClose=\{\(\) => setIsSearchModalOpen\(false\)\} searchQuery=\{searchQuery\} setSearchQuery=\{setSearchQuery\} \/>\n/, '');

// Remove mobile search button
const mobileSearchBtn = `          <button \n            onClick={() => setIsSearchModalOpen(true)}\n            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)]"\n            aria-label="Search"\n          >\n            <Search className="w-4 h-4 text-zinc-400" />\n          </button>\n`;
code = code.replace(mobileSearchBtn, '');

// Remove desktop search button
const desktopSearchBtn = `            <button \n              onClick={() => setIsSearchModalOpen(true)}\n              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-zinc-800 transition-all text-zinc-300 flex items-center justify-center cursor-pointer"\n              title="Search"\n            >\n              <Search className="w-4 h-4 text-zinc-400" />\n            </button>\n`;
code = code.replace(desktopSearchBtn, '');

fs.writeFileSync('src/App.tsx', code);
