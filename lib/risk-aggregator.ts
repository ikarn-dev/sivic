/**
 * Risk Aggregator
 * 
 * Combines findings from all detection layers to calculate
 * a comprehensive risk score.
 */

import {
    SecurityFinding,
    RiskScore,
    RiskGrade,
    Severity,
    SEVERITY_SCORES,
    getRiskGrade
} from './security-rules';

// Detection layer weights
export const LAYER_WEIGHTS = {
    patternMatch: 0.25,   // 25% - Fast pattern detection
    onChain: 0.45,        // 45% - Primary blockchain evidence (most reliable)
    aiAnalysis: 0.30,     // 30% - AI contextual analysis
};

// On-chain check result types
export interface AuthorityCheck {
    type: 'mint' | 'freeze' | 'update' | 'admin';
    exists: boolean;
    address: string | null;
    isMultisig: boolean;
    isDisabled: boolean;
    risk: Severity;
}

export interface TokenMetadataCheck {
    name: string;
    symbol: string;
    totalSupply: number;
    holders: number;
    topHolderPercentage: number;
    age: number; // days
    isMutable: boolean;
    risk: Severity;
}

export interface TransactionPatternCheck {
    recentTxCount: number;
    largeTransactions: number;
    suspiciousPatterns: string[];
    risk: Severity;
}

export interface ProgramVerificationCheck {
    isVerified: boolean;
    isUpgradeable: boolean;
    hasTimeLock: boolean;
    lastUpgrade: Date | null;
    risk: Severity;
}

export interface OnChainAnalysisResult {
    authorities: AuthorityCheck[];
    tokenMetadata?: TokenMetadataCheck;
    transactionPatterns?: TransactionPatternCheck;
    programVerification?: ProgramVerificationCheck;
    overallRisk: Severity;
    score: number;
    findings: OnChainFinding[];
}

export interface OnChainFinding {
    type: string;
    severity: Severity;
    description: string;
    evidence: string;
    remediation: string;
}

export interface AIAnalysisResult {
    vulnerabilities: AIVulnerability[];
    recommendations: string[];
    contextualInsights: string[];
    confidence: number;
    score: number;
}

export interface AIVulnerability {
    name: string;
    severity: Severity;
    description: string;
    location?: string;
    confidence: number;
}

export interface CombinedAnalysisResult {
    address: string;
    timestamp: Date;
    riskScore: RiskScore;
    layers: {
        patternMatch: {
            findings: SecurityFinding[];
            score: number;
        };
        onChain: OnChainAnalysisResult;
        aiAnalysis: AIAnalysisResult;
    };
    summary: AnalysisSummary;
    remediations: PrioritizedRemediation[];
}

export interface AnalysisSummary {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    topRisks: string[];
    recommendation: string;
}

export interface PrioritizedRemediation {
    priority: number;
    severity: Severity;
    issue: string;
    action: string;
    references: string[];
}

// Calculate on-chain score from checks
export function calculateOnChainScore(result: OnChainAnalysisResult): number {
    let score = 0;

    // Authority checks (up to 40 points)
    for (const auth of result.authorities) {
        if (auth.exists && !auth.isMultisig && !auth.isDisabled) {
            score += auth.type === 'mint' ? 15 : 10;
        }
    }

    // Token metadata (up to 25 points)
    if (result.tokenMetadata) {
        if (result.tokenMetadata.topHolderPercentage > 50) score += 15;
        else if (result.tokenMetadata.topHolderPercentage > 25) score += 8;

        if (result.tokenMetadata.age < 7) score += 10;
        else if (result.tokenMetadata.age < 30) score += 5;

        if (result.tokenMetadata.isMutable) score += 5;
    }

    // Transaction patterns (up to 15 points)
    if (result.transactionPatterns) {
        score += Math.min(result.transactionPatterns.suspiciousPatterns.length * 5, 15);
    }

    // Program verification (up to 20 points)
    if (result.programVerification) {
        if (!result.programVerification.isVerified) score += 10;
        if (result.programVerification.isUpgradeable && !result.programVerification.hasTimeLock) {
            score += 10;
        }
    }

    return Math.min(score, 100);
}

