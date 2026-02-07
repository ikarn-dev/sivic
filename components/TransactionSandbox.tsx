import { useState } from 'react';
import { GlassContainerCard, GlassContainerEmpty } from '@/components/Card';
import { FormTextarea, PrimaryButton, SecondaryButton } from '@/components/FormElements';
import { toast } from 'sonner';
import { AIAnalysisCard } from '@/components/AnalysisTimeline';

// Types matching API response
interface MEVThreat {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
}

interface MEVAnalysisResult {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threats: MEVThreat[];
    recommendations: string[];
    transactionType: string;
    estimatedValue?: string;
    analyzedAt: string;
    // On-chain data from API
    onChainData?: {
        fetched: boolean;
        signature?: string;
        slot?: number;
        fee?: number;
        programsDetected: string[];
        isDexTransaction: boolean;
        innerInstructionsCount?: number;
    };
    // AI Analysis
    aiAnalysis?: {
        summary: string;
        riskAssessment: string;
        keyFindings: string[];
        recommendations: string[];
    };
}

interface TransactionSandboxProps {
    className?: string;
}

/**
 * Transaction Sandbox Component
 * Allows users to paste a transaction signature or raw data
 * for MEV risk assessment using AI analysis
 */
export function TransactionSandbox({ className = '' }: TransactionSandboxProps) {
    const [transaction, setTransaction] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
    const [result, setResult] = useState<MEVAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!transaction.trim()) {
            toast.error('Please enter a transaction');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);
        setIsAIAnalyzing(false);

        try {
            // Step 1: Standard MEV Analysis
            const response = await fetch('/api/mev-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction: transaction.trim() }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Analysis failed');
            }

            const data: MEVAnalysisResult = await response.json();
            setResult(data);

            // Show toast based on risk level
            if (data.riskLevel === 'critical') {
                toast.error('Critical MEV Risk Detected!', {
                    description: `Risk Score: ${data.riskScore}/100`,
                });
            } else if (data.riskLevel === 'high') {
                toast.warning('High MEV Risk Detected', {
                    description: `Risk Score: ${data.riskScore}/100`,
                });
            } else {
                toast.success('Analysis Complete', {
                    description: `Risk Score: ${data.riskScore}/100 (${data.riskLevel})`,
                });
            }

            // Step 2: AI Analysis (OpenRouter)
            setIsAIAnalyzing(true);
            try {
                const aiResponse = await fetch('/api/ai/mev-analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mevData: data }),
                });

                if (aiResponse.ok) {
                    const aiResult = await aiResponse.json();
                    setResult(prev => prev ? ({ ...prev, aiAnalysis: aiResult }) : null);
                    toast.success('AI Report Generated', {
                        description: 'Powered by OpenRouter'
                    });
                } else {
                    console.error('AI Analysis failed');
                    // Silently fail or show minor toast, main analysis already shown
                }
            } catch (aiError) {
                console.error('AI Analysis error:', aiError);
            } finally {
                setIsAIAnalyzing(false);
            }

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to analyze transaction';
            toast.error('Analysis Error', { description: message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClear = () => {
        setTransaction('');
        setResult(null);
        setIsAIAnalyzing(false);
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-white';
        }
    };

    const getRiskBgColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500/20 border-red-500/30';
            case 'high': return 'bg-orange-500/20 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
            case 'low': return 'bg-green-500/20 border-green-500/30';
            default: return 'bg-white/10 border-white/20';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-white';
        }
    };

    return (
        <GlassContainerCard title="Transaction Sandbox" className={className}>
            <div className="space-y-4">
                {/* Input Section */}
                <div>
                    <FormTextarea
                        placeholder="Paste a Solana transaction signature or raw transaction data..."
                        value={transaction}
                        onChange={(e) => setTransaction(e.target.value)}
                        rows={3}
                        disabled={isAnalyzing}
                    />
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-2">
                        Enter a transaction signature (e.g., 5abc...xyz) or paste raw transaction JSON
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <PrimaryButton
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !transaction.trim()}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            'Analyze MEV Risk'
                        )}
                    </PrimaryButton>
                    {(transaction || result) && (
                        <SecondaryButton onClick={handleClear} disabled={isAnalyzing}>
                            Clear
                        </SecondaryButton>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                        {/* AI Analysis Card */}
                        {result.aiAnalysis ? (
                            <AIAnalysisCard data={{ aiAnalysis: result.aiAnalysis } as any} />
                        ) : isAIAnalyzing ? (
                            <div className="p-6 rounded-lg border border-purple-500/20 bg-purple-500/5 animate-pulse">
                                <div className="flex items-center justify-center gap-3 text-purple-300">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="font-medium text-sm">Generating AI Report...</span>
                                </div>
                            </div>
                        ) : null}

                        {/* Risk Score Header */}
                        <div className={`p-4 rounded-lg border ${getRiskBgColor(result.riskLevel)}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[rgba(255,255,255,0.5)] mb-1">MEV Risk Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                                            {result.riskScore}
                                        </span>
                                        <span className="text-sm text-[rgba(255,255,255,0.5)]">/ 100</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-medium uppercase ${getRiskColor(result.riskLevel)}`}>
                                        {result.riskLevel} Risk
                                    </span>
                                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                                        Type: {result.transactionType}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* On-Chain Data Used for Analysis */}
                        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] text-[rgba(255,255,255,0.5)] uppercase tracking-wider">On-Chain Data</p>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${result.onChainData?.fetched ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {result.onChainData?.fetched ? 'Fetched from Helius' : 'Heuristic Only'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <p className="text-[rgba(255,255,255,0.4)] mb-1">Transaction Type</p>
                                    <p className="text-white font-medium">{result.transactionType}</p>
                                </div>
                                <div>
                                    <p className="text-[rgba(255,255,255,0.4)] mb-1">Slot</p>
                                    <p className="text-white font-medium">
                                        {result.onChainData?.slot?.toLocaleString() || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[rgba(255,255,255,0.4)] mb-1">Fee</p>
                                    <p className="text-white font-medium">
                                        {result.onChainData?.fee ? `${(result.onChainData.fee / 1e9).toFixed(6)} SOL` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[rgba(255,255,255,0.4)] mb-1">Inner Instructions</p>
                                    <p className="text-white font-medium">
                                        {result.onChainData?.innerInstructionsCount ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {result.onChainData?.programsDetected && result.onChainData.programsDetected.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                                    <p className="text-[rgba(255,255,255,0.4)] text-xs mb-1.5">DEX Programs Detected</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.onChainData.programsDetected.map((dex, i) => (
                                            <span key={i} className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                                                {dex}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Threats Detected */}
                        <div>
                            <h4 className="text-sm font-medium text-white mb-2">Threats Detected</h4>
                            {result.threats.length > 0 ? (
                                <ul className="space-y-2">
                                    {result.threats.map((threat, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                                        >
                                            <span className={`text-xs font-medium uppercase ${getSeverityColor(threat.severity)}`}>
                                                {threat.severity}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-white font-medium capitalize">
                                                    {threat.type.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-[rgba(255,255,255,0.5)] mt-0.5">
                                                    {threat.description}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <GlassContainerEmpty message="No threats detected" />
                            )}
                        </div>

                        {/* Recommendations */}
                        <div>
                            <h4 className="text-sm font-medium text-white mb-2">Recommendations</h4>
                            {result.recommendations.length > 0 ? (
                                <ul className="space-y-1.5">
                                    {result.recommendations.map((rec, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-[rgba(255,255,255,0.7)]"
                                        >
                                            <span className="text-green-400 mt-0.5">→</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-[rgba(255,255,255,0.5)]">No specific recommendations</p>
                            )}
                        </div>

                        {/* Analysis Timestamp */}
                        <p className="text-xs text-[rgba(255,255,255,0.3)] text-right">
                            Analyzed at: {new Date(result.analyzedAt).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </GlassContainerCard>
    );
}


export default TransactionSandbox;
