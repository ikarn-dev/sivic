'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { GlassContainerCard, GlassStatCard } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { FormInput, FormSelect, PrimaryButton, SecondaryButton } from '@/components/FormElements';
import { SkeletonStatCard } from '@/components/Skeleton';
import { toast } from 'sonner';

// Types for exploit data
interface Exploit {
    id: string;
    date: string;
    timestamp: number;
    name: string;
    amount: number | null;
    chain: string[];
    technique: string | null;
    classification: string | null;
    targetType: string | null;
    source: string | null;
    language: string | null;
    bridgeHack: boolean;
    returnedFunds: number | null;
}

interface ExploitsResponse {
    exploits: Exploit[];
    total: number;
    totalLost: number;
    chains: string[];
    techniques: string[];
    lastUpdated: string;
}

// Classification colors and labels
const classificationConfig: Record<string, { color: string; label: string }> = {
    'Protocol Logic': { color: '#f87171', label: 'Protocol Logic' },
    'Infrastructure': { color: '#fb923c', label: 'Infrastructure' },
    'Ecosystem': { color: '#facc15', label: 'Ecosystem' },
    'Rugpull': { color: '#ef4444', label: 'Rug Pull' },
    'Smart Contract Language': { color: '#a78bfa', label: 'Smart Contract' },
};

// Target type icons
const targetTypeIcons: Record<string, string> = {
    'DeFi Protocol': '🏦',
    'CEX': '🏢',
    'Wallet': '👛',
    'Bridge': '🌉',
    'Gaming': '🎮',
    'NFTfi': '🖼️',
    'DAO': '🏛️',
    'Other': '📦',
};

// Format currency
function formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return 'Unknown';
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

