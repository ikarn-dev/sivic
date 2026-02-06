/**
 * On-Chain Analyzer - Comprehensive Solana data fetching
 * Fetches and analyzes all relevant on-chain data for exploit detection
 */

import { Severity } from './security-rules';
import { apiLogger } from './utils/logger';

// ============================================
// TYPES
// ============================================

export interface AnalysisStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    startTime?: number;
    endTime?: number;
    duration?: number;
    data?: any;
    error?: string;
}

export interface TokenAnalysisData {
    // Basic Info
    address: string;
    type: 'token' | 'program' | 'account' | 'unknown';

    // Mint Info (for tokens)
    decimals?: number;
    supply?: string;
    supplyFormatted?: number;

    // Authorities
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    closeAuthority?: string | null;

    // Token Metadata
    name?: string;
    symbol?: string;
    uri?: string;
    isMutable?: boolean;
    updateAuthority?: string;

    // Holder Analysis
    totalHolders?: number;
    topHolders?: Array<{
        address: string;
        amount: string;
        percentage: number;
        rank: number;
    }>;
    holderConcentration?: number; // % held by top 10

    // Transaction Analysis
    recentTxCount?: number;
    failedTxCount?: number;
    failedTxRate?: number;
    avgTxPerDay?: number;

    // Age & Activity
    createdAt?: string;
    ageInDays?: number;
    lastActivity?: string;

    // Program Info (for programs)
    programData?: string;
    upgradeAuthority?: string | null;
    isUpgradeable?: boolean;
    executableSize?: number;

    // Risk Indicators
    riskIndicators: RiskIndicator[];
}

export interface RiskIndicator {
    id: string;
    category: 'authority' | 'holder' | 'activity' | 'metadata' | 'program';
    name: string;
    severity: Severity;
    value: string;
    description: string;
    remediation?: string;
}

export interface AnalysisTimeline {
    steps: AnalysisStep[];
    totalDuration: number;
    startTime: number;
    endTime?: number;
}

// ============================================
// HELIUS RPC HELPER
// ============================================

function getHeliusRpcUrl(): string {
    const apiKey = process.env.HELIUS_API_KEY;
    const baseUrl = process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com';

    if (apiKey) {
        return `${baseUrl}/?api-key=${apiKey}`;
    }
    return process.env.PUBLICNODE_RPC_URL || 'https://solana-mainnet.publicnode.com';
}

const RPC_URL = getHeliusRpcUrl();

async function rpcCall(method: string, params: any[], timeoutMs: number = 10000): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method,
                params,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || 'RPC Error');
        }
        return data.result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`RPC call timed out after ${timeoutMs}ms`);
        }
        throw error;
    }
}

// ============================================
// DATA FETCHERS
// ============================================

export async function fetchAccountInfo(address: string): Promise<any> {
    const result = await rpcCall('getAccountInfo', [address, { encoding: 'jsonParsed' }]);
    return result?.value || null;
}

export async function fetchProgramAccounts(programId: string): Promise<any[]> {
    try {
        const result = await rpcCall('getProgramAccounts', [
            programId,
            { encoding: 'jsonParsed', dataSlice: { offset: 0, length: 0 } }
        ]);
        return result || [];
    } catch {
        return [];
    }
}

export async function fetchTokenSupply(mintAddress: string): Promise<any> {
    try {
        const result = await rpcCall('getTokenSupply', [mintAddress]);
        return result?.value || null;
    } catch {
        return null;
    }
}

export async function fetchTokenLargestAccounts(mintAddress: string): Promise<any[]> {
    try {
        const result = await rpcCall('getTokenLargestAccounts', [mintAddress]);
        return result?.value || [];
    } catch {
        return [];
    }
}

export async function fetchSignaturesForAddress(
    address: string,
    limit: number = 100
): Promise<any[]> {
    try {
        const result = await rpcCall('getSignaturesForAddress', [address, { limit }]);
        return result || [];
    } catch {
        return [];
    }
}

export async function fetchTokenMetadata(mintAddress: string): Promise<any> {
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://api.helius.xyz/v0/token-metadata?api-key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mintAccounts: [mintAddress],
                    includeOffChain: true,
                }),
            }
        );

        const data = await response.json();
        return data?.[0] || null;
    } catch {
        return null;
    }
}

export async function fetchAsset(address: string): Promise<any> {
    try {
        const result = await rpcCall('getAsset', [{ id: address }]);
        return result || null;
    } catch {
        return null;
    }
}

