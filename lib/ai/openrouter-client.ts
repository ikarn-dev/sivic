/**
 * OpenRouter AI Client - Optimized
 * 
 * Features:
 * - Multiple API keys with rotation (avoids rate limiting)
 * - Fast free models prioritized
 * - Minimal data payload for speed
 * - Fallback through all models and keys
 */

// ===========================================
// TYPES
// ===========================================

export interface AIAnalysisResult {
    summary: string;
    riskAssessment: string;
    keyFindings: string[];
    recommendations: string[];
}

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
    };
}

// ===========================================
// CONFIGURATION
// ===========================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Verified free models - Updated Feb 2026
const FREE_MODELS = [
    'google/gemma-3-27b-it:free',                         // Gemma 3 27B Instruct (reliable)
    'mistralai/mistral-nemo:free',                        // Mistral Nemo
    'openrouter/pony-alpha',                              // Pony Alpha (can be rate limited)
];

// Concise system prompt (fewer tokens = faster)
const SYSTEM_PROMPT = `Solana security analyst. Return only JSON:
{"summary":"2 short sentences","riskAssessment":"1 sentence","keyFindings":["f1","f2","f3"],"recommendations":["r1","r2","r3"]}`;

// ===========================================
// API KEY MANAGEMENT
// ===========================================

let currentKeyIndex = 0;

function getAPIKeys(): string[] {
    const keys: string[] = [];

    // Support up to 5 API keys
    const key1 = process.env.OPENROUTER_API_KEY;
    const key2 = process.env.OPENROUTER_API_KEY_2;
    const key3 = process.env.OPENROUTER_API_KEY_3;
    const key4 = process.env.OPENROUTER_API_KEY_4;
    const key5 = process.env.OPENROUTER_API_KEY_5;

    if (key1) keys.push(key1);
    if (key2) keys.push(key2);
    if (key3) keys.push(key3);
    if (key4) keys.push(key4);
    if (key5) keys.push(key5);

    return keys;
}

function getNextAPIKey(): string | null {
    const keys = getAPIKeys();
    if (keys.length === 0) return null;

    // Round-robin rotation
    const key = keys[currentKeyIndex % keys.length];
    currentKeyIndex++;
    return key;
}

// ===========================================
// MINIMAL DATA EXTRACTION
// ===========================================

function extractMinimalData(detectionData: any): string {
    // Only send essential data for analysis
    const minimal = {
        addr: detectionData.address?.slice(0, 12) + '...',
        type: detectionData.type || 'token',
        risk: detectionData.riskScore?.score || 0,
        grade: detectionData.riskScore?.grade || 'N/A',
        // Security flags only (no raw data)
        flags: {
            mintAuth: detectionData.securityData?.mintAuthority ? 'enabled' : 'disabled',
            freezeAuth: detectionData.securityData?.freezeAuthority ? 'enabled' : 'disabled',
            mutable: detectionData.securityData?.mutable || false,
        },
        // Market summary (minimal)
        market: {
            price: detectionData.marketOverview?.price || 0,
            mcap: detectionData.marketOverview?.marketCap || 0,
            liq: detectionData.marketOverview?.liquidity || 0,
        }
    };

    return JSON.stringify(minimal);
}

// ===========================================
// AI GENERATION
// ===========================================

async function generateWithModel(
    apiKey: string,
    model: string,
    minimalData: string
): Promise<AIAnalysisResult | null> {
    try {
        const userPrompt = `Analyze this Solana token: ${minimalData}`;

        const messages: OpenRouterMessage[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
        ];

        const isPonyAlpha = model.includes('pony-alpha');

        const requestBody: any = {
            model,
            messages,
            max_tokens: 300,
            temperature: 0.1,
        };

        // Enable reasoning for alpha models
        if (isPonyAlpha) {
            requestBody.reasoning = { enabled: true };
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const status = response.status;
            let errorDetail = '';
            try {
                const errorJson = await response.json();
                errorDetail = errorJson?.error?.message || JSON.stringify(errorJson);
            } catch {
                errorDetail = await response.text().catch(() => 'Unknown error');
            }
            console.error(`[OpenRouter] HTTP ${status} for ${model}: ${errorDetail}`);

            // Rate limited - return null to try next
            if (status === 429) return null;

            return null;
        }

        const data: OpenRouterResponse = await response.json();

        if (data.error) {
            console.error('[OpenRouter] API Error:', data.error.message);
            return null;
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) return null;

        // Fast JSON extraction
        let jsonText = text;

        // Remove code blocks
        const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeMatch) jsonText = codeMatch[1];

        // Extract JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

        // Quick validation
        if (!parsed.summary || !parsed.keyFindings) return null;

        // Ensure arrays exist
        if (!Array.isArray(parsed.keyFindings)) parsed.keyFindings = [];
        if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

        console.log(`[OpenRouter] Success with ${model}`);
        return parsed;

    } catch (error: any) {
        console.error(`[OpenRouter] Error with ${model}:`, error.message);
        return null;
    }
}

