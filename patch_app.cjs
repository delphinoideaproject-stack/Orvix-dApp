const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `import { useAppKitAccount, useAppKit } from '@reown/appkit/react';\n`;
code = code.replace("import { formatGlobalNumber } from './lib/formatNumber';", "import { formatGlobalNumber } from './lib/formatNumber';\n" + imports);

// Remove wallet states
code = code.replace("  const [walletConnected, setWalletConnected] = useState(false);", "");
code = code.replace("  const [walletAddress, setWalletAddress] = useState('0x1234...5678');", "");
code = code.replace("  const [walletBalance, setWalletBalance] = useState('2.45 BNB');", "");

// Replace usage of states with useAppKitAccount
code = code.replace("const [walletModalOpen, setWalletModalOpen] = useState(false);", 
                    "const [walletModalOpen, setWalletModalOpen] = useState(false);\n  const { address, isConnected } = useAppKitAccount();\n  const { open } = useAppKit();");

// Submit wizard props
code = code.replace("walletConnected={walletConnected}", "walletConnected={isConnected}");
code = code.replace("walletAddress={walletAddress}", "walletAddress={address}");
code = code.replace("onOpenWalletModal={() => setWalletModalOpen(true)}", "onOpenWalletModal={() => open()}");

// Mobile connect button
const mobileButtonOld = `<button 
            onClick={() => {
              if (walletConnected) {
                setWalletConnected(false);
              } else {
                setWalletModalOpen(true);
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold flex items-center gap-1.5 font-mono"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {walletConnected ? \`\${walletAddress} (\${walletBalance})\` : 'Connect'}
          </button>`;

const mobileButtonNew = `<appkit-button size="sm" />`;
code = code.replace(mobileButtonOld, mobileButtonNew);

// Desktop connect button
const desktopButtonOld = `<button 
              onClick={() => {
                if (walletConnected) {
                  setWalletConnected(false);
                } else {
                  setWalletModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-zinc-800 transition-all text-xs font-mono font-medium text-[var(--text)] flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {walletConnected ? (
                <span className="flex items-center gap-1.5">
                  <span>{walletAddress}</span>
                  <span className="text-zinc-400 font-sans font-medium">({walletBalance})</span>
                </span>
              ) : 'Connect Wallet'}
            </button>`;

const desktopButtonNew = `<div className="flex items-center"><appkit-button /></div>`;
code = code.replace(desktopButtonOld, desktopButtonNew);

fs.writeFileSync('src/App.tsx', code);
