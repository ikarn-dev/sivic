/**
 * DexScreener API Service
 * 
 * DEX pairs, liquidity pools, and trading data
 * Docs: https://docs.dexscreener.com/
 * FREE - No API key required
 */

// ===========================================
// TYPES
// ===========================================

export interface DexScreenerPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    txns: {
        m5: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        h6: { buys: number; sells: number };
        h24: { buys: number; sells: number };
    };
    volume: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h6: number;
        h24: number;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info?: {
        imageUrl?: string;
        websites?: Array<{ label: string; url: string }>;
        socials?: Array<{ type: string; url: string }>;
    };
}

export interface DexScreenerTokenResponse {
    schemaVersion: string;
    pairs: DexScreenerPair[] | null;
}

export interface DexScreenerSummary {
    totalPairs: number;
    totalLiquidity: number;
    totalVolume24h: number;
    price: number;
    priceChange24h: number;
    marketCap: number;
    fdv: number;
    dexes: string[];
    createdAt: number | null;
    pairs: Array<{
        dex: string;
        pairAddress: string;
        liquidity: number;
        volume24h: number;
        quoteToken: string;
    }>;
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Get all pairs for a token address
 */
export async function getTokenPairs(address: string): Promise<DexScreenerPair[] | null> {
    try {
        console.log('[DexScreener] Fetching pairs for:', address);
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`,
            {
                headers: { 'Accept': 'application/json' },
            }
        );

        if (!response.ok) {
            console.error('[DexScreener] API error:', response.status);
            return null;
        }

        const data: DexScreenerTokenResponse = await response.json();
        console.log('[DexScreener] Found', data.pairs?.length || 0, 'pairs');
        return data.pairs || null;
    } catch (error) {
        console.error('[DexScreener] Fetch failed:', error);
        return null;
    }
}

/**
 * Get summarized DEX data for a token
 */
export async function getTokenDexSummary(address: string): Promise<DexScreenerSummary | null> {
    const pairs = await getTokenPairs(address);

    if (!pairs || pairs.length === 0) {
        return null;
    }

    // Sort by liquidity descending
    const sortedPairs = [...pairs].sort((a, b) =>
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    );

    // Get unique DEXes
    const dexes = [...new Set(pairs.map(p => p.dexId))];

    // Calculate totals
    const totalLiquidity = pairs.reduce((sum, p) => sum + (p.liquidity?.usd || 0), 0);
    const totalVolume24h = pairs.reduce((sum, p) => sum + (p.volume?.h24 || 0), 0);

    // Use the highest liquidity pair for price data
    const mainPair = sortedPairs[0];

    // Find earliest creation time
    const createdAt = pairs
        .filter(p => p.pairCreatedAt)
        .sort((a, b) => a.pairCreatedAt - b.pairCreatedAt)[0]?.pairCreatedAt || null;

    return {
        totalPairs: pairs.length,
        totalLiquidity,
        totalVolume24h,
        price: parseFloat(mainPair.priceUsd) || 0,
        priceChange24h: mainPair.priceChange?.h24 || 0,
        marketCap: mainPair.marketCap || 0,
        fdv: mainPair.fdv || 0,
        dexes,
        createdAt,
        pairs: sortedPairs.slice(0, 10).map(p => ({
            dex: p.dexId,
            pairAddress: p.pairAddress,
            liquidity: p.liquidity?.usd || 0,
            volume24h: p.volume?.h24 || 0,
            quoteToken: p.quoteToken.symbol,
        })),
    };
}

/**
 * Get pair details by pair address
 */
export async function getPairByAddress(pairAddress: string): Promise<DexScreenerPair | null> {
    try {
        console.log('[DexScreener] Fetching pair:', pairAddress);
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
            {
                headers: { 'Accept': 'application/json' },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.pairs?.[0] || null;
    } catch (error) {
        console.error('[DexScreener] Pair fetch failed:', error);
        return null;
    }
}
