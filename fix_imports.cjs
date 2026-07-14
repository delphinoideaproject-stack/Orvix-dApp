const fs = require('fs');

function addImport(file, importStr) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(importStr)) {
    // Find the last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLastImport + 1) + importStr + '\n' + content.slice(endOfLastImport + 1);
    } else {
      content = importStr + '\n' + content;
    }
    fs.writeFileSync(file, content);
  }
}

addImport('src/App.tsx', "import { formatGlobalNumber } from './lib/formatNumber';");
addImport('src/components/TokenPosterCard.tsx', "import { formatGlobalNumber } from '../lib/formatNumber';");
addImport('src/pages/ArchivePage.tsx', "import { formatGlobalNumber } from '../lib/formatNumber';");
addImport('src/pages/HomePage.tsx', "import { formatGlobalNumber } from '../lib/formatNumber';");
addImport('src/pages/SubmitWizard.tsx', "import { formatGlobalNumber } from '../lib/formatNumber';");

