/**
 * MEV Stats API Route
 * 
 * Fetches MEV statistics from Bitquery and on-chain data
 * for the MEV Shield page
 */

import { NextResponse } from 'next/server';
import { serverConfig, isHeliusConfigured, isBitqueryConfigured } from '@/lib/config';
import { apiLogger, withTiming } from '@/lib/utils/logger';

// Types for response
interface MEVIncident {
    dex: string;
    type: 'sandwich' | 'frontrun' | 'backrun' | 'arbitrage';
    profitSol: number;
    timestamp: string;
    txSignature: string;
}

interface MEVStats {
    // Bitquery MEV incidents (if available)
    incidents: {
        available: boolean;
        recent: MEVIncident[];
        totalLast24h: number;
        profitLast24hSol: number;
    };
    // DEX activity
    dexActivity: {
        jupiterTx24h: number;
        raydiumTx24h: number;
        orcaTx24h: number;
        totalMevExposure: number;
    };
    // Network metrics for MEV context
    networkMetrics: {
        avgTps: number;
        peakTps: number;
        avgBlockTime: number;
        slotRange: {
            start: number;
            end: number;
        };
    };
    // Calculated MEV indicators
    mevIndicators: {
        sandwichRisk: 'low' | 'medium' | 'high';
        frontRunRisk: 'low' | 'medium' | 'high';
        estimatedMevOpportunities: number;
    };
    lastUpdated: string;
}

// Fetch MEV incidents from Bitquery
async function fetchBitqueryMEVData(): Promise<{ incidents: MEVIncident[]; totalProfit: number } | null> {
    const rawEnvKey = process.env.BITQUERY_API_KEY;
    const apiKey = serverConfig.bitquery.apiKey;
    const isConfigured = isBitqueryConfigured();

    console.log('[Bitquery Debug] Raw env BITQUERY_API_KEY present:', !!rawEnvKey, rawEnvKey ? `starts with: ${rawEnvKey.slice(0, 10)}...` : '');
    console.log('[Bitquery Debug] Config apiKey present:', !!apiKey);
    console.log('[Bitquery Debug] Is configured:', isConfigured);

    if (!isConfigured) {
        console.log('[Bitquery Debug] Skipping - not configured');
        return null;
    }

    try {
        // GraphQL query for recent Jito bundle tips (MEV indicator)
        // Jito has 8 mainnet tip payment accounts - tips go to one of these
        const JITO_TIP_ACCOUNTS = [
            "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
            "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
            "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
            "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
            "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
            "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
            "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
            "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
        ];

        const query = `
            query SolanaMEVBundles {
                Solana(dataset: realtime) {
                    Transfers(
                        where: {
                            Transfer: {
                                Receiver: { Address: { in: ${JSON.stringify(JITO_TIP_ACCOUNTS)} } }
                            }
                        }
                        limit: { count: 20 }
                        orderBy: { descending: Block_Slot }
                    ) {
                        Block {
                            Time
                            Slot
                        }
                        Transaction {
                            Signature
                        }
                        Transfer {
                            Amount
                            AmountInUSD
                            Sender {
                                Address
                            }
                            Receiver {
                                Address
                            }
                            Currency {
                                Symbol
                                Name
                            }
                        }
                    }
                }
            }
        `;

        console.log('[Bitquery Debug] Fetching from:', serverConfig.bitquery.graphqlUrl);

        const response = await fetch(serverConfig.bitquery.graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ query }),
        });

        console.log('[Bitquery Debug] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('[Bitquery Debug] Error response:', errorText);
            apiLogger.warn('/api/mev-stats', `Bitquery returned ${response.status}: ${errorText}`);
            return null;
        }

        const data = await response.json();
        console.log('[Bitquery Debug] Response data:', JSON.stringify(data).slice(0, 500));

        if (data.errors) {
            console.log('[Bitquery Debug] GraphQL errors:', JSON.stringify(data.errors));
            apiLogger.warn('/api/mev-stats', 'Bitquery returned errors');
            return null;
        }

        const transfers = data.data?.Solana?.Transfers || [];
        let totalProfit = 0;

        const incidents: MEVIncident[] = transfers.map((t: {
            Block: { Time: string; Slot: number };
            Transaction: { Signature: string };
            Transfer: { Amount: string | number; AmountInUSD: string | number; Sender: { Address: string }; Currency: { Symbol: string; Name: string } };
        }) => {
            // Amount may be string from Bitquery - ensure it's a number
            const profitSol = parseFloat(String(t.Transfer.Amount)) || 0;
            totalProfit += profitSol;

            return {
                dex: 'Jito Bundle',
                type: 'arbitrage' as const,
                profitSol,
                timestamp: t.Block.Time,
                txSignature: t.Transaction.Signature,
            };
        });

        console.log('[Bitquery Debug] Found incidents:', incidents.length);
        return { incidents, totalProfit };
    } catch (error) {
        console.log('[Bitquery Debug] Exception:', error);
        apiLogger.error('/api/mev-stats', error);
        return null;
    }
}

