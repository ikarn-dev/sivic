'use client';

import { formatUSDExact, formatRelativeTime } from '@/lib/utils/format';
import { SkeletonCategoryGrid } from '@/components/Skeleton';
import { GlassContainerCard, CategoryCard } from '@/components/Card';
import { CategoryData } from '@/hooks/useEcosystem';

interface TVLOverviewProps {
    isLoading: boolean;
    totalTvl?: number;
    categories?: CategoryData[];
    lastUpdated?: string;
}

/**
 * TVL Overview Component
 * Premium card displaying total value locked and top categories
 */
export function TVLOverview({ isLoading, totalTvl, categories, lastUpdated }: TVLOverviewProps) {
    return (
        <GlassContainerCard title="Solana Ecosystem TVL">
            {isLoading ? (
                <div className="space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50">Total Value Locked</span>
                        <div className="skeleton-shimmer h-7 w-32 rounded-lg" />
                    </div>
                    <SkeletonCategoryGrid count={4} />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header with total TVL */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50 text-sm">Total Value Locked</span>
                        <span className="text-white text-2xl font-bold tracking-tight">
                            {formatUSDExact(totalTvl)}
                        </span>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {categories?.slice(0, 4).map((cat) => (
                            <CategoryCard
                                key={cat.name}
                                label={cat.name}
                                value={formatUSDExact(cat.totalTvl)}
                            />
                        ))}
                    </div>

                    {/* Last Updated */}
                    {lastUpdated && (
                        <p className="text-white/30 text-xs pt-2">
                            Updated {formatRelativeTime(lastUpdated)}
                        </p>
                    )}
                </div>
            )}
        </GlassContainerCard>
    );
}
