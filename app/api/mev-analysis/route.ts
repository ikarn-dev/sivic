/**
 * MEV Analysis API Route
 * 
 * Analyzes a Solana transaction for MEV (Maximal Extractable Value) risks.
 * Fetches actual on-chain transaction data from Helius for real analysis.
 * 
 * POST /api/mev-analysis
 * Body: { transaction: string } - Transaction signature or raw transaction data
 */

import { NextRequest, NextResponse } from 'next/server';
import { serverConfig, isHeliusConfigured } from '@/lib/config';

// Known DEX program IDs
const DEX_PROGRAMS = {
    JUPITER_V6: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    JUPITER_V4: 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
    RAYDIUM_AMM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    RAYDIUM_CLMM: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
    ORCA_WHIRLPOOL: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    METEORA: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
    LIFINITY: 'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S',
};

// Types for transaction data
interface TransactionData {
    signature: string;
    slot: number;
    blockTime: number | null;
    fee: number;
    success: boolean;
    programs: string[];
    accountKeys: string[];
    innerInstructionsCount: number;
    logMessages: string[];
}

// Types for MEV analysis response
interface MEVRiskAssessment {
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: {
        type: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }[];
    recommendations: string[];
    transactionType: string;
    estimatedValue?: string;
    analyzedAt: string;
    // On-chain data used for analysis
    onChainData: {
        fetched: boolean;
        signature?: string;
        slot?: number;
        fee?: number;
        programsDetected: string[];
        isDexTransaction: boolean;
        innerInstructionsCount?: number;
    };
}

interface ErrorResponse {
    error: string;
    message: string;
}

/**
 * Fetch transaction data from Helius RPC
 */
