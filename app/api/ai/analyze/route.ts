/**
 * AI Analysis API Route
 * 
 * POST /api/ai/analyze
 * Generates AI-powered security analysis using OpenRouter free models.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSecurityAnalysis, getAIStatus } from '@/lib/ai/openrouter-client';

// POST - Generate AI analysis
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { detectionData } = body;

        if (!detectionData) {
            return NextResponse.json(
                { error: 'Detection data required' },
                { status: 400 }
            );
        }

        console.log('[AI-Analyze] Starting analysis for:', detectionData.address);

        const result = await generateSecurityAnalysis(detectionData);

        if (!result) {
            console.error('[AI-Analyze] Analysis failed');
            return NextResponse.json(
                { error: 'AI analysis failed', message: 'Unable to generate analysis' },
                { status: 500 }
            );
        }

        console.log('[AI-Analyze] Analysis complete');
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[AI-Analyze] Error:', error.message);
        return NextResponse.json(
            { error: 'Analysis failed', message: error.message },
            { status: 500 }
        );
    }
}

// GET - Health check
export async function GET() {
    const status = getAIStatus();

    return NextResponse.json({
        status: status.configured ? 'ok' : 'unconfigured',
        provider: status.provider,
        models: status.models,
        message: status.configured
            ? `OpenRouter AI ready with ${status.models.length} free models`
            : 'No OpenRouter API key configured (OPENROUTER_API_KEY)',
    });
}
