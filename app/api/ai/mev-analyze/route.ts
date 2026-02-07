/**
 * MEV AI Analysis API Route
 * 
 * POST /api/ai/mev-analyze
 * Generates AI-powered MEV risk analysis using OpenRouter free models.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMEVReport } from '@/lib/ai/openrouter-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mevData } = body;

        if (!mevData) {
            return NextResponse.json(
                { error: 'MEV data required' },
                { status: 400 }
            );
        }

        console.log('[AI-MEV] Starting analysis for:', mevData.transactionType);

        const result = await generateMEVReport(mevData);

        if (!result) {
            console.error('[AI-MEV] Analysis failed');
            return NextResponse.json(
                { error: 'AI analysis failed', message: 'Unable to generate MEV analysis' },
                { status: 500 }
            );
        }

        console.log('[AI-MEV] Analysis complete');
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[AI-MEV] Error:', error.message);
        return NextResponse.json(
            { error: 'Analysis failed', message: error.message },
            { status: 500 }
        );
    }
}
