import express from 'express';
import cors from 'cors';
import path from 'path';
import { ethers } from 'ethers';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DEFAULT_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const AGGREGATOR_ADDRESS = '0xA4Bf191D53B880cA49F1ceD0C0C840378bdDef42';
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const AGGREGATOR_ABI = [
  "function getAllWhitelistedFactories() view returns (address[])",
  "function assessPools(address tokenIn, address tokenOut, uint256 amountIn, address[] memory factories, bool rawMode) view returns (tuple(address pool, uint256 output, uint256 liquidity, uint256 priceImpact, uint256 score, bool eligible, uint256 failReason)[] assessments)",
  "function quoteExactInput(address tokenIn, address tokenOut, uint256 amountIn, address[] memory factories, uint256 slippageBps) view returns (tuple(tuple(address pool, address tokenOut, uint16 v2FeeNumerator, uint16 v2FeeDenominator, address factory)[] hops, uint256 amountOut, uint256 priceImpact, uint256 amountOutMin, bytes path, string liquidityProfile, uint256 poolLiquidity, address bestPool) result)",
  "function WRAPPED_NATIVE() view returns (address)"
];

// 1. Pool Assessment Endpoint
app.post('/api/pool-assessment', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, rpcUrl } = req.body;
    const provider = new ethers.JsonRpcProvider(rpcUrl || DEFAULT_RPC);
    const contract = new ethers.Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, provider);

    let wrappedNative = WBNB_ADDRESS;
    try {
      wrappedNative = await contract.WRAPPED_NATIVE();
    } catch (e) {}

    const resolvedTokenIn = tokenIn === '0x0000000000000000000000000000000000000000' || !tokenIn ? wrappedNative : tokenIn;
    const resolvedTokenOut = tokenOut === '0x0000000000000000000000000000000000000000' || !tokenOut ? wrappedNative : tokenOut;

    const factories = await contract.getAllWhitelistedFactories();
    const assessments = await contract.assessPools(resolvedTokenIn, resolvedTokenOut, amountIn, factories, false);

    const formatted = assessments.map((a: any) => ({
      pool: a.pool,
      output: a.output.toString(),
      liquidity: a.liquidity.toString(),
      priceImpact: a.priceImpact.toString(),
      score: Number(a.score),
      eligible: a.eligible,
      failReason: Number(a.failReason)
    }));

    res.json({ success: true, assessments: formatted });
  } catch (err: any) {
    console.error('Pool assessment error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to assess pools' });
  }
});

// 2. Quote Endpoint
app.post('/api/quote', async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, slippageBps, rpcUrl } = req.body;
    const provider = new ethers.JsonRpcProvider(rpcUrl || DEFAULT_RPC);
    const contract = new ethers.Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, provider);

    let wrappedNative = WBNB_ADDRESS;
    try {
      wrappedNative = await contract.WRAPPED_NATIVE();
    } catch (e) {}

    const resolvedTokenIn = tokenIn === '0x0000000000000000000000000000000000000000' || !tokenIn ? wrappedNative : tokenIn;
    const resolvedTokenOut = tokenOut === '0x0000000000000000000000000000000000000000' || !tokenOut ? wrappedNative : tokenOut;

    const factories = await contract.getAllWhitelistedFactories();
    const quoteResult = await contract.quoteExactInput(resolvedTokenIn, resolvedTokenOut, amountIn, factories, slippageBps || 50);

    res.json({
      success: true,
      quote: {
        amountOut: quoteResult.amountOut.toString(),
        priceImpact: quoteResult.priceImpact.toString(),
        amountOutMin: quoteResult.amountOutMin.toString(),
        path: quoteResult.path,
        liquidityProfile: quoteResult.liquidityProfile,
        poolLiquidity: quoteResult.poolLiquidity.toString(),
        bestPool: quoteResult.bestPool
      }
    });
  } catch (err: any) {
    console.error('Quote error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate quote' });
  }
});

// 3. Balance Endpoint
app.post('/api/balance', async (req, res) => {
  try {
    const { tokenAddress, walletAddress, rpcUrl } = req.body;
    const provider = new ethers.JsonRpcProvider(rpcUrl || DEFAULT_RPC);

    if (!walletAddress) {
      return res.json({ success: true, balance: '0', decimals: 18, symbol: 'BNB' });
    }

    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000' || tokenAddress.toLowerCase() === 'bnb') {
      const bal = await provider.getBalance(walletAddress);
      return res.json({ success: true, balance: bal.toString(), decimals: 18, symbol: 'BNB' });
    }

    const c = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [bal, decimals, symbol] = await Promise.all([
      c.balanceOf(walletAddress),
      c.decimals(),
      c.symbol()
    ]);

    res.json({ success: true, balance: bal.toString(), decimals: Number(decimals), symbol });
  } catch (err: any) {
    console.error('Balance error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch balance' });
  }
});

// 4. Allowance Endpoint
app.post('/api/allowance', async (req, res) => {
  try {
    const { tokenAddress, ownerAddress, spenderAddress, rpcUrl } = req.body;
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
      return res.json({ success: true, allowance: '0' });
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl || DEFAULT_RPC);
    const c = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const allowance = await c.allowance(ownerAddress, spenderAddress);
    res.json({ success: true, allowance: allowance.toString() });
  } catch (err: any) {
    console.error('Allowance error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch allowance' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', aggregator: AGGREGATOR_ADDRESS });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Orvix Backend & Vite Server running on http://localhost:${PORT}`);
  });
}

startServer();
