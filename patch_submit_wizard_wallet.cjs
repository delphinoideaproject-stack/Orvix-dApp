const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

const oldDeposit = `      if (!walletProvider) throw new Error("No wallet connected");
      const provider = new ethers.BrowserProvider(walletProvider as any);`;

const newDeposit = `      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("No wallet connected");
      const provider = new ethers.BrowserProvider(ethereum);`;

content = content.replace(oldDeposit, newDeposit);

fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
