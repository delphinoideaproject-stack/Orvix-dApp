const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

if (!content.includes('import { formatGlobalNumber }')) {
  content = content.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\nimport { formatGlobalNumber } from '../lib/formatNumber';");
}

content = content.replace(/\$\{t\.price\}/g, "${formatGlobalNumber(t.price)}");

fs.writeFileSync('src/pages/HomePage.tsx', content);