// ===========================================
// MAIN EXPORT
// ===========================================

export async function generateSecurityAnalysis(
    detectionData: any
): Promise<AIAnalysisResult | null> {
    console.log('[OpenRouter] Starting analysis for:', detectionData.address);

    const keys = getAPIKeys();
    if (keys.length === 0) {
        console.error('[OpenRouter] No API keys configured');
        return null;
    }

    // Extract minimal data once
    const minimalData = extractMinimalData(detectionData);
    console.log('[OpenRouter] Minimal data size:', minimalData.length, 'chars');

    // Try each model with rotating keys
    for (const model of FREE_MODELS) {
        // Get next API key (round-robin)
        const apiKey = getNextAPIKey();
        if (!apiKey) continue;

        console.log(`[OpenRouter] Trying ${model}`);

        const result = await generateWithModel(apiKey, model, minimalData);
        if (result) {
            return result;
        }

        // Small delay before next attempt to avoid burst rate limits
        await new Promise(r => setTimeout(r, 100));
    }

    // If all models failed with primary rotation, try backup keys with all models
    if (keys.length > 1) {
        console.log('[OpenRouter] Trying backup keys...');

        for (let keyIdx = 1; keyIdx < keys.length; keyIdx++) {
            const backupKey = keys[keyIdx];

            for (const model of FREE_MODELS.slice(0, 3)) { // Only fast models
                console.log(`[OpenRouter] Backup key ${keyIdx} with ${model}`);

                const result = await generateWithModel(backupKey, model, minimalData);
                if (result) {
                    return result;
                }
            }
        }
    }

    console.error('[OpenRouter] All attempts exhausted');
    return null;
}

// ===========================================
// MEV ANALYSIS
// ===========================================

export async function generateMEVReport(
    mevData: any
): Promise<AIAnalysisResult | null> {
    console.log('[OpenRouter] Starting MEV report for:', mevData.transactionType);

    const keys = getAPIKeys();
    if (keys.length === 0) return null;

    // Create a concise summary of the transaction for the AI
    const context = {
        type: mevData.transactionType,
        score: mevData.riskScore,
        level: mevData.riskLevel,
        threats: mevData.threats.map((t: any) => `${t.type} (${t.severity})`),
        programs: mevData.onChainData?.programsDetected || [],
        fee: mevData.onChainData?.fee || 0,
    };

    const minimalData = JSON.stringify(context);
    console.log('[OpenRouter] MEV Context size:', minimalData.length, 'chars');

    const systemPrompt = `Solana MEV expert. Analyze transaction risk. Return JSON:
{"summary":"2 sentences on the MEV nature","riskAssessment":"1 sentence verdict","keyFindings":["f1","f2","f3"],"recommendations":["r1","r2","r3"]}`;

    // Try primary models
    for (const model of FREE_MODELS) {
        const apiKey = getNextAPIKey();
        if (!apiKey) continue;

        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Analyze MEV risk: ${minimalData}` }
                    ],
                    max_tokens: 400,
                    temperature: 0.1,
                }),
            });

            if (!response.ok) continue;

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) continue;

            // Extract JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) continue;

            const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
            if (parsed.summary && parsed.keyFindings) {
                return parsed;
            }
        } catch (e) {
            console.error(`[OpenRouter] MEV Analysis error with ${model}:`, e);
        }
    }

    return null;
}

// ===========================================
// HEALTH CHECK
// ===========================================

export function getAIStatus(): {
    configured: boolean;
    provider: string;
    keyCount: number;
    models: string[];
} {
    const keys = getAPIKeys();
    return {
        configured: keys.length > 0,
        provider: 'OpenRouter',
        keyCount: keys.length,
        models: FREE_MODELS,
    };
}
