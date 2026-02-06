'use client';

import { formatUSDExact, formatChange, getChangeColor } from '@/lib/utils/format';
import { SkeletonDexList } from '@/components/Skeleton';
import { GlassContainerCard } from '@/components/Card';
import { DexVolume } from '@/hooks/useDexVolumes';

interface DEXVolumeOverviewProps {
    isLoading: boolean;
    totalVolume24h?: number;
    dexes?: DexVolume[];
    maxItems?: number;
}

/**
 * DEX Volume Overview Component
 * Premium card displaying 24h DEX volume with ranking
 */
export function DEXVolumeOverview({ isLoading, totalVolume24h, dexes, maxItems = 6 }: DEXVolumeOverviewProps) {
    return (
        <GlassContainerCard title="24h DEX Volume">
            {isLoading ? (
                <div className="space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50">Total Volume (24h)</span>
                        <div className="skeleton-shimmer h-7 w-32 rounded-lg" />
                    </div>
                    <SkeletonDexList rows={maxItems} />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header with total volume */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50 text-sm">Total Volume (24h)</span>
                        <span className="text-white text-2xl font-bold tracking-tight">
                            {formatUSDExact(totalVolume24h)}
                        </span>
                    </div>

                    {/* DEX List */}
                    <div className="space-y-2 max-h-[280px] overflow-y-auto hide-scrollbar pr-1">
                        {dexes?.slice(0, maxItems).map((dex, index) => (
                            <div
                                key={dex.name}
                                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-white/30 text-xs font-medium w-5">{index + 1}</span>
                                    <span className="text-white text-sm font-medium">{dex.displayName || dex.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-white text-sm font-medium">{formatUSDExact(dex.total24h)}</span>
                                    <span className={`text-xs font-medium ${getChangeColor(dex.change_1d)}`}>
                                        {formatChange(dex.change_1d)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </GlassContainerCard>
    );
}