// Format date
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Exploit card component
function ExploitCard({ exploit }: { exploit: Exploit }) {
    const classification = classificationConfig[exploit.classification || ''] || { color: '#94a3b8', label: exploit.classification };
    const targetIcon = targetTypeIcons[exploit.targetType || 'Other'] || '📦';
    const isSolana = exploit.chain.some(c => c.toLowerCase() === 'solana');

    return (
        <Card className="p-5 ring-1 ring-white/5 hover:ring-orange-500/30 transition-all duration-300" hover={true} blobIntensity="subtle" rounded="lg">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{targetIcon}</span>
                    <div>
                        <h3 className="text-white font-semibold">
                            {exploit.name}
                        </h3>
                        <p className="text-white/50 text-sm">{formatDate(exploit.date)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-lg font-bold ${exploit.amount && exploit.amount >= 10000000 ? 'text-red-400' : exploit.amount && exploit.amount >= 1000000 ? 'text-orange-400' : 'text-yellow-400'}`}>
                        {formatCurrency(exploit.amount)}
                    </p>
                    {exploit.returnedFunds && (
                        <p className="text-green-400 text-xs">
                            +{formatCurrency(exploit.returnedFunds)} recovered
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                {/* Classification badge */}
                <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${classification.color}20`, color: classification.color }}
                >
                    {classification.label}
                </span>

                {/* Chain badges */}
                {exploit.chain.slice(0, 3).map((chain) => (
                    <span
                        key={chain}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${chain.toLowerCase() === 'solana'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-white/10 text-white/60'
                            }`}
                    >
                        {chain}
                    </span>
                ))}
                {exploit.chain.length > 3 && (
                    <span className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-white/60">
                        +{exploit.chain.length - 3} more
                    </span>
                )}

                {/* Bridge hack indicator */}
                {exploit.bridgeHack && (
                    <span className="px-2.5 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                        🌉 Bridge
                    </span>
                )}

                {/* Solana highlight */}
                {isSolana && (
                    <span className="px-2.5 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 font-semibold">
                        ⚡ Solana
                    </span>
                )}
            </div>

            {/* Technique */}
            {exploit.technique && (
                <p className="text-white/60 text-sm mb-3">
                    <span className="text-white/40">Technique:</span> {exploit.technique}
                </p>
            )}

            {/* Language and source */}
            <div className="flex items-center justify-between">
                {exploit.language && (
                    <span className="text-white/40 text-xs">
                        📝 {exploit.language}
                    </span>
                )}
                {exploit.source && (
                    <a
                        href={exploit.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 text-xs hover:underline flex items-center gap-1"
                    >
                        View Source →
                    </a>
                )}
            </div>
        </Card>
    );
}

export default function ExploitDatabasePage() {
    const [data, setData] = useState<ExploitsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChain, setSelectedChain] = useState('');
    const [selectedTechnique, setSelectedTechnique] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [solanaOnly, setSolanaOnly] = useState(false);
    const [limit, setLimit] = useState(50);

    // Fetch exploits
    const fetchExploits = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (selectedChain) params.set('chain', selectedChain);
            if (selectedTechnique) params.set('technique', selectedTechnique);
            if (minAmount) params.set('minAmount', minAmount);
            if (solanaOnly) params.set('solanaOnly', 'true');
            params.set('limit', limit.toString());

            const response = await fetch(`/api/exploits?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch exploits');

            const result: ExploitsResponse = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching exploits:', err);
            setError('Failed to load exploit data. Please try again.');
            toast.error('Failed to load exploit data');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchExploits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply filters
    const handleApplyFilters = () => {
        fetchExploits();
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedChain('');
        setSelectedTechnique('');
        setMinAmount('');
        setSolanaOnly(false);
        setLimit(50);
        // Trigger fetch after state updates
        setTimeout(() => fetchExploits(), 0);
    };

    // Calculate Solana-specific stats
    const solanaStats = useMemo(() => {
        if (!data) return { count: 0, totalLost: 0 };
        const solanaExploits = data.exploits.filter(e =>
            e.chain.some(c => c.toLowerCase() === 'solana')
        );
        return {
            count: solanaExploits.length,
            totalLost: solanaExploits.reduce((sum, e) => sum + (e.amount || 0), 0),
        };
    }, [data]);

    // Chain options for select
    const chainOptions = useMemo(() => {
        const chains = data?.chains || [];
        return [
            { value: '', label: 'All Chains' },
            ...chains.map(c => ({ value: c, label: c })),
        ];
    }, [data?.chains]);

    // Technique options for select (grouped by first letter)
    const techniqueOptions = useMemo(() => {
        const techniques = data?.techniques || [];
        return [
            { value: '', label: 'All Techniques' },
            ...techniques.slice(0, 30).map(t => ({ value: t, label: t.length > 40 ? t.slice(0, 40) + '...' : t })),
        ];
    }, [data?.techniques]);

    return (
        <DashboardLayout>
            <div className="space-y-5">
                {/* Page Header */}
                <PageHeader
                    title="Exploit Database"
                    description="Historical blockchain exploits, hacks, and security incidents from DeFiLlama"
                    rightContent={
                        <div className="flex items-center gap-2">
                            <SecondaryButton
                                onClick={() => setSolanaOnly(!solanaOnly)}
                                className={solanaOnly ? '!bg-[rgba(153,69,255,0.2)] !border-[#9945ff]' : ''}
                            >
                                {solanaOnly ? '⚡ Solana Only' : 'All Chains'}
                            </SecondaryButton>
                            <PrimaryButton onClick={handleApplyFilters}>
                                🔄 Refresh
                            </PrimaryButton>
                        </div>
                    }
                />

                {/* Stats Overview */}
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
                                title="Total Exploits"
                                value={data?.total.toString() || '0'}
                                variant="warning"
                            />
                            <GlassStatCard
                                title="Total Funds Lost"
                                value={formatCurrency(data?.totalLost || 0)}
                                variant="danger"
                            />
                            <GlassStatCard
                                title="Solana Exploits"
                                value={solanaStats.count.toString()}
                                variant="success"
                            />
                            <GlassStatCard
                                title="Solana Funds Lost"
                                value={formatCurrency(solanaStats.totalLost)}
                            />
                        </>
                    )}
                </div>

                {/* Filters */}
                <GlassContainerCard title="🔍 Filter Exploits">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormInput
                            label="Search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Protocol name, technique..."
                        />
                        <FormSelect
                            label="Chain"
                            value={selectedChain}
                            options={chainOptions}
                            onChange={(e) => setSelectedChain(e.target.value)}
                        />
                        <FormSelect
                            label="Attack Technique"
                            value={selectedTechnique}
                            options={techniqueOptions}
                            onChange={(e) => setSelectedTechnique(e.target.value)}
                        />
                        <FormInput
                            label="Min Amount (USD)"
                            type="number"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="e.g., 1000000"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <SecondaryButton onClick={handleResetFilters}>
                            Clear Filters
                        </SecondaryButton>
                        <PrimaryButton onClick={handleApplyFilters}>
                            Apply Filters
                        </PrimaryButton>
                    </div>
                </GlassContainerCard>

                {/* Data Sources Info */}
                <Card className="p-5 ring-1 ring-orange-500/30" hover={false} blobIntensity="subtle" rounded="lg">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <h3 className="text-white font-semibold">Data Sources</h3>
                            <p className="text-white/60 text-sm mt-1">
                                Data aggregated from <a href="https://defillama.com/hacks" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">DeFiLlama Hacks Dashboard</a>.
                                Covers exploits from 2016 to present across all major blockchains.
                                {data && ` Last updated: ${new Date(data.lastUpdated).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Exploits List */}
                <GlassContainerCard title={`📋 Recent Exploits (${data?.exploits?.length || 0} shown)`}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-[#f87171] mb-4">{error}</p>
                            <PrimaryButton onClick={fetchExploits}>Retry</PrimaryButton>
                        </div>
                    ) : data?.exploits && data.exploits.length > 0 ? (
                        <div className="space-y-4">
                            {/* Grid of exploit cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {data.exploits.map((exploit) => (
                                    <ExploitCard key={exploit.id} exploit={exploit} />
                                ))}
                            </div>

                            {/* Load more */}
                            {data.total > data.exploits.length && (
                                <div className="text-center pt-4">
                                    <SecondaryButton
                                        onClick={() => {
                                            setLimit(limit + 50);
                                            setTimeout(() => fetchExploits(), 0);
                                        }}
                                    >
                                        Load More ({data.total - data.exploits.length} remaining)
                                    </SecondaryButton>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[rgba(255,255,255,0.5)]">
                            <p className="text-4xl mb-4">🔍</p>
                            <p>No exploits match your filters.</p>
                            <p className="text-sm mt-2">Try adjusting your search criteria.</p>
                        </div>
                    )}
                </GlassContainerCard>

                {/* Educational Footer */}
                <Card className="p-6" hover={false} blobIntensity="subtle" rounded="lg">
                    <h3 className="text-white font-semibold text-lg mb-4">📚 Understanding Exploit Classifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(classificationConfig).map(([key, { color, label }]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-white/60 text-sm">{label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-white/40 text-sm mt-5">
                        Use this database to research past exploits, understand common attack vectors, and learn from security incidents across the blockchain ecosystem.
                    </p>
                </Card>
            </div>
        </DashboardLayout>
    );
}
