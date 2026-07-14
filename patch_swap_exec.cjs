const fs = require('fs');
let content = fs.readFileSync('src/pages/SwapPage.tsx', 'utf8');

const newTryBlock = `    try {
      if (!walletProvider) throw new Error("No crypto wallet found");
      
      const provider = new ethers.BrowserProvider(walletProvider as any);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(ORVIX_CONFIG.aggregator, OrvixAggregatorABI, signer);
      
      let wrappedNative;
      try {
        wrappedNative = await contract.WRAPPED_NATIVE();
      } catch (e) {
        wrappedNative = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
      }
      const tokenInAddr = fromToken.symbol === 'BNB' ? wrappedNative : (fromToken.contract || wrappedNative);
      const tokenOutAddr = toToken.symbol === 'BNB' ? wrappedNative : (toToken.contract || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd');
      
      const amountInWei = ethers.parseUnits(fromAmount || '0', 18);
      
      let slippageNum = parseFloat(slippage) || 0.5;
      const minOutStr = (parseFloat(selectedPool.output) * (1 - slippageNum/100)).toFixed(18);
      const minOutWei = ethers.parseUnits(minOutStr, 18);
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const path = "0x";
      
      const tx = await contract.swapExactInput(
        tokenInAddr,
        tokenOutAddr,
        amountInWei,
        minOutWei,
        await signer.getAddress(),
        deadline,
        path,
        ORVIX_CONFIG.treasury,
        await signer.getAddress(),
        {
          value: fromToken.symbol === 'BNB' ? amountInWei : 0n
        }
      );
      
      const receipt = await tx.wait();
      
      setQuoteLoading(false);
      setPoolFlowStep('success');
      
      const newTx: SwapTx = {
        id: tx.hash.substring(2, 11).toUpperCase(),
        timestamp: new Date().toISOString(),
        fromAmount: fromAmount,
        fromSymbol: fromToken.symbol || '',
        toAmount: selectedPool.output,
        toSymbol: toToken.symbol || '',
        rate: formatGlobalNumber((parseFloat(selectedPool.output) / parseFloat(fromAmount)), { minimumFractionDigits: 6, maximumFractionDigits: 6 }),
        pool: selectedPool.pool,
        fee: selectedPool.fee,
        gasUsed: receipt.gasUsed.toString(),
        txHash: receipt.hash
      };
      setSwaps(prev => [newTx, ...prev]);

    } catch (err: any) {
      console.error("Swap execution failed:", err);
      setQuoteLoading(false);
      // fallback to wallet state, maybe show alert
      alert("Swap failed: " + (err.message || "Unknown error"));
      setPoolFlowStep('wallet');
    }`;

// let's replace the whole try catch
const startIdx = content.indexOf('try {');
const funcDef = content.indexOf('const handleSwapExecute = async () => {');
if (funcDef > -1) {
  const tryStart = content.indexOf('try {', funcDef);
  const catchEndStr = '      }, 1500);\n    }';
  const catchEnd = content.indexOf(catchEndStr, tryStart) + catchEndStr.length;
  
  if (tryStart > -1 && catchEnd > tryStart) {
    const newContent = content.substring(0, tryStart) + newTryBlock + content.substring(catchEnd);
    fs.writeFileSync('src/pages/SwapPage.tsx', newContent);
    console.log("Replaced successfully!");
  } else {
    console.error("Could not find bounds", tryStart, catchEnd);
  }
}

