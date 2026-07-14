const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const settingsBtnMatch = code.match(/          \{\/\* Settings Button \*\/\}\n          <button\n            onClick=\{\(\) => setSettingsOpen\(true\)\}\n            className="w-full flex items-center gap-3 px-3\.5 py-2\.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer border border-blue-500\/30 bg-blue-600\/10 text-\[var\(--text\)\] hover:bg-blue-600\/20"\n          >\n            <Settings className="w-4 h-4 text-blue-500" \/>\n            Settings \(\{theme\}, \{language\}\)\n          <\/button>\n\n/);

if (settingsBtnMatch) {
  code = code.replace(settingsBtnMatch[0], '');
  
  code = code.replace(
    /          <\/nav>\n        <\/div>/,
    `          </nav>\n\n          {/* Settings Button */}\n          <button\n            onClick={() => setSettingsOpen(true)}\n            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer border border-[var(--border)] bg-[var(--card)] text-zinc-400 hover:text-[var(--text)] hover:bg-zinc-800/50 mt-4"\n          >\n            <Settings className="w-4 h-4" />\n            Settings ({theme}, {language})\n          </button>\n        </div>`
  );
}

fs.writeFileSync('src/App.tsx', code);
