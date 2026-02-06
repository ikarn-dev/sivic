/**
 * Contract Audit API Route
 * 
 * Analyzes Solana smart contracts for vulnerabilities.
 * Note: AI-powered analysis is done client-side via Puter.js
 * This route provides heuristic-based analysis as a fallback.
 * 
 * POST /api/contract-audit
 * Body: { contractAddress?: string, sourceCode?: string }
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for vulnerability report
export interface Vulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
    codeLocation?: string;
    cweId?: string;
}

export interface AuditReport {
    contractAddress?: string;
    overallScore: number; // 0-100 (higher = safer)
    riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    vulnerabilities: Vulnerability[];
    summary: string;
    gasOptimizations?: string[];
    bestPractices?: string[];
    analyzedAt: string;
    analysisType: 'address' | 'source';
}

interface ErrorResponse {
    error: string;
    message: string;
}

/**
 * Analyze contract using heuristics
 * Note: AI-powered analysis is done client-side via Puter.js
 */
async function analyzeContract(
    input: { address?: string; code?: string },
    type: 'address' | 'source'
): Promise<AuditReport> {
    return getSimulatedAuditReport(input, type);
}

/**
 * Heuristic-based audit report
 */
function getSimulatedAuditReport(
    input: { address?: string; code?: string },
    type: 'address' | 'source'
): AuditReport {
    const hasCode = type === 'source' && input.code;

    // Generate realistic vulnerabilities based on input
    const vulnerabilities: Vulnerability[] = [];

    if (hasCode) {
        // Check for common patterns in code
        const code = input.code!.toLowerCase();

        if (!code.includes('signer') && !code.includes('is_signer')) {
            vulnerabilities.push({
                id: 'VULN-001',
                severity: 'critical',
                title: 'Missing Signer Verification',
                description: 'The contract does not appear to verify transaction signers. This could allow unauthorized accounts to execute privileged operations.',
                recommendation: 'Add explicit signer checks using require!(ctx.accounts.authority.is_signer, ErrorCode::Unauthorized)',
                cweId: 'CWE-287',
            });
        }

        if (!code.includes('owner') && !code.includes('authority')) {
            vulnerabilities.push({
                id: 'VULN-002',
                severity: 'high',
                title: 'No Owner/Authority Check',
                description: 'Contract lacks owner or authority validation, potentially allowing any user to modify critical state.',
                recommendation: 'Implement owner checks and store the authority pubkey in a PDA.',
                cweId: 'CWE-284',
            });
        }

        if (code.includes('transfer') && !code.includes('checked')) {
            vulnerabilities.push({
                id: 'VULN-003',
                severity: 'medium',
                title: 'Unchecked Token Transfer',
                description: 'Token transfers should use checked arithmetic to prevent overflow/underflow issues.',
                recommendation: 'Use checked_add, checked_sub, or the checked_* variants of token transfer.',
                cweId: 'CWE-190',
            });
        }

        if (code.length < 200) {
            vulnerabilities.push({
                id: 'VULN-004',
                severity: 'low',
                title: 'Minimal Code Analysis',
                description: 'The provided code snippet is very short. A complete audit requires the full contract source.',
                recommendation: 'Provide the complete contract source code for comprehensive analysis.',
            });
        }
    } else {
        // Address-based analysis (limited without source)
        vulnerabilities.push({
            id: 'INFO-001',
            severity: 'low',
            title: 'Limited Analysis Available',
            description: 'Without source code, only on-chain behavior patterns can be analyzed. For a complete audit, provide the source code.',
            recommendation: 'Submit source code for comprehensive vulnerability detection.',
        });
    }

    // Calculate score based on vulnerabilities
    let score = 100;
    for (const vuln of vulnerabilities) {
        switch (vuln.severity) {
            case 'critical': score -= 30; break;
            case 'high': score -= 20; break;
            case 'medium': score -= 10; break;
            case 'low': score -= 5; break;
        }
    }
    score = Math.max(0, Math.min(100, score));

    let riskLevel: AuditReport['riskLevel'] = 'safe';
    if (score < 25) riskLevel = 'critical';
    else if (score < 50) riskLevel = 'high';
    else if (score < 70) riskLevel = 'medium';
    else if (score < 90) riskLevel = 'low';

    return {
        contractAddress: input.address,
        overallScore: score,
        riskLevel,
        vulnerabilities,
        summary: `[HEURISTIC ANALYSIS] ${vulnerabilities.length > 0
            ? `Found ${vulnerabilities.length} potential issue(s). ${vulnerabilities.filter(v => v.severity === 'critical').length} critical, ${vulnerabilities.filter(v => v.severity === 'high').length} high severity.`
            : 'No significant vulnerabilities detected in initial analysis.'} For AI-powered analysis, use client-side Puter.js integration.`,
        gasOptimizations: hasCode ? [
            'Consider using PDAs instead of key pairs for derived accounts',
            'Batch similar operations to reduce transaction overhead',
        ] : [],
        bestPractices: [
            'Implement comprehensive error handling with custom error codes',
            'Add detailed program logs for debugging and monitoring',
            'Use Anchor framework constraints for account validation',
        ],
        analyzedAt: new Date().toISOString(),
        analysisType: type,
    };
}

// POST handler
export async function POST(request: NextRequest): Promise<NextResponse<AuditReport | ErrorResponse>> {
    try {
        const body = await request.json();
        const { contractAddress, sourceCode } = body;

        // Validate input
        if (!contractAddress && !sourceCode) {
            return NextResponse.json(
                { error: 'Invalid request', message: 'Provide either a contract address or source code' },
                { status: 400 }
            );
        }

        const type: 'address' | 'source' = sourceCode ? 'source' : 'address';
        const input = {
            address: contractAddress?.trim(),
            code: sourceCode?.trim(),
        };

        // Validate contract address format (basic check)
        if (type === 'address' && input.address) {
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.address)) {
                return NextResponse.json(
                    { error: 'Invalid address', message: 'Please provide a valid Solana program address' },
                    { status: 400 }
                );
            }
        }

        // Validate source code (minimum length)
        if (type === 'source' && input.code && input.code.length < 20) {
            return NextResponse.json(
                { error: 'Invalid code', message: 'Source code is too short for meaningful analysis' },
                { status: 400 }
            );
        }

        console.log(`[Contract-Audit] Analyzing ${type}:`,
            type === 'address' ? input.address : `${input.code?.substring(0, 50)}...`);

        const report = await analyzeContract(input, type);

        console.log('[Contract-Audit] Analysis complete:', {
            score: report.overallScore,
            vulnerabilities: report.vulnerabilities.length,
            riskLevel: report.riskLevel,
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('[Contract-Audit] Request error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', message: 'Failed to analyze contract' },
            { status: 500 }
        );
    }
}

// GET handler for health check
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/contract-audit',
        method: 'POST',
        aiProvider: 'puter.js (client-side)',
        acceptedInputs: ['contractAddress', 'sourceCode'],
        message: 'Heuristic analysis available. AI-powered analysis via Puter.js on client-side.',
    });
}
