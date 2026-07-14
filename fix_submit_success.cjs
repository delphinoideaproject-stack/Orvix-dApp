const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

if (!content.includes('const [isDepositSent, setIsDepositSent]')) {
  content = content.replace(
    "const [isDepositing, setIsDepositing] = useState(false);",
    "const [isDepositing, setIsDepositing] = useState(false);\n  const [isDepositSent, setIsDepositSent] = useState(false);"
  );
}

const oldSendDeposit = `<div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    <Button 
                      className="w-full font-bold" 
                      onClick={() => setShowConfirmModal(true)}
                    >
                      SEND DEPOSIT
                    </Button>
                  </div>`;

const newSendDeposit = `<div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    {isDepositSent ? (
                      <button 
                        className="w-full font-bold flex items-center justify-center py-2 px-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-not-allowed transition-all" 
                        disabled
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        DEPOSIT SENT
                      </button>
                    ) : (
                      <Button 
                        className="w-full font-bold" 
                        onClick={() => setShowConfirmModal(true)}
                      >
                        SEND DEPOSIT
                      </Button>
                    )}
                  </div>`;

content = content.replace(oldSendDeposit, newSendDeposit);


const oldSuccessModal = `{showSuccessModal && (
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
      )}`;

const newSuccessModal = `{showSuccessModal && (
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
              <a 
                href="https://bscscan.com/tx/0x8d3d9b4c7063ddbc8d3d9b4c7063ddbc8d3d7f42" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between transition-colors"
              >
                0x8d3d...7f42 <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setIsDepositSent(true);
                }}
              >
                Close & Continue
              </Button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(oldSuccessModal, newSuccessModal);
fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