// Estimate MEV activity from network performance
function estimateMevActivity(tps: number, congestion: 'low' | 'moderate' | 'high') {
    // Based on research: >50% of high TPS is MEV bot activity
    const botActivityFactor = tps > 4000 ? 0.55 : tps > 2500 ? 0.40 : tps > 1500 ? 0.25 : 0.10;
    const congestionFactor = congestion === 'high' ? 1.5 : congestion === 'moderate' ? 1.2 : 1.0;

    const estimatedDexTxs = tps * botActivityFactor * congestionFactor;

    return {
        jupiter: Math.round(estimatedDexTxs * 0.50),
        raydium: Math.round(estimatedDexTxs * 0.30),
        orca: Math.round(estimatedDexTxs * 0.15),
        total: Math.round(estimatedDexTxs),
    };
}

export async function GET() {
    const endpoint = '/api/mev-stats';

    if (!isHeliusConfigured()) {
        apiLogger.warn(endpoint, 'Helius API key not configured');
        return NextResponse.json(
            { error: 'Helius API not configured', configured: false },
            { status: 503 }
        );
    }

    return withTiming(
        async () => {
            apiLogger.request(endpoint);

            try {
                // Fetch network performance and Bitquery data in parallel
                const [perfResponse, bitqueryData] = await Promise.all([
                    fetch(serverConfig.helius.rpcEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method: 'getRecentPerformanceSamples',
                            params: [10],
                        }),
                    }),
                    fetchBitqueryMEVData(),
                ]);

                if (!perfResponse.ok) {
                    throw new Error(`RPC error: ${perfResponse.status}`);
                }

                const perfData = await perfResponse.json();
                const samples = perfData.result || [];

                // Calculate averages
                const totalTx = samples.reduce((sum: number, s: { numTransactions: number }) => sum + s.numTransactions, 0);
                const totalTime = samples.reduce((sum: number, s: { samplePeriodSecs: number }) => sum + s.samplePeriodSecs, 0);
                const avgTps = totalTime > 0 ? Math.round(totalTx / totalTime) : 0;
                const peakTps = samples.length > 0
                    ? Math.max(...samples.map((s: { numTransactions: number; samplePeriodSecs: number }) =>
                        Math.round(s.numTransactions / s.samplePeriodSecs)))
                    : 0;

                // Determine congestion level
                const congestion: 'low' | 'moderate' | 'high' =
                    avgTps > 3000 ? 'high' : avgTps > 1500 ? 'moderate' : 'low';

                // Estimate MEV activity
                const mevEstimate = estimateMevActivity(avgTps, congestion);

                // Get current slot
                const epochResponse = await fetch(serverConfig.helius.rpcEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getSlot',
                    }),
                });
                const epochData = await epochResponse.json();
                const currentSlot = epochData.result || 0;

                // Build response
                const stats: MEVStats = {
                    incidents: {
                        available: bitqueryData !== null,
                        recent: bitqueryData?.incidents || [],
                        totalLast24h: bitqueryData?.incidents.length || 0,
                        profitLast24hSol: bitqueryData?.totalProfit || 0,
                    },
                    dexActivity: {
                        jupiterTx24h: mevEstimate.jupiter * 3600 * 24,
                        raydiumTx24h: mevEstimate.raydium * 3600 * 24,
                        orcaTx24h: mevEstimate.orca * 3600 * 24,
                        totalMevExposure: mevEstimate.total,
                    },
                    networkMetrics: {
                        avgTps,
                        peakTps,
                        avgBlockTime: 0.4,
                        slotRange: {
                            start: currentSlot - 10000,
                            end: currentSlot,
                        },
                    },
                    mevIndicators: {
                        sandwichRisk: congestion === 'high' ? 'high' : congestion === 'moderate' ? 'medium' : 'low',
                        frontRunRisk: avgTps > 3000 ? 'high' : avgTps > 2000 ? 'medium' : 'low',
                        estimatedMevOpportunities: mevEstimate.total,
                    },
                    lastUpdated: new Date().toISOString(),
                };

                apiLogger.data('MEV stats response', { avgTps, peakTps, congestion, bitqueryAvailable: bitqueryData !== null });
                return NextResponse.json(stats);
            } catch (error) {
                apiLogger.error(endpoint, error);
                return NextResponse.json(
                    { error: 'Failed to fetch MEV stats', message: error instanceof Error ? error.message : 'Unknown error' },
                    { status: 500 }
                );
            }
        },
        (duration) => apiLogger.response(endpoint, 200, duration)
    );
}
