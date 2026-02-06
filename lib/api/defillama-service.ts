/**
 * DeFiLlama API Service
 * 
 * Centralized service for all DeFiLlama API calls with:
 * - Server-side caching
 * - Deduplication
 * - Rate limit protection
 * - Shared data between endpoints
 */

import { serverConfig } from '@/lib/config';
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { apiLogger } from '@/lib/utils/logger';

// Types
interface DeFiLlamaProtocol {
    name: string;
    slug: string;
    tvl: number;
    change_1d: number | null;
    change_7d: number | null;
    chain: string;
    chains: string[];
    category: string;
    logo: string;
}

interface ChainData {
    name: string;
    tvl: number;
}

interface SolPriceResponse {
    coins: Record<string, { price: number }>;
}

interface DexOverviewResponse {
    totalVolume24h: number;
    protocols: Array<{
        name: string;
        displayName: string;
        total24h: number;
        total7d: number;
        change_1d: number;
        change_7d: number;
    }>;
}

// Category normalization
const CATEGORY_MAP: Record<string, string> = {
    'Dexs': 'dexs',
    'Dexes': 'dexs',
    'DEX': 'dexs',
    'Lending': 'lending',
    'CDP': 'lending',
    'Liquid Staking': 'staking',
    'Staking': 'staking',
    'Staking Pool': 'staking',
    'Liquid Restaking': 'staking',
    'NFT Lending': 'nft',
    'NFT Marketplace': 'nft',
    'NFT': 'nft',
    'Bridge': 'bridges',
    'Cross Chain': 'bridges',
    'Yield': 'yield',
    'Yield Aggregator': 'yield',
    'Farm': 'yield',
    'Derivatives': 'derivatives',
    'Perpetuals': 'perpetuals',
    'Options': 'derivatives',
    'Algo-Stables': 'staking',
    'Launchpad': 'launch',
    'Privacy': 'other',
    'Insurance': 'other',
    'Indexes': 'yield',
    'Synthetics': 'derivatives',
    'Payments': 'other',
    'RWA': 'rwa',
    'Prediction Market': 'other',
    'Gaming': 'gaming',
};

function normalizeCategory(category: string): string {
    return CATEGORY_MAP[category] || 'other';
}

/**
 * Fetch all protocols from DeFiLlama (cached)
 */
async function fetchAllProtocols(): Promise<DeFiLlamaProtocol[]> {
    return serverCache.getOrFetch(
        CACHE_KEYS.DEFILLAMA_PROTOCOLS,
        async () => {
            apiLogger.request('DeFiLlama', `${serverConfig.defillama.apiUrl}/protocols`);

            const response = await fetch(`${serverConfig.defillama.apiUrl}/protocols`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`DeFiLlama /protocols error: ${response.status}`);
            }

            const protocols = await response.json();
            apiLogger.data('All protocols', `${protocols.length} total`);
            return protocols;
        },
        CACHE_TTL.MEDIUM
    );
}

/**
 * Fetch chain TVL data (cached)
 */
async function fetchChains(): Promise<ChainData[]> {
    return serverCache.getOrFetch(
        CACHE_KEYS.DEFILLAMA_CHAINS,
        async () => {
            apiLogger.request('DeFiLlama', `${serverConfig.defillama.apiUrl}/v2/chains`);

            const response = await fetch(`${serverConfig.defillama.apiUrl}/v2/chains`, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`DeFiLlama /v2/chains error: ${response.status}`);
            }

            return response.json();
        },
        CACHE_TTL.MEDIUM
    );
}

/**
 * Fetch SOL price (cached)
 */
async function fetchSolPrice(): Promise<number> {
    const data = await serverCache.getOrFetch<SolPriceResponse>(
        CACHE_KEYS.DEFILLAMA_SOL_PRICE,
        async () => {
            const url = `${serverConfig.defillama.coinsUrl}/prices/current/coingecko:solana`;
            apiLogger.request('DeFiLlama', url);

            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`DeFiLlama price error: ${response.status}`);
            }

            return response.json();
        },
        CACHE_TTL.SHORT // Price updates more frequently
    );

    return data.coins['coingecko:solana']?.price || 0;
}

/**
 * Fetch DEX overview for Solana (cached)
 */
