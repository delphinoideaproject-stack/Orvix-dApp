const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

const oldIdGen = `      const id = 'SUB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setSubmissionId(id);`;

const newIdGen = `      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const id = \`ORX-\${dateStr}-\${randomStr}\`;
      setSubmissionId(id);`;

content = content.replace(oldIdGen, newIdGen);

const oldStep6 = `        {step === 6 && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 flex items-center justify-center rounded-full mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Submission Successful</h2>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium mb-6 border border-amber-200/50 dark:border-amber-900/50">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" /> Review Status: Pending
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 max-w-sm mx-auto text-left space-y-3 mb-6">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Submission ID</div>
                <div className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">{submissionId}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Transaction Hash</div>
                <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">{txHash}</div>
              </div>
              <a 
                href={\`https://bscscan.com/tx/\${txHash}\`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full mt-2 flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium py-2 rounded-lg transition-colors text-sm"
              >
                View on BscScan <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
              Your submission has been received successfully. If your project satisfies all Orvix Listing Requirements and Terms & Conditions, it will proceed through the Orvix review process. Once approved, your token will be published on the New Alpha page and become discoverable by the community.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="outline" onClick={() => window.location.reload()}>&larr; Home</Button>
              <Button variant="ghost">Contact Us</Button>
            </div>
          </div>
        )}`;

const newStep6 = `        {step === 6 && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 flex items-center justify-center rounded-full mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Submission Successful</h2>
            
            <p className="text-zinc-900 dark:text-zinc-100 font-medium mb-8">
              Your submission has been received successfully.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-sm mx-auto text-left space-y-5 mb-8">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Review Status</div>
                <div className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-sm font-medium border border-amber-200/50 dark:border-amber-900/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" /> Pending
                </div>
              </div>
              
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Submission ID</div>
                <div className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{submissionId}</div>
              </div>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
              If your project satisfies all Orvix Listing Requirements and Terms & Conditions, it will proceed through the Orvix review process. Once approved, your token will be published on the New Alpha page and become discoverable by the community.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="outline" onClick={() => window.location.reload()}>&larr; Home</Button>
              <Button variant="ghost">Contact Us</Button>
            </div>
          </div>
        )}`;

content = content.replace(oldStep6, newStep6);
fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
