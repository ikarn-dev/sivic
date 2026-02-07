'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card, { GlassContainerCard, GlassStatCard } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ChecklistGroup } from '@/components/Checklist';
import { ProgressBar, ProgressBadge } from '@/components/EmptyState';
import { PrimaryButton, SecondaryButton, FormInput, FormTextarea } from '@/components/FormElements';
import { toast } from 'sonner';

// Comprehensive pre-audit checklist organized by category
const checklistData = {
    'Access Control': [
        { id: 1, item: 'Owner/admin privileges are properly restricted', severity: 'critical' as const, tip: 'Use multi-sig or DAO governance for critical functions' },
        { id: 2, item: 'Multi-sig or timelock for critical functions', severity: 'high' as const, tip: 'Minimum 2/3 multi-sig recommended for admin keys' },
        { id: 3, item: 'Role-based access control implemented', severity: 'medium' as const, tip: 'Separate roles for different permission levels' },
        { id: 4, item: 'Emergency pause functionality exists', severity: 'high' as const, tip: 'Circuit breaker pattern for quick response to exploits' },
    ],
    'Token Safety': [
        { id: 5, item: 'Mint authority is disabled or controlled', severity: 'critical' as const, tip: 'Disabling mint prevents infinite token creation' },
        { id: 6, item: 'Freeze authority is disabled or documented', severity: 'high' as const, tip: 'If retained, document the governance process' },
        { id: 7, item: 'Token metadata is immutable or controlled', severity: 'medium' as const, tip: 'Prevent unauthorized metadata changes' },
        { id: 8, item: 'Transfer hooks reviewed for security', severity: 'high' as const, tip: 'Ensure hooks cannot block transfers maliciously' },
    ],
    'Liquidity & Economics': [
        { id: 9, item: 'Liquidity is locked for appropriate duration', severity: 'high' as const, tip: 'Minimum 6 months lock recommended' },
        { id: 10, item: 'LP tokens are not held by single wallet', severity: 'medium' as const, tip: 'Distribute LP tokens to prevent rug pulls' },
        { id: 11, item: 'Tokenomics reviewed for sustainability', severity: 'medium' as const, tip: 'Ensure emission schedule is realistic' },
        { id: 12, item: 'Slippage parameters are reasonable', severity: 'medium' as const, tip: 'Max slippage should protect against MEV' },
    ],
    'Code Quality': [
        { id: 13, item: 'No unchecked arithmetic operations', severity: 'high' as const, tip: 'Use Rust\'s checked_* methods or overflow checks' },
        { id: 14, item: 'Reentrancy guards in place', severity: 'critical' as const, tip: 'Use mutex patterns for state-changing functions' },
        { id: 15, item: 'Integer overflow/underflow protection', severity: 'high' as const, tip: 'Enable overflow checks in Cargo.toml' },
        { id: 16, item: 'Proper error handling implemented', severity: 'medium' as const, tip: 'Use custom error types with clear messages' },
    ],
    'External Dependencies': [
        { id: 17, item: 'Oracle manipulation protections', severity: 'high' as const, tip: 'Use TWAP or multiple oracle sources' },
        { id: 18, item: 'Flash loan attack mitigations', severity: 'high' as const, tip: 'Add delays or multi-block confirmations' },
        { id: 19, item: 'Cross-program invocation (CPI) validated', severity: 'critical' as const, tip: 'Validate all incoming CPI calls' },
        { id: 20, item: 'Account validation for all inputs', severity: 'critical' as const, tip: 'Verify ownership, type, and state of accounts' },
    ],
    'Solana-Specific': [
        { id: 21, item: 'Signer checks on all privileged operations', severity: 'critical' as const, tip: 'is_signer check on all admin functions' },
        { id: 22, item: 'Owner validation for PDAs', severity: 'critical' as const, tip: 'Verify program ID owns the PDA' },
        { id: 23, item: 'Rent exemption properly handled', severity: 'medium' as const, tip: 'Ensure accounts are rent-exempt' },
        { id: 24, item: 'Account discriminators implemented', severity: 'high' as const, tip: 'Use Anchor discriminators or manual tagging' },
    ],
};

const allItems = Object.values(checklistData).flat();
const categories = Object.keys(checklistData);

// Severity weights for priority calculation
const severityWeights = { critical: 10, high: 5, medium: 2, low: 1 };

