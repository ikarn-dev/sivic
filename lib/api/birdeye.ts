/**
 * Birdeye API Service
 * 
 * Token data, price, liquidity, and market information
 * Docs: https://docs.birdeye.so/
 */

// ===========================================
// CONFIGURATION
// ===========================================

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || '';
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';
const DEFAULT_TIMEOUT = 10000; // 10 second timeout

function getBirdeyeHeaders() {
    return {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana',
        'Content-Type': 'application/json',
    };
}

// Helper function for timeout fetch
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_TIMEOUT): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeoutMs}ms`);
        }
        throw error;
    }
}

// ===========================================
// TYPES
// ===========================================

export interface BirdeyeTokenOverview {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    extensions?: {
        website?: string;
        twitter?: string;
        telegram?: string;
        discord?: string;
        description?: string;
    };
    logoURI?: string;
    liquidity: number;
    price: number;
    priceChange24hPercent: number;
    mc: number; // Market cap
    fdv: number; // Fully diluted valuation
    v24hUSD: number; // 24h volume in USD
    v24hChangePercent: number;
    supply: number;
    circulatingSupply: number;
    holder: number;
    trade24h: number;
    trade24hChangePercent: number;
    buy24h: number;
    sell24h: number;
    uniqueWallet24h: number;
    uniqueWallet24hChangePercent: number;
    lastTradeUnixTime: number;
    lastTradeHumanTime: string;
    creationTime?: number;
}

export interface BirdeyeTokenSecurity {
    creatorAddress: string;
    creatorBalance: number;
    creatorPercentage: number;
    ownerAddress: string;
    ownerBalance: number;
    ownerPercentage: number;
    top10HolderBalance: number;
    top10HolderPercent: number;
    isMutable: boolean;
    isMintable: boolean;
    isFreezable: boolean;
    isLpBurned: boolean;
    lpBurnedPercent: number;
}

export interface BirdeyePrice {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
    priceChange24h: number;
}

export interface BirdeyeTradeData {
    trade24h: number;
    trade24hChangePercent: number;
    buy24h: number;
    buy24hChangePercent: number;
    sell24h: number;
    sell24hChangePercent: number;
    uniqueWallet24h: number;
    uniqueWallet24hChangePercent: number;
    volume24hUSD: number;
    volume24hChangePercent: number;
}

export interface BirdeyeLiquidity {
    totalLiquidity: number;
    pools: Array<{
        address: string;
        source: string;
        liquidity: number;
        baseToken: string;
        quoteToken: string;
    }>;
}

export interface BirdeyeTokenCreation {
    txHash: string;
    slot: number;
    blockTime: number;
    creator: string;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Get comprehensive token overview (price, volume, market cap, holders, etc.)
 */
export async function getTokenOverview(address: string): Promise<BirdeyeTokenOverview | null> {
    if (!BIRDEYE_API_KEY) {
        console.log('[Birdeye] API key not configured, skipping');
        return null;
    }

    try {
        const response = await fetchWithTimeout(
            `${BIRDEYE_BASE_URL}/defi/token_overview?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        return null;
    }
}

/**
 * Get token price
 */
export async function getTokenPrice(address: string): Promise<BirdeyePrice | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching price:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/price?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('[Birdeye] Price fetch failed:', error);
        return null;
    }
}

/**
 * Get token security info (creator, LP burn status, etc.)
 */
export async function getTokenSecurity(address: string): Promise<BirdeyeTokenSecurity | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching security info:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/token_security?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) {
            console.error('[Birdeye] Security info error:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('[Birdeye] Security info success');
        return data.data || null;
    } catch (error) {
        console.error('[Birdeye] Security fetch failed:', error);
        return null;
    }
}

/**
 * Get token trade data (buy/sell volume, unique wallets)
 */
export async function getTokenTradeData(address: string): Promise<BirdeyeTradeData | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching trade data:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/v3/token/trade-data/single?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('[Birdeye] Trade data fetch failed:', error);
        return null;
    }
}

/**
 * Get token liquidity information
 */
export async function getTokenLiquidity(address: string): Promise<BirdeyeLiquidity | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching liquidity:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/v3/token/exit-liquidity?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('[Birdeye] Liquidity fetch failed:', error);
        return null;
    }
}

/**
 * Get token market data (market cap, FDV, supply)
 */
export async function getTokenMarketData(address: string): Promise<{
    marketCap: number;
    fdv: number;
    circulatingSupply: number;
    totalSupply: number;
} | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching market data:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/v3/token/market-data?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const d = data.data;
        return d ? {
            marketCap: d.mc || d.marketCap || 0,
            fdv: d.fdv || 0,
            circulatingSupply: d.circulatingSupply || 0,
            totalSupply: d.supply || d.totalSupply || 0,
        } : null;
    } catch (error) {
        console.error('[Birdeye] Market data fetch failed:', error);
        return null;
    }
}

/**
 * Get token creation info
 */
export async function getTokenCreation(address: string): Promise<BirdeyeTokenCreation | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching creation info:', address);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/defi/token_creation_info?address=${address}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('[Birdeye] Creation info fetch failed:', error);
        return null;
    }
}

/**
 * Get wallet token balance changes (for tracking creator activity)
 */
export async function getWalletTokenActivity(walletAddress: string, limit = 50): Promise<any[] | null> {
    if (!BIRDEYE_API_KEY) return null;

    try {
        console.log('[Birdeye] Fetching wallet activity:', walletAddress);
        const response = await fetch(
            `${BIRDEYE_BASE_URL}/wallet/v2/balance-change?wallet=${walletAddress}&limit=${limit}`,
            { headers: getBirdeyeHeaders() }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.data?.items || null;
    } catch (error) {
        console.error('[Birdeye] Wallet activity fetch failed:', error);
        return null;
    }
}

/**
 * Check if Birdeye API is configured
 */
export function isBirdeyeConfigured(): boolean {
    return !!BIRDEYE_API_KEY;
}

/**
 * Get token price history for deviation analysis
 */
export async function getTokenPriceHistory(
    address: string,
    timeType: string = '1H',
    limit: number = 24
): Promise<Array<{ unixTime: number; value: number }> | null> {
    if (!BIRDEYE_API_KEY) return null;
    try {
        const now = Math.floor(Date.now() / 1000);
        const timeFrom = now - (limit * 3600);
        const response = await fetchWithTimeout(
            `/defi/history_price?address=${address}&type=${timeType}&time_from=${timeFrom}&time_to=${now}`,
            { headers: getBirdeyeHeaders() }
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.items || null;
    } catch { return null; }
}

/**
 * Analyze price volatility and detect pump/dump patterns
 */
export async function analyzePriceVolatility(address: string): Promise<{
    currentPrice: number;
    priceChange24h: number;
    volatility24h: number;
    isPumpDetected: boolean;
    isDumpDetected: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}> {
    const overview = await getTokenOverview(address);
    const currentPrice = overview?.price || 0;
    const priceChange24h = overview?.priceChange24hPercent || 0;
    const isPumpDetected = priceChange24h > 100;
    const isDumpDetected = priceChange24h < -50;
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (Math.abs(priceChange24h) > 50) riskLevel = 'critical';
    else if (isPumpDetected || isDumpDetected) riskLevel = 'high';
    else if (Math.abs(priceChange24h) > 15) riskLevel = 'medium';
    return { currentPrice, priceChange24h, volatility24h: Math.abs(priceChange24h), isPumpDetected, isDumpDetected, riskLevel };
}
