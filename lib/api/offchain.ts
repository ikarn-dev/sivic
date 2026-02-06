/**
 * Off-Chain Data APIs for Exploit Detection
 * 
 * Provides access to security databases, audit info, and external data sources
 * All APIs use free tiers with no authentication required
 */

// ===========================================
// DIA ORACLE API - Cross-DEX Price Feeds
// ===========================================

const DIA_BASE_URL = process.env.DIA_API_URL || 'https://api.diadata.org/v1';

export interface DIAPriceData {
    Symbol: string;
    Name: string;
    Price: number;
    PriceYesterday: number;
    VolumeYesterdayUSD: number;
    Time: string;
    Source: string;
}

/**
 * Get token price from DIA Oracle (alternative price source)
 * Free tier: No auth required
 */
export async function getDIAPrice(symbol: string): Promise<DIAPriceData | null> {
    try {
        const response = await fetch(`${DIA_BASE_URL}/quotation/${symbol}`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get Solana price from DIA for oracle deviation checks
 */
export async function getSolanaDIAPrice(): Promise<number | null> {
    const data = await getDIAPrice('SOL');
    return data?.Price || null;
}

// ===========================================
// DEFILLAMA AUDITS - Protocol Security Data
// ===========================================

const DEFILLAMA_BASE = process.env.DEFILLAMA_API_URL || 'https://api.llama.fi';

export interface ProtocolAudit {
    name: string;
    auditor: string;
    date: string;
    link?: string;
}

export interface ProtocolTVL {
    id: string;
    name: string;
    symbol: string;
    tvl: number;
    chainTvls: Record<string, number>;
    change_1h: number;
    change_1d: number;
    change_7d: number;
    audits?: string;
    audit_links?: string[];
}

/**
 * Get protocol data including audit info from DeFiLlama
 */
export async function getProtocolAuditInfo(protocolSlug: string): Promise<{
    tvl: number;
    audits: number;
    auditLinks: string[];
    change24h: number;
} | null> {
    try {
        const response = await fetch(`${DEFILLAMA_BASE}/protocol/${protocolSlug}`);
        if (!response.ok) return null;

        const data = await response.json();
        return {
            tvl: data.tvl || 0,
            audits: parseInt(data.audits) || 0,
            auditLinks: data.audit_links || [],
            change24h: data.change_1d || 0,
        };
    } catch {
        return null;
    }
}

/**
 * Get list of hacked protocols from DeFiLlama
 * Useful for checking if a protocol has been exploited before
 */
export async function getHackedProtocols(): Promise<Array<{
    name: string;
    amount: number;
    date: string;
    chain: string;
    technique: string;
}>> {
    try {
        const response = await fetch(`${DEFILLAMA_BASE}/hacks`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.map((hack: any) => ({
            name: hack.name || '',
            amount: hack.amount || 0,
            date: hack.date || '',
            chain: hack.chain || '',
            technique: hack.technique || '',
        }));
    } catch {
        return [];
    }
}

// ===========================================
// RUGCHECK API - Token Safety Scoring
// ===========================================

const RUGCHECK_BASE = process.env.RUGCHECK_API_URL || 'https://api.rugcheck.xyz/v1';

export interface RugCheckReport {
    mint: string;
    score: number;
    risks: Array<{
        name: string;
        description: string;
        level: 'info' | 'warning' | 'danger';
        score: number;
    }>;
    tokenMeta?: {
        name: string;
        symbol: string;
    };
}

/**
 * Get RugCheck safety report for a Solana token
 * Free API - No auth required
 */
export async function getRugCheckReport(mintAddress: string): Promise<RugCheckReport | null> {
    try {
        const response = await fetch(`${RUGCHECK_BASE}/tokens/${mintAddress}/report`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Get RugCheck summary score
 */
export async function getRugCheckScore(mintAddress: string): Promise<{
    score: number;
    riskLevel: 'safe' | 'caution' | 'danger' | 'unknown';
    riskCount: number;
} | null> {
    const report = await getRugCheckReport(mintAddress);
    if (!report) return null;

    let riskLevel: 'safe' | 'caution' | 'danger' | 'unknown' = 'unknown';
    if (report.score >= 80) riskLevel = 'safe';
    else if (report.score >= 50) riskLevel = 'caution';
    else riskLevel = 'danger';

    return {
        score: report.score,
        riskLevel,
        riskCount: report.risks?.length || 0,
    };
}

// ===========================================
// JITO MEV DATA - Bundle and Tip Analysis
// ===========================================

const JITO_EXPLORER_BASE = 'https://explorer.jito.wtf/api';

export interface JitoBundle {
    bundleId: string;
    slot: number;
    timestamp: number;
    transactions: string[];
    tip: number;
    landedTipLamports: number;
}

/**
 * Get recent Jito bundles for MEV analysis
 * Note: This is a public explorer API
 */
export async function getRecentJitoBundles(limit: number = 20): Promise<JitoBundle[]> {
    try {
        const response = await fetch(`${JITO_EXPLORER_BASE}/bundles?limit=${limit}`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.bundles || [];
    } catch {
        return [];
    }
}

/**
 * Check if a transaction is part of a Jito bundle (MEV activity)
 */
export async function checkTransactionInBundle(signature: string): Promise<{
    isBundle: boolean;
    tip?: number;
    bundleId?: string;
} | null> {
    try {
        const response = await fetch(`${JITO_EXPLORER_BASE}/transaction/${signature}`);
        if (!response.ok) return { isBundle: false };

        const data = await response.json();
        if (data.bundleId) {
            return {
                isBundle: true,
                tip: data.tip || 0,
                bundleId: data.bundleId,
            };
        }
        return { isBundle: false };
    } catch {
        return null;
    }
}

// ===========================================
// SOLANA COMPASS - Validator & MEV Metrics
// ===========================================

/**
 * Note: Solana Compass doesn't have a public API
 * These metrics would need to be scraped or use alternative sources
 * Using Helius/Solana RPC for validator data instead
 */

// ===========================================
// KNOWN SCAM/DRAINER DATABASES
// ===========================================

// Static list of known drainer addresses (would be updated from external sources)
const KNOWN_DRAINER_ADDRESSES: Set<string> = new Set([
    // Add known drainer addresses here
    'DRAiNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxKEY',
]);

const KNOWN_RUG_PULL_CREATORS: Set<string> = new Set([
    // Add known rug pull creators here
]);

/**
 * Check if address is a known drainer
 */
export function isKnownDrainer(address: string): boolean {
    return KNOWN_DRAINER_ADDRESSES.has(address);
}

/**
 * Check if creator is associated with rug pulls
 */
export function isKnownRugPullCreator(address: string): boolean {
    return KNOWN_RUG_PULL_CREATORS.has(address);
}

// ===========================================
// AGGREGATE SECURITY CHECK
// ===========================================

export interface OffChainSecurityReport {
    rugCheckScore: number | null;
    rugCheckRiskLevel: string;
    hasAudits: boolean;
    auditCount: number;
    wasHacked: boolean;
    hackDetails?: { amount: number; date: string; technique: string };
    isKnownDrainer: boolean;
    oracleDeviation: number | null;
    mevActivity: boolean;
}

/**
 * Aggregate off-chain security check combining multiple sources
 */
export async function getOffChainSecurityReport(
    tokenAddress: string,
    creatorAddress?: string,
    protocolSlug?: string
): Promise<OffChainSecurityReport> {
    const [rugCheck, auditInfo, hackedList] = await Promise.all([
        getRugCheckScore(tokenAddress),
        protocolSlug ? getProtocolAuditInfo(protocolSlug) : null,
        getHackedProtocols(),
    ]);

    // Check if protocol was hacked
    const hackInfo = protocolSlug
        ? hackedList.find(h => h.name.toLowerCase().includes(protocolSlug.toLowerCase()))
        : null;

    return {
        rugCheckScore: rugCheck?.score || null,
        rugCheckRiskLevel: rugCheck?.riskLevel || 'unknown',
        hasAudits: (auditInfo?.audits || 0) > 0,
        auditCount: auditInfo?.audits || 0,
        wasHacked: !!hackInfo,
        hackDetails: hackInfo ? {
            amount: hackInfo.amount,
            date: hackInfo.date,
            technique: hackInfo.technique,
        } : undefined,
        isKnownDrainer: creatorAddress ? isKnownDrainer(creatorAddress) : false,
        oracleDeviation: null, // Would need token-specific oracle comparison
        mevActivity: false, // Would need transaction-level analysis
    };
}
