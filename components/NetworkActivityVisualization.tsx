'use client';

import { useMemo } from 'react';
import { GlassContainerCard } from '@/components/Card';

interface NetworkActivityVisualizationProps {
    tps: number;
    congestion: 'low' | 'moderate' | 'high';
    successRate: number;
    slot?: number;
    blockHeight?: number;
    isLoading?: boolean;
    className?: string;
}

/**
 * Network Activity Visualization Component
 * Modern visualization of real-time Solana network activity
 * Shows actual network metrics derived from on-chain data
 */
export function NetworkActivityVisualization({
    tps,
    congestion,
    successRate,
    slot,
    blockHeight,
    isLoading = false,
    className = '',
}: NetworkActivityVisualizationProps) {
    // Calculate network activity metrics from real data
    const activityMetrics = useMemo(() => {
        const throughputLevel = tps > 3000 ? 'high' : tps > 1500 ? 'moderate' : 'normal';
        const mevExposure = congestion === 'high' ? 'High' : congestion === 'moderate' ? 'Medium' : 'Low';
        const networkLoad = Math.min(100, Math.round((tps / 4000) * 100));

        return { throughputLevel, mevExposure, networkLoad };
    }, [tps, congestion]);

    // Get congestion colors
    const getCongestionStyles = () => {
        if (congestion === 'high') {
            return {
                text: 'text-red-400',
                bg: 'bg-red-500',
                glow: 'shadow-red-500/30',
                ring: 'ring-red-500/50',
            };
        }
        if (congestion === 'moderate') {
            return {
                text: 'text-yellow-400',
                bg: 'bg-yellow-500',
                glow: 'shadow-yellow-500/30',
                ring: 'ring-yellow-500/50',
            };
        }
        return {
            text: 'text-green-400',
            bg: 'bg-green-500',
            glow: 'shadow-green-500/30',
            ring: 'ring-green-500/50',
        };
    };

    const styles = getCongestionStyles();

    if (isLoading) {
        return (
            <GlassContainerCard title="Network Activity" className={className}>
                <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin" />
                        <span className="text-[rgba(255,255,255,0.4)] text-sm">
                            Loading network data...
                        </span>
                    </div>
                </div>
            </GlassContainerCard>
        );
    }

    return (
        <GlassContainerCard title="Network Activity" className={className}>
            <div className="space-y-5">
                {/* Main Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                    {/* TPS Gauge */}
                    <div className="relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
                        <div className="text-center">
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Transactions/sec</p>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {tps.toLocaleString()}
                            </p>
                            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${styles.bg} transition-all duration-700 ease-out rounded-full`}
                                    style={{ width: `${activityMetrics.networkLoad}%` }}
                                />
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1.5">
                                {activityMetrics.networkLoad}% capacity
                            </p>
                        </div>
                    </div>

                    {/* Network Congestion */}
                    <div className="relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
                        <div className="text-center">
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Congestion Level</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${styles.bg} shadow-lg ${styles.glow}`} />
                                <span className={`text-2xl font-semibold capitalize ${styles.text}`}>
                                    {congestion}
                                </span>
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3">
                                MEV Exposure: <span className={styles.text}>{activityMetrics.mevExposure}</span>
                            </p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="relative p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06]">
                        <div className="text-center">
                            <p className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Success Rate</p>
                            <p className={`text-3xl font-bold tracking-tight ${successRate >= 95 ? 'text-green-400' : successRate >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {successRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3">
                                Transaction confirmations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Live Network Pulse Visualization */}
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-black/40 to-transparent border border-white/[0.06] overflow-hidden">
                    {/* Background Gradient */}
                    <div
                        className={`absolute inset-0 ${styles.bg} opacity-5`}
                    />

                    {/* Network Flow Visualization */}
                    <div className="relative flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {/* Animated transaction flow bars */}
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 rounded-full ${styles.bg} transition-all duration-300`}
                                            style={{
                                                height: `${12 + Math.sin((Date.now() / 200) + i) * 8 + (tps / 500)}px`,
                                                opacity: 0.3 + (i % 3) * 0.2,
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-white font-medium">Live Transaction Flow</p>
                                    <p className="text-xs text-[rgba(255,255,255,0.4)]">
                                        Processing ~{Math.round(tps)} tx/s across the network
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Processing indicator */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="text-xs text-[rgba(255,255,255,0.4)]">Validators</span>
                        </div>
                    </div>

                    {/* Slot Progress (if available) */}
                    {slot && (
                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[rgba(255,255,255,0.4)]">Current Slot</span>
                                <span className="text-white font-mono">{slot.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Network Status Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${styles.bg}`} />
                        <span className="text-xs text-[rgba(255,255,255,0.5)]">
                            Network: <span className={styles.text}>{congestion.charAt(0).toUpperCase() + congestion.slice(1)}</span>
                        </span>
                    </div>
                    {blockHeight && (
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">
                            Block #{blockHeight.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </GlassContainerCard>
    );
}

export default NetworkActivityVisualization;
