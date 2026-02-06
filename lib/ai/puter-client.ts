
/**
 * Puter.js Client (Client-Side)
 * 
 * Handles interaction with Puter.js AI for serverless inference.
 * Models: google/gemini-2.0-flash (or user specified)
 */

declare global {
    interface Window {
        puter: any;
    }
}

export interface AIAnalysisResult {
    summary: string;
    riskAssessment: string;
    keyFindings: string[];
    recommendations: string[];
}

export async function generateSecurityAnalysis(
    address: string,
    detectionData: any
): Promise<AIAnalysisResult | null> {
    if (typeof window === 'undefined' || !window.puter) {
        console.error('[Puter] Puter.js not loaded');
        return null;
    }

    try {
        // Using the latest Gemini 2.5 Flash model for best performance
        const model = 'google/gemini-2.5-flash';

        console.log('[Puter] ===========================================');
        console.log('[Puter] Starting AI Analysis for:', address);
        console.log('[Puter] Detection Mode:', detectionData?.detectionMode || 'unknown');
        console.log('[Puter] Input Address:', address);

        // Log the full detection data being sent
        console.log('[Puter] Detection Data Summary:');
        console.log('[Puter]   - Type:', detectionData?.type);
        console.log('[Puter]   - Risk Score:', detectionData?.riskScore?.score || 'N/A');
        console.log('[Puter]   - Risk Grade:', detectionData?.riskScore?.grade || 'N/A');
        console.log('[Puter]   - Total Params Checked:', detectionData?.totalParamsChecked || 'N/A');
        console.log('[Puter]   - Total Params Triggered:', detectionData?.totalParamsTriggered || 'N/A');
        console.log('[Puter]   - On-Chain Params:', detectionData?.onChainParamsChecked || 'N/A');
        console.log('[Puter]   - Off-Chain Params:', detectionData?.offChainParamsChecked || 'N/A');
        console.log('[Puter]   - Risk Indicators Count:', detectionData?.riskIndicators?.length || 0);
        console.log('[Puter]   - Token Name:', detectionData?.profileSummary?.tokenName || 'N/A');
        console.log('[Puter]   - Token Symbol:', detectionData?.profileSummary?.tokenSymbol || 'N/A');
        console.log('[Puter]   - Market Cap:', detectionData?.marketOverview?.marketCap || 'N/A');
        console.log('[Puter]   - Liquidity:', detectionData?.marketOverview?.liquidity || 'N/A');
        console.log('[Puter]   - Holders:', detectionData?.marketOverview?.holders || 'N/A');

        // Log risk indicators
        if (detectionData?.riskIndicators?.length > 0) {
            console.log('[Puter] Risk Indicators:');
            detectionData.riskIndicators.forEach((indicator: any, index: number) => {
                console.log(`[Puter]   [${index + 1}] ${indicator.severity.toUpperCase()} - ${indicator.name}: ${indicator.value}`);
            });
        }

        // Log full detection data (truncated for readability)
        console.log('[Puter] Full Detection Data (JSON):', JSON.stringify(detectionData, null, 2).substring(0, 1000) + '...');

        const prompt = `
You are a Solana Security Expert AI. Analyze the following contract data and provide a security assessment.

Contract Address: ${address}
Detection Data: ${JSON.stringify(detectionData, null, 2)}

Provide your analysis in the following JSON format ONLY:
{
    "summary": "Brief 1-sentence summary of the contract's security posture.",
    "riskAssessment": "Detailed paragraph assessing the risks, specifically mentioning any triggered parameters.",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}
`;

        console.log('[Puter] Sending request to Puter AI...');
        console.log('[Puter] Model:', model);
        console.log('[Puter] Prompt Length:', prompt.length, 'characters');

        const response = await window.puter.ai.chat(prompt, { model: model });

        console.log('[Puter] ===========================================');
        console.log('[Puter] Response received from Puter AI');
        console.log('[Puter] Response Type:', typeof response);
        console.log('[Puter] Response Keys:', Object.keys(response || {}));
        console.log('[Puter] Response Message Keys:', Object.keys(response?.message || {}));
        console.log('[Puter] Response:', JSON.stringify(response, null, 2).substring(0, 2000));

        let content = '';
        if (response && response.message && response.message.content) {
            // Handle potential array or string response from Puter
            if (Array.isArray(response.message.content)) {
                content = response.message.content[0]?.text || '';
                console.log('[Puter] Content extracted from array[0].text');
            } else {
                content = response.message.content;
                console.log('[Puter] Content extracted directly from message.content');
            }
        }

        if (!content) {
            console.warn('[Puter] No content in response');
            return null;
        }

        console.log('[Puter] Content Length:', content.length, 'characters');
        console.log('[Puter] Content Preview:', content.substring(0, 500) + '...');
        console.log('[Puter] Analysis generated successfully');

        // Clean up markdown code blocks if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log('[Puter] Cleaned Content Length:', cleanContent.length, 'characters');

        const result = JSON.parse(cleanContent) as AIAnalysisResult;

        console.log('[Puter] ===========================================');
        console.log('[Puter] AI Analysis Result:');
        console.log('[Puter]   - Summary:', result.summary);
        console.log('[Puter]   - Risk Assessment:', result.riskAssessment?.substring(0, 200) + '...');
        console.log('[Puter]   - Key Findings Count:', result.keyFindings?.length || 0);
        console.log('[Puter]   - Recommendations Count:', result.recommendations?.length || 0);
        console.log('[Puter] ===========================================');

        return result;

    } catch (error) {
        console.error('[Puter] ===========================================');
        console.error('[Puter] Request Failed!');
        console.error('[Puter] Error:', error);
        console.error('[Puter] Error Message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('[Puter] Stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('[Puter] ===========================================');
        return null;
    }
}
