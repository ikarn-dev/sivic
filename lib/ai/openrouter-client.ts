/**
 * OpenRouter AI Client - NVIDIA Nemotron Model
 * 
 * Features:
 * - Uses nvidia/nemotron-3-nano-30b-a3b:free model
 * - Handles reasoning extraction from 'reasoning' or 'reasoning_details'
 * - Multiple API keys with rotation
 * - Robust error handling
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
            reasoning?: string; // Some models use this
            reasoning_details?: any; // Others use this
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

// NVIDIA Nemotron - Free, fast, reasoning-capable
const AI_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free'; 

const REQUEST_TIMEOUT_MS = 25000; // 25s should be enough for nano model

const SYSTEM_PROMPT = `You are a Solana security analyst. Analyze the provided token/contract data and return ONLY a JSON object with this exact structure:
{"summary":"2 sentence summary of security assessment","riskAssessment":"1 sentence overall risk verdict","keyFindings":["finding1","finding2","finding3"],"recommendations":["rec1","rec2","rec3"]}
Do not include any text outside the JSON object.`;

// ===========================================
// API KEY MANAGEMENT
// ===========================================

let currentKeyIndex = 0;

function getAPIKeys(): string[] {
    const keys: string[] = [];
    const envKeys = [
        process.env.OPENROUTER_API_KEY,
        process.env.OPENROUTER_API_KEY_2,
        process.env.OPENROUTER_API_KEY_3,
        process.env.OPENROUTER_API_KEY_4,
        process.env.OPENROUTER_API_KEY_5
    ];
    envKeys.forEach(k => { if (k) keys.push(k); });
    return keys;
}

function getNextAPIKey(): string | null {
    const keys = getAPIKeys();
    if (keys.length === 0) return null;
    const key = keys[currentKeyIndex % keys.length];
    currentKeyIndex++;
    return key;
}

// ===========================================
// UTILS
// ===========================================

function extractMinimalData(detectionData: any): string {
    const minimal = {
        addr: detectionData.address?.slice(0, 12) + '...',
        type: detectionData.type || 'token',
        risk: detectionData.riskScore?.score || 0,
        grade: detectionData.riskScore?.grade || 'N/A',
        flags: {
            mintAuth: detectionData.securityData?.mintAuthority ? 'enabled' : 'disabled',
            freezeAuth: detectionData.securityData?.freezeAuthority ? 'enabled' : 'disabled',
            mutable: detectionData.securityData?.mutable || false,
        },
        market: {
            price: detectionData.marketOverview?.price || 0,
            mcap: detectionData.marketOverview?.marketCap || 0,
            liq: detectionData.marketOverview?.liquidity || 0,
        }
    };
    return JSON.stringify(minimal);
}

function constructAnalysisFromReasoning(reasoningText: string): AIAnalysisResult | null {
    try {
        const summary = extractSection(reasoningText, 'Summary', 'Risk Assessment') || 'Analysis completed based on available data.';
        const riskAssessment = extractSection(reasoningText, 'Risk Assessment', 'Key Findings') || 'Risk level determined from security flags and market data.';
        
        const keyFindings: string[] = [];
        const findingsSection = extractSection(reasoningText, 'Key Findings', 'Recommendations');
        if (findingsSection) {
            findingsSection.split(/\n\s*[-*\d.]+\s*/).forEach(b => {
                const cleaned = b.trim();
                if (cleaned.length > 10 && cleaned.length < 500) keyFindings.push(cleaned);
            });
        }
        if (keyFindings.length === 0) keyFindings.push('Analysis based on token security flags and market data');

        const recommendations: string[] = [];
        const recsSection = extractSection(reasoningText, 'Recommendations', '');
        if (recsSection) {
            recsSection.split(/\n\s*[-*\d.]+\s*/).forEach(b => {
                const cleaned = b.trim();
                if (cleaned.length > 10 && cleaned.length < 300) recommendations.push(cleaned);
            });
        }
        if (recommendations.length === 0) recommendations.push('Exercise caution when interacting with this asset');

        console.log('[OpenRouter] Constructed analysis from reasoning text');
        return {
            summary: summary.slice(0, 500),
            riskAssessment: riskAssessment.slice(0, 300),
            keyFindings: keyFindings.slice(0, 5),
            recommendations: recommendations.slice(0, 4),
        };
    } catch (error) {
        console.error('[OpenRouter] Failed to construct analysis from reasoning:', error);
        return null;
    }
}

function extractSection(text: string, startMarker: string, endMarker: string): string {
    const startRegex = new RegExp(`\\*\\*${startMarker}[^*]*\\*\\*:?\\s*`, 'i');
    const startMatch = text.match(startRegex);
    if (!startMatch) return '';
    const startIdx = startMatch.index! + startMatch[0].length;
    let endIdx = text.length;
    if (endMarker) {
        const endRegex = new RegExp(`\\*\\*${endMarker}[^*]*\\*\\*`, 'i');
        const endMatch = text.slice(startIdx).match(endRegex);
        if (endMatch && endMatch.index) endIdx = startIdx + endMatch.index;
    }
    return text.slice(startIdx, endIdx).trim();
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') throw new Error(`Request timeout after ${timeoutMs}ms`);
        throw error;
    }
}

