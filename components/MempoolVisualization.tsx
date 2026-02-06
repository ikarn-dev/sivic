'use client';

import { useMemo } from 'react';
import { GlassContainerCard } from '@/components/Card';

interface MempoolVisualizationProps {
    tps: number;
    congestion: 'low' | 'moderate' | 'high';
    successRate: number;
    isLoading?: boolean;
    className?: string;
}

interface TransactionBlock {
    id: number;
    type: 'swap' | 'transfer' | 'stake' | 'nft' | 'other';
    size: 'small' | 'medium' | 'large';
    risk: 'low' | 'medium' | 'high';
}

/**
 * Mempool Visualization Component
 * Displays a visual representation of the transaction pool state
 * based on network conditions (TPS, congestion, success rate)
 */
export function MempoolVisualization({
    tps,
    congestion,
    successRate,
    isLoading = false,
    className = '',
}: MempoolVisualizationProps) {
    // Generate transaction blocks based on network state
    const transactionBlocks = useMemo(() => {
        if (isLoading) return [];

        // Number of blocks based on TPS
        const blockCount = Math.min(Math.max(Math.floor(tps / 100), 8), 32);
        const blocks: TransactionBlock[] = [];

        // Distribution based on typical Solana activity
        const typeDistribution = {
            swap: 0.45,      // 45% DEX swaps
            transfer: 0.25,  // 25% token transfers  
            stake: 0.10,     // 10% staking
            nft: 0.10,       // 10% NFT activity
            other: 0.10,     // 10% other
        };

        // Risk distribution based on congestion
        const riskDistribution = congestion === 'high'
            ? { low: 0.3, medium: 0.4, high: 0.3 }
            : congestion === 'moderate'
                ? { low: 0.5, medium: 0.35, high: 0.15 }
                : { low: 0.7, medium: 0.25, high: 0.05 };

        for (let i = 0; i < blockCount; i++) {
            // Determine type
            const typeRand = Math.random();
            let type: TransactionBlock['type'] = 'other';
            let cumulative = 0;
            for (const [t, prob] of Object.entries(typeDistribution)) {
                cumulative += prob;
                if (typeRand <= cumulative) {
                    type = t as TransactionBlock['type'];
                    break;
                }
            }

            // Determine risk
            const riskRand = Math.random();
            let risk: TransactionBlock['risk'] = 'low';
            if (riskRand > riskDistribution.low + riskDistribution.medium) {
                risk = 'high';
            } else if (riskRand > riskDistribution.low) {
                risk = 'medium';
            }

            // Determine size
            const sizeRand = Math.random();
            const size: TransactionBlock['size'] = sizeRand > 0.7 ? 'large' : sizeRand > 0.3 ? 'medium' : 'small';

            blocks.push({ id: i, type, size, risk });
        }

        return blocks;
    }, [tps, congestion, isLoading]);

    // Calculate queue metrics
    const queueMetrics = useMemo(() => {
        const pendingTx = Math.floor(tps * 0.4); // ~40% of TPS as "pending"
        const avgWaitTime = congestion === 'high' ? '2-5s' : congestion === 'moderate' ? '0.5-2s' : '<0.5s';
        const mevExposure = congestion === 'high' ? 'High' : congestion === 'moderate' ? 'Medium' : 'Low';

        return { pendingTx, avgWaitTime, mevExposure };
    }, [tps, congestion]);

    // Get colors for different elements
    const getTypeColor = (type: TransactionBlock['type']) => {
        const colors = {
            swap: 'bg-blue-500/60',
            transfer: 'bg-green-500/60',
            stake: 'bg-purple-500/60',
            nft: 'bg-pink-500/60',
            other: 'bg-gray-500/60',
        };
        return colors[type];
    };

    const getRiskBorder = (risk: TransactionBlock['risk']) => {
        const borders = {
            low: 'border-green-500/30',
            medium: 'border-yellow-500/50',
            high: 'border-red-500/70 animate-pulse',
        };
        return borders[risk];
    };

    const getSizeClasses = (size: TransactionBlock['size']) => {
        const sizes = {
            small: 'w-6 h-6',
            medium: 'w-8 h-8',
            large: 'w-10 h-10',
        };
        return sizes[size];
    };

    const getCongestionColor = () => {
        if (congestion === 'high') return 'text-red-400';
        if (congestion === 'moderate') return 'text-yellow-400';
        return 'text-green-400';
    };

    if (isLoading) {
        return (
            <GlassContainerCard title="Mempool Visualization" className={className}>
                <div className="flex items-center justify-center h-48">
                    <div className="text-[rgba(255,255,255,0.4)] text-sm">
                        Loading mempool data...
                    </div>
                </div>
            </GlassContainerCard>
        );
    }

    return (
        <GlassContainerCard title="Mempool Visualization" className={className}>
            <div className="space-y-4">
                {/* Queue Metrics Bar */}
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                    <div className="text-center">
                        <p className="text-xs text-[rgba(255,255,255,0.4)]">Pending Txs</p>
                        <p className="text-lg font-semibold text-white">{queueMetrics.pendingTx}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[rgba(255,255,255,0.4)]">Avg Wait</p>
                        <p className={`text-lg font-semibold ${getCongestionColor()}`}>
                            {queueMetrics.avgWaitTime}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[rgba(255,255,255,0.4)]">MEV Exposure</p>
                        <p className={`text-lg font-semibold ${getCongestionColor()}`}>
                            {queueMetrics.mevExposure}
                        </p>
                    </div>
                </div>

                {/* Transaction Pool Visualization */}
                <div className="relative p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.06)] min-h-[140px]">
                    {/* Flow Arrow Indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-[rgba(255,255,255,0.3)]">
                        <span>Processing</span>
                        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>

                    {/* Transaction Blocks Grid */}
                    <div className="flex flex-wrap gap-2">
                        {transactionBlocks.map((block) => (
                            <div
                                key={block.id}
                                className={`
                                    ${getSizeClasses(block.size)}
                                    ${getTypeColor(block.type)}
                                    ${getRiskBorder(block.risk)}
                                    rounded-md border-2 transition-all duration-300
                                    hover:scale-110 hover:z-10 cursor-pointer
                                    flex items-center justify-center
                                `}
                                title={`${block.type} (${block.risk} MEV risk)`}
                            >
                                {block.risk === 'high' && (
                                    <span className="text-xs text-white font-bold">!</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {transactionBlocks.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-[rgba(255,255,255,0.4)] text-sm">
                            No pending transactions
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-blue-500/60" />
                        <span className="text-[rgba(255,255,255,0.5)]">Swap</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-green-500/60" />
                        <span className="text-[rgba(255,255,255,0.5)]">Transfer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-purple-500/60" />
                        <span className="text-[rgba(255,255,255,0.5)]">Stake</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-pink-500/60" />
                        <span className="text-[rgba(255,255,255,0.5)]">NFT</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded border-2 border-red-500/70" />
                        <span className="text-[rgba(255,255,255,0.5)]">High MEV Risk</span>
                    </div>
                </div>

                {/* Network Status Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${congestion === 'high' ? 'bg-red-500 animate-pulse' :
                                congestion === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                        <span className="text-xs text-[rgba(255,255,255,0.5)]">
                            Network: <span className={getCongestionColor()}>{congestion.charAt(0).toUpperCase() + congestion.slice(1)}</span>
                        </span>
                    </div>
                    <span className="text-xs text-[rgba(255,255,255,0.4)]">
                        {Math.round(successRate)}% success rate
                    </span>
                </div>
            </div>
        </GlassContainerCard>
    );
}

export default MempoolVisualization;