async function fetchDexOverview(): Promise<DexOverviewResponse> {
    return serverCache.getOrFetch(
        CACHE_KEYS.DEFILLAMA_DEX_OVERVIEW,
        async () => {
            const url = `${serverConfig.defillama.apiUrl}/overview/dexs/Solana?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`;
            apiLogger.request('DeFiLlama', url);

            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`DeFiLlama DEX overview error: ${response.status}`);
            }

            const data = await response.json();

            return {
                totalVolume24h: data.total24h || 0,
                protocols: (data.protocols || []).map((p: Record<string, unknown>) => ({
                    name: p.name,
                    displayName: p.displayName || p.name,
                    total24h: p.total24h || 0,
                    total7d: p.total7d || 0,
                    change_1d: p.change_1d || 0,
                    change_7d: p.change_7d || 0,
                })),
            };
        },
        CACHE_TTL.MEDIUM
    );
}

// Types for Solana protocols result
interface SolanaProtocolsResult {
    protocols: Array<{
        name: string;
        slug: string;
        tvl: number;
        change24h: number;
        category: string;
    }>;
    totalTvl: number;
}

/**
 * Get Solana protocols only (extracted from all protocols, cached)
 */
async function getSolanaProtocols(): Promise<SolanaProtocolsResult> {
    // Check if we have pre-processed Solana protocols
    const cached = serverCache.get<SolanaProtocolsResult>(CACHE_KEYS.SOLANA_PROTOCOLS);
    if (cached) {
        return cached;
    }

    // Get all protocols and filter
    const allProtocols = await fetchAllProtocols();

    const solanaProtocols = allProtocols
        .filter((p: DeFiLlamaProtocol) => p.chains?.includes('Solana') || p.chain === 'Solana')
        .filter((p: DeFiLlamaProtocol) => p.tvl > 0)
        .map((p: DeFiLlamaProtocol) => ({
            name: p.name,
            slug: p.slug,
            tvl: p.tvl,
            change24h: p.change_1d || 0,
            category: normalizeCategory(p.category),
        }))
        .sort((a, b) => b.tvl - a.tvl);

    const totalTvl = solanaProtocols.reduce((sum, p) => sum + p.tvl, 0);

    const result: SolanaProtocolsResult = { protocols: solanaProtocols, totalTvl };

    // Cache the processed result
    serverCache.set(CACHE_KEYS.SOLANA_PROTOCOLS, result, CACHE_TTL.MEDIUM);

    return result;
}

/**
 * Get ecosystem data (TVL by category)
 */
export async function getEcosystemData() {
    // Fetch all data in parallel using cached functions
    const [chainsData, solPrice, solanaData] = await Promise.all([
        fetchChains(),
        fetchSolPrice(),
        getSolanaProtocols(),
    ]);

    // Get Solana chain total TVL
    const solanaChain = chainsData.find(c => c.name === 'Solana');
    const totalTvl = solanaChain?.tvl || 0;

    // Group protocols by category
    const categoryMap = new Map<string, typeof solanaData.protocols>();

    for (const protocol of solanaData.protocols) {
        const existing = categoryMap.get(protocol.category) || [];
        existing.push(protocol);
        categoryMap.set(protocol.category, existing);
    }

    // Build categories array
    const categories = Array.from(categoryMap.entries())
        .map(([name, protocols]) => ({
            name,
            totalTvl: protocols.reduce((sum, p) => sum + p.tvl, 0),
            protocols: protocols.slice(0, 10).map(p => ({
                name: p.name,
                slug: p.slug,
                tvl: p.tvl,
                change24h: p.change24h,
            })),
        }))
        .sort((a, b) => b.totalTvl - a.totalTvl);

    return {
        totalTvl,
        solPrice,
        categories,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get DEX volume data
 */
export async function getDexData() {
    const dexOverview = await fetchDexOverview();

    const dexes = dexOverview.protocols
        .filter(p => p.total24h > 0)
        .sort((a, b) => b.total24h - a.total24h)
        .slice(0, 20)
        .map(p => ({
            name: p.name,
            displayName: p.displayName,
            total24h: p.total24h,
            total7d: p.total7d,
            change_1d: p.change_1d,
            change_7d: p.change_7d,
        }));

    return {
        totalVolume24h: dexOverview.totalVolume24h,
        dexes,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get protocols for treemap visualization
 */
export async function getTreemapData(limit: number = 50) {
    const solanaData = await getSolanaProtocols();

    const protocols = solanaData.protocols.slice(0, limit).map(p => ({
        name: p.name,
        value: p.tvl,
        change24h: p.change24h,
        category: p.category,
    }));

    const totalTvl = protocols.reduce((sum, p) => sum + p.value, 0);

    return {
        protocols,
        totalTvl,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats() {
    return serverCache.stats();
}
