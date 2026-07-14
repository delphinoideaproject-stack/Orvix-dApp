const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

const oldBtn = `              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setIsDepositSent(true);
                }}
              >
                Close & Continue
              </Button>`;

const newBtn = `              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setIsDepositSent(true);
                  if (step2Valid) {
                     setStep(3);
                  }
                }}
              >
                Continue
              </Button>`;

content = content.replace(oldBtn, newBtn);
fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