async function fetchTransactionData(signature: string): Promise<TransactionData | null> {
    if (!isHeliusConfigured()) {
        console.log('[MEV-Analysis] Helius not configured, skipping on-chain fetch');
        return null;
    }

    try {
        console.log('[MEV-Analysis] Fetching on-chain data for:', signature);

        const response = await fetch(serverConfig.helius.rpcEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                    signature,
                    {
                        maxSupportedTransactionVersion: 0,
                        encoding: 'jsonParsed',
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.log('[MEV-Analysis] RPC error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.error || !data.result) {
            console.log('[MEV-Analysis] Transaction not found or error:', data.error?.message || 'Not found');
            return null;
        }

        const tx = data.result;
        const accountKeys = tx.transaction?.message?.accountKeys?.map((k: { pubkey: string }) => k.pubkey) || [];
        const programs = accountKeys.filter((key: string) => Object.values(DEX_PROGRAMS).includes(key));

        // Extract log messages
        const logMessages = tx.meta?.logMessages || [];

        const txData: TransactionData = {
            signature,
            slot: tx.slot,
            blockTime: tx.blockTime,
            fee: tx.meta?.fee || 0,
            success: tx.meta?.err === null,
            programs,
            accountKeys,
            innerInstructionsCount: tx.meta?.innerInstructions?.length || 0,
            logMessages,
        };

        console.log('[MEV-Analysis] On-chain data fetched:', {
            slot: txData.slot,
            fee: txData.fee,
            programs: txData.programs.length,
            innerInstructions: txData.innerInstructionsCount,
            success: txData.success,
        });

        return txData;
    } catch (error) {
        console.error('[MEV-Analysis] Error fetching transaction:', error);
        return null;
    }
}

/**
 * Detect DEX from program IDs
 */
function detectDex(programs: string[]): string[] {
    const detected: string[] = [];

    for (const program of programs) {
        if (program === DEX_PROGRAMS.JUPITER_V6 || program === DEX_PROGRAMS.JUPITER_V4) {
            detected.push('Jupiter');
        } else if (program === DEX_PROGRAMS.RAYDIUM_AMM || program === DEX_PROGRAMS.RAYDIUM_CLMM) {
            detected.push('Raydium');
        } else if (program === DEX_PROGRAMS.ORCA_WHIRLPOOL) {
            detected.push('Orca');
        } else if (program === DEX_PROGRAMS.METEORA) {
            detected.push('Meteora');
        } else if (program === DEX_PROGRAMS.LIFINITY) {
            detected.push('Lifinity');
        }
    }

    return [...new Set(detected)];
}

/**
 * Analyze transaction for MEV risks
 */
async function analyzeMEVRisk(transaction: string): Promise<MEVRiskAssessment> {
    const isSignature = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/.test(transaction.trim());
    const hasSwapKeywords = /swap|jupiter|raydium|orca|serum/i.test(transaction);

    let riskScore = 10; // Base score
    const threats: MEVRiskAssessment['threats'] = [];
    const recommendations: string[] = [];
    let transactionType = 'unknown';

    // Initialize on-chain data result
    const onChainData: MEVRiskAssessment['onChainData'] = {
        fetched: false,
        programsDetected: [],
        isDexTransaction: false,
    };

    // If it's a transaction signature, fetch actual on-chain data
    if (isSignature) {
        const txData = await fetchTransactionData(transaction.trim());

        if (txData) {
            onChainData.fetched = true;
            onChainData.signature = txData.signature;
            onChainData.slot = txData.slot;
            onChainData.fee = txData.fee;
            onChainData.innerInstructionsCount = txData.innerInstructionsCount;

            // Detect DEX programs
            const detectedDexes = detectDex(txData.programs);
            onChainData.programsDetected = detectedDexes;
            onChainData.isDexTransaction = detectedDexes.length > 0;

            // Analyze based on real data
            if (onChainData.isDexTransaction) {
                transactionType = 'swap';
                riskScore += 30;

                threats.push({
                    type: 'dex_swap',
                    severity: 'medium',
                    description: `DEX swap detected via ${detectedDexes.join(', ')} - common MEV target`,
                });

                // High fee indicates priority/MEV competition
                if (txData.fee > 10000) { // > 0.00001 SOL
                    riskScore += 15;
                    threats.push({
                        type: 'high_priority_fee',
                        severity: 'medium',
                        description: `High priority fee (${(txData.fee / 1e9).toFixed(6)} SOL) suggests MEV competition`,
                    });
                }

                // Many inner instructions = complex swap = more MEV opportunities
                if (txData.innerInstructionsCount > 5) {
                    riskScore += 15;
                    threats.push({
                        type: 'complex_swap',
                        severity: 'medium',
                        description: `Complex transaction with ${txData.innerInstructionsCount} inner instructions - multi-hop swap increases MEV risk`,
                    });
                }

                recommendations.push('Use private RPC endpoints for future transactions');
                recommendations.push('Consider using Jito bundles for MEV protection');
                recommendations.push('Set slippage to 0.5-1% for better protection');
            } else {
                transactionType = 'transfer';
                recommendations.push('Non-DEX transaction - lower MEV risk');
            }

            // Transaction failed - possible MEV interference
            if (!txData.success) {
                riskScore += 20;
                threats.push({
                    type: 'transaction_failed',
                    severity: 'high',
                    description: 'Transaction failed - possible MEV bot interference or slippage exceeded',
                });
            }

        } else {
            // Couldn't fetch - use heuristic analysis
            transactionType = 'signature';
            recommendations.push('Could not fetch on-chain data - using heuristic analysis');
        }
    }

    // Fallback heuristic analysis for non-signatures
    if (!onChainData.fetched) {
        if (hasSwapKeywords) {
            transactionType = 'swap_data';
            riskScore += 25;
            onChainData.isDexTransaction = true;

            threats.push({
                type: 'swap_keywords',
                severity: 'medium',
                description: 'DEX swap keywords detected in transaction data',
            });
        }

        if (transaction.length > 500) {
            riskScore += 10;
            threats.push({
                type: 'complex_data',
                severity: 'low',
                description: 'Complex transaction data detected',
            });
        }
    }

    // No threats found
    if (threats.length === 0) {
        threats.push({
            type: 'none',
            severity: 'low',
            description: 'No MEV threats detected based on analysis',
        });
        recommendations.push('Standard precautions apply');
    }

    // Clamp score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine risk level
    let riskLevel: MEVRiskAssessment['riskLevel'] = 'low';
    if (riskScore >= 76) riskLevel = 'critical';
    else if (riskScore >= 51) riskLevel = 'high';
    else if (riskScore >= 26) riskLevel = 'medium';

    return {
        riskScore,
        riskLevel,
        threats,
        recommendations,
        transactionType,
        analyzedAt: new Date().toISOString(),
        onChainData,
    };
}

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse<MEVRiskAssessment | ErrorResponse>> {
    try {
        const body = await request.json();
        const { transaction } = body;

        if (!transaction || typeof transaction !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request', message: 'Transaction data is required' },
                { status: 400 }
            );
        }

        if (transaction.trim().length < 10) {
            return NextResponse.json(
                { error: 'Invalid transaction', message: 'Transaction data is too short' },
                { status: 400 }
            );
        }

        console.log('[MEV-Analysis] Analyzing transaction:', transaction.substring(0, 50) + '...');

        const analysis = await analyzeMEVRisk(transaction.trim());

        console.log('[MEV-Analysis] Analysis complete:', {
            riskScore: analysis.riskScore,
            riskLevel: analysis.riskLevel,
            threatCount: analysis.threats.length,
            onChainDataFetched: analysis.onChainData.fetched,
            programsDetected: analysis.onChainData.programsDetected,
        });

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('[MEV-Analysis] Request error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', message: 'Failed to analyze transaction' },
            { status: 500 }
        );
    }
}

// GET handler for health check
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/mev-analysis',
        method: 'POST',
        features: ['on-chain-fetch', 'dex-detection', 'heuristic-fallback'],
        message: 'Fetches real on-chain data for transaction signatures',
    });
}
