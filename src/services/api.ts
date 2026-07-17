const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://orvixbackend.vercel.app/api';

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

export async function fetchPools(tokenIn: string, tokenOut: string, amountIn: string, userAddress: string): Promise<PoolAssessmentResponse> {
  if (!userAddress) {
    return { success: false, error: 'User address is required' };
  }
  
  try {
    const res = await fetch(`${API_BASE}/assess-pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_in: tokenIn, token_out: tokenOut, amount_in: amountIn, user_address: userAddress, raw_mode: false })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to fetch pools' };
    }
    
    const data = await res.json();
    return {
      success: true,
      assessments: data.assessments?.map((a: any) => ({
        pool: a.pool,
        output: a.output,
        liquidity: a.liquidity,
        priceImpact: a.price_impact_bps,
        score: parseFloat(a.score || '0'),
        eligible: a.eligible,
        failReason: a.fail_reason_code
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getQuotes(tokenIn: string, tokenOut: string, amountIn: string, slippageBps: number = 50, userAddress: string): Promise<QuoteResponse> {
  if (!userAddress) {
    return { success: false, error: 'User address is required' };
  }
  
  try {
    const res = await fetch(`${API_BASE}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_in: tokenIn, token_out: tokenOut, amount_in: amountIn, slippage_bps: slippageBps, user_address: userAddress })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to fetch quote' };
    }
    
    const data = await res.json();
    return {
      success: true,
      quote: {
        amountOut: data.amount_out,
        priceImpact: data.price_impact_bps,
        amountOutMin: data.amount_out_min,
        path: data.path,
        liquidityProfile: data.liquidity_profile,
        poolLiquidity: data.pool_liquidity,
        bestPool: data.best_pool
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchBalance(tokenAddress: string, walletAddress: string) {
  if (!walletAddress) {
    return { success: false, error: 'Wallet address is required' };
  }
  
  try {
    const isNative = tokenAddress === '0x0000000000000000000000000000000000000000' || !tokenAddress;
    const endpoint = isNative ? '/native-balance' : '/token-info';
    
    const body = isNative 
      ? { user_address: walletAddress }
      : { address: tokenAddress, user_address: walletAddress };
      
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to fetch balance' };
    }
    
    const data = await res.json();
    return {
      success: true,
      balance: data.balance,
      decimals: data.decimals || 18,
      symbol: data.symbol || 'BNB'
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string) {
  if (!ownerAddress) {
    return { success: false, error: 'Owner address is required' };
  }
  
  try {
    const res = await fetch(`${API_BASE}/allowance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_address: tokenAddress, user_address: ownerAddress, spender_address: spenderAddress })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to fetch allowance' };
    }
    
    const data = await res.json();
    return {
      success: true,
      allowance: data.allowance
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
