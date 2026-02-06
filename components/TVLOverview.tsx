'use client';

import { formatUSDExact, formatRelativeTime } from '@/lib/utils/format';
import { SkeletonCategoryGrid } from '@/components/Skeleton';
import { GlassContainerCard } from '@/components/Card';
import { CategoryData } from '@/hooks/useEcosystem';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { CHART_COLORS } from '@/components/charts/config';

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
    // Prepare chart data
    const getChartData = () => {
        if (!categories) return null;

        const topCategories = categories.slice(0, 6);
        const colors = [
            '#3b82f6', // blue
            '#8b5cf6', // purple
            '#10b981', // emerald
            '#f59e0b', // amber
            '#ef4444', // red
            '#ec4899', // pink
        ];

        return {
            labels: topCategories.map(c => c.name),
            datasets: [{
                data: topCategories.map(c => c.totalTvl),
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4,
            }]
        };
    };

    const chartData = getChartData();

    return (
        <GlassContainerCard title="TVL by Category">
            {isLoading ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50">Total Value Locked</span>
                        <div className="skeleton-shimmer h-7 w-32 rounded-lg" />
                    </div>
                    <SkeletonCategoryGrid count={4} />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header with total TVL */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <span className="text-white/50 text-sm">Total Value Locked</span>
                        <span className="text-white text-2xl font-bold tracking-tight">
                            {formatUSDExact(totalTvl)}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Chart Section */}
                        <div className="w-full md:w-1/2 h-[220px]">
                            {chartData && (
                                <DoughnutChart
                                    data={chartData}
                                    height={220}
                                    options={{
                                        cutout: '65%',
                                        plugins: {
                                            legend: { display: false }
                                        }
                                    }}
                                    centerValue={categories && categories.length > 0 ? `${categories.length}` : undefined}
                                    centerText="Categories"
                                />
                            )}
                        </div>

                        {/* List Section */}
                        <div className="w-full md:w-1/2 space-y-3">
                            {categories?.slice(0, 6).map((cat, index) => (
                                <div key={cat.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: chartData?.datasets[0].backgroundColor[index] as string }}
                                        />
                                        <span className="text-white/70 text-sm capitalize group-hover:text-white transition-colors">
                                            {cat.name}
                                        </span>
                                    </div>
                                    <span className="text-white font-medium text-sm tabular-nums">
                                        {formatUSDExact(cat.totalTvl)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Last Updated */}
                    {lastUpdated && (
                        <p className="text-white/30 text-xs pt-2 text-center md:text-left">
                            Updated {formatRelativeTime(lastUpdated)}
                        </p>
                    )}
                </div>
            )}
        </GlassContainerCard>
    );
}
