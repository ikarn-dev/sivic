'use client';

import { useState } from 'react';
import { Severity, getRiskGrade } from '@/lib/security-rules';
import { getGradeColor, getGradeDescription, getSeverityColor } from '@/lib/risk-aggregator';

interface RiskScoreGaugeProps {
    score: number;
    confidence: number;
    breakdown?: {
        patternMatch: number;
        onChain: number;
        aiAnalysis: number;
    };
    size?: 'sm' | 'md' | 'lg';
    showBreakdown?: boolean;
}

export function RiskScoreGauge({
    score,
    confidence,
    breakdown,
    size = 'md',
    showBreakdown = true
}: RiskScoreGaugeProps) {
    const grade = getRiskGrade(score);
    const gradeColor = getGradeColor(grade);
    const gradeDescription = getGradeDescription(grade);

    const sizeMap = {
        sm: { gauge: 120, strokeWidth: 10, fontSize: '2rem' },
        md: { gauge: 180, strokeWidth: 14, fontSize: '3rem' },
        lg: { gauge: 240, strokeWidth: 18, fontSize: '4rem' },
    };

    const config = sizeMap[size];
    const radius = (config.gauge - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Main Gauge */}
            <div className="relative" style={{ width: config.gauge, height: config.gauge }}>
                {/* Background circle */}
                <svg
                    className="rotate-[-90deg]"
                    width={config.gauge}
                    height={config.gauge}
                >
                    <circle
                        cx={config.gauge / 2}
                        cy={config.gauge / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={config.strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={config.gauge / 2}
                        cy={config.gauge / 2}
                        r={radius}
                        stroke={gradeColor}
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 8px ${gradeColor}40)`,
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-bold"
                        style={{
                            fontSize: config.fontSize,
                            color: gradeColor,
                            textShadow: `0 0 20px ${gradeColor}40`,
                        }}
                    >
                        {grade}
                    </span>
                    <span className="text-white/60 text-sm">{score}/100</span>
                </div>
            </div>

            {/* Grade description */}
            <div className="text-center">
                <p className="text-white/80 text-sm">{gradeDescription}</p>
                <p className="text-white/40 text-xs mt-1">Confidence: {confidence}%</p>
            </div>

            {/* Breakdown bars */}
            {showBreakdown && breakdown && (
                <div className="w-full max-w-xs space-y-3 mt-4">
                    <BreakdownBar
                        label="Pattern Match"
                        value={breakdown.patternMatch}
                        color="#8b5cf6"
                    />
                    <BreakdownBar
                        label="On-Chain Analysis"
                        value={breakdown.onChain}
                        color="#06b6d4"
                    />
                    <BreakdownBar
                        label="AI Analysis"
                        value={breakdown.aiAnalysis}
                        color="#f59e0b"
                    />
                </div>
            )}
        </div>
    );
}

interface BreakdownBarProps {
    label: string;
    value: number;
    color: string;
}

function BreakdownBar({ label, value, color }: BreakdownBarProps) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">{label}</span>
                <span className="text-white/80">{value}/100</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${value}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}60`,
                    }}
                />
            </div>
        </div>
    );
}

// Security check card component
interface SecurityCheckCardProps {
    type: string;
    severity: Severity;
    description: string;
    evidence?: string;
    remediation?: string;
    expanded?: boolean;
}