// Calculate AI score from analysis
export function calculateAIScore(result: AIAnalysisResult): number {
    let score = 0;

    for (const vuln of result.vulnerabilities) {
        const baseScore = SEVERITY_SCORES[vuln.severity];
        const confidenceMultiplier = vuln.confidence / 100;
        score += baseScore * confidenceMultiplier;
    }

    return Math.min(score, 100);
}

// Aggregate all layers into final risk score
export function aggregateRiskScore(
    patternScore: number,
    onChainScore: number,
    aiScore: number,
    confidenceData: { pattern: number; onChain: number; ai: number }
): RiskScore {
    // Calculate weighted score
    const weightedScore =
        (patternScore * LAYER_WEIGHTS.patternMatch) +
        (onChainScore * LAYER_WEIGHTS.onChain) +
        (aiScore * LAYER_WEIGHTS.aiAnalysis);

    // Calculate overall confidence
    const overallConfidence =
        (confidenceData.pattern * LAYER_WEIGHTS.patternMatch) +
        (confidenceData.onChain * LAYER_WEIGHTS.onChain) +
        (confidenceData.ai * LAYER_WEIGHTS.aiAnalysis);

    return {
        overall: Math.round(weightedScore),
        confidence: Math.round(overallConfidence),
        breakdown: {
            patternMatch: Math.round(patternScore),
            onChain: Math.round(onChainScore),
            aiAnalysis: Math.round(aiScore),
        },
        grade: getRiskGrade(weightedScore),
    };
}

// Generate summary from all findings
export function generateSummary(
    patternFindings: SecurityFinding[],
    onChainFindings: OnChainFinding[],
    aiVulnerabilities: AIVulnerability[]
): AnalysisSummary {
    // Count by severity
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    const allFindings = [
        ...patternFindings.map(f => ({ name: f.ruleName, severity: f.severity })),
        ...onChainFindings.map(f => ({ name: f.type, severity: f.severity })),
        ...aiVulnerabilities.map(v => ({ name: v.name, severity: v.severity })),
    ];

    for (const finding of allFindings) {
        switch (finding.severity) {
            case 'critical': criticalCount++; break;
            case 'high': highCount++; break;
            case 'medium': mediumCount++; break;
            case 'low': lowCount++; break;
        }
    }

    // Top risks (critical and high)
    const topRisks = allFindings
        .filter(f => f.severity === 'critical' || f.severity === 'high')
        .slice(0, 5)
        .map(f => f.name);

    // Generate recommendation
    let recommendation = '';
    if (criticalCount > 0) {
        recommendation = 'CRITICAL: Immediate remediation required. Do not proceed with deployment until critical issues are resolved.';
    } else if (highCount > 0) {
        recommendation = 'HIGH RISK: Address high-severity issues before deployment. Consider professional security audit.';
    } else if (mediumCount > 0) {
        recommendation = 'MODERATE RISK: Review and address medium-severity issues. Apply security best practices.';
    } else if (lowCount > 0) {
        recommendation = 'LOW RISK: Minor improvements recommended. Contract appears relatively safe.';
    } else {
        recommendation = 'No significant issues detected. Consider professional audit for additional assurance.';
    }

    return {
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        topRisks,
        recommendation,
    };
}

