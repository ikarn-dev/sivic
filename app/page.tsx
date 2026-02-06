'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Card, { GlassStatCard, GlassContainerCard, GlassContainerEmpty } from '@/components/Card';
import { SkeletonStatCard } from '@/components/Skeleton';
import { EcosystemTreemap } from '@/components/EcosystemTreemap';
import { PageHeader, ConnectionStatusBadge, WarningBanner } from '@/components/PageHeader';
import { StatusList } from '@/components/StatusItem';
import { NetworkMetrics } from '@/components/NetworkMetrics';
import { TVLOverview } from '@/components/TVLOverview';
import { DEXVolumeOverview } from '@/components/DEXVolumeOverview';
import { ProtocolGrid } from '@/components/ProtocolCard';
import { useNetworkHealth } from '@/hooks/useNetworkHealth';
import { useEcosystem } from '@/hooks/useEcosystem';
import { useDexVolumes } from '@/hooks/useDexVolumes';
import { useProtocolsTreemap } from '@/hooks/useProtocolsTreemap';
import { usePrefetch } from '@/hooks/usePrefetch';
import { formatNumberExact, formatPercent } from '@/lib/utils/format';

export default function Home() {
  // Warm the cache on first load
  usePrefetch();

  // Fetch real data from APIs
  const { data: networkData, isLoading: networkLoading, isConfigured } = useNetworkHealth(30000);
  const { data: ecosystemData, isLoading: ecosystemLoading } = useEcosystem(300000);
  const { data: dexData, isLoading: dexLoading } = useDexVolumes(300000);
  const { data: treemapData, isLoading: treemapLoading } = useProtocolsTreemap(300000);

  // Derive values from real data - no hardcoding
  const isConnected = isConfigured && !!networkData;

  const getMevRisk = () => {
    if (!networkData) return { level: '—', variant: 'default' as const };
    switch (networkData.congestion) {
      case 'high': return { level: 'High', variant: 'danger' as const };
      case 'moderate': return { level: 'Medium', variant: 'warning' as const };
      default: return { level: 'Low', variant: 'success' as const };
    }
  };
  const mevRisk = getMevRisk();

  // Status items derived from real data
  const getProtectionStatus = (): Array<{ label: string; status: 'active' | 'inactive' | 'warning' }> => {
    return [
      { label: 'Network Monitor', status: isConnected ? 'active' : 'inactive' },
      { label: 'MEV Shield', status: networkData?.congestion === 'high' ? 'warning' : isConfigured ? 'active' : 'inactive' },
      { label: 'Ecosystem Data', status: ecosystemData ? 'active' : 'inactive' },
      { label: 'DEX Data', status: dexData ? 'active' : 'inactive' },
    ];
  };

  // Network metrics derived from real data
  const getNetworkMetrics = () => {
    if (!networkData) return [];
    return [
      {
        label: 'Congestion',
        value: networkData.congestion,
        valueColor: networkData.congestion === 'low' ? 'text-[#4ade80]' : networkData.congestion === 'moderate' ? 'text-[#facc15]' : 'text-[#f87171]'
      },
      { label: 'Block Height', value: formatNumberExact(networkData.blockHeight) },
      { label: 'Epoch', value: networkData.epoch.toString() },
      {
        label: 'Health',
        value: networkData.health === 'ok' ? 'Healthy' : 'Issues',
        valueColor: networkData.health === 'ok' ? 'text-[#4ade80]' : 'text-[#f87171]'
      },
    ];
  };

  // Protocol data for grid
  const getProtocols = () => {
    if (!ecosystemData?.categories) return [];
    return ecosystemData.categories.flatMap(cat =>
      cat.protocols.slice(0, 2).map(p => ({
        name: p.name,
        tvl: p.tvl,
        category: cat.name
      }))
    ).slice(0, 12);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page Header */}
        <PageHeader
          title="Overview"
          description="Solana ecosystem security dashboard"
          rightContent={<ConnectionStatusBadge isConnected={isConnected} />}
        />

        {/* API Not Configured Warning */}
        {!isConfigured && (
          <WarningBanner
            title="Helius API not configured"
            message="Network data requires Helius API. Add your key to .env.local"
          />
        )}

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {networkLoading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <GlassStatCard
                title="MEV Risk Level"
                value={mevRisk.level}
                variant={mevRisk.variant}
              />
              <GlassStatCard
                title="Network TPS"
                value={formatNumberExact(networkData?.tps)}
                variant="success"
              />
              <GlassStatCard
                title="TX Success Rate"
                value={formatPercent(networkData?.successRate, 2)}
              />
              <GlassStatCard
                title="SOL Price"
                value={ecosystemLoading ? '—' : `$${ecosystemData?.solPrice?.toFixed(2) || '—'}`}
              />
            </>
          )}
        </div>

        {/* Ecosystem Data Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TVLOverview
            isLoading={ecosystemLoading}
            totalTvl={ecosystemData?.totalTvl}
            categories={ecosystemData?.categories}
            lastUpdated={ecosystemData?.lastUpdated}
          />
          <DEXVolumeOverview
            isLoading={dexLoading}
            totalVolume24h={dexData?.totalVolume24h}
            dexes={dexData?.dexes}
          />
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Protection Status */}
          <GlassContainerCard title="Protection Status">
            <StatusList items={getProtectionStatus()} />
          </GlassContainerCard>

          {/* Network Status */}
          <GlassContainerCard title="Network Status">
            {networkData ? (
              <NetworkMetrics metrics={getNetworkMetrics()} />
            ) : (
              <GlassContainerEmpty message="Loading network data..." />
            )}
          </GlassContainerCard>
        </div>

        {/* Solana Ecosystem Heatmap */}
        {treemapLoading ? (
          <Card className="p-6" hover={false} blobIntensity="subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="skeleton-shimmer h-5 w-40 rounded-lg mb-2" />
                <div className="skeleton-shimmer h-3 w-56 rounded-lg" />
              </div>
              <div className="skeleton-shimmer h-8 w-32 rounded-lg" />
            </div>
            <div className="skeleton-shimmer h-[400px] w-full rounded-xl" />
          </Card>
        ) : treemapData && treemapData.protocols.length > 0 ? (
          <EcosystemTreemap
            data={treemapData.protocols}
            title="Solana Ecosystem Heatmap"
            height={400}
          />
        ) : (
          <Card className="p-6" hover={false} blobIntensity="subtle">
            <h3 className="text-lg font-semibold text-white mb-4">Solana Ecosystem Heatmap</h3>
            <GlassContainerEmpty message="Loading ecosystem data..." />
          </Card>
        )}

        {/* Top Protocols by TVL */}
        <GlassContainerCard title="Top Protocols by TVL">
          {ecosystemLoading ? (
            <GlassContainerEmpty message="Loading ecosystem data..." />
          ) : getProtocols().length > 0 ? (
            <ProtocolGrid protocols={getProtocols()} />
          ) : (
            <GlassContainerEmpty message="No protocol data available" />
          )}
        </GlassContainerCard>
      </div>
    </DashboardLayout>
  );
}
