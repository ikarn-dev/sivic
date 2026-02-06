/**
 * Streaming Contract Analysis API Route (V2)
 * 
 * Uses separated Token and DEX detection engines with 31 params each.
 * Streams analysis steps in real-time via Server-Sent Events.
 * 
 * Detection Mode:
 * - Token (mint account): 18 on-chain + 13 off-chain params
 * - DEX (program account): 19 on-chain + 12 off-chain params
 */

import { NextRequest } from 'next/server';
import { TokenDetector } from '@/lib/detection/token-detector';
import { DexDetector } from '@/lib/detection/dex-detector';
import * as birdeye from '@/lib/api/birdeye';
// AI Client removed (Client-side Puter.js used instead)

// ===========================================
// RPC CONFIGURATION
// ===========================================

function getHeliusRpcUrl(): string {
    const apiKey = process.env.HELIUS_API_KEY;
    const baseUrl = process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com';
    if (apiKey) {
        return `${baseUrl}/?api-key=${apiKey}`;
    }
    return process.env.PUBLICNODE_RPC_URL || 'https://solana-mainnet.publicnode.com';
}

const RPC_URL = getHeliusRpcUrl();

async function rpcCall(method: string, params: any[]): Promise<any> {
    console.log(`[Analyze] RPC: ${method}`);
    const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const data = await response.json();
    if (data.error) {
        console.error(`[Analyze] RPC Error (${method}):`, data.error.message);
        throw new Error(data.error.message || 'RPC Error');
    }
    return data.result;
}

// ===========================================
// TYPES
// ===========================================

interface StreamEvent {
    type: 'step_start' | 'step_complete' | 'step_error' | 'step_update' | 'data_update' | 'complete';
    stepId?: string;
    stepName?: string;
    duration?: number;
    data?: any;
    error?: string;
    paramsChecked?: number;
    paramsTriggered?: number;
    detectionMode?: 'token' | 'dex';
    aiAnalysis?: any;
}

// ===========================================
// MAIN HANDLER
// ===========================================

