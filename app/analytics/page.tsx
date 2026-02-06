'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Card, { GlassContainerCard, GlassStatCard, GlassContainerEmpty, CategoryCard } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { CategoryList } from '@/components/CategoryList';
import { SkeletonStatCard } from '@/components/Skeleton';
import { useEcosystem, useDexVolumes, useProtocolsTreemap, useNetworkHealth } from '@/hooks';
import { formatNumberExact, formatUSDExact, formatChange, getChangeColor } from '@/lib/utils/format';
import EcosystemTreemap from '@/components/EcosystemTreemap';

export default function AnalyticsPage() {
    const { data: ecosystemData, isLoading: ecosystemLoading } = useEcosystem();
    const { data: dexData, isLoading: dexLoading } = useDexVolumes();
    const { data: treemapData, isLoading: treemapLoading } = useProtocolsTreemap();
    const { data: networkData, isLoading: networkLoading } = useNetworkHealth();

    const isLoading = ecosystemLoading || dexLoading || treemapLoading || networkLoading;

    return (
        <DashboardLayout>
            <div className="space-y-5">
                {/* Page Header */}
                <PageHeader
                    title="Ecosystem Analytics"
                    description="Comprehensive insights into Solana DeFi security landscape"
                />

                {/* Key Metrics - all from real data */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading ? (
                        <>
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                            <SkeletonStatCard />
                        </>
                    ) : (
                        <>
                            <GlassStatCard
                                title="Total Value Locked"
                                value={formatUSDExact(ecosystemData?.totalTvl, 0)}
                                variant="success"
                            />
                            <GlassStatCard
                                title="24h DEX Volume"
                                value={formatUSDExact(dexData?.totalVolume24h, 0)}
                            />
                            <GlassStatCard
                                title="Network TPS"
                                value={formatNumberExact(networkData?.tps, 0)}
                                variant="success"
                            />
                            <GlassStatCard
                                title="Protocols Tracked"
                                value={(treemapData?.protocols?.length || 0).toString()}
                            />
                        </>
                    )}
                </div>

                {/* Protocol TVL Breakdown */}
                <GlassContainerCard title="Protocol TVL Distribution">
                    {treemapLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full" />
                        </div>
                    ) : treemapData?.protocols ? (
                        <EcosystemTreemap data={treemapData.protocols} />
                    ) : (
                        <GlassContainerEmpty message="No data available" />
                    )}
                </GlassContainerCard>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <GlassContainerCard title="TVL by Category">
                        {ecosystemLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full" />
                            </div>
                        ) : ecosystemData?.categories ? (
                            <CategoryList categories={ecosystemData.categories} maxItems={6} />
                        ) : (
                            <GlassContainerEmpty message="Loading categories..." />
                        )}
                    </GlassContainerCard>

                    <GlassContainerCard title="DEX Volume (24h)">
                        {dexLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full" />
                            </div>
                        ) : dexData?.dexes ? (
                            <div className="space-y-3">
                                {dexData.dexes.slice(0, 6).map((dex) => (
                                    <div key={dex.name} className="flex items-center justify-between">
                                        <span className="text-white">{dex.displayName || dex.name}</span>
                                        <div className="text-right">
                                            <span className="text-[rgba(255,255,255,0.6)]">
                                                {formatUSDExact(dex.total24h, 0)}
                                            </span>
                                            <span className={`ml-2 text-xs ${getChangeColor(dex.change_1d)}`}>
                                                {formatChange(dex.change_1d)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <GlassContainerEmpty message="Loading DEX data..." />
                        )}
                    </GlassContainerCard>
                </div>

                {/* Network Health */}
                <GlassContainerCard title="Network Health">
                    {networkLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                        </div>
                    ) : networkData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Card className="p-4 text-center" hover={false} blobIntensity="subtle" rounded="md">
                                <p className={`text-2xl font-bold ${networkData.health === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                                    {networkData.health === 'ok' ? 'Healthy' : 'Issues'}
                                </p>
                                <p className="text-white/50 text-sm mt-1">Network Status</p>
                            </Card>
                            <Card className="p-4 text-center" hover={false} blobIntensity="subtle" rounded="md">
                                <p className={`text-2xl font-bold capitalize ${networkData.congestion === 'low' ? 'text-green-400' :
                                    networkData.congestion === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {networkData.congestion}
                                </p>
                                <p className="text-white/50 text-sm mt-1">Congestion</p>
                            </Card>
                            <Card className="p-4 text-center" hover={false} blobIntensity="subtle" rounded="md">
                                <p className="text-2xl font-bold text-white">{formatNumberExact(networkData.blockHeight)}</p>
                                <p className="text-white/50 text-sm mt-1">Block Height</p>
                            </Card>
                            <Card className="p-4 text-center" hover={false} blobIntensity="subtle" rounded="md">
                                <p className="text-2xl font-bold text-white">{networkData.epoch}</p>
                                <p className="text-white/50 text-sm mt-1">Current Epoch</p>
                            </Card>
                        </div>
                    ) : (
                        <GlassContainerEmpty message="Loading network data..." />
                    )}
                </GlassContainerCard>
            </div>
        </DashboardLayout>
    );
}