export function SecurityCheckCard({
    type,
    severity,
    description,
    evidence,
    remediation,
    expanded: defaultExpanded = false,
}: SecurityCheckCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const severityColor = getSeverityColor(severity);

    const severityIcons: Record<Severity, string> = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
    };

    return (
        <div
            className="rounded-lg border border-white/10 bg-white/5 overflow-hidden transition-all duration-300"
            style={{ borderLeftColor: severityColor, borderLeftWidth: 3 }}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{severityIcons[severity]}</span>
                    <div className="text-left">
                        <p className="text-white font-medium">{type}</p>
                        <p className="text-white/60 text-sm">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-1 rounded text-xs font-medium uppercase"
                        style={{
                            backgroundColor: `${severityColor}20`,
                            color: severityColor,
                        }}
                    >
                        {severity}
                    </span>
                    <svg
                        className={`w-5 h-5 text-white/40 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    {evidence && (
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Evidence</p>
                            <p className="text-white/80 text-sm font-mono bg-black/30 rounded px-3 py-2">
                                {evidence}
                            </p>
                        </div>
                    )}
                    {remediation && (
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Remediation</p>
                            <p className="text-green-400/80 text-sm">{remediation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// On-chain checks display
interface OnChainChecksProps {
    authorities: Array<{
        type: string;
        exists: boolean;
        address: string | null;
        isMultisig: boolean;
        isDisabled: boolean;
        risk: Severity;
    }>;
    tokenMetadata?: {
        name: string;
        symbol: string;
        totalSupply: number;
        holders: number;
        topHolderPercentage: number;
        age: number;
        isMutable: boolean;
        risk: Severity;
    };
}

export function OnChainChecks({ authorities, tokenMetadata }: OnChainChecksProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-cyan-400">⛓️</span>
                On-Chain Verification
            </h3>

            {/* Authority checks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {authorities.map((auth, idx) => (
                    <AuthorityCheckItem key={idx} authority={auth} />
                ))}
            </div>

            {/* Token metadata */}
            {tokenMetadata && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white/80 font-medium mb-3">Token Metadata</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-white/40">Name:</span>
                            <span className="text-white ml-2">{tokenMetadata.name}</span>
                        </div>
                        <div>
                            <span className="text-white/40">Symbol:</span>
                            <span className="text-white ml-2">{tokenMetadata.symbol}</span>
                        </div>
                        <div>
                            <span className="text-white/40">Supply:</span>
                            <span className="text-white ml-2">
                                {tokenMetadata.totalSupply.toLocaleString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-white/40">Age:</span>
                            <span className="text-white ml-2">{tokenMetadata.age} days</span>
                        </div>
                        <div>
                            <span className="text-white/40">Top Holder:</span>
                            <span
                                className="ml-2"
                                style={{ color: tokenMetadata.topHolderPercentage > 50 ? '#ef4444' : '#22c55e' }}
                            >
                                {tokenMetadata.topHolderPercentage.toFixed(1)}%
                            </span>
                        </div>
                        <div>
                            <span className="text-white/40">Mutable:</span>
                            <span
                                className="ml-2"
                                style={{ color: tokenMetadata.isMutable ? '#eab308' : '#22c55e' }}
                            >
                                {tokenMetadata.isMutable ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface AuthorityCheckItemProps {
    authority: {
        type: string;
        exists: boolean;
        address: string | null;
        isMultisig: boolean;
        isDisabled: boolean;
        risk: Severity;
    };
}

function AuthorityCheckItem({ authority }: AuthorityCheckItemProps) {
    const statusColor = authority.isDisabled
        ? '#22c55e'
        : authority.isMultisig
            ? '#eab308'
            : '#ef4444';

    const statusLabel = authority.isDisabled
        ? 'Disabled'
        : authority.isMultisig
            ? 'Multisig'
            : 'Active';

    const statusIcon = authority.isDisabled ? '✓' : authority.isMultisig ? '⚡' : '⚠';

    return (
        <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
            <div>
                <p className="text-white font-medium capitalize">{authority.type} Authority</p>
                {authority.address && (
                    <p className="text-white/40 text-xs font-mono truncate max-w-[120px]">
                        {authority.address.slice(0, 8)}...{authority.address.slice(-6)}
                    </p>
                )}
            </div>
            <div
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
            >
                <span>{statusIcon}</span>
                {statusLabel}
            </div>
        </div>
    );
}

// Exploit pattern match display
interface ExploitPatternMatchProps {
    matches: Array<{
        technique: string;
        ruleIds: string[];
        occurrences: number;
        averageLoss: number;
    }>;
}

export function ExploitPatternMatch({ matches }: ExploitPatternMatchProps) {
    if (matches.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-red-400">🎯</span>
                Known Exploit Pattern Matches
            </h3>

            <div className="space-y-2">
                {matches.map((match, idx) => (
                    <div
                        key={idx}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{match.technique}</p>
                            <span className="text-red-400 text-sm">
                                ${(match.averageLoss / 1000000).toFixed(1)}M avg loss
                            </span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">
                            {match.occurrences} historical occurrences • Rules: {match.ruleIds.join(', ')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Summary card
interface AnalysisSummaryCardProps {
    summary: {
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topRisks: string[];
        recommendation: string;
    };
}

export function AnalysisSummaryCard({ summary }: AnalysisSummaryCardProps) {
    const totalFindings = summary.criticalCount + summary.highCount + summary.mediumCount + summary.lowCount;

    return (
        <div className="p-4 bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/10">
            <h3 className="text-white font-semibold mb-4">Analysis Summary</h3>

            {/* Severity counts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <SeverityBadge label="Critical" count={summary.criticalCount} color="#ef4444" />
                <SeverityBadge label="High" count={summary.highCount} color="#f97316" />
                <SeverityBadge label="Medium" count={summary.mediumCount} color="#eab308" />
                <SeverityBadge label="Low" count={summary.lowCount} color="#22c55e" />
            </div>

            {/* Top risks */}
            {summary.topRisks.length > 0 && (
                <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase mb-2">Top Risks</p>
                    <div className="flex flex-wrap gap-2">
                        {summary.topRisks.map((risk, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded"
                            >
                                {risk}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendation */}
            <div className="p-3 bg-black/30 rounded border-l-2 border-cyan-400">
                <p className="text-white/80 text-sm">{summary.recommendation}</p>
            </div>
        </div>
    );
}

interface SeverityBadgeProps {
    label: string;
    count: number;
    color: string;
}

function SeverityBadge({ label, count, color }: SeverityBadgeProps) {
    return (
        <div
            className="text-center p-2 rounded"
            style={{ backgroundColor: `${color}15` }}
        >
            <p className="text-2xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs text-white/40">{label}</p>
        </div>
    );
}

export default {
    RiskScoreGauge,
    SecurityCheckCard,
    OnChainChecks,
    ExploitPatternMatch,
    AnalysisSummaryCard,
};
