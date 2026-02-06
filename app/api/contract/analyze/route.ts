/**
 * Contract Analysis API Route (v2)
 * 
 * Multi-layer security analysis with real-time timeline tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    SOLANA_SECURITY_RULES,
    matchSecurityPatterns,
    SecurityFinding,
} from '@/lib/security-rules';
import {
    getSolanaTechniques,
    SOLANA_EXPLOITS
} from '@/lib/exploit-patterns';
import {
    analyzeAddress,
    calculateRiskScore,
    TokenAnalysisData,
    AnalysisTimeline,
    RiskIndicator,
} from '@/lib/on-chain-analyzer';

// ============================================
// TYPES
// ============================================

interface AnalyzeRequest {
    address: string;
    sourceCode?: string;
    options?: {
        skipOnChain?: boolean;
        skipAI?: boolean;
        depth?: 'quick' | 'standard' | 'deep';
    };
}

interface AnalysisResult {
    address: string;
    timestamp: string;

    // Account Data
    accountType: 'token' | 'program' | 'account' | 'unknown';
    accountData: TokenAnalysisData;

    // Timeline
    timeline: AnalysisTimeline;

    // Risk Assessment
    riskScore: {
        overall: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        confidence: number;
        breakdown: {
            onChain: number;
            patternMatch: number;
            aiAnalysis: number;
        };
    };

    // Findings
    riskIndicators: RiskIndicator[];
    patternFindings: SecurityFinding[];

    // Summary
    summary: {
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
        topRisks: string[];
        recommendation: string;
    };

    // Remediations
    remediations: Array<{
        priority: number;
        severity: string;
        issue: string;
        action: string;
    }>;
}

// ============================================
// MAIN HANDLER
// ============================================

export async function POST(request: NextRequest) {
    try {
        const body: AnalyzeRequest = await request.json();
        const { address, sourceCode, options } = body;

        if (!address) {
            return NextResponse.json(
                { error: 'Contract address is required' },
                { status: 400 }
            );
        }

        // Validate Solana address format
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
            return NextResponse.json(
                { error: 'Invalid Solana address format' },
                { status: 400 }
            );
        }

        // ========================================
        // LAYER 1: On-Chain Analysis
        // ========================================
        const { data: accountData, timeline } = await analyzeAddress(address);
        const { score: onChainScore, grade } = calculateRiskScore(accountData);

        // ========================================
        // LAYER 2: Pattern Matching (if source code)
        // ========================================
        let patternFindings: SecurityFinding[] = [];
        let patternScore = 0;

        if (sourceCode) {
            patternFindings = matchSecurityPatterns(sourceCode);

            for (const finding of patternFindings) {
                switch (finding.severity) {
                    case 'critical': patternScore += 30; break;
                    case 'high': patternScore += 20; break;
                    case 'medium': patternScore += 10; break;
                    case 'low': patternScore += 3; break;
                }
            }
            patternScore = Math.min(patternScore, 100);
        }

        // ========================================
        // LAYER 3: AI Analysis (contextual)
        // ========================================
        let aiScore = 0;
        const aiInsights: string[] = [];

        // Generate contextual insights based on findings
        const criticalIndicators = accountData.riskIndicators.filter(r => r.severity === 'critical');
        const highIndicators = accountData.riskIndicators.filter(r => r.severity === 'high');
        const mediumIndicators = accountData.riskIndicators.filter(r => r.severity === 'medium');

        if (criticalIndicators.length > 0) {
            aiInsights.push(`Found ${criticalIndicators.length} critical risk indicator(s) that require immediate attention.`);
            aiScore += criticalIndicators.length * 20; // Each critical adds 20
        }

        if (highIndicators.length > 0) {
            aiInsights.push(`Found ${highIndicators.length} high risk indicator(s).`);
            aiScore += highIndicators.length * 10; // Each high adds 10
        }

        if (mediumIndicators.length > 0) {
            aiInsights.push(`Found ${mediumIndicators.length} medium risk indicator(s).`);
            aiScore += mediumIndicators.length * 3; // Each medium adds 3
        }

        if (accountData.type === 'token') {
            if (accountData.mintAuthority) {
                aiInsights.push('Token has active mint authority - unlimited inflation possible.');
                aiScore += 15;
            }
            if (accountData.freezeAuthority) {
                aiInsights.push('Active freeze authority can lock user accounts.');
                aiScore += 8;
            }
            if (accountData.holderConcentration && accountData.holderConcentration > 80) {
                aiInsights.push(`Top 10 holders control ${accountData.holderConcentration.toFixed(1)}% - high centralization risk.`);
                aiScore += 10;
            }
            if (accountData.holderConcentration && accountData.holderConcentration > 50) {
                aiInsights.push(`Top 10 holders control ${accountData.holderConcentration.toFixed(1)}% of supply.`);
                aiScore += 5;
            }
            if (accountData.ageInDays !== undefined && accountData.ageInDays < 7) {
                aiInsights.push(`Token is only ${accountData.ageInDays} days old - exercise caution.`);
                aiScore += 8;
            } else if (accountData.ageInDays !== undefined && accountData.ageInDays < 30) {
                aiInsights.push(`Token is ${accountData.ageInDays} days old - relatively new.`);
                aiScore += 3;
            }
        } else if (accountData.type === 'program') {
            if (accountData.isUpgradeable) {
                aiInsights.push('Program is upgradeable - verify the upgrade authority is secure.');
                aiScore += 10;
            } else {
                aiInsights.push('Program is immutable - code cannot be changed.');
                aiScore -= 5; // Positive for immutability
            }
        }

        // Check against known exploit patterns
        const matchingExploits = SOLANA_EXPLOITS.filter(exp =>
            (accountData.mintAuthority && exp.technique.toLowerCase().includes('mint')) ||
            (accountData.isUpgradeable && exp.technique.toLowerCase().includes('access'))
        );

        if (matchingExploits.length > 0) {
            aiInsights.push(
                `Similar patterns have been used in ${matchingExploits.length} historical exploits, ` +
                `totaling $${(matchingExploits.reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(0)}M in losses.`
            );
            aiScore += matchingExploits.length * 5;
        }

        // Cap AI score between 0-100
        aiScore = Math.max(0, Math.min(100, aiScore));

        // ========================================
        // CALCULATE COMBINED SCORE
        // ========================================
        const weights = { onChain: 0.5, pattern: 0.25, ai: 0.25 };

        const overallScore = Math.round(
            onChainScore * weights.onChain +
            patternScore * weights.pattern +
            aiScore * weights.ai
        );

        const confidence = sourceCode ? 85 :
            (timeline.steps.filter(s => s.status === 'complete').length / Math.max(timeline.steps.length, 1)) * 100;

        // ========================================
        // COUNT FINDINGS BY SEVERITY
        // ========================================
        const criticalCount = accountData.riskIndicators.filter(r => r.severity === 'critical').length +
            patternFindings.filter(f => f.severity === 'critical').length;
        const highCount = accountData.riskIndicators.filter(r => r.severity === 'high').length +
            patternFindings.filter(f => f.severity === 'high').length;
        const mediumCount = accountData.riskIndicators.filter(r => r.severity === 'medium').length +
            patternFindings.filter(f => f.severity === 'medium').length;
        const lowCount = accountData.riskIndicators.filter(r => r.severity === 'low').length +
            patternFindings.filter(f => f.severity === 'low').length;

        // ========================================
        // GENERATE RECOMMENDATION
        // ========================================
        let recommendation = '';
        if (criticalCount > 0) {
            recommendation = 'CRITICAL RISK: Do not interact until issues are resolved.';
        } else if (highCount > 0) {
            recommendation = 'HIGH RISK: Proceed with extreme caution and verify thoroughly.';
        } else if (mediumCount > 0) {
            recommendation = 'MODERATE RISK: Review findings before proceeding.';
        } else {
            recommendation = 'LOW RISK: Contract appears relatively safe.';
        }

        // ========================================
        // GENERATE REMEDIATIONS
        // ========================================
        const remediations: AnalysisResult['remediations'] = [];
        let priority = 1;

        // Add from risk indicators
        for (const indicator of accountData.riskIndicators.filter(r => r.remediation)) {
            remediations.push({
                priority: priority++,
                severity: indicator.severity,
                issue: indicator.name,
                action: indicator.remediation!,
            });
        }

        // Add from pattern findings
        for (const finding of patternFindings.filter(f => f.remediation)) {
            remediations.push({
                priority: priority++,
                severity: finding.severity,
                issue: finding.ruleName,
                action: finding.remediation,
            });
        }

        // Sort by severity
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        remediations.sort((a, b) =>
            severityOrder[a.severity as keyof typeof severityOrder] -
            severityOrder[b.severity as keyof typeof severityOrder]
        );

        // Re-number priorities
        remediations.forEach((r, i) => r.priority = i + 1);

        // ========================================
        // BUILD RESPONSE
        // ========================================
        const result: AnalysisResult = {
            address,
            timestamp: new Date().toISOString(),

            accountType: accountData.type,
            accountData,
            timeline,

            riskScore: {
                overall: overallScore,
                grade,
                confidence: Math.round(confidence),
                breakdown: {
                    onChain: onChainScore,
                    patternMatch: patternScore,
                    aiAnalysis: aiScore,
                },
            },

            riskIndicators: accountData.riskIndicators,
            patternFindings,

            summary: {
                criticalCount,
                highCount,
                mediumCount,
                lowCount,
                topRisks: accountData.riskIndicators
                    .filter(r => r.severity === 'critical' || r.severity === 'high')
                    .slice(0, 5)
                    .map(r => r.name),
                recommendation,
            },

            remediations,
        };

        return NextResponse.json({
            success: true,
            analysis: result,
            context: {
                solanaExploitTechniques: getSolanaTechniques().slice(0, 10),
                recentSolanaExploits: SOLANA_EXPLOITS.slice(0, 5),
                rulesApplied: SOLANA_SECURITY_RULES.length,
                aiInsights,
            },
            meta: {
                version: '2.0.0',
                analysisDepth: options?.depth || 'standard',
            },
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to analyze contract', details: (error as Error).message },
            { status: 500 }
        );
    }
}

// ============================================
// QUICK CHECK (GET)
// ============================================

export async function GET(request: NextRequest) {
    const address = request.nextUrl.searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Address parameter is required' },
            { status: 400 }
        );
    }

    try {
        const { data, timeline } = await analyzeAddress(address);
        const { score, grade } = calculateRiskScore(data);

        return NextResponse.json({
            success: true,
            address,
            accountType: data.type,
            quickCheck: {
                score,
                grade,
                riskIndicatorsCount: data.riskIndicators.length,
                criticalCount: data.riskIndicators.filter(r => r.severity === 'critical').length,
                highCount: data.riskIndicators.filter(r => r.severity === 'high').length,
            },
            duration: timeline.totalDuration,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Quick check failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