// ===========================================
// CORE API CALLER
// ===========================================

async function callOpenRouter(
    messages: OpenRouterMessage[],
    maxTokens: number = 2000
): Promise<AIAnalysisResult | null> {
    const keys = getAPIKeys();
    if (keys.length === 0) {
        console.error('[OpenRouter] No API keys configured');
        return null;
    }

    // Try rotation
    for (let i = 0; i < keys.length; i++) {
        const apiKey = keys[currentKeyIndex % keys.length];
        currentKeyIndex++; // Rotate for next time
        
        console.log(`[OpenRouter] Using Nemotron (Key attempt ${i + 1}/${keys.length})...`);
        
        try {
            const response = await fetchWithTimeout(
                OPENROUTER_API_URL,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://sivic.app',
                        'X-Title': 'Sivic Security Analyzer',
                    },
                    body: JSON.stringify({
                        model: AI_MODEL,
                        messages,
                        reasoning: { enabled: true },
                        max_tokens: maxTokens,
                        temperature: 0.1,
                    }),
                },
                REQUEST_TIMEOUT_MS
            );

            if (!response.ok) {
                // Handle rate limits by continuing to next key
                if (response.status === 429) {
                    console.log('[OpenRouter] Rate limited, trying next key...');
                    await new Promise(r => setTimeout(r, 1000));
                    continue; 
                }
                const err = await response.text();
                console.error(`[OpenRouter] HTTP ${response.status}:`, err);
                continue; // Try next key for server errors too
            }

            const data: OpenRouterResponse = await response.json();
            
            // Extract content strategy
            let text = data.choices?.[0]?.message?.content;
            
            // Fallback to reasoning fields if content is empty
            if (!text || !text.trim()) {
                const msg = data.choices?.[0]?.message as any;
                if (msg.reasoning && msg.reasoning.trim()) {
                    console.log('[OpenRouter] Using "reasoning" field');
                    text = msg.reasoning;
                } else if (msg.reasoning_details && Array.isArray(msg.reasoning_details)) {
                    // Combine reasoning details
                     const combined = msg.reasoning_details
                        .filter((d: any) => d.type === 'reasoning.text' && d.text)
                        .map((d: any) => d.text)
                        .join('\n');
                    if (combined.trim()) {
                        console.log('[OpenRouter] Using "reasoning_details" array');
                        text = combined;
                    }
                }
            }

            if (!text || !text.trim()) {
                console.error('[OpenRouter] Empty response from model');
                continue;
            }

            // Extract JSON
            let jsonText = text;
            const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeMatch) jsonText = codeMatch[1];
            
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
                // Validate fields
                if (parsed.summary && (parsed.keyFindings || parsed.riskAssessment)) {
                    return parsed;
                }
            } else {
                console.log('[OpenRouter] No JSON found, attempting construction from text...');
                const constructed = constructAnalysisFromReasoning(text);
                if (constructed) return constructed;
            }

        } catch (error: any) {
            console.error('[OpenRouter] Error:', error.message);
            // Continue to next key on error
        }
    }

    return null;
}

// ===========================================
// PUBLIC EXPORTS
// ===========================================

export async function generateSecurityAnalysis(
    detectionData: any
): Promise<AIAnalysisResult | null> {
    const minimalData = extractMinimalData(detectionData);
    console.log('[OpenRouter] Starting Security Analysis. Input size:', minimalData.length);
    
    return callOpenRouter([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this Solana token for security risks: ${minimalData}` }
    ]);
}

export async function generateMEVReport(
    mevData: any
): Promise<AIAnalysisResult | null> {
    console.log('[OpenRouter] Starting MEV Report for:', mevData.transactionType);
    
    const context = {
        type: mevData.transactionType,
        score: mevData.riskScore,
        level: mevData.riskLevel,
        threats: mevData.threats?.map((t: any) => `${t.type} (${t.severity})`) || [],
        programs: mevData.onChainData?.programsDetected || [],
        fee: mevData.onChainData?.fee || 0,
    };
    const minimalData = JSON.stringify(context);

    const mevSystemPrompt = `You are a Solana MEV expert. Analyze the transaction risk data and return ONLY a JSON object with this exact structure:
{"summary":"2 sentences about MEV nature and risk","riskAssessment":"1 sentence overall verdict","keyFindings":["finding1","finding2","finding3"],"recommendations":["rec1","rec2","rec3"]}
Do not include any text outside the JSON object.`;

    return callOpenRouter([
        { role: 'system', content: mevSystemPrompt },
        { role: 'user', content: `Analyze MEV risk: ${minimalData}` }
    ], 1000); 
}

export function getAIStatus() {
    return {
        configured: getAPIKeys().length > 0,
        provider: 'OpenRouter',
        keyCount: getAPIKeys().length,
        model: AI_MODEL,
    };
}
