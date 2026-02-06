/**
 * Jupiter API Service
 * 
 * Token prices, swap quotes, and slippage estimation
 * Docs: https://station.jup.ag/docs/apis/
 * FREE - No API key required
 */

// ===========================================
// CONSTANTS
// ===========================================

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || '';
const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';
const JUPITER_QUOTE_API = 'https://api.jup.ag/swap/v1';

function getJupiterHeaders() {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };
    if (JUPITER_API_KEY) {
        headers['x-api-key'] = JUPITER_API_KEY;
    }
    return headers;
}

// Common tokens for quote testing
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// ===========================================
// TYPES
// ===========================================

export interface JupiterPrice {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
    timeTaken?: number;
}

export interface JupiterPriceResponse {
    data: Record<string, JupiterPrice>;
    timeTaken: number;
}

export interface JupiterQuote {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    platformFee?: {
        amount: string;
        feeBps: number;
    };
    priceImpactPct: string;
    routePlan: Array<{
        swapInfo: {
            ammKey: string;
            label: string;
            inputMint: string;
            outputMint: string;
            inAmount: string;
            outAmount: string;
            feeAmount: string;
            feeMint: string;
        };
        percent: number;
    }>;
    contextSlot: number;
    timeTaken: number;
}

export interface SlippageAnalysis {
    buySlippagePercent: number;
    sellSlippagePercent: number;
    buyPriceImpact: number;
    sellPriceImpact: number;
    isHoneypot: boolean;
    honeypotReason?: string;
    tradeable: boolean;
    tradeableReason?: string;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Get token price from Jupiter
 */
export async function getTokenPrice(address: string): Promise<JupiterPrice | null> {
    try {
        console.log('[Jupiter] Fetching price:', address);
        const response = await fetch(
            `${JUPITER_PRICE_API}?ids=${address}`,
            { headers: getJupiterHeaders() }
        );

        if (!response.ok) {
            console.error('[Jupiter] Price API error:', response.status);
            return null;
        }

        const data: JupiterPriceResponse = await response.json();
        return data.data[address] || null;
    } catch (error) {
        console.error('[Jupiter] Price fetch failed:', error);
        return null;
    }
}

/**
 * Get swap quote from Jupiter
 */
export async function getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps = 50
): Promise<JupiterQuote | null> {
    try {
        console.log('[Jupiter] Getting quote:', inputMint.slice(0, 8), '->', outputMint.slice(0, 8));

        const params = new URLSearchParams({
            inputMint,
            outputMint,
            amount,
            slippageBps: slippageBps.toString(),
        });

        // Add timeout to prevent hanging on network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
            `${JUPITER_QUOTE_API}/quote?${params}`,
            {
                headers: getJupiterHeaders(),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            // 400 errors often mean no routes available (token can't be traded)
            if (response.status === 400) {
                const errorData = await response.json().catch(() => null);
                console.log('[Jupiter] No routes available:', errorData?.error || 'Unknown');
                return null;
            }
            console.error('[Jupiter] Quote API error:', response.status);
            return null;
        }

        const data: JupiterQuote = await response.json();
        console.log('[Jupiter] Quote received, price impact:', data.priceImpactPct);
        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('[Jupiter] Quote request timed out');
        } else if (error.cause?.code === 'ENOTFOUND') {
            console.error('[Jupiter] DNS resolution failed - check network');
        } else {
            console.error('[Jupiter] Quote fetch failed:', error.message || error);
        }
        return null;
    }
}

/**
 * Analyze buy/sell slippage for a token
 * Tests buying and selling with a small amount to detect honeypots
 */
export async function analyzeSlippage(tokenAddress: string): Promise<SlippageAnalysis> {
    const result: SlippageAnalysis = {
        buySlippagePercent: 0,
        sellSlippagePercent: 0,
        buyPriceImpact: 0,
        sellPriceImpact: 0,
        isHoneypot: false,
        tradeable: true,
    };

    // Test amount: $100 worth of USDC (100 * 10^6)
    const testAmountUSDC = '100000000'; // 100 USDC
    const testAmountToken = '1000000000'; // 1B smallest units (adjust based on decimals)

    try {
        // Test BUY: USDC -> Token
        console.log('[Jupiter] Testing buy slippage...');
        const buyQuote = await getQuote(USDC_MINT, tokenAddress, testAmountUSDC);

        if (!buyQuote) {
            result.tradeable = false;
            result.tradeableReason = 'No buy route available';
            console.log('[Jupiter] No buy route found');
        } else {
            result.buyPriceImpact = parseFloat(buyQuote.priceImpactPct);
            result.buySlippagePercent = result.buyPriceImpact;
        }

        // Test SELL: Token -> USDC
        console.log('[Jupiter] Testing sell slippage...');
        const sellQuote = await getQuote(tokenAddress, USDC_MINT, testAmountToken);

        if (!sellQuote) {
            // No sell route could indicate honeypot
            if (buyQuote) {
                result.isHoneypot = true;
                result.honeypotReason = 'Can buy but cannot sell (no sell route)';
            }
            result.tradeable = false;
            result.tradeableReason = result.tradeableReason || 'No sell route available';
            console.log('[Jupiter] No sell route found');
        } else {
            result.sellPriceImpact = parseFloat(sellQuote.priceImpactPct);
            result.sellSlippagePercent = result.sellPriceImpact;

            // Check for extreme sell slippage (honeypot indicator)
            if (result.sellSlippagePercent > 50) {
                result.isHoneypot = true;
                result.honeypotReason = `Extreme sell slippage: ${result.sellSlippagePercent.toFixed(1)}%`;
            } else if (result.sellSlippagePercent > result.buySlippagePercent * 3 && result.sellSlippagePercent > 10) {
                result.isHoneypot = true;
                result.honeypotReason = `Sell slippage (${result.sellSlippagePercent.toFixed(1)}%) much higher than buy (${result.buySlippagePercent.toFixed(1)}%)`;
            }
        }

    } catch (error) {
        console.error('[Jupiter] Slippage analysis failed:', error);
        result.tradeable = false;
        result.tradeableReason = 'Analysis failed';
    }

    return result;
}

/**
 * Get multiple token prices at once
 */
export async function getMultiplePrices(addresses: string[]): Promise<Record<string, JupiterPrice>> {
    if (addresses.length === 0) return {};

    try {
        const ids = addresses.join(',');
        const response = await fetch(
            `${JUPITER_PRICE_API}?ids=${ids}`,
            { headers: getJupiterHeaders() }
        );

        if (!response.ok) return {};

        const data: JupiterPriceResponse = await response.json();
        return data.data || {};
    } catch (error) {
        console.error('[Jupiter] Multiple price fetch failed:', error);
        return {};
    }
}
