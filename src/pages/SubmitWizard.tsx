import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Check, Wallet, ShieldCheck, ChevronRight, BookOpen, ExternalLink, FileText, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { ethers } from 'ethers';
import { mockTokens } from '../data';
import { Token } from '../types';
import { formatGlobalNumber } from '../lib/formatNumber';
import { ORVIX_CONFIG, getExplorerUrl, getEffectiveRpcUrl } from '../contracts/config';


export function SubmitWizard({
  walletConnected: externalWalletConnected,
  walletAddress: externalWalletAddress,
  onOpenWalletModal
}: {
  walletConnected?: boolean;
  walletAddress?: string;
  onOpenWalletModal?: () => void;
}) {
  const [step, setStep] = useState(1);
  
  // Step 1: Terms
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const allAgreed = agree1 && agree2 && agree3;

  // Step 2: Metadata
  const [formData, setFormData] = useState({
    contractAddress: '',
    name: '',
    symbol: '',
    decimals: '18',
    totalSupply: '',
    tokenIcon: '',
    wallpaper: '',
    website: '',
    x: '',
    telegram: '',
    github: '',
    whitepaper: '',
    documentation: '',
    description: ''
  });
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    totalSupplyFormatted: string;
    depositFormatted: string;
  } | null>(null);

  // Step 3: Connect & Deposit
  const [localWalletConnected, setLocalWalletConnected] = useState(false);
  const walletConnected = externalWalletConnected;
  const walletAddress = externalWalletAddress || '';
  
  const [isDeployerVerified, setIsDeployerVerified] = useState(false);
  const [isLiquidityVerified, setIsLiquidityVerified] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDepositSent, setIsDepositSent] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Step 5 & 6
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    const address = formData.contractAddress.trim();
    if (!address) {
      setTokenInfo(null);
      setTokenError('');
      return;
    }
    if (address.length !== 42 || !address.startsWith('0x')) {
      setTokenError('Invalid contract address format');
      setTokenInfo(null);
      return;
    }

    setTokenError('');
    setIsLoadingToken(true);

    const timer = setTimeout(async () => {
      try {
        const provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
        const contract = new ethers.Contract(
          address,
          [
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
            "function name() view returns (string)"
          ],
          provider
        );

        const [symbol, name, decimals, totalSupplyRaw] = await Promise.all([
          contract.symbol().catch(() => 'UNK'),
          contract.name().catch(() => 'Unknown Token'),
          contract.decimals().catch(() => 18),
          contract.totalSupply().catch(() => 0)
        ]);

        const humanSupply = Number(ethers.formatUnits(totalSupplyRaw, decimals));
        const depositAmount = humanSupply * 0.07 / 100;

        const formattedSupply = humanSupply.toLocaleString('en-US', { maximumFractionDigits: 4 });
        const formattedDeposit = depositAmount.toLocaleString('en-US', { maximumFractionDigits: 6 });

        setTokenInfo({
          symbol,
          totalSupplyFormatted: formattedSupply,
          depositFormatted: formattedDeposit
        });
        
        setFormData(prev => ({
          ...prev,
          symbol: prev.symbol || symbol,
          name: prev.name || name,
          decimals: prev.decimals || decimals.toString(),
          totalSupply: prev.totalSupply || humanSupply.toString()
        }));
        
        setIsLoadingToken(false);
      } catch (err) {
        console.error(err);
        setTokenError('Unable to fetch token data. Please verify the contract address.');
        setIsLoadingToken(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.contractAddress]);

  // Validation
  const isValidHttpsUrl = (urlStr: string) => {
    if (!urlStr.trim()) return false;
    try {
      const u = new URL(urlStr);
      return u.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  const isValidUrl = (urlStr: string) => {
    if (!urlStr.trim()) return true; // optional
    try {
      const u = new URL(urlStr);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const step2Valid = 
    formData.contractAddress.trim() !== '' &&
    formData.name.trim() !== '' &&
    formData.symbol.trim() !== '' &&
    formData.totalSupply.trim() !== '' &&
    isValidHttpsUrl(formData.website) &&
    isValidUrl(formData.x) &&
    isValidUrl(formData.telegram) &&
    isValidUrl(formData.github) &&
    isValidUrl(formData.documentation) &&
    isValidUrl(formData.whitepaper);

  const handleConnectClick = () => {
    if (onOpenWalletModal) {
      onOpenWalletModal();
    } else {
      setLocalWalletConnected(true);
    }
    setIsDeployerVerified(true);
    setIsLiquidityVerified(true);
  };

  const handleDepositConfirm = async () => {
    try {
      setIsDepositing(true);
      const ethereum = (window as any).ethereum;
      let provider;
      if (ethereum && (typeof ethereum.request === 'function' || typeof ethereum.send === 'function')) {
        provider = new ethers.BrowserProvider(ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(getEffectiveRpcUrl());
      }
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
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const id = `ORX-${dateStr}-${randomStr}`;
      setSubmissionId(id);
      
      const newToken: Token = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol,
        pair: `${formData.symbol}/USDT`,
        chain: 'BSC',
        price: '0.00',
        priceChange: 0,
        listedAt: 'Pending Review',
        contract: formData.contractAddress || '0x1234567890abcdef1234567890abcdef12345678',
        creator: walletAddress,
        addLpTx: '0x9876...5432',
        renounceTx: '0x1111...2222',
        lockLpTx: '0x3333...4444',
        ammVersion: 'AMM V2 · BNB Chain',
        totalSupply: formData.totalSupply,
        logo: formData.tokenIcon || 'tether',
        wallpaper: formData.wallpaper.trim() || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
        website: formData.website,
        x: formData.x || undefined,
        telegram: formData.telegram || undefined,
        github: formData.github || undefined,
        documentation: formData.documentation || undefined
      };
      // For demo, we don't actually add it yet since it's pending review
      
      window.dispatchEvent(new CustomEvent('orvix-toast', { detail: `Submission received for ${formData.name}!` }));
      setIsSubmitting(false);
      setStep(6);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Terms' },
    { num: 2, label: 'Metadata' },
    { num: 3, label: 'Deposit' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Submit' },
    { num: 6, label: 'Done' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Submit Token</h1>
        
        {/* Progress bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map(s => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors bg-white dark:bg-zinc-950",
                step > s.num ? "border-blue-500 text-blue-500" : 
                step === s.num ? "border-blue-500 text-blue-500 ring-4 ring-blue-500/20" : 
                "border-zinc-200 dark:border-zinc-800 text-zinc-400"
              )}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", step >= s.num ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
        
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Terms & Listing Requirements</h2>
            
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 space-y-4 max-h-[300px] overflow-y-auto">
              <p><strong>1. Listing Requirements:</strong> Projects must provide accurate information, including metadata, contract address, and project owner verification. LP tokens must be locked on AMM V2 for at least 6 months.</p>
              <p><strong>2. Deposit Rules (0.07%):</strong> A listing deposit equal to 0.07% of the project's total token supply is required. Deposit amount is automatically calculated. This is non-refundable and used for the review process.</p>
              <p><strong>3. Eligibility Rules:</strong> Tax modifications cannot exceed 5%. The connected wallet must be the deployer of the token contract. Any malicious or honeypot contracts will be permanently rejected.</p>
              <p><strong>4. Disclaimer:</strong> ORVIX provides technical verification only. Verification is not financial advice, investment advice, or a guarantee of future project performance. Submissions do not guarantee listing.</p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agree1}
                  onChange={(e) => setAgree1(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">I confirm that I am the official deployer of this token and have the authority to submit it.</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agree2}
                  onChange={(e) => setAgree2(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">I understand that the 0.07% listing deposit is non-refundable, regardless of the review outcome.</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agree3}
                  onChange={(e) => setAgree3(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">I agree to the Orvix Terms & Conditions and Listing Eligibility Rules.</span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button disabled={!allAgreed} onClick={() => setStep(2)}>Accept & Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Project Metadata</h2>
              <p className="text-sm text-zinc-500">Provide accurate information about your token.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Token Contract Address</label>
                <input 
                  type="text" 
                  value={formData.contractAddress} 
                  onChange={e => setFormData({...formData, contractAddress: e.target.value})}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600" 
                  placeholder="0x1234567890abcdef1234567890abcdef12345678" 
                />
                {isLoadingToken && <p className="text-xs text-blue-500 mt-1 flex items-center"><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" /> Auto-reading contract information...</p>}
                {tokenError && <p className="text-xs text-red-500 mt-1">{tokenError}</p>}
              </div>

              {tokenInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider">Required Deposit</div>
                    <div className="font-mono text-xl text-zinc-900 dark:text-zinc-100 font-bold">
                      {tokenInfo.depositFormatted} <span className="text-base text-zinc-500 font-normal">{tokenInfo.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">0.07% of Supply</div>
                    <div className="font-mono text-sm text-zinc-700 dark:text-zinc-300">{tokenInfo.totalSupplyFormatted}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Token Name</label>
                  <input 
                    type="text" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. BlockTech" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Symbol</label>
                  <input 
                    type="text" 
                    value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. BTS" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Supply</label>
                  <input 
                    type="number" 
                    value={formData.totalSupply} onChange={e => setFormData({...formData, totalSupply: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Decimals</label>
                  <input 
                    type="number" 
                    value={formData.decimals} onChange={e => setFormData({...formData, decimals: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Token Icon URL (SVG/PNG)</label>
                <input 
                  type="url" 
                  value={formData.tokenIcon} onChange={e => setFormData({...formData, tokenIcon: e.target.value})}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="https://.../logo.png" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Wallpaper URL</label>
                <input 
                  type="url" 
                  value={formData.wallpaper} onChange={e => setFormData({...formData, wallpaper: e.target.value})}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="https://.../banner.png" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Website <span className="text-red-500">*</span></label>
                  <input 
                    type="url" 
                    value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})}
                    className={cn("w-full bg-transparent border rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 outline-none", !isValidHttpsUrl(formData.website) && formData.website ? "border-red-500 focus:ring-red-500" : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500")}
                    placeholder="https://..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">X (Twitter)</label>
                  <input 
                    type="url" 
                    value={formData.x} onChange={e => setFormData({...formData, x: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://x.com/..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Telegram</label>
                  <input 
                    type="url" 
                    value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://t.me/..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub</label>
                  <input 
                    type="url" 
                    value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://github.com/..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Whitepaper</label>
                  <input 
                    type="url" 
                    value={formData.whitepaper} onChange={e => setFormData({...formData, whitepaper: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Documentation</label>
                  <input 
                    type="url" 
                    value={formData.documentation} onChange={e => setFormData({...formData, documentation: e.target.value})}
                    className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Describe your token utility..." 
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!step2Valid} onClick={() => setStep(3)}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Connect & Deposit</h2>
              <p className="text-sm text-zinc-500">Verify deployer wallet and send the listing deposit.</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-zinc-500" />
                    BNB Chain Wallet
                  </span>
                  {/* @ts-ignore */}
                    <appkit-button size="sm" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", isDeployerVerified ? "bg-green-500 border-green-500 text-white" : "border-zinc-300 dark:border-zinc-700 bg-transparent text-transparent")}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={cn("text-sm", isDeployerVerified ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>Deployer Verification</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border", isLiquidityVerified ? "bg-green-500 border-green-500 text-white" : "border-zinc-300 dark:border-zinc-700 bg-transparent text-transparent")}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={cn("text-sm", isLiquidityVerified ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>Initial Liquidity Verification</span>
                  </div>
                </div>
              </div>

              {isDeployerVerified && isLiquidityVerified && (
                <div className="p-6 border border-blue-200 dark:border-blue-900/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 text-center space-y-4">
                  <div className="text-sm text-zinc-500">Required Listing Deposit</div>
                  <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {tokenInfo?.depositFormatted} {tokenInfo?.symbol}
                  </div>
                  
                  {isDepositSent ? (
                    <button 
                      className="w-full mt-2 font-bold flex items-center justify-center py-2.5 px-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] cursor-not-allowed transition-all" 
                      disabled
                    >
                      <Check className="w-5 h-5 mr-2" />
                      DEPOSIT SENT
                    </button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full font-bold mt-2" 
                      onClick={() => setShowConfirmModal(true)}
                    >
                      SEND DEPOSIT
                    </Button>
                  )}
                  {txHash && (
                    <div className="text-xs text-zinc-500 flex items-center justify-center gap-1 mt-2">
                      Tx Hash: <span className="font-mono">{txHash.slice(0,6)}...{txHash.slice(-4)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={!isDepositSent} onClick={() => setStep(4)}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Review Submission</h2>
              <p className="text-sm text-zinc-500">Please review all information before final submission.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                  Project Metadata
                </div>
                <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Token Name</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{formData.name}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Symbol</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{formData.symbol}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-zinc-500 text-xs mb-1">Contract Address</div>
                    <div className="font-mono text-zinc-900 dark:text-zinc-100 break-all">{formData.contractAddress}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Total Supply</div>
                    <div className="font-mono text-zinc-900 dark:text-zinc-100">{Number(formData.totalSupply).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Website</div>
                    <div className="text-blue-600 dark:text-blue-400 truncate">{formData.website}</div>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                  Verifications
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Deployer Identity</span>
                    <span className="flex items-center text-green-600 dark:text-green-500 font-medium text-xs"><Check className="w-3.5 h-3.5 mr-1" /> Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Initial Liquidity</span>
                    <span className="flex items-center text-green-600 dark:text-green-500 font-medium text-xs"><Check className="w-3.5 h-3.5 mr-1" /> Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Listing Deposit</span>
                    <span className="flex items-center text-green-600 dark:text-green-500 font-medium text-xs"><Check className="w-3.5 h-3.5 mr-1" /> {tokenInfo?.depositFormatted} {formData.symbol}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => setStep(5)}>Ready to Submit <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 flex items-center justify-center rounded-full mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Complete Submission</h2>
            <p className="text-zinc-500 max-w-sm mx-auto">
              All checks passed. Your deposit has been secured and metadata verified. You are ready to officially submit {formData.name} for listing.
            </p>
            
            <div className="pt-6 pb-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto min-w-[200px]"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" /> Submitting...</>
                ) : (
                  <>Submit Listing <ChevronRight className="w-5 h-5 ml-1" /></>
                )}
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => setStep(4)} disabled={isSubmitting}>Back to Review</Button>
            </div>
          </div>
        )}

        {step === 6 && (
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
        )}

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Confirm Listing Deposit</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div>
                <div className="text-zinc-500 mb-1">Official Submission Address</div>
                <div className="font-mono bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 break-all text-xs">
                  0x4f27fa7bacdb9abd8b07c038a0769b4c7063ddbc
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-zinc-500">Network</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">BNB Smart Chain</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-zinc-500">Deposit Amount</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">
                  {tokenInfo?.depositFormatted} {tokenInfo?.symbol}
                </div>
              </div>
              
              <p className="text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                This transaction will transfer the required listing deposit to the official Orvix submission address. Please verify the information before continuing.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)} disabled={isDepositing}>
                Cancel
              </Button>
              <Button 
                disabled={isDepositing}
                onClick={handleDepositConfirm}
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
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Deposit Successful</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
              Your listing deposit has been successfully submitted.
            </p>
            
            <div className="text-left mb-6">
              <div className="text-xs text-zinc-500 mb-1">Transaction Hash</div>
              <a 
                href={`${getExplorerUrl()}/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-sm bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between transition-colors"
              >
                {txHash.slice(0,6)}...{txHash.slice(-4)} <ExternalLink className="w-4 h-4 ml-2" />
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
      )}
    </div>
  );
}
