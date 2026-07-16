import { getEffectiveRpcUrl } from '../contracts/config';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export interface PoolAssessmentResponse {
  success: boolean;
  assessments?: Array<{
    pool: string;
    output: string;
    liquidity: string;
    priceImpact: string;
    score: number;
    eligible: boolean;
    failReason: number;
  }>;
  error?: string;
}

export interface QuoteResponse {
  success: boolean;
  quote?: {
    amountOut: string;
    priceImpact: string;
    amountOutMin: string;
    path: string;
    liquidityProfile: string;
    poolLiquidity: string;
    bestPool: string;
  };
  error?: string;
}

export async function fetchPools(tokenIn: string, tokenOut: string, amountIn: string): Promise<PoolAssessmentResponse> {
  const rpcUrl = getEffectiveRpcUrl();
  const res = await fetch(`${API_BASE}/pool-assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenIn, tokenOut, amountIn, rpcUrl })
  });
  return res.json();
}

export async function getQuotes(tokenIn: string, tokenOut: string, amountIn: string, slippageBps: number = 50): Promise<QuoteResponse> {
  const rpcUrl = getEffectiveRpcUrl();
  const res = await fetch(`${API_BASE}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenIn, tokenOut, amountIn, slippageBps, rpcUrl })
  });
  return res.json();
}

export async function fetchBalance(tokenAddress: string, walletAddress: string) {
  const rpcUrl = getEffectiveRpcUrl();
  const res = await fetch(`${API_BASE}/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress, walletAddress, rpcUrl })
  });
  return res.json();
}

export async function fetchAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string) {
  const rpcUrl = getEffectiveRpcUrl();
  const res = await fetch(`${API_BASE}/allowance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress, ownerAddress, spenderAddress, rpcUrl })
  });
  return res.json();
}