export default function PreAuditPage() {
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const [projectName, setProjectName] = useState('');
    const [projectNotes, setProjectNotes] = useState('');
    const [showTips, setShowTips] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleItemChange = (id: number, checked: boolean) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    // Calculate progress and stats
    const stats = useMemo(() => {
        const completedItems = allItems.filter(item => checkedItems.has(item.id));
        const progress = (checkedItems.size / allItems.length) * 100;

        // Calculate critical items
        const criticalItems = allItems.filter(i => i.severity === 'critical');
        const completedCritical = criticalItems.filter(i => checkedItems.has(i.id)).length;

        // Calculate high items
        const highItems = allItems.filter(i => i.severity === 'high');
        const completedHigh = highItems.filter(i => checkedItems.has(i.id)).length;

        // Calculate weighted score
        const maxScore = allItems.reduce((sum, i) => sum + severityWeights[i.severity], 0);
        const currentScore = completedItems.reduce((sum, i) => sum + severityWeights[i.severity], 0);
        const readinessScore = Math.round((currentScore / maxScore) * 100);

        // Determine audit readiness status
        let readinessStatus: 'not-ready' | 'partial' | 'ready' = 'not-ready';
        if (readinessScore >= 80 && completedCritical === criticalItems.length) {
            readinessStatus = 'ready';
        } else if (readinessScore >= 50) {
            readinessStatus = 'partial';
        }

        return {
            progress,
            completedCritical,
            totalCritical: criticalItems.length,
            completedHigh,
            totalHigh: highItems.length,
            readinessScore,
            readinessStatus,
        };
    }, [checkedItems]);

    // Export to PDF (print)
    const handleExportPDF = () => {
        toast.info('Opening print dialog...');
        window.print();
    };

    // Export to JSON
    const handleExportJSON = () => {
        const report = {
            projectName: projectName || 'Unnamed Project',
            generatedAt: new Date().toISOString(),
            progress: `${checkedItems.size}/${allItems.length}`,
            readinessScore: stats.readinessScore,
            notes: projectNotes,
            checklist: categories.map(category => ({
                category,
                items: checklistData[category as keyof typeof checklistData].map(item => ({
                    ...item,
                    completed: checkedItems.has(item.id),
                })),
            })),
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pre-audit-checklist-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Checklist exported as JSON');
    };

    // Generate AI Report (simulated)
    const handleGenerateReport = async () => {
        if (checkedItems.size === 0) {
            toast.error('Please complete at least some checklist items first');
            return;
        }

        toast.info('Generating AI security report...');

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const uncheckedCritical = allItems.filter(i => i.severity === 'critical' && !checkedItems.has(i.id));

        if (uncheckedCritical.length > 0) {
            toast.warning(`Report generated with ${uncheckedCritical.length} critical items incomplete`, {
                description: 'Address critical items before proceeding to audit.',
            });
        } else {
            toast.success('Pre-audit report generated successfully!');
        }
    };

    // Reset checklist
    const handleReset = () => {
        setCheckedItems(new Set());
        toast.info('Checklist reset');
    };

    const getReadinessColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-[#4ade80]';
            case 'partial': return 'text-[#facc15]';
            default: return 'text-[#f87171]';
        }
    };

    const getReadinessLabel = (status: string) => {
        switch (status) {
            case 'ready': return 'Ready for Audit';
            case 'partial': return 'Partially Ready';
            default: return 'Not Ready';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-5">
                {/* Page Header */}
                <PageHeader
                    title="Pre-Audit Checklist"
                    description="AI-generated security checklist to prepare your project for professional audit"
                    rightContent={<ProgressBadge current={checkedItems.size} total={allItems.length} />}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GlassStatCard
                        title="Readiness Score"
                        value={`${stats.readinessScore}%`}
                        variant={stats.readinessScore >= 80 ? 'success' : stats.readinessScore >= 50 ? 'warning' : 'danger'}
                    />
                    <GlassStatCard
                        title="Critical Items"
                        value={`${stats.completedCritical}/${stats.totalCritical}`}
                        variant={stats.completedCritical === stats.totalCritical ? 'success' : 'danger'}
                    />
                    <GlassStatCard
                        title="High Priority"
                        value={`${stats.completedHigh}/${stats.totalHigh}`}
                        variant={stats.completedHigh === stats.totalHigh ? 'success' : 'warning'}
                    />
                    <GlassStatCard
                        title="Status"
                        value={getReadinessLabel(stats.readinessStatus)}
                        variant={stats.readinessStatus === 'ready' ? 'success' : stats.readinessStatus === 'partial' ? 'warning' : 'danger'}
                    />
                </div>

                {/* Progress Bar */}
                <ProgressBar progress={checkedItems.size} max={allItems.length} />

                {/* Project Details */}
                <GlassContainerCard title="Project Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Project Name"
                            type="text"
                            placeholder="Enter your project name..."
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                        <div className="flex items-end gap-2">
                            <SecondaryButton onClick={() => setShowTips(!showTips)}>
                                {showTips ? 'Hide Tips' : 'Show Tips'}
                            </SecondaryButton>
                            <SecondaryButton onClick={handleReset}>
                                Reset
                            </SecondaryButton>
                        </div>
                    </div>
                    <div className="mt-4">
                        <FormTextarea
                            label="Notes"
                            placeholder="Add any notes about your project's security considerations..."
                            value={projectNotes}
                            onChange={(e) => setProjectNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </GlassContainerCard>

                {/* Category Navigation */}
                <div className="flex flex-wrap gap-2">
                    <SecondaryButton
                        onClick={() => setActiveCategory(null)}
                        className={!activeCategory ? '!border-[#f97316] !text-[#f97316]' : ''}
                    >
                        All Categories
                    </SecondaryButton>
                    {categories.map(category => {
                        const categoryItems = checklistData[category as keyof typeof checklistData];
                        const completed = categoryItems.filter(i => checkedItems.has(i.id)).length;
                        return (
                            <SecondaryButton
                                key={category}
                                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                                className={activeCategory === category ? '!border-[#f97316] !text-[#f97316]' : ''}
                            >
                                {category} ({completed}/{categoryItems.length})
                            </SecondaryButton>
                        );
                    })}
                </div>

                {/* Checklist Categories */}
                {(activeCategory ? [activeCategory] : categories).map(category => (
                    <GlassContainerCard key={category} title={category}>
                        <div className="space-y-3">
                            {checklistData[category as keyof typeof checklistData].map((item) => (
                                <div key={item.id}>
                                    <label className={`flex items-start gap-3 p-4 rounded-lg bg-white/[0.02] ring-1 transition-all cursor-pointer group ${checkedItems.has(item.id)
                                        ? 'ring-green-500/30 bg-green-500/5'
                                        : 'ring-white/5 hover:ring-white/10'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={checkedItems.has(item.id)}
                                            onChange={(e) => handleItemChange(item.id, e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent checked:bg-orange-500 checked:border-orange-500 focus:ring-0 focus:ring-offset-0"
                                        />
                                        <div className="flex-1">
                                            <p className={`text-sm transition-colors ${checkedItems.has(item.id)
                                                ? 'text-white/50 line-through'
                                                : 'text-white group-hover:text-orange-400'
                                                }`}>
                                                {item.item}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`text-xs uppercase font-medium ${item.severity === 'critical' ? 'text-red-400' :
                                                    item.severity === 'high' ? 'text-orange-400' :
                                                        item.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                    {item.severity}
                                                </span>
                                            </div>
                                            {showTips && (
                                                <p className="text-white/40 text-xs mt-2 italic">
                                                    Tip: {item.tip}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </GlassContainerCard>
                ))}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <PrimaryButton onClick={handleGenerateReport} className="flex-1">
                        Generate AI Report
                    </PrimaryButton>
                    <SecondaryButton onClick={handleExportPDF}>
                        Export PDF
                    </SecondaryButton>
                    <SecondaryButton onClick={handleExportJSON}>
                        Export JSON
                    </SecondaryButton>
                </div>

                {/* Next Steps */}
                <GlassContainerCard title="Next Steps">
                    <div className="space-y-4">
                        {stats.readinessStatus === 'not-ready' && (
                            <Card className="p-5 ring-1 ring-red-500/30" hover={false} blobIntensity="subtle" rounded="md">
                                <p className="text-white font-semibold mb-1">Not Ready for Audit</p>
                                <p className="text-white/60 text-sm">
                                    Complete the critical items above before proceeding. Focus on the red-labeled items first.
                                </p>
                            </Card>
                        )}
                        {stats.readinessStatus === 'partial' && (
                            <Card className="p-5 ring-1 ring-yellow-500/30" hover={false} blobIntensity="subtle" rounded="md">
                                <p className="text-white font-semibold mb-1">Almost There</p>
                                <p className="text-white/60 text-sm">
                                    Good progress! Complete the remaining items, especially critical ones, to maximize your audit readiness.
                                </p>
                            </Card>
                        )}
                        {stats.readinessStatus === 'ready' && (
                            <Card className="p-5 ring-1 ring-green-500/30" hover={false} blobIntensity="subtle" rounded="md">
                                <p className="text-white font-semibold mb-1">Ready for Professional Audit</p>
                                <p className="text-white/60 text-sm">
                                    Congratulations! Your project meets the pre-audit requirements. You are now ready to engage with professional auditors.
                                </p>
                            </Card>
                        )}
                    </div>
                </GlassContainerCard>
            </div >
        </DashboardLayout >
    );
}