// Prioritize remediations
export function prioritizeRemediations(
    patternFindings: SecurityFinding[],
    onChainFindings: OnChainFinding[],
    aiVulnerabilities: AIVulnerability[]
): PrioritizedRemediation[] {
    const remediations: PrioritizedRemediation[] = [];

    // Add pattern-based remediations
    for (const finding of patternFindings) {
        remediations.push({
            priority: 0, // Will be calculated
            severity: finding.severity,
            issue: finding.ruleName,
            action: finding.remediation,
            references: [],
        });
    }

    // Add on-chain remediations
    for (const finding of onChainFindings) {
        remediations.push({
            priority: 0,
            severity: finding.severity,
            issue: finding.type,
            action: finding.remediation,
            references: [],
        });
    }

    // Add AI remediations
    for (const vuln of aiVulnerabilities) {
        remediations.push({
            priority: 0,
            severity: vuln.severity,
            issue: vuln.name,
            action: vuln.description,
            references: [],
        });
    }

    // Sort by severity and deduplicate
    const priorityMap: Record<Severity, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
    };

    remediations.sort((a, b) => priorityMap[a.severity] - priorityMap[b.severity]);

    // Assign priorities
    remediations.forEach((r, idx) => {
        r.priority = idx + 1;
    });

    // Deduplicate by issue name
    const seen = new Set<string>();
    return remediations.filter(r => {
        if (seen.has(r.issue.toLowerCase())) return false;
        seen.add(r.issue.toLowerCase());
        return true;
    });
}

// Full analysis combination
export function combineAnalysis(
    address: string,
    patternFindings: SecurityFinding[],
    onChainResult: OnChainAnalysisResult,
    aiResult: AIAnalysisResult
): CombinedAnalysisResult {
    // Calculate individual scores
    const patternScore = patternFindings.reduce(
        (sum, f) => sum + SEVERITY_SCORES[f.severity],
        0
    );

    const onChainScore = calculateOnChainScore(onChainResult);
    const aiScore = calculateAIScore(aiResult);

    // Calculate confidence levels
    const patternConfidence = patternFindings.length > 0
        ? patternFindings.reduce((sum, f) => sum + f.confidence, 0) / patternFindings.length
        : 50;
    const onChainConfidence = 90; // On-chain data is highly reliable
    const aiConfidence = aiResult.confidence;

    // Aggregate risk score
    const riskScore = aggregateRiskScore(
        Math.min(patternScore, 100),
        onChainScore,
        aiScore,
        { pattern: patternConfidence, onChain: onChainConfidence, ai: aiConfidence }
    );

    // Generate summary and remediations
    const summary = generateSummary(patternFindings, onChainResult.findings, aiResult.vulnerabilities);
    const remediations = prioritizeRemediations(patternFindings, onChainResult.findings, aiResult.vulnerabilities);

    return {
        address,
        timestamp: new Date(),
        riskScore,
        layers: {
            patternMatch: {
                findings: patternFindings,
                score: Math.min(patternScore, 100),
            },
            onChain: onChainResult,
            aiAnalysis: aiResult,
        },
        summary,
        remediations,
    };
}

// Helper to get severity color
export function getSeverityColor(severity: Severity): string {
    switch (severity) {
        case 'critical': return '#ef4444'; // red-500
        case 'high': return '#f97316';     // orange-500
        case 'medium': return '#eab308';   // yellow-500
        case 'low': return '#22c55e';      // green-500
        default: return '#6b7280';         // gray-500
    }
}

// Helper to get grade color
export function getGradeColor(grade: RiskGrade): string {
    switch (grade) {
        case 'A': return '#22c55e'; // green-500
        case 'B': return '#84cc16'; // lime-500
        case 'C': return '#eab308'; // yellow-500
        case 'D': return '#f97316'; // orange-500
        case 'F': return '#ef4444'; // red-500
        default: return '#6b7280'; // gray-500
    }
}

// Helper to get grade description
export function getGradeDescription(grade: RiskGrade): string {
    switch (grade) {
        case 'A': return 'Very Safe - Minimal risk detected';
        case 'B': return 'Low Risk - Minor issues found';
        case 'C': return 'Medium Risk - Notable vulnerabilities present';
        case 'D': return 'High Risk - Significant vulnerabilities detected';
        case 'F': return 'Critical Risk - Severe vulnerabilities require immediate attention';
        default: return 'Unknown risk level';
    }
}

export default {
    calculateOnChainScore,
    calculateAIScore,
    aggregateRiskScore,
    generateSummary,
    prioritizeRemediations,
    combineAnalysis,
    getSeverityColor,
    getGradeColor,
    getGradeDescription,
    LAYER_WEIGHTS,
};
