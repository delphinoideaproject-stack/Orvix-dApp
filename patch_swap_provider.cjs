const fs = require('fs');
let code = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

const importToAdd = `import { useAppKitProvider } from '@reown/appkit/react';`;
code = code.replace("import { ethers } from 'ethers';", importToAdd + "\nimport { ethers } from 'ethers';");

const oldProvider = `if (!(window as any).ethereum) throw new Error("No crypto wallet found");
      
      const provider = new ethers.BrowserProvider((window as any).ethereum);`;

const newProvider = `if (!walletProvider) throw new Error("No crypto wallet found");
      
      const provider = new ethers.BrowserProvider(walletProvider as any);`;

code = code.replace(oldProvider, newProvider);

// We need to add `const { walletProvider } = useAppKitProvider('eip155');` inside the SwapPage component.
const findState = `  const [poolFlowStep, setPoolFlowStep] = useState<'loading' | 'list' | 'review' | 'wallet' | 'success'>('loading');`;
const addHook = `  const { walletProvider } = useAppKitProvider('eip155');\n` + findState;

code = code.replace(findState, addHook);

fs.writeFileSync('src/pages/SwapPage.tsx', code);
