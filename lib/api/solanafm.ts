/**
 * SolanaFM API Service
 * 
 * Additional on-chain data for token analysis
 * Docs: https://docs.solana.fm/
 * Free tier: 10 requests/second, 100k requests/month
 */

const SOLANAFM_BASE_URL = process.env.SOLANAFM_API_URL || 'https://api.solana.fm/v0';
const DEFAULT_TIMEOUT = 10000;

// ===========================================
// TYPES
// ===========================================

export interface SolanaFMTokenInfo {
    mint: string;
    name?: string;
    symbol?: string;
    decimals: number;
    supply: string;
    mintAuthority?: string;
    freezeAuthority?: string;
    isInitialized: boolean;
}

export interface SolanaFMHolder {
    owner: string;
    amount: string;
    decimals: number;
    percentage: number;
}

export interface SolanaFMTransfer {
    signature: string;
    timestamp: number;
    source: string;
    destination: string;
    amount: string;
    mint: string;
    success: boolean;
}

export interface SolanaFMAccountInfo {
    address: string;
    lamports: number;
    owner: string;
    executable: boolean;
    rentEpoch: number;
    data?: string;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

// ===========================================
// API FUNCTIONS
// ===========================================

/**
 * Get token information from SolanaFM
 */
export async function getTokenInfo(mintAddress: string): Promise<SolanaFMTokenInfo | null> {
    try {
        const response = await fetchWithTimeout(
            `${SOLANAFM_BASE_URL}/tokens/${mintAddress}`
        );

        if (!response.ok) {
            console.warn('[SolanaFM] getTokenInfo failed:', response.status);
            return null;
        }

        const data = await response.json();
        return data.result || null;
    } catch (e) {
        console.warn('[SolanaFM] getTokenInfo error:', e);
        return null;
    }
}

/**
 * Get top token holders
 * Useful for concentration analysis
 */
export async function getTokenHolders(
    mintAddress: string,
    limit: number = 20
): Promise<SolanaFMHolder[]> {
    try {
        const response = await fetchWithTimeout(
            `${SOLANAFM_BASE_URL}/tokens/${mintAddress}/holders?limit=${limit}`
        );

        if (!response.ok) {
            console.warn('[SolanaFM] getTokenHolders failed:', response.status);
            return [];
        }

        const data = await response.json();
        return data.result || [];
    } catch (e) {
        console.warn('[SolanaFM] getTokenHolders error:', e);
        return [];
    }
}

/**
 * Get recent token transfers
 * Useful for detecting unusual transfer patterns
 */
export async function getTokenTransfers(
    mintAddress: string,
    limit: number = 50
): Promise<SolanaFMTransfer[]> {
    try {
        const response = await fetchWithTimeout(
            `${SOLANAFM_BASE_URL}/tokens/${mintAddress}/transfers?limit=${limit}`
        );

        if (!response.ok) {
            console.warn('[SolanaFM] getTokenTransfers failed:', response.status);
            return [];
        }

        const data = await response.json();
        return data.result || [];
    } catch (e) {
        console.warn('[SolanaFM] getTokenTransfers error:', e);
        return [];
    }
}

/**
 * Get account information
 */
export async function getAccountInfo(address: string): Promise<SolanaFMAccountInfo | null> {
    try {
        const response = await fetchWithTimeout(
            `${SOLANAFM_BASE_URL}/accounts/${address}`
        );

        if (!response.ok) {
            console.warn('[SolanaFM] getAccountInfo failed:', response.status);
            return null;
        }

        const data = await response.json();
        return data.result || null;
    } catch (e) {
        console.warn('[SolanaFM] getAccountInfo error:', e);
        return null;
    }
}

/**
 * Analyze holder distribution for concentration analysis
 * Returns metrics useful for detecting rug pull risks
 */
export async function analyzeHolderDistribution(mintAddress: string): Promise<{
    topHolderPercent: number;
    top5HoldersPercent: number;
    top10HoldersPercent: number;
    holderCount: number;
    concentrationRisk: 'low' | 'medium' | 'high' | 'critical';
}> {
    const holders = await getTokenHolders(mintAddress, 20);

    if (holders.length === 0) {
        return {
            topHolderPercent: 0,
            top5HoldersPercent: 0,
            top10HoldersPercent: 0,
            holderCount: 0,
            concentrationRisk: 'low',
        };
    }

    const topHolderPercent = holders[0]?.percentage || 0;
    const top5HoldersPercent = holders.slice(0, 5).reduce((sum, h) => sum + h.percentage, 0);
    const top10HoldersPercent = holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);

    // Determine concentration risk
    let concentrationRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (topHolderPercent > 50) {
        concentrationRisk = 'critical';
    } else if (topHolderPercent > 25 || top5HoldersPercent > 70) {
        concentrationRisk = 'high';
    } else if (topHolderPercent > 10 || top5HoldersPercent > 50) {
        concentrationRisk = 'medium';
    }

    return {
        topHolderPercent,
        top5HoldersPercent,
        top10HoldersPercent,
        holderCount: holders.length,
        concentrationRisk,
    };
}

/**
 * Detect unusual transfer patterns
 * Returns flags for suspicious activity
 */
export async function detectTransferAnomalies(mintAddress: string): Promise<{
    recentTransferCount: number;
    uniqueSenders: number;
    uniqueReceivers: number;
    failedTransfers: number;
    largeTransfers: number;
    suspiciousPatterns: string[];
}> {
    const transfers = await getTokenTransfers(mintAddress, 100);

    const senders = new Set<string>();
    const receivers = new Set<string>();
    let failedTransfers = 0;
    let largeTransfers = 0;
    const suspiciousPatterns: string[] = [];

    // Analyze patterns
    const receiverCounts: Record<string, number> = {};

    for (const transfer of transfers) {
        senders.add(transfer.source);
        receivers.add(transfer.destination);

        if (!transfer.success) {
            failedTransfers++;
        }

        // Track receiver frequency
        receiverCounts[transfer.destination] = (receiverCounts[transfer.destination] || 0) + 1;

        // Detect large transfers (would need token decimals for accurate threshold)
        const amount = parseFloat(transfer.amount);
        if (amount > 1e9) {
            largeTransfers++;
        }
    }

    // Check for funneling pattern (many senders to few receivers)
    const uniqueReceivers = receivers.size;
    const uniqueSenders = senders.size;

    if (uniqueSenders > 10 && uniqueReceivers < 3) {
        suspiciousPatterns.push('Funneling pattern: Many senders to few receivers');
    }

    // Check for single receiver dominance
    const topReceiverCount = Math.max(...Object.values(receiverCounts));
    if (topReceiverCount > transfers.length * 0.5) {
        suspiciousPatterns.push('Single receiver dominance: >50% of transfers to one address');
    }

    // High failure rate
    if (transfers.length > 10 && failedTransfers / transfers.length > 0.2) {
        suspiciousPatterns.push('High transfer failure rate: >20% failed');
    }

    return {
        recentTransferCount: transfers.length,
        uniqueSenders,
        uniqueReceivers,
        failedTransfers,
        largeTransfers,
        suspiciousPatterns,
    };
}