// ============================================
// COMPREHENSIVE ANALYZER
// ============================================

export async function analyzeAddress(address: string): Promise<{
    data: TokenAnalysisData;
    timeline: AnalysisTimeline;
}> {
    const timeline: AnalysisTimeline = {
        steps: [],
        totalDuration: 0,
        startTime: Date.now(),
    };

    const data: TokenAnalysisData = {
        address,
        type: 'unknown',
        riskIndicators: [],
    };

    // Helper to track steps
    const runStep = async <T>(
        id: string,
        name: string,
        fn: () => Promise<T>
    ): Promise<T | null> => {
        const step: AnalysisStep = {
            id,
            name,
            status: 'running',
            startTime: Date.now(),
        };
        timeline.steps.push(step);

        try {
            const result = await fn();
            step.status = 'complete';
            step.endTime = Date.now();
            step.duration = step.endTime - step.startTime!;
            step.data = result;
            return result;
        } catch (error) {
            step.status = 'error';
            step.endTime = Date.now();
            step.duration = step.endTime - step.startTime!;
            step.error = (error as Error).message;
            return null;
        }
    };

    // Step 1: Fetch Account Info
    const accountInfo = await runStep('account_info', 'Fetching Account Info', () =>
        fetchAccountInfo(address)
    );

    if (!accountInfo) {
        data.type = 'unknown';
        data.riskIndicators.push({
            id: 'account_not_found',
            category: 'metadata',
            name: 'Account Not Found',
            severity: 'high',
            value: 'N/A',
            description: 'Unable to fetch account data from blockchain',
        });

        timeline.endTime = Date.now();
        timeline.totalDuration = timeline.endTime - timeline.startTime;
        return { data, timeline };
    }

    const parsedType = accountInfo.data?.parsed?.type;
    const owner = accountInfo.owner;

    // BPF Loader variants for program detection
    const BPF_LOADERS = [
        'BPFLoaderUpgradeab1e11111111111111111111111',  // Upgradeable
        'BPFLoader2111111111111111111111111111111111',  // Immutable v2
        'BPFLoader1111111111111111111111111111111111',  // Immutable v1
    ];
    const isBpfLoader = BPF_LOADERS.includes(owner);

    // ========================================
    // TOKEN MINT ANALYSIS
    // ========================================
    if (parsedType === 'mint') {
        data.type = 'token';
        const mintInfo = accountInfo.data.parsed.info;

        // Basic mint info
        data.decimals = mintInfo.decimals;
        data.supply = mintInfo.supply;
        data.supplyFormatted = parseFloat(mintInfo.supply) / Math.pow(10, mintInfo.decimals);

        // Authorities
        data.mintAuthority = mintInfo.mintAuthority;
        data.freezeAuthority = mintInfo.freezeAuthority;

        // Check mint authority risk
        if (data.mintAuthority) {
            data.riskIndicators.push({
                id: 'active_mint_authority',
                category: 'authority',
                name: 'Active Mint Authority',
                severity: 'critical',
                value: data.mintAuthority,
                description: 'Token has an active mint authority that can create unlimited new tokens',
                remediation: 'Consider disabling mint authority to prevent inflation attacks',
            });
        } else {
            data.riskIndicators.push({
                id: 'mint_authority_disabled',
                category: 'authority',
                name: 'Mint Authority Disabled',
                severity: 'low',
                value: 'Disabled',
                description: 'No new tokens can be minted - supply is fixed',
            });
        }

        // Check freeze authority risk
        if (data.freezeAuthority) {
            data.riskIndicators.push({
                id: 'active_freeze_authority',
                category: 'authority',
                name: 'Active Freeze Authority',
                severity: 'high',
                value: data.freezeAuthority,
                description: 'Token accounts can be frozen, preventing transfers',
                remediation: 'Consider disabling freeze authority if not needed',
            });
        }

        // Step 2: Fetch Token Metadata
        const metadata = await runStep('token_metadata', 'Fetching Token Metadata', () =>
            fetchTokenMetadata(address)
        );

        if (metadata) {
            data.name = metadata.onChainMetadata?.metadata?.data?.name?.trim() ||
                metadata.legacyMetadata?.name ||
                'Unknown';
            data.symbol = metadata.onChainMetadata?.metadata?.data?.symbol?.trim() ||
                metadata.legacyMetadata?.symbol ||
                'UNKNOWN';
            data.uri = metadata.onChainMetadata?.metadata?.data?.uri ||
                metadata.legacyMetadata?.uri;
            data.isMutable = metadata.onChainMetadata?.metadata?.isMutable ?? true;
            data.updateAuthority = metadata.onChainMetadata?.metadata?.updateAuthority;

            if (data.isMutable) {
                data.riskIndicators.push({
                    id: 'mutable_metadata',
                    category: 'metadata',
                    name: 'Mutable Metadata',
                    severity: 'medium',
                    value: 'True',
                    description: 'Token metadata can be changed by the update authority',
                    remediation: 'Consider making metadata immutable for transparency',
                });
            }
        }

        // Step 3: Fetch Largest Holders
        const holders = await runStep('largest_holders', 'Fetching Largest Holders', () =>
            fetchTokenLargestAccounts(address)
        );

        if (holders && holders.length > 0) {
            const totalSupply = data.supplyFormatted || 1;

            data.topHolders = holders.slice(0, 10).map((h: any, i: number) => {
                const amount = parseFloat(h.amount) / Math.pow(10, data.decimals || 0);
                return {
                    address: h.address,
                    amount: h.amount,
                    percentage: (amount / totalSupply) * 100,
                    rank: i + 1,
                };
            });

            data.totalHolders = holders.length;
            data.holderConcentration = data.topHolders.reduce((sum, h) => sum + h.percentage, 0);

            // Check holder concentration
            const topHolder = data.topHolders[0];
            if (topHolder && topHolder.percentage > 50) {
                data.riskIndicators.push({
                    id: 'high_concentration',
                    category: 'holder',
                    name: 'Extremely High Holder Concentration',
                    severity: 'critical',
                    value: `${topHolder.percentage.toFixed(1)}%`,
                    description: `Single address holds ${topHolder.percentage.toFixed(1)}% of total supply`,
                    remediation: 'High concentration indicates potential rug pull risk',
                });
            } else if (topHolder && topHolder.percentage > 25) {
                data.riskIndicators.push({
                    id: 'moderate_concentration',
                    category: 'holder',
                    name: 'High Holder Concentration',
                    severity: 'high',
                    value: `${topHolder.percentage.toFixed(1)}%`,
                    description: `Top holder has ${topHolder.percentage.toFixed(1)}% of supply`,
                    remediation: 'Monitor for large sell-offs',
                });
            } else if (data.holderConcentration > 80) {
                data.riskIndicators.push({
                    id: 'top10_concentration',
                    category: 'holder',
                    name: 'Top 10 Hold Majority',
                    severity: 'medium',
                    value: `${data.holderConcentration.toFixed(1)}%`,
                    description: `Top 10 holders control ${data.holderConcentration.toFixed(1)}% of supply`,
                });
            }
        }

        // Step 4: Fetch Recent Transactions
        const signatures = await runStep('recent_transactions', 'Fetching Recent Transactions', () =>
            fetchSignaturesForAddress(address, 100)
        );

        if (signatures && signatures.length > 0) {
            data.recentTxCount = signatures.length;
            data.failedTxCount = signatures.filter((s: any) => s.err !== null).length;
            data.failedTxRate = (data.failedTxCount / data.recentTxCount) * 100;

            // Calculate age from oldest transaction
            const oldestTx = signatures[signatures.length - 1];
            if (oldestTx?.blockTime) {
                const oldestDate = new Date(oldestTx.blockTime * 1000);
                data.ageInDays = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
            }

            // Get last activity
            const newestTx = signatures[0];
            if (newestTx?.blockTime) {
                data.lastActivity = new Date(newestTx.blockTime * 1000).toISOString();
            }

            if (data.failedTxRate > 30) {
                data.riskIndicators.push({
                    id: 'high_failure_rate',
                    category: 'activity',
                    name: 'High Transaction Failure Rate',
                    severity: 'medium',
                    value: `${data.failedTxRate.toFixed(1)}%`,
                    description: 'Many recent transactions are failing',
                    remediation: 'May indicate issues with the contract or attack attempts',
                });
            }

            if (data.ageInDays !== undefined && data.ageInDays < 7) {
                data.riskIndicators.push({
                    id: 'new_token',
                    category: 'activity',
                    name: 'New Token',
                    severity: 'medium',
                    value: `${data.ageInDays} days`,
                    description: `Token is only ${data.ageInDays} days old`,
                    remediation: 'New tokens carry higher risk - do thorough research',
                });
            }
        }
    }
    // ========================================
    // PROGRAM ANALYSIS
    // ========================================
    // Check for all BPF loader variants (upgradeable and immutable)
    else if (parsedType === 'program' || isBpfLoader || accountInfo.executable) {
        data.type = 'program';
        const programInfo = accountInfo.data?.parsed?.info;

        data.programData = programInfo?.programData;

        console.log(`[Analyzer] Program detected, data account: ${data.programData}`);

        // Step 2: Fetch Program Data Account (contains upgrade authority)
        if (data.programData) {
            const programDataInfo = await runStep('program_data', 'Fetching Program Data', () =>
                fetchAccountInfo(data.programData!)
            );

            if (programDataInfo) {
                const pdInfo = programDataInfo.data?.parsed?.info;
                data.upgradeAuthority = pdInfo?.authority || null;
                data.isUpgradeable = data.upgradeAuthority !== null;

                if (data.isUpgradeable && data.upgradeAuthority) {
                    data.riskIndicators.push({
                        id: 'upgradeable_program',
                        category: 'program',
                        name: 'Upgradeable Program',
                        severity: 'high',
                        value: data.upgradeAuthority,
                        description: 'Program can be modified by the upgrade authority',
                        remediation: 'Verify the upgrade authority is a multisig or DAO',
                    });
                } else {
                    data.riskIndicators.push({
                        id: 'immutable_program',
                        category: 'program',
                        name: 'Immutable Program',
                        severity: 'low',
                        value: 'Immutable',
                        description: 'Program cannot be upgraded - code is fixed',
                    });
                }
            }
        }

        // Step 3: Fetch Recent Program Usage
        const signatures = await runStep('program_usage', 'Fetching Program Usage', () =>
            fetchSignaturesForAddress(address, 100)
        );

        if (signatures && signatures.length > 0) {
            data.recentTxCount = signatures.length;
            data.failedTxCount = signatures.filter((s: any) => s.err !== null).length;
            data.failedTxRate = (data.failedTxCount / data.recentTxCount) * 100;

            const newestTx = signatures[0];
            if (newestTx?.blockTime) {
                data.lastActivity = new Date(newestTx.blockTime * 1000).toISOString();
            }

            console.log(`[Analyzer] Program usage: ${data.recentTxCount} recent tx`);
            console.log(`[Analyzer] Failure rate: ${data.failedTxRate.toFixed(1)}%`);

            if (data.failedTxRate > 30) {
                data.riskIndicators.push({
                    id: 'program_high_failure',
                    category: 'activity',
                    name: 'High Failure Rate',
                    severity: 'medium',
                    value: `${data.failedTxRate.toFixed(1)}%`,
                    description: 'Many program invocations are failing',
                });
            }

            if (data.recentTxCount < 10) {
                data.riskIndicators.push({
                    id: 'low_usage',
                    category: 'activity',
                    name: 'Low Usage',
                    severity: 'medium',
                    value: `${data.recentTxCount} tx`,
                    description: 'Program has very low recent usage',
                    remediation: 'May indicate an inactive or new program',
                });
            }
        }
    }
    // ========================================
    // REGULAR ACCOUNT ANALYSIS
    // ========================================
    else {
        data.type = 'account';

        data.riskIndicators.push({
            id: 'regular_account',
            category: 'metadata',
            name: 'Regular Account',
            severity: 'low',
            value: parsedType || 'unknown',
            description: 'This is a regular account, not a token or program',
        });
    }

    // Finalize timeline
    timeline.endTime = Date.now();
    timeline.totalDuration = timeline.endTime - timeline.startTime;

    return { data, timeline };
}

// ============================================
// RISK SCORING
// ============================================

export function calculateRiskScore(data: TokenAnalysisData): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
    let score = 0;
    let hasCritical = false;
    let hasHigh = false;

    for (const indicator of data.riskIndicators) {
        switch (indicator.severity) {
            case 'critical': 
                score += 30; 
                hasCritical = true;
                break;
            case 'high': 
                score += 20; 
                hasHigh = true;
                break;
            case 'medium': score += 10; break;
            case 'low': score += 2; break;
        }
    }

    score = Math.min(score, 100);

    // Improved grading logic - any critical or high risk drops grade significantly
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (hasCritical) {
        grade = 'F'; // Any critical vulnerability = F grade
    } else if (hasHigh) {
        grade = 'D'; // Any high risk = D grade
    } else if (score <= 10) {
        grade = 'A';
    } else if (score <= 25) {
        grade = 'B';
    } else if (score <= 50) {
        grade = 'C';
    } else {
        grade = 'D';
    }

    return { score, grade };
}
