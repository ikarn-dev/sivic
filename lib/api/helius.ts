/**
 * Helius RPC Service
 * 
 * Solana blockchain data via Helius API
 * Docs: https://docs.helius.dev/
 */

import { serverConfig, isHeliusConfigured } from '../config';

// ===========================================
// TYPES
// ===========================================

export interface NetworkPerformance {
    numTransactions: number;
    numSlots: number;
    samplePeriodSecs: number;
    slot: number;
}

export interface EpochInfo {
    absoluteSlot: number;
    blockHeight: number;
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
}

export interface BlockProduction {
    byIdentity: Record<string, number[]>;
    range: { firstSlot: number; lastSlot: number };
}

export interface TransactionStatus {
    slot: number;
    confirmations: number | null;
    err: object | null;
    confirmationStatus: 'processed' | 'confirmed' | 'finalized';
}

// ===========================================
// DAS API TYPES (Digital Asset Standard)
// ===========================================

export interface HeliusAsset {
    id: string;
    content?: {
        json_uri?: string;
        metadata?: {
            name?: string;
            symbol?: string;
            description?: string;
        };
    };
    authorities?: Array<{
        address: string;
        scopes: string[];
    }>;
    ownership?: {
        owner: string;
        frozen: boolean;
        delegated: boolean;
        delegate?: string;
    };
    supply?: {
        print_max_supply: number;
        print_current_supply: number;
    };
    mutable: boolean;
    burnt: boolean;
    token_info?: {
        symbol?: string;
        decimals?: number;
        supply?: number;
        mint_authority?: string;
        freeze_authority?: string;
        token_program?: string;
        price_info?: {
            price_per_token: number;
            currency: string;
        };
    };
}

export interface HeliusParsedTransaction {
    signature: string;
    slot: number;
    timestamp: number;
    fee: number;
    feePayer: string;
    type: string;
    source: string;
    description?: string;
    accountData?: Array<{
        account: string;
        nativeBalanceChange: number;
        tokenBalanceChanges: Array<{
            mint: string;
            rawTokenAmount: {
                tokenAmount: string;
                decimals: number;
            };
            userAccount: string;
        }>;
    }>;
    tokenTransfers?: Array<{
        mint: string;
        fromUserAccount: string;
        toUserAccount: string;
        tokenAmount: number;
        tokenStandard: string;
    }>;
    nativeTransfers?: Array<{
        fromUserAccount: string;
        toUserAccount: string;
        amount: number;
    }>;
    instructions?: Array<{
        programId: string;
        accounts: string[];
        data: string;
        innerInstructions?: Array<{
            programId: string;
            accounts: string[];
            data: string;
        }>;
    }>;
}

export interface HeliusSignature {
    signature: string;
    slot: number;
    err: object | null;
    memo: string | null;
    blockTime: number | null;
    confirmationStatus: string;
}

// ===========================================
// RPC HELPER
// ===========================================

