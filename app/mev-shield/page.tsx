'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { GlassContainerCard } from '@/components/Card';
import { PageHeader, WarningBanner } from '@/components/PageHeader';
import { InfoCardGrid } from '@/components/InfoCard';
import { TransactionSandbox } from '@/components/TransactionSandbox';
import { NetworkActivityVisualization } from '@/components/NetworkActivityVisualization';
import { OnChainMetrics } from '@/components/OnChainMetrics';
import { FAQ } from '@/components/FAQ';
import { useNetworkHealth } from '@/hooks/useNetworkHealth';
import { useMEVStats } from '@/hooks/useMEVStats';
import { formatRelativeTime } from '@/lib/utils/format';

// MEV Attack Types - educational content (static, not mock data)
const mevAttackTypes = [
    {
        name: 'Sandwich Attack',
        description: 'Attacker places orders before and after victim\'s transaction to profit from price movement.',
        severity: 'high' as const,
    },
    {
        name: 'Front-running',
        description: 'Copying and executing a profitable transaction before the original sender.',
        severity: 'medium' as const,
    },
    {
        name: 'Back-running',
        description: 'Placing a transaction immediately after a large trade to capture arbitrage.',
        severity: 'medium' as const,
    },
    {
        name: 'Liquidation',
        description: 'Monitoring DeFi positions to profit from liquidation opportunities.',
        severity: 'low' as const,
    },
];


export default function MEVShieldPage() {
    const { data: networkData, isLoading, isConfigured, refetch } = useNetworkHealth(15000);
    const { data: mevStats, isLoading: mevStatsLoading } = useMEVStats(60000);

    return (
        <DashboardLayout>
            <div className="space-y-5">
                {/* Page Header */}
                <PageHeader
                    title="MEV Shield"
                    description="Network-based MEV risk analysis"
                    rightContent={
                        <div className="flex items-center gap-3">
                            {networkData?.lastUpdated && (
                                <span className="text-[rgba(255,255,255,0.4)] text-xs">
                                    Updated {formatRelativeTime(networkData.lastUpdated)}
                                </span>
                            )}
                            <button
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className="px-3.5 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 rounded-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Analyzing...' : 'Refresh'}
                            </button>
                        </div>
                    }
                />

                {/* API Not Configured Warning */}
                {!isConfigured && (
                    <WarningBanner
                        title="Helius API not configured"
                        message="MEV analysis requires network data. Add your Helius API key to .env.local"
                    />
                )}

                {/* Network Activity Visualization */}
                {networkData && (
                    <NetworkActivityVisualization
                        tps={networkData.tps}
                        congestion={networkData.congestion}
                        successRate={networkData.successRate}
                        slot={networkData.slot}
                        blockHeight={networkData.blockHeight}
                        isLoading={isLoading}
                    />
                )}

                {/* On-Chain MEV Data - Full Width */}
                <OnChainMetrics
                    data={mevStats}
                    isLoading={mevStatsLoading}
                />

                {/* Transaction Sandbox - AI-powered MEV Analysis */}
                <TransactionSandbox />

                {/* MEV Attack Types Reference (Educational - static content) */}
                <GlassContainerCard title="MEV Attack Types">
                    <InfoCardGrid cards={mevAttackTypes} columns={4} />
                </GlassContainerCard>

                {/* Educational FAQ Section */}
                <FAQ />
            </div>
        </DashboardLayout>
    );
}
