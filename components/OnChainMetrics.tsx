'use client';

import { GlassContainerCard, GlassContainerEmpty } from '@/components/Card';
import { MEVStats } from '@/hooks/useMEVStats';

interface OnChainMetricsProps {
    data: MEVStats | null;
    isLoading?: boolean;
    className?: string;
}

/**
 * On-Chain Metrics Component
 * Displays all fetched on-chain data used for MEV detection
 */
export function OnChainMetrics({
    data,
    isLoading = false,
    className = '',
}: OnChainMetricsProps) {
    const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
        switch (risk) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
        }
    };

    const getRiskBg = (risk: 'low' | 'medium' | 'high') => {
        switch (risk) {
            case 'high': return 'bg-red-500/10 border-red-500/30';
            case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'bg-green-500/10 border-green-500/30';
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // MEV Detection thresholds (per spec)
    const MEV_THRESHOLDS = {
        tps: { high: 4000, medium: 2500, low: 1500 },
        successRate: { critical: 85, warning: 92 },
    };

    if (isLoading || !data) {
        return (
            <GlassContainerCard title="On-Chain MEV Data" className={className}>
                <GlassContainerEmpty message="Loading on-chain data..." />
            </GlassContainerCard>
        );
    }

    // Determine TPS risk level
    const getTpsRisk = (tps: number): 'low' | 'medium' | 'high' => {
        if (tps > MEV_THRESHOLDS.tps.high) return 'high';
        if (tps > MEV_THRESHOLDS.tps.medium) return 'medium';
        return 'low';
    };

    const tpsRisk = getTpsRisk(data.networkMetrics.avgTps);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Live Data Parameters - Shows what's being fetched */}
            <GlassContainerCard title="Live Data Parameters">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* TPS with threshold indicator */}
                    <div className={`p-3 rounded-lg border ${getRiskBg(tpsRisk)}`}>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase tracking-wider">Avg TPS</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${getRiskBg(tpsRisk)} ${getRiskColor(tpsRisk)}`}>
                                {tpsRisk.toUpperCase()}
                            </span>
                        </div>
                        <p className={`text-xl font-bold ${getRiskColor(tpsRisk)}`}>
                            {data.networkMetrics.avgTps.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] mt-1">
                            Threshold: &gt;{MEV_THRESHOLDS.tps.high} = HIGH
                        </p>
                    </div>

                    {/* Peak TPS */}
                    <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                        <p className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-1">Peak TPS</p>
                        <p className="text-xl font-bold text-white">{data.networkMetrics.peakTps.toLocaleString()}</p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] mt-1">
                            Max observed rate
                        </p>
                    </div>

                    {/* Current Slot */}
                    <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)]">
                        <p className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-1">Current Slot</p>
                        <p className="text-xl font-bold text-blue-400">{data.networkMetrics.slotRange.end.toLocaleString()}</p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] mt-1">
                            Block height
                        </p>
                    </div>

                    {/* MEV Exposure */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                        <p className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase tracking-wider mb-1">MEV Exposure</p>
                        <p className="text-xl font-bold text-orange-400">{formatNumber(data.dexActivity.totalMevExposure)}</p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] mt-1">
                            Est. bot txs/sec
                        </p>
                    </div>
                </div>

                {/* Detection Parameters Info */}
                <div className="mt-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                    <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1.5">Detection Thresholds Used:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-[rgba(255,255,255,0.5)]">
                        <span>TPS &gt;4000 = <span className="text-red-400">HIGH</span></span>
                        <span>TPS &gt;2500 = <span className="text-yellow-400">MED</span></span>
                        <span>Success &lt;85% = <span className="text-red-400">CRITICAL</span></span>
                        <span>Bot Activity: {(data.networkMetrics.avgTps > 4000 ? 55 : data.networkMetrics.avgTps > 2500 ? 40 : 25)}% of TPS</span>
                    </div>
                </div>
            </GlassContainerCard>

            {/* Risk Indicators with AI Analysis note */}
            <GlassContainerCard title="MEV Risk Indicators">
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className={`p-3 rounded-lg border ${getRiskBg(data.mevIndicators.sandwichRisk)}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">Sandwich Risk</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRiskBg(data.mevIndicators.sandwichRisk)} ${getRiskColor(data.mevIndicators.sandwichRisk)}`}>
                                {data.mevIndicators.sandwichRisk.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)] mt-1">
                            {data.mevIndicators.sandwichRisk === 'high'
                                ? 'High congestion enables sandwich attacks'
                                : data.mevIndicators.sandwichRisk === 'medium'
                                    ? 'Moderate risk - use slippage protection'
                                    : 'Low risk - normal market conditions'}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg border ${getRiskBg(data.mevIndicators.frontRunRisk)}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-white font-medium">Front-Run Risk</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRiskBg(data.mevIndicators.frontRunRisk)} ${getRiskColor(data.mevIndicators.frontRunRisk)}`}>
                                {data.mevIndicators.frontRunRisk.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)] mt-1">
                            {data.mevIndicators.frontRunRisk === 'high'
                                ? 'High TPS indicates active MEV bots'
                                : data.mevIndicators.frontRunRisk === 'medium'
                                    ? 'Elevated bot activity detected'
                                    : 'Standard mempool conditions'}
                        </p>
                    </div>
                </div>

                {/* Estimated DEX Activity */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 text-center">
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)]">Jupiter (24h)</p>
                        <p className="text-sm font-bold text-blue-400">{formatNumber(data.dexActivity.jupiterTx24h)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 text-center">
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)]">Raydium (24h)</p>
                        <p className="text-sm font-bold text-purple-400">{formatNumber(data.dexActivity.raydiumTx24h)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 text-center">
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)]">Orca (24h)</p>
                        <p className="text-sm font-bold text-cyan-400">{formatNumber(data.dexActivity.orcaTx24h)}</p>
                    </div>
                </div>
            </GlassContainerCard>

            {/* Jito MEV Incidents */}
            <GlassContainerCard title={`Jito Bundle Activity ${data.incidents.available ? '' : '(API not configured)'}`}>
                {data.incidents.available && data.incidents.recent.length > 0 ? (
                    <div className="space-y-2">
                        {data.incidents.recent.slice(0, 5).map((incident, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                        {incident.type}
                                    </span>
                                    <span className="text-xs text-[rgba(255,255,255,0.6)]">{incident.dex}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-green-400">+{Number(incident.profitSol).toFixed(4)} SOL</p>
                                    <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{formatTime(incident.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex justify-between text-xs text-[rgba(255,255,255,0.4)]">
                            <span>Total: {data.incidents.totalLast24h} incidents</span>
                            <span className="text-green-400">{Number(data.incidents.profitLast24hSol).toFixed(4)} SOL tips</span>
                        </div>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] italic">
                            Source: Bitquery GraphQL → Jito Tip Accounts (8 mainnet accounts)
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-xs text-[rgba(255,255,255,0.4)]">
                            {data.incidents.available
                                ? 'No recent Jito bundles detected'
                                : 'Add BITQUERY_API_KEY to .env.local for real-time MEV data'}
                        </p>
                        <p className="text-[9px] text-[rgba(255,255,255,0.3)] mt-2">
                            Jito bundles indicate MEV activity on Solana
                        </p>
                    </div>
                )}
            </GlassContainerCard>
        </div>
    );
}

export default OnChainMetrics;