export async function GET(request: NextRequest) {
    const address = request.nextUrl.searchParams.get('address');
    console.log('[Analyze V2] Starting separated detection for:', address);

    if (!address) {
        return new Response(JSON.stringify({ error: 'Address required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
        return new Response(JSON.stringify({ error: 'Invalid Solana address' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: StreamEvent) => {
                console.log('[Analyze V2] Event:', event.type, event.stepId || '',
                    event.paramsChecked ? `[${event.paramsChecked} params]` : '');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            };

            const startTime = Date.now();

            try {
                // ========================================
                // STEP 1: DETERMINE ACCOUNT TYPE
                // ========================================
                send({ type: 'step_start', stepId: 'account_type', stepName: 'Determining Account Type' });
                const step1Start = Date.now();

                const accountResult = await rpcCall('getAccountInfo', [address, { encoding: 'jsonParsed' }]);
                const accountInfo = accountResult?.value;

                if (!accountInfo) {
                    send({
                        type: 'step_error',
                        stepId: 'account_type',
                        error: 'Account not found',
                        duration: Date.now() - step1Start
                    });
                    send({ type: 'complete', data: { error: 'Account not found', address } });
                    controller.close();
                    return;
                }

                const parsedType = accountInfo.data?.parsed?.type;
                const owner = accountInfo.owner;

                // Determine detection mode
                const isToken = parsedType === 'mint';
                const isProgram = owner === 'BPFLoaderUpgradeab1e11111111111111111111111';
                const detectionMode: 'token' | 'dex' = isToken ? 'token' : 'dex';

                send({
                    type: 'step_complete',
                    stepId: 'account_type',
                    duration: Date.now() - step1Start,
                    data: {
                        accountType: parsedType || 'program',
                        detectionMode,
                        totalParams: detectionMode === 'token' ? 31 : 31
                    },
                    detectionMode
                });

                // ========================================
                // ROUTE TO APPROPRIATE DETECTOR
                // ========================================
                if (detectionMode === 'token') {
                    // TOKEN DETECTION (31 params: 18 on-chain + 13 off-chain)
                    console.log('[Analyze V2] Using TOKEN detector (31 params)');

                    const mintInfo = accountInfo.data?.parsed?.info;

                    // Fetch token metadata
                    send({ type: 'step_start', stepId: 'token_metadata', stepName: 'Fetching Token Metadata' });
                    const metaStart = Date.now();

                    let tokenName = 'Unknown';
                    let tokenSymbol = 'UNKNOWN';
                    let imageUrl = null;

                    try {
                        const apiKey = process.env.HELIUS_API_KEY;
                        if (apiKey) {
                            const dasResponse = await fetch(
                                `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        jsonrpc: '2.0',
                                        id: 'get-asset',
                                        method: 'getAsset',
                                        params: { id: address },
                                    }),
                                }
                            );
                            const dasData = await dasResponse.json();
                            const asset = dasData?.result;

                            if (asset) {
                                const content = asset.content;
                                const metadata = content?.metadata;
                                tokenName = metadata?.name?.trim() || asset.name?.trim() || 'Unknown';
                                tokenSymbol = metadata?.symbol?.trim() || asset.symbol?.trim() || 'UNKNOWN';
                                const imageFile = content?.files?.find((f: any) =>
                                    f.mime?.startsWith('image/') || f.uri?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
                                );
                                imageUrl = imageFile?.uri || content?.links?.image || metadata?.image || null;
                            }
                        }
                        send({
                            type: 'step_complete',
                            stepId: 'token_metadata',
                            duration: Date.now() - metaStart,
                            data: { name: tokenName, symbol: tokenSymbol },
                            detectionMode: 'token'
                        });
                    } catch (e) {
                        send({ type: 'step_error', stepId: 'token_metadata', error: 'Metadata fetch failed', duration: Date.now() - metaStart });
                    }

                    // Run Token Detector
                    const tokenDetector = new TokenDetector(address, (event) => {
                        send({
                            ...event,
                            detectionMode: 'token'
                        });
                    });

                    const tokenResult = await tokenDetector.analyze({
                        address,
                        accountInfo,
                        mintInfo,
                    });

                    // Build final result
                    const finalData = {
                        address,
                        type: 'token',
                        detectionMode: 'token',

                        // Detection stats
                        totalParamsChecked: tokenResult.totalParamsChecked,
                        totalParamsTriggered: tokenResult.totalParamsTriggered,
                        onChainParamsChecked: tokenResult.onChainParamsChecked,
                        offChainParamsChecked: tokenResult.offChainParamsChecked,

                        // Token info
                        profileSummary: {
                            tokenName,
                            tokenSymbol,
                            imageUrl,
                            decimals: mintInfo.decimals,
                            mintAuthority: mintInfo.mintAuthority,
                            freezeAuthority: mintInfo.freezeAuthority,
                            ageInDays: tokenResult.tokenData.ageInDays,
                            createdAt: tokenResult.tokenData.createdAt,
                        },

                        // Market data from detector
                        marketOverview: {
                            currentSupply: tokenResult.tokenData.supply,
                            decimals: mintInfo.decimals,
                            price: tokenResult.tokenData.price,
                            priceChange24h: tokenResult.tokenData.priceChange24h,
                            marketCap: tokenResult.tokenData.marketCap,
                            volume24h: tokenResult.tokenData.volume24h,
                            liquidity: tokenResult.tokenData.liquidity,
                            holders: tokenResult.tokenData.holders,
                        },

                        // Misc data
                        misc: {
                            ownerProgram: owner,
                        },

                        // Security
                        securityData: {
                            creatorAddress: tokenResult.tokenData.creatorAddress,
                            creatorPercentage: tokenResult.tokenData.creatorPercentage,
                            isLpBurned: tokenResult.tokenData.lpBurned,
                            lpBurnedPercent: tokenResult.tokenData.lpBurnedPercent,
                            // Authority-based flags
                            isMintable: !!mintInfo.mintAuthority,
                            isFreezable: !!mintInfo.freezeAuthority,
                            // RugCheck data
                            rugCheckScore: tokenResult.tokenData.rugCheckScore,
                            rugCheckRiskLevel: tokenResult.tokenData.rugCheckRiskLevel,
                        },

                        // Trading data
                        tradingData: {
                            buySlippage: tokenResult.tokenData.buySlippage,
                            sellSlippage: tokenResult.tokenData.sellSlippage,
                            isHoneypot: tokenResult.tokenData.isHoneypot,
                            dexPairs: tokenResult.tokenData.dexPairs,
                            dexNames: tokenResult.tokenData.dexNames,
                        },

                        // Top holders
                        topHolders: tokenResult.tokenData.topHolders || [],

                        // Params for display
                        onChainParams: tokenResult.onChainParams,
                        offChainParams: tokenResult.offChainParams,

                        // Risk
                        riskIndicators: tokenResult.riskIndicators,
                        riskScore: {
                            score: tokenResult.riskScore,
                            grade: getGrade(tokenResult.riskScore),
                        },
                        overallRisk: tokenResult.overallRisk,

                        // Duration
                        totalDuration: Date.now() - startTime,
                    };

                    // AI Analysis Step removed (Client-side)

                    send({ type: 'data_update', data: finalData, detectionMode: 'token' });
                    send({
                        type: 'complete',
                        data: finalData,
                        paramsChecked: tokenResult.totalParamsChecked,
                        paramsTriggered: tokenResult.totalParamsTriggered,
                        detectionMode: 'token'
                    });

                } else {
                    // DEX/PROGRAM DETECTION (31 params: 19 on-chain + 12 off-chain)
                    console.log('[Analyze V2] Using DEX detector (31 params)');

                    // Fetch program data if available
                    let programData = null;
                    const programInfo = accountInfo.data?.parsed?.info;
                    const programDataAddress = programInfo?.programData;

                    if (programDataAddress) {
                        send({ type: 'step_start', stepId: 'program_data', stepName: 'Fetching Program Data' });
                        const pdStart = Date.now();

                        try {
                            const pdResult = await rpcCall('getAccountInfo', [programDataAddress, { encoding: 'jsonParsed' }]);
                            programData = pdResult?.value?.data?.parsed?.info;
                            send({
                                type: 'step_complete',
                                stepId: 'program_data',
                                duration: Date.now() - pdStart,
                                data: { upgradeAuthority: programData?.authority || 'Immutable' },
                                detectionMode: 'dex'
                            });
                        } catch (e) {
                            send({ type: 'step_error', stepId: 'program_data', error: 'Program data fetch failed', duration: Date.now() - pdStart });
                        }
                    }

                    // Run DEX Detector
                    const dexDetector = new DexDetector(address, (event) => {
                        send({
                            ...event,
                            detectionMode: 'dex'
                        });
                    });

                    const dexResult = await dexDetector.analyze({
                        address,
                        accountInfo,
                        programData,
                    });

                    // Build final result
                    const finalData = {
                        address,
                        type: 'program',
                        detectionMode: 'dex',

                        // Detection stats
                        totalParamsChecked: dexResult.totalParamsChecked,
                        totalParamsTriggered: dexResult.totalParamsTriggered,
                        onChainParamsChecked: dexResult.onChainParamsChecked,
                        offChainParamsChecked: dexResult.offChainParamsChecked,

                        // Program info
                        profileSummary: {
                            programId: address,
                            programName: dexResult.dexData.programName || 'Unknown Program',
                            isUpgradeable: dexResult.dexData.isUpgradeable,
                            upgradeAuthority: dexResult.dexData.upgradeAuthority,
                            ownerProgram: owner,
                        },

                        // DEX data
                        dexData: {
                            tvl: dexResult.dexData.tvl,
                            volume24h: dexResult.dexData.volume24h,
                            transactionCount: dexResult.dexData.transactionCount,
                            errorRate: dexResult.dexData.recentErrorRate,
                        },

                        // Misc data
                        misc: {
                            ownerProgram: owner,
                        },

                        // Risk
                        riskIndicators: dexResult.riskIndicators,
                        riskScore: {
                            score: dexResult.riskScore,
                            grade: getGrade(dexResult.riskScore),
                        },
                        overallRisk: dexResult.overallRisk,

                        // Duration
                        totalDuration: Date.now() - startTime,
                    };

                    // AI Analysis Step removed (Client-side)

                    send({ type: 'data_update', data: finalData, detectionMode: 'dex' });
                    send({
                        type: 'complete',
                        data: finalData,
                        paramsChecked: dexResult.totalParamsChecked,
                        paramsTriggered: dexResult.totalParamsTriggered,
                        detectionMode: 'dex'
                    });


                }

            } catch (error) {
                console.error('[Analyze V2] Fatal error:', (error as Error).message);
                send({
                    type: 'complete',
                    data: {
                        error: (error as Error).message,
                        address
                    }
                });
            }

            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// ===========================================
// HELPERS
// ===========================================

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score <= 20) return 'A';
    if (score <= 40) return 'B';
    if (score <= 60) return 'C';
    if (score <= 80) return 'D';
    return 'F';
}
