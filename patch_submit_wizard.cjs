const fs = require('fs');
let content = fs.readFileSync('src/pages/SubmitWizard.tsx', 'utf8');

// replace handleDepositConfirm
const oldDeposit = `  const handleDepositConfirm = () => {
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setShowConfirmModal(false);
      setTxHash('0x' + Math.random().toString(16).slice(2, 42));
      setShowSuccessModal(true);
    }, 1500);
  };`;

const newDeposit = `  const handleDepositConfirm = async () => {
    try {
      setIsDepositing(true);
      if (!walletProvider) throw new Error("No wallet connected");
      const provider = new ethers.BrowserProvider(walletProvider as any);
      const signer = await provider.getSigner();
      
      const erc20 = new ethers.Contract(
        formData.contractAddress,
        ["function transfer(address to, uint256 amount) returns (bool)", "function decimals() view returns (uint8)"],
        signer
      );
      
      const decimals = await erc20.decimals();
      const amount = ethers.parseUnits(tokenInfo?.depositFormatted || '0', decimals);
      
      const tx = await erc20.transfer(ORVIX_CONFIG.treasury, amount);
      const receipt = await tx.wait();
      
      setTxHash(receipt.hash);
      setIsDepositing(false);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setIsDepositing(false);
      alert("Deposit failed: " + (err.message || "Unknown error"));
    }
  };`;

content = content.replace(oldDeposit, newDeposit);

// replace final submit fake delay
const oldSubmit = `  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const id = \`ORX-\${dateStr}-\${randomStr}\`;
      setSubmissionId(id);
      
      const newToken: Token = {`;

const newSubmit = `  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const id = \`ORX-\${dateStr}-\${randomStr}\`;
      setSubmissionId(id);
      
      const newToken: Token = {`;

content = content.replace(oldSubmit, newSubmit);

const oldSubmitEnd = `      setStep(6);
    }, 2000);
  };`;

const newSubmitEnd = `      setStep(6);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };`;

content = content.replace(oldSubmitEnd, newSubmitEnd);

// verify wallet fake delay
const oldVerify = `    // Simulate verifications after connect
    setTimeout(() => {
      setIsDeployerVerified(true);
      setTimeout(() => {
        setIsLiquidityVerified(true);
      }, 500);
    }, 500);`;

const newVerify = `    setIsDeployerVerified(true);
    setIsLiquidityVerified(true);`;

content = content.replace(oldVerify, newVerify);

fs.writeFileSync('src/pages/SubmitWizard.tsx', content);
