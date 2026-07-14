const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

const oldSection = `<div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Send to</span>
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      <span className="break-all">0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc');
                          setCopiedTreasury(true);
                          setTimeout(() => setCopiedTreasury(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 ml-2"
                      >
                        {copiedTreasury ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 italic pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  Transfer this exact amount to the treasury address above, then paste the transaction hash in the next step.
                </div>`;

const newSection = `<div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    <Button 
                      className="w-full font-bold" 
                      onClick={() => setShowConfirmModal(true)}
                    >
                      SEND DEPOSIT
                    </Button>
                  </div>
                </div>`;

content = content.replace(oldSection, newSection);

// Add states
if (!content.includes('const [showConfirmModal, setShowConfirmModal]')) {
  content = content.replace(
    "const [copiedTreasury, setCopiedTreasury] = useState(false);",
    "const [showConfirmModal, setShowConfirmModal] = useState(false);\n  const [showSuccessModal, setShowSuccessModal] = useState(false);\n  const [isDepositing, setIsDepositing] = useState(false);"
  );
}

// Add ExternalLink import if missing
if (!content.includes('ExternalLink')) {
  content = content.replace("import { Check, ChevronRight", "import { Check, ChevronRight, ExternalLink");
}

// Append modals before the final closing div
const modals = `
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Confirm Listing Deposit</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div>
                <div className="text-zinc-500 mb-1">Official Submission Address</div>
                <div className="font-mono bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 break-all">
                  0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc
                </div>
              </div>
              
              <div>
                <div className="text-zinc-500 mb-1">Network</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">BNB Smart Chain</div>
              </div>
              
              <div>
                <div className="text-zinc-500 mb-1">Deposit Amount</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  {tokenInfo?.depositFormatted} {tokenInfo?.symbol}
                </div>
              </div>
              
              <p className="text-zinc-600 dark:text-zinc-400">
                This transaction will transfer the required listing deposit to the official Orvix submission address.<br/>Please verify the information before continuing.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)} disabled={isDepositing}>
                Cancel
              </Button>
              <Button 
                disabled={isDepositing}
                onClick={() => {
                  setIsDepositing(true);
                  setTimeout(() => {
                    setIsDepositing(false);
                    setShowConfirmModal(false);
                    setShowSuccessModal(true);
                  }, 1500);
                }}
              >
                {isDepositing ? 'Confirming...' : 'CONFIRM'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 flex items-center justify-center rounded-full mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Submission Successful</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
              Your listing deposit has been successfully submitted.
            </p>
            
            <div className="text-left mb-6">
              <div className="text-xs text-zinc-500 mb-1">Transaction Hash</div>
              <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                0x8d3d9b4c7063ddbc8d3d9b4c7063ddbc8d3d7f42
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href="https://bscscan.com/tx/0x8d3d9b4c7063ddbc8d3d9b4c7063ddbc8d3d7f42" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold py-2 rounded-lg transition-colors"
              >
                View on BscScan <ExternalLink className="w-4 h-4" />
              </a>
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  if (step2Valid) {
                     setStep(3);
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n}", modals + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
