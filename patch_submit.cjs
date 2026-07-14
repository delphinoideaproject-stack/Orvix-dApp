const fs = require('fs');
let code = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

code = code.replace(
  "const walletConnected = externalWalletConnected || localWalletConnected;",
  "const walletConnected = externalWalletConnected;"
);

code = code.replace(
  "const walletAddress = externalWalletAddress || '0xDeployer...1234';",
  "const walletAddress = externalWalletAddress || '';"
);

// We should replace the custom connect button in SubmitWizard with appkit-button too, or just let it call onOpenWalletModal (which calls open() from useAppKit()).
const oldButton = `{walletConnected ? (
                    <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                    </span>
                  ) : (
                    <Button size="sm" onClick={handleConnectClick}>Connect Wallet</Button>
                  )}`;

const newButton = `<appkit-button size="sm" />`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/pages/SubmitWizard.tsx', code);