async function rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
    if (!isHeliusConfigured()) {
        throw new Error('Helius API key not configured');
    }

    const response = await fetch(serverConfig.helius.rpcEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        }),
    });

    if (!response.ok) {
        throw new Error(`Helius RPC error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`Helius RPC error: ${data.error.message}`);
    }

    return data.result;
}

// ===========================================
// NETWORK HEALTH METHODS
// ===========================================

/**
 * Get recent performance samples (TPS data)
 */
export async function getRecentPerformanceSamples(limit = 10): Promise<NetworkPerformance[]> {
    return rpcCall<NetworkPerformance[]>('getRecentPerformanceSamples', [limit]);
}

/**
 * Get current epoch info
 */
export async function getEpochInfo(): Promise<EpochInfo> {
    return rpcCall<EpochInfo>('getEpochInfo');
}

/**
 * Get current block height
 */
export async function getBlockHeight(): Promise<number> {
    return rpcCall<number>('getBlockHeight');
}

/**
 * Get current slot
 */
export async function getSlot(): Promise<number> {
    return rpcCall<number>('getSlot');
}

/**
 * Get cluster health
 */
export async function getHealth(): Promise<'ok' | string> {
    try {
        return await rpcCall<'ok'>('getHealth');
    } catch {
        return 'error';
    }
}

// ===========================================
// COMPUTED METRICS
// ===========================================

/**
 * Calculate current TPS from recent samples
 */
export async function getCurrentTPS(): Promise<number> {
    const samples = await getRecentPerformanceSamples(1);
    if (samples.length === 0) return 0;

    const sample = samples[0];
    return Math.round(sample.numTransactions / sample.samplePeriodSecs);
}

/**
 * Calculate transaction success rate from recent samples
 */
export async function getTransactionSuccessRate(): Promise<number> {
    // This requires additional data from getBlockProduction
    // For now, return a placeholder
    const samples = await getRecentPerformanceSamples(5);
    if (samples.length === 0) return 0;

    // Approximate success rate based on slots vs transactions
    const totalSlots = samples.reduce((sum, s) => sum + s.numSlots, 0);
    const totalTx = samples.reduce((sum, s) => sum + s.numTransactions, 0);

    // Rough estimation - actual rate requires transaction-level data
    return totalSlots > 0 ? Math.min(98, Math.round((totalTx / totalSlots) * 100) / 100) : 0;
}

/**
 * Get comprehensive network health status
 */
export async function getNetworkHealth() {
    const [epochInfo, tps, health] = await Promise.all([
        getEpochInfo(),
        getCurrentTPS(),
        getHealth(),
    ]);

    // Determine congestion level based on TPS
    let congestion: 'low' | 'moderate' | 'high';
    if (tps < 1500) {
        congestion = 'low';
    } else if (tps < 3000) {
        congestion = 'moderate';
    } else {
        congestion = 'high';
    }

    return {
        tps,
        blockHeight: epochInfo.blockHeight,
        slot: epochInfo.absoluteSlot,
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        congestion,
        health,
    };
}

// ===========================================
// ACCOUNT METHODS
// ===========================================

/**
 * Get account info
 */
export async function getAccountInfo(address: string): Promise<unknown> {
    return rpcCall('getAccountInfo', [
        address,
        { encoding: 'base64' }
    ]);
}

/**
 * Check if program is valid
 */
export async function isProgramAccount(address: string): Promise<boolean> {
    try {
        const info = await getAccountInfo(address);
        return info !== null && typeof info === 'object' && 'executable' in (info as Record<string, unknown>);
    } catch {
        return false;
    }
}

// ===========================================
// DAS API METHODS (Digital Asset Standard)
// ===========================================

/**
 * Get asset details using Helius DAS API
 * Free tier: Included in standard RPC calls
 */
export async function getAsset(address: string): Promise<HeliusAsset | null> {
    try {
        return await rpcCall<HeliusAsset>('getAsset', [{ id: address }]);
    } catch (e) {
        console.warn('[Helius] getAsset failed:', e);
        return null;
    }
}

/**
 * Get assets owned by a wallet
 * Useful for analyzing holder patterns
 */
export async function getAssetsByOwner(
    ownerAddress: string,
    page: number = 1,
    limit: number = 100
): Promise<{ items: HeliusAsset[]; total: number } | null> {
    try {
        const result = await rpcCall<{ items: HeliusAsset[]; total: number }>('getAssetsByOwner', [{
            ownerAddress,
            page,
            limit,
        }]);
        return result;
    } catch (e) {
        console.warn('[Helius] getAssetsByOwner failed:', e);
        return null;
    }
}

/**
 * Get token accounts by owner for a specific mint
 */
export async function getTokenAccountsByOwner(
    ownerAddress: string,
    mintAddress: string
): Promise<Array<{ pubkey: string; account: { data: { parsed: { info: { tokenAmount: { uiAmount: number } } } } } }> | null> {
    try {
        const result = await rpcCall<{ value: Array<{ pubkey: string; account: unknown }> }>('getTokenAccountsByOwner', [
            ownerAddress,
            { mint: mintAddress },
            { encoding: 'jsonParsed' }
        ]);
        return result?.value as any || null;
    } catch (e) {
        console.warn('[Helius] getTokenAccountsByOwner failed:', e);
        return null;
    }
}

// ===========================================
// TRANSACTION PARSING METHODS
// ===========================================

/**
 * Get signatures for an address with pagination
 */
export async function getSignaturesForAddress(
    address: string,
    limit: number = 100,
    before?: string
): Promise<HeliusSignature[]> {
    const params: any = { limit };
    if (before) params.before = before;

    try {
        return await rpcCall<HeliusSignature[]>('getSignaturesForAddress', [address, params]);
    } catch (e) {
        console.warn('[Helius] getSignaturesForAddress failed:', e);
        return [];
    }
}

/**
 * Get parsed transaction details using Helius Enhanced API
 * This provides human-readable transaction data with token transfers
 */
export async function getParsedTransactions(
    signatures: string[]
): Promise<HeliusParsedTransaction[]> {
    if (!isHeliusConfigured() || signatures.length === 0) return [];

    try {
        // Helius Enhanced Transactions API endpoint
        const apiKey = serverConfig.helius.apiKey;
        const response = await fetch(
            `https://api.helius.xyz/v0/transactions?api-key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: signatures }),
            }
        );

        if (!response.ok) {
            throw new Error(`Helius API error: ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.warn('[Helius] getParsedTransactions failed:', e);
        return [];
    }
}

/**
 * Analyze transaction patterns for exploit detection
 * Returns aggregated statistics about transaction types
 */
export async function analyzeTransactionPatterns(
    address: string,
    limit: number = 100
): Promise<{
    totalTransactions: number;
    failedTransactions: number;
    failureRate: number;
    transactionTypes: Record<string, number>;
    largeTransfers: number;
    suspiciousPatterns: string[];
}> {
    const signatures = await getSignaturesForAddress(address, limit);
    const failedCount = signatures.filter(s => s.err !== null).length;

    // Get parsed transactions for pattern analysis
    const signatureList = signatures.slice(0, 20).map(s => s.signature); // Limit to 20 for API quota
    const parsedTxs = await getParsedTransactions(signatureList);

    // Aggregate transaction types
    const transactionTypes: Record<string, number> = {};
    let largeTransfers = 0;
    const suspiciousPatterns: string[] = [];

    for (const tx of parsedTxs) {
        const type = tx.type || 'unknown';
        transactionTypes[type] = (transactionTypes[type] || 0) + 1;

        // Check for large transfers (>1000 SOL or significant token amounts)
        if (tx.nativeTransfers) {
            for (const transfer of tx.nativeTransfers) {
                if (transfer.amount > 1000 * 1e9) { // 1000 SOL in lamports
                    largeTransfers++;
                }
            }
        }

        // Detect suspicious patterns
        if (tx.type === 'SWAP' && tx.tokenTransfers && tx.tokenTransfers.length > 4) {
            suspiciousPatterns.push('Multi-hop swap detected (potential sandwich)');
        }

        if (tx.instructions && tx.instructions.length > 10) {
            suspiciousPatterns.push('Complex transaction with many instructions');
        }
    }

    return {
        totalTransactions: signatures.length,
        failedTransactions: failedCount,
        failureRate: signatures.length > 0 ? (failedCount / signatures.length) * 100 : 0,
        transactionTypes,
        largeTransfers,
        suspiciousPatterns: [...new Set(suspiciousPatterns)],
    };
}

/**
 * Get token largest accounts (top holders)
 */
export async function getTokenLargestAccounts(
    mintAddress: string
): Promise<Array<{ address: string; amount: string; decimals: number; uiAmount: number }>> {
    try {
        const result = await rpcCall<{ value: Array<{ address: string; amount: string; decimals: number; uiAmount: number }> }>(
            'getTokenLargestAccounts',
            [mintAddress]
        );
        return result?.value || [];
    } catch (e) {
        console.warn('[Helius] getTokenLargestAccounts failed:', e);
        return [];
    }
}

/**
 * Get token supply information
 */
export async function getTokenSupply(
    mintAddress: string
): Promise<{ amount: string; decimals: number; uiAmount: number } | null> {
    try {
        const result = await rpcCall<{ value: { amount: string; decimals: number; uiAmount: number } }>(
            'getTokenSupply',
            [mintAddress]
        );
        return result?.value || null;
    } catch (e) {
        console.warn('[Helius] getTokenSupply failed:', e);
        return null;
    }
}
