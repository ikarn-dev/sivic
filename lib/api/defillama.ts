/**
 * DeFiLlama API Service
 * 
 * TVL, Volume, and DeFi protocol data
 * Docs: https://defillama.com/docs/api
 * No API key required!
 */

import { serverConfig, SOLANA_PROTOCOLS } from '../config';

// ===========================================
// TYPES
// ===========================================

export interface Protocol {
    id: string;
    name: string;
    symbol: string;
    category: string;
    chains: string[];
    tvl: number;
    chainTvls: Record<string, number>;
    change_1d: number;
    change_7d: number;
}

export interface ProtocolDetail extends Protocol {
    currentChainTvls: Record<string, number>;
    description?: string;
    url?: string;
    logo?: string;
}

export interface DexVolume {
    name: string;
    displayName?: string;
    total24h: number;
    total7d?: number;
    change_1d: number;
    change_7d?: number;
    chains: string[];
}

export interface ChainTVL {
    name: string;
    tvl: number;
    tokenSymbol?: string;
    gecko_id?: string;
}

export interface YieldPool {
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase: number;
    apyReward: number | null;
    pool: string;
}

// ===========================================
// API HELPERS
// ===========================================

async function fetchAPI<T>(baseUrl: string, endpoint: string): Promise<T> {
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
        },
        // Cache for 5 minutes
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        throw new Error(`DeFiLlama API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// ===========================================
// TVL ENDPOINTS
// ===========================================

/**
 * Get all protocols
 */
export async function getProtocols(): Promise<Protocol[]> {
    return fetchAPI<Protocol[]>(serverConfig.defillama.apiUrl, '/protocols');
}

/**
 * Get Solana-only protocols
 */
export async function getSolanaProtocols(): Promise<Protocol[]> {
    const protocols = await getProtocols();
    return protocols.filter(p => p.chains.includes('Solana'));
}

/**
 * Get specific protocol details
 */
export async function getProtocol(slug: string): Promise<ProtocolDetail> {
    return fetchAPI<ProtocolDetail>(serverConfig.defillama.apiUrl, `/protocol/${slug}`);
}

/**
 * Get current TVL of a protocol (simplified)
 */
export async function getProtocolTVL(slug: string): Promise<number> {
    return fetchAPI<number>(serverConfig.defillama.apiUrl, `/tvl/${slug}`);
}

/**
 * Get all chains TVL
 */
export async function getChains(): Promise<ChainTVL[]> {
    return fetchAPI<ChainTVL[]>(serverConfig.defillama.apiUrl, '/v2/chains');
}

/**
 * Get Solana chain TVL
 */
export async function getSolanaTVL(): Promise<number> {
    const chains = await getChains();
    const solana = chains.find(c => c.name === 'Solana');
    return solana?.tvl || 0;
}

// ===========================================
// DEX VOLUME ENDPOINTS
// ===========================================

/**
 * Get all DEX overview
 */
export async function getDexOverview(): Promise<{ protocols: DexVolume[] }> {
    return fetchAPI(
        serverConfig.defillama.apiUrl,
        '/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
    );
}

/**
 * Get Solana DEX overview
 */
export async function getSolanaDexOverview(): Promise<{ protocols: DexVolume[] }> {
    return fetchAPI(
        serverConfig.defillama.apiUrl,
        '/overview/dexs/Solana?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
    );
}

/**
 * Get specific DEX summary
 */
export async function getDexSummary(protocol: string): Promise<DexVolume> {
    return fetchAPI(
        serverConfig.defillama.apiUrl,
        `/summary/dexs/${protocol}?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
    );
}

// ===========================================
// YIELDS ENDPOINTS
// ===========================================

/**
 * Get all yield pools
 */
export async function getYieldPools(): Promise<{ data: YieldPool[] }> {
    return fetchAPI(serverConfig.defillama.yieldsUrl, '/pools');
}

/**
 * Get Solana yield pools
 */
export async function getSolanaYieldPools(): Promise<YieldPool[]> {
    const result = await getYieldPools();
    return result.data.filter(p => p.chain === 'Solana');
}

// ===========================================
// AGGREGATED DATA
// ===========================================

/**
 * Get TVL for all tracked Solana protocols
 */
export async function getSolanaEcosystemTVL() {
    const categories = SOLANA_PROTOCOLS;
    const results: Record<string, Record<string, number>> = {};

    // Fetch TVL for each category
    for (const [category, protocols] of Object.entries(categories)) {
        results[category] = {};

        for (const [name, slug] of Object.entries(protocols)) {
            try {
                const tvl = await getProtocolTVL(slug);
                results[category][name] = tvl;
            } catch {
                results[category][name] = 0;
            }
        }
    }

    return results;
}

/**
 * Get category totals
 */
export async function getCategoryTotals() {
    const ecosystem = await getSolanaEcosystemTVL();

    const totals: Record<string, number> = {};
    for (const [category, protocols] of Object.entries(ecosystem)) {
        totals[category] = Object.values(protocols).reduce((sum, tvl) => sum + tvl, 0);
    }

    return totals;
}

// ===========================================
// PRICE ENDPOINTS
// ===========================================

/**
 * Get current SOL price
 */
export async function getSOLPrice(): Promise<number> {
    const result = await fetchAPI<{ coins: Record<string, { price: number }> }>(
        serverConfig.defillama.coinsUrl,
        '/prices/current/coingecko:solana'
    );
    return result.coins['coingecko:solana']?.price || 0;
}

/**
 * Get token price by address
 */
export async function getTokenPrice(address: string): Promise<number> {
    const result = await fetchAPI<{ coins: Record<string, { price: number }> }>(
        serverConfig.defillama.coinsUrl,
        `/prices/current/solana:${address}`
    );
    return result.coins[`solana:${address}`]?.price || 0;
}
