'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================
// UTILITIES
// ============================================

function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

// ============================================
// TYPES
// ============================================

export interface AnalysisStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    duration?: number;
    data?: any;
    error?: string;
}

export interface RiskIndicator {
    id: string;
    category: 'authority' | 'holder' | 'activity' | 'metadata' | 'program';
    name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    value: string;
    description: string;
}

export interface AnalysisData {
    address: string;
    type: 'token' | 'program' | 'account' | 'unknown';

    // Basic info
    marketOverview: {
        currentSupply?: number;
        decimals?: number;
        holders?: number;
        supplyRaw?: string;
        price?: number;
        priceChange24h?: number;
        marketCap?: number;
        fdv?: number;
        volume24h?: number;
        liquidity?: number;
    };

    profileSummary: {
        tokenName?: string;
        tokenSymbol?: string;
        imageUrl?: string;
        decimals?: number;
        mintAuthority?: string | null;
        freezeAuthority?: string | null;
        uri?: string;
        isMutable?: boolean;
        updateAuthority?: string;
        programData?: string;
        upgradeAuthority?: string | null;
        isUpgradeable?: boolean;
        programSize?: number;
        website?: string;
        twitter?: string;
        telegram?: string;
        discord?: string;
        createdAt?: number;
        ageInDays?: number;
    };

    misc: {
        ownerProgram?: string;
    };

    // Price data (from Birdeye/Jupiter)
    priceData?: {
        price?: number;
        priceChange24h?: number;
        lastTradeTime?: string;
    };

    // Liquidity data (from DexScreener)
    liquidityData?: {
        totalLiquidity?: number;
        pools?: Array<{
            dex: string;
            pairAddress: string;
            liquidity: number;
            volume24h: number;
            quoteToken: string;
        }>;
    };

    // Trading data (from Birdeye/Jupiter)
    tradingData?: {
        volume24h?: number;
        volumeChange24h?: number;
        trades24h?: number;
        tradesChange24h?: number;
        buys24h?: number;
        sells24h?: number;
        uniqueWallets24h?: number;
        // Slippage data
        buySlippage?: number;
        sellSlippage?: number;
        isHoneypot?: boolean;
        // DEX data
        dexPairs?: number;
        dexNames?: string[];
    };

    // Security data (from Birdeye)
    securityData?: {
        creatorAddress?: string;
        creatorBalance?: number;
        creatorPercentage?: number;
        top10HolderPercent?: number;
        isMintable?: boolean;
        isFreezable?: boolean;
        isMutable?: boolean;
        isLpBurned?: boolean;
        lpBurnedPercent?: number;
        // RugCheck data
        rugCheckScore?: number;
        rugCheckRiskLevel?: 'safe' | 'caution' | 'danger' | 'unknown';
    };

    // DEX data (from DexScreener)
    dexData?: {
        totalPairs?: number;
        totalLiquidity?: number;
        totalVolume24h?: number;
        dexes?: string[];
        pairCreatedAt?: number;
        pairs?: Array<{
            dex: string;
            pairAddress: string;
            liquidity: number;
            volume24h: number;
            quoteToken: string;
        }>;
    };

    // Slippage data (from Jupiter)
    slippageData?: {
        buySlippage?: number;
        sellSlippage?: number;
        buyPriceImpact?: number;
        sellPriceImpact?: number;
        isHoneypot?: boolean;
        honeypotReason?: string;
        tradeable?: boolean;
    };

    // Holders
    topHolders?: Array<{
        rank: number;
        address: string;
        amount: string;
        amountFormatted: number;
        percentage: number;
    }>;

    // Transaction stats
    transactionStats?: {
        total: number;
        failed: number;
        failureRate: number;
    };

    // Risk assessment
    riskIndicators: RiskIndicator[];
    riskScore?: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    totalDuration?: number;

    // AI Analysis
    aiAnalysis?: {
        summary: string;
        riskAssessment: string;
        keyFindings: string[];
        recommendations: string[];
    };

    // Detection params (for display)
    onChainParams?: Record<string, { checked: boolean; triggered: boolean; value?: string }>;
    offChainParams?: Record<string, { checked: boolean; triggered: boolean; value?: string }>;
}

// ============================================
// LIVE ANALYSIS TIMELINE
// ============================================

export function LiveAnalysisTimeline({
    steps,
    totalDuration,
    isAnalyzing,
    paramsChecked = 0,
    paramsTriggered = 0,
    detectionMode,
}: {
    steps: AnalysisStep[];
    totalDuration: number;
    isAnalyzing: boolean;
    paramsChecked?: number;
    paramsTriggered?: number;
    detectionMode?: 'token' | 'dex';
}) {
    const totalParams = detectionMode === 'token' ? 31 : detectionMode === 'dex' ? 31 : 0;

    return (
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-[#8b949e]'}`}></div>
                    <span className="text-white font-medium">Analysis Timeline</span>
                    {detectionMode && (
                        <span className="px-2 py-0.5 rounded text-xs uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {detectionMode}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {/* Param Count Display */}
                    {totalParams > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#8b949e]">Params:</span>
                            <span className="text-white font-mono">{paramsChecked}/{totalParams}</span>
                            {paramsTriggered > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                                    {paramsTriggered} triggered
                                </span>
                            )}
                        </div>
                    )}
                    <span className="text-[#8b949e] text-sm">
                        {(totalDuration / 1000).toFixed(2)}s
                    </span>
                </div>
            </div>

            {/* Steps */}
            <div className="divide-y divide-[#21262d]">
                {steps.map((step) => (
                    <div key={step.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                            {/* Status Indicator */}
                            <div className="mt-1">
                                {step.status === 'complete' && (
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                {step.status === 'running' && (
                                    <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                                )}
                                {step.status === 'error' && (
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                                {step.status === 'pending' && (
                                    <div className="w-5 h-5 rounded-full border-2 border-[#30363d]"></div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className={`font-medium ${step.status === 'complete' ? 'text-green-400' :
                                        step.status === 'running' ? 'text-cyan-400' :
                                            step.status === 'error' ? 'text-red-400' :
                                                'text-[#8b949e]'
                                        }`}>
                                        {step.name}
                                    </span>
                                    {step.duration !== undefined && (
                                        <span className="text-[#8b949e] text-sm">
                                            {step.duration}ms
                                        </span>
                                    )}
                                </div>

                                {/* Step Data */}
                                {step.status === 'complete' && step.data && (
                                    <div className="mt-1 text-sm text-[#8b949e]">
                                        {step.id === 'account_info' && (
                                            <>
                                                <span>Type: <span className="text-cyan-400">{step.data.type}</span></span>
                                                <span className="mx-2">|</span>
                                                <span>Owner: <span className="font-mono">{step.data.owner?.slice(0, 12)}...</span></span>
                                            </>
                                        )}
                                        {step.id === 'token_metadata' && step.data.name && (
                                            <>
                                                <span>Name: <span className="text-white">{step.data.name}</span></span>
                                                {step.data.symbol && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>Symbol: <span className="text-cyan-400">{step.data.symbol}</span></span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {step.id === 'birdeye_overview' && (
                                            <>
                                                {step.data.price !== undefined && (
                                                    <span>Price: <span className="text-green-400">${step.data.price < 0.01 ? step.data.price.toExponential(2) : step.data.price.toFixed(4)}</span></span>
                                                )}
                                                {step.data.marketCap !== undefined && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>MCap: <span className="text-white">${formatNumber(step.data.marketCap)}</span></span>
                                                    </>
                                                )}
                                                {step.data.volume24h !== undefined && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>Vol: <span className="text-white">${formatNumber(step.data.volume24h)}</span></span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {step.id === 'security_info' && (
                                            <>
                                                <span>LP Burned: <span className={step.data.lpBurned ? 'text-green-400' : 'text-red-400'}>{step.data.lpBurned ? 'Yes' : 'No'}</span></span>
                                                {step.data.creatorPercent !== undefined && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>Creator: <span className={step.data.creatorPercent > 10 ? 'text-yellow-400' : 'text-white'}>{step.data.creatorPercent?.toFixed(1)}%</span></span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {step.id === 'dex_pairs' && (
                                            <>
                                                <span>Pairs: <span className="text-white">{step.data.pairs}</span></span>
                                                {step.data.liquidity !== undefined && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>Liquidity: <span className={step.data.liquidity < 10000 ? 'text-red-400' : 'text-green-400'}>${formatNumber(step.data.liquidity)}</span></span>
                                                    </>
                                                )}
                                                {step.data.dexes && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span>DEXes: <span className="text-cyan-400">{step.data.dexes}</span></span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {step.id === 'slippage_analysis' && (
                                            <>
                                                <span>Buy: <span className="text-white">{step.data.buySlippage}</span></span>
                                                <span className="mx-2">|</span>
                                                <span>Sell: <span className={parseFloat(step.data.sellSlippage) > 10 ? 'text-red-400' : 'text-white'}>{step.data.sellSlippage}</span></span>
                                                {step.data.honeypot && (
                                                    <>
                                                        <span className="mx-2">|</span>
                                                        <span className="text-red-500 font-bold">HONEYPOT</span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {step.id === 'largest_holders' && (
                                            <span>Top holders: <span className="text-white">{step.data.topHolders}</span></span>
                                        )}
                                        {(step.id === 'recent_transactions' || step.id === 'program_usage') && (
                                            <>
                                                <span>Transactions: <span className="text-white">{step.data.transactions}</span></span>
                                                <span className="mx-2">|</span>
                                                <span>Failed: <span className={step.data.failed > 30 ? 'text-red-400' : 'text-white'}>{step.data.failed}</span></span>
                                            </>
                                        )}
                                        {step.id === 'program_data' && (
                                            <span>Upgrade Authority: <span className="font-mono text-white">{step.data.upgradeAuthority}</span></span>
                                        )}
                                    </div>
                                )}

                                {step.status === 'error' && step.error && (
                                    <p className="mt-1 text-sm text-red-400">{step.error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// MARKET OVERVIEW CARD
// ============================================

export function MarketOverviewCard({ data }: { data: AnalysisData }) {
    const { marketOverview, priceData, liquidityData, type } = data;

    // Format price for display - improved formatting
    const formatPrice = (price?: number) => {
        if (!price) return '-';
        if (price < 0.000001) return `$${price.toExponential(2)}`;
        if (price < 0.0001) return `$${price.toFixed(8)}`;
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };

    // Format large numbers
    const formatLargeNumber = (num?: number) => {
        if (!num) return '-';
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Market Overview</h3>

            <div className="space-y-3">
                {/* Price & Change - Now using marketOverview.price */}
                {(marketOverview?.price || priceData?.price) && (
                    <DataRow
                        label="Price"
                        value={
                            <span className="flex items-center gap-2">
                                {formatPrice(marketOverview?.price || priceData?.price)}
                                {(marketOverview?.priceChange24h !== undefined || priceData?.priceChange24h !== undefined) && (
                                    <span className={`text-xs ${(marketOverview?.priceChange24h || priceData?.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {(marketOverview?.priceChange24h || priceData?.priceChange24h || 0) >= 0 ? '+' : ''}{(marketOverview?.priceChange24h || priceData?.priceChange24h || 0).toFixed(2)}%
                                    </span>
                                )}
                            </span>
                        }
                    />
                )}

                {/* Volume 24h */}
                {(marketOverview?.volume24h) && (
                    <DataRow
                        label="Volume 24h"
                        value={formatLargeNumber(marketOverview.volume24h)}
                        valueClass="text-white"
                    />
                )}

                {/* Market Cap */}
                {marketOverview?.marketCap && (
                    <DataRow
                        label="Market Cap"
                        value={formatLargeNumber(marketOverview.marketCap)}
                    />
                )}

                {/* Liquidity */}
                {(liquidityData?.totalLiquidity || marketOverview?.liquidity) && (
                    <DataRow
                        label="Liquidity"
                        value={formatLargeNumber(liquidityData?.totalLiquidity || marketOverview?.liquidity)}
                        valueClass="text-white"
                    />
                )}

                <DataRow
                    label="Current Supply"
                    value={marketOverview?.currentSupply?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || '-'}
                />
                {type === 'token' && (
                    <>
                        <DataRow label="Decimals" value={marketOverview?.decimals?.toString() || '-'} />
                        <DataRow label="Holders" value={marketOverview?.holders?.toString() || '-'} />
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// PROFILE SUMMARY CARD
// ============================================

export function ProfileSummaryCard({ data }: { data: AnalysisData }) {
    const { profileSummary, type } = data;

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Profile Summary</h3>

            <div className="space-y-3">
                {type === 'token' && (
                    <>
                        <DataRow
                            label="Token name"
                            value={profileSummary?.tokenName || 'Unknown'}
                        />
                        <DataRow
                            label="Symbol"
                            value={profileSummary?.tokenSymbol || '-'}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Decimals"
                            value={profileSummary.decimals?.toString() || '-'}
                        />
                        <DataRow
                            label="Mint Authority"
                            value={profileSummary.mintAuthority ? 'Active' : 'Disabled'}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Freeze Authority"
                            value={profileSummary.freezeAuthority ? 'Active' : 'Disabled'}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Mutable"
                            value={profileSummary.isMutable ? 'Yes' : 'No'}
                            valueClass="text-white"
                        />
                        {profileSummary.ageInDays !== undefined && (
                            <DataRow
                                label="Token Age"
                                value={profileSummary.ageInDays < 1
                                    ? `${(profileSummary.ageInDays * 24).toFixed(1)} hours`
                                    : `${profileSummary.ageInDays.toFixed(1)} days`}
                                valueClass={profileSummary.ageInDays < 1 ? 'text-yellow-400' : 'text-white'}
                            />
                        )}
                    </>
                )}
                {type === 'program' && (
                    <>
                        <DataRow
                            label="Upgradeable"
                            value={profileSummary.isUpgradeable ? 'Yes' : 'No'}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Upgrade Authority"
                            value={profileSummary.upgradeAuthority?.slice(0, 12) + '...' || 'None'}
                            mono
                        />
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// MISC CARD
// ============================================

export function MiscCard({ data }: { data: AnalysisData }) {
    const ownerProgram = data.misc?.ownerProgram;

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Misc</h3>

            <div className="space-y-3">
                <DataRow
                    label="Token address"
                    value={`${data.address.slice(0, 4)}...${data.address.slice(-5)}`}
                    mono
                    copyable={data.address}
                />
                <DataRow
                    label="Owner Program"
                    value={ownerProgram ? `${ownerProgram.slice(0, 12)}...` : '-'}
                    mono
                />
            </div>
        </div>
    );
}

// ============================================
// TRADING DATA CARD
// ============================================

export function TradingDataCard({ data }: { data: AnalysisData }) {
    const { slippageData, dexData } = data;

    if (!slippageData && !dexData) return null;

    const formatPercent = (val?: number) => {
        if (val === undefined) return '-';
        if (val === 0) return '0.00%';
        return val < 0.01 ? `${val.toFixed(4)}%` : `${val.toFixed(2)}%`;
    };

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Trading & DEX</h3>

            <div className="space-y-3">
                {/* Slippage */}
                {slippageData && (
                    <>
                        <DataRow
                            label="Buy Price Impact"
                            value={formatPercent(slippageData.buyPriceImpact)}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Sell Price Impact"
                            value={formatPercent(slippageData.sellPriceImpact)}
                            valueClass="text-white"
                        />
                        <DataRow
                            label="Honeypot Check"
                            value={slippageData.isHoneypot ? 'Detected!' : 'Passed'}
                            valueClass="text-white"
                        />
                    </>
                )}

                {/* DEX Data */}
                {dexData && (
                    <>
                        <DataRow
                            label="DEXes"
                            value={dexData.dexes?.join(', ') || '-'}
                            valueClass="text-white capitalize"
                        />
                        <DataRow
                            label="Pairs"
                            value={dexData.totalPairs?.toString() || '-'}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// RISK SCORE CARD
// ============================================

export function RiskScoreCard({ data }: { data: AnalysisData }) {
    const { riskScore, riskIndicators } = data;

    if (!riskScore) return null;

    const critical = riskIndicators.filter(r => r.severity === 'critical').length;
    const high = riskIndicators.filter(r => r.severity === 'high').length;
    const medium = riskIndicators.filter(r => r.severity === 'medium').length;
    const low = riskIndicators.filter(r => r.severity === 'low').length;

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm font-medium">Risk Assessment</h3>
                <div className="px-3 py-1 rounded-lg border text-2xl font-bold text-white bg-white/10 border-white/20">
                    {riskScore.grade}
                </div>
            </div>

            {/* Score Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Risk Score</span>
                    <span className="text-white">{riskScore.score}/100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500 bg-white/40"
                        style={{ width: `${riskScore.score}%` }}
                    ></div>
                </div>
            </div>

            {/* Indicator Counts */}
            <div className="flex flex-wrap gap-2">
                {critical > 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-white/10 text-white border border-white/20">
                        {critical} Critical
                    </span>
                )}
                {high > 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-white/10 text-white border border-white/20">
                        {high} High
                    </span>
                )}
                {medium > 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-white/10 text-white border border-white/20">
                        {medium} Medium
                    </span>
                )}
                {low > 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-white/10 text-white border border-white/20">
                        {low} Low
                    </span>
                )}
                {riskIndicators.length === 0 && (
                    <span className="text-sm text-white/60">No risk indicators found</span>
                )}
            </div>
        </div>
    );
}

// ============================================
// RISK INDICATORS LIST
// ============================================

export function RiskIndicatorsList({ indicators }: { indicators: RiskIndicator[] }) {
    const sorted = [...indicators].sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
    });

    if (indicators.length === 0) {
        return (
            <div className="text-center py-8 text-white/60">
                No risk indicators found
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {sorted.map((indicator) => (
                <div
                    key={indicator.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-medium">{indicator.name}</span>
                                <span className="px-2 py-0.5 rounded text-xs uppercase bg-white/10 text-white">
                                    {indicator.severity}
                                </span>
                            </div>
                            <p className="text-white/60 text-sm">{indicator.description}</p>
                        </div>
                        <span className="text-white/60 text-sm font-mono shrink-0">
                            {indicator.value?.slice(0, 16)}{indicator.value?.length > 16 ? '...' : ''}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================
// TOP HOLDERS TABLE
// ============================================

export function TopHoldersTable({
    holders,
    decimals = 0
}: {
    holders?: AnalysisData['topHolders'];
    decimals?: number;
}) {
    if (!holders || holders.length === 0) {
        return (
            <div className="text-center py-8 text-white/60">
                No holder data available
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-white/60 text-left border-b border-white/10">
                        <th className="py-3 px-4 font-medium">#</th>
                        <th className="py-3 px-4 font-medium">Address</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                        <th className="py-3 px-4 font-medium text-right">%</th>
                    </tr>
                </thead>
                <tbody>
                    {holders.map((holder) => (
                        <tr
                            key={holder.address}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                            <td className="py-3 px-4 text-white/60">{holder.rank}</td>
                            <td className="py-3 px-4 font-mono text-white">
                                {holder.address.slice(0, 8)}...{holder.address.slice(-4)}
                            </td>
                            <td className="py-3 px-4 text-right text-white">
                                {holder.amountFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-white">
                                {holder.percentage.toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================
// HELPERS
// ============================================

function DataRow({
    label,
    value,
    valueClass = 'text-white',
    mono = false,
    copyable,
}: {
    label: string;
    value: React.ReactNode;
    valueClass?: string;
    mono?: boolean;
    copyable?: string;
}) {
    const handleCopy = () => {
        if (copyable) {
            navigator.clipboard.writeText(copyable);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <span className="text-[#8b949e] text-sm">{label}</span>
            <span
                className={`text-sm ${valueClass} ${mono ? 'font-mono' : ''} ${copyable ? 'cursor-pointer hover:underline' : ''}`}
                onClick={copyable ? handleCopy : undefined}
                title={copyable ? 'Click to copy' : undefined}
            >
                {value}
            </span>
        </div>
    );
}

// ============================================
// AI ANALYSIS CARD
// ============================================

export function AIAnalysisCard({ data }: { data: AnalysisData }) {
    if (!data.aiAnalysis) return null;

    const { summary, riskAssessment, keyFindings, recommendations } = data.aiAnalysis;

    return (
        <div className="rounded-lg p-6 relative overflow-hidden group mb-6"
            style={{
                background: 'linear-gradient(135deg, rgba(8,8,20,0.9) 0%, rgba(13,17,23,0.95) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)', // Purple border for AI
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
            }}
        >
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-xl tracking-tight">AI Security Analysis</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <p className="text-purple-300/80 text-xs font-medium uppercase tracking-wider">Powered by Puter.js</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {/* Summary */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 backdrop-blur-sm">
                    <p className="text-gray-200 text-lg leading-relaxed font-light">"{summary}"</p>
                </div>

                {/* Risk Assessment */}
                <div>
                    <h4 className="text-purple-400 text-xs font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Risk Assessment
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-purple-500/30 pl-4">{riskAssessment}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key Findings */}
                    <div className="bg-blue-500/5 rounded-xl p-5 border border-blue-500/10 hover:border-blue-500/20 transition-colors">
                        <h4 className="text-blue-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" /> Key Findings
                        </h4>
                        <ul className="space-y-3">
                            {keyFindings.map((finding, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500/40 rounded-full flex-shrink-0" />
                                    <span className="leading-snug">{finding}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-emerald-500/5 rounded-xl p-5 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
                        <h4 className="text-emerald-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" /> Recommendations
                        </h4>
                        <ul className="space-y-3">
                            {recommendations.map((rec, i) => (
                                <li key={i} className="text-gray-300 text-sm flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500/40 rounded-full flex-shrink-0" />
                                    <span className="leading-snug">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// SECURITY DATA CARD (with RugCheck)
// ============================================

export function SecurityDataCard({ data }: { data: AnalysisData }) {
    const { securityData } = data;

    if (!securityData) return null;

    const getRiskLevelColor = (level?: string) => {
        switch (level) {
            case 'danger': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'caution': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'safe': return 'text-green-400 bg-green-500/10 border-green-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Security Analysis</h3>

            {/* RugCheck Badge */}
            {securityData.rugCheckScore !== undefined && (
                <div className="mb-4 p-3 rounded-lg border flex items-center justify-between"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{securityData.rugCheckScore}</span>
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">RugCheck Score</div>
                            <div className="text-white/50 text-xs">Safety rating (0-100)</div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase border ${getRiskLevelColor(securityData.rugCheckRiskLevel)}`}>
                        {securityData.rugCheckRiskLevel || 'Unknown'}
                    </span>
                </div>
            )}

            <div className="space-y-2">
                <DataRow label="Creator Address" value={securityData.creatorAddress ? securityData.creatorAddress.slice(0, 8) + '...' : '-'} />
                <DataRow label="Creator %" value={securityData.creatorPercentage ? securityData.creatorPercentage.toFixed(2) + '%' : '-'} />
                <DataRow label="LP Burned" value={securityData.isLpBurned ? `Yes (${securityData.lpBurnedPercent?.toFixed(1)}%)` : 'No'} />
                <DataRow label="Mintable" value={securityData.isMintable ? 'Yes' : 'No'} valueClass={securityData.isMintable ? 'text-red-400' : 'text-green-400'} />
                <DataRow label="Freezable" value={securityData.isFreezable ? 'Yes' : 'No'} valueClass={securityData.isFreezable ? 'text-yellow-400' : 'text-green-400'} />
            </div>
        </div>
    );
}

// ============================================
// SLIPPAGE DATA CARD (with Trading)
// ============================================

export function SlippageDataCard({ data }: { data: AnalysisData }) {
    const { tradingData } = data;

    if (!tradingData) return null;

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Trading Analysis</h3>

            {/* Honeypot Check */}
            {tradingData.isHoneypot !== undefined && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${tradingData.isHoneypot ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    <span className={`text-2xl ${tradingData.isHoneypot ? 'text-red-400' : 'text-green-400'}`}>
                        {tradingData.isHoneypot ? '⚠️' : '✓'}
                    </span>
                    <div>
                        <div className={`font-medium ${tradingData.isHoneypot ? 'text-red-400' : 'text-green-400'}`}>
                            {tradingData.isHoneypot ? 'Honeypot Detected!' : 'Honeypot Check Passed'}
                        </div>
                        <div className="text-white/50 text-xs">
                            {tradingData.isHoneypot ? 'Token may not be sellable' : 'Token appears tradeable'}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <DataRow
                    label="Buy Slippage"
                    value={tradingData.buySlippage !== undefined ? `${tradingData.buySlippage.toFixed(2)}%` : '-'}
                    valueClass={tradingData.buySlippage && tradingData.buySlippage > 5 ? 'text-yellow-400' : 'text-white'}
                />
                <DataRow
                    label="Sell Slippage"
                    value={tradingData.sellSlippage !== undefined ? `${tradingData.sellSlippage.toFixed(2)}%` : '-'}
                    valueClass={tradingData.sellSlippage && tradingData.sellSlippage > 10 ? 'text-red-400' : tradingData.sellSlippage && tradingData.sellSlippage > 5 ? 'text-yellow-400' : 'text-white'}
                />
                <DataRow label="DEX Pairs" value={tradingData.dexPairs?.toString() || '-'} />
                <DataRow label="DEXes" value={tradingData.dexNames?.join(', ') || '-'} />
                {tradingData.volume24h !== undefined && (
                    <DataRow label="24h Volume" value={`$${tradingData.volume24h.toLocaleString()}`} />
                )}
            </div>
        </div>
    );
}

// ============================================
// PARAMS OVERVIEW CARD
// ============================================

export function ParamsOverviewCard({ data }: { data: AnalysisData }) {
    const { onChainParams, offChainParams } = data;

    if (!onChainParams && !offChainParams) return null;

    const onChainList = onChainParams ? Object.entries(onChainParams) : [];
    const offChainList = offChainParams ? Object.entries(offChainParams) : [];

    const onChainChecked = onChainList.filter(([, v]) => v.checked).length;
    const onChainTriggered = onChainList.filter(([, v]) => v.triggered).length;
    const offChainChecked = offChainList.filter(([, v]) => v.checked).length;
    const offChainTriggered = offChainList.filter(([, v]) => v.triggered).length;

    const formatParamName = (name: string) => {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
    };

    return (
        <div
            className="rounded-lg p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.12)'
            }}
        >
            <h3 className="text-white/60 text-sm font-medium mb-4">Detection Parameters</h3>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{onChainChecked}/{onChainList.length}</div>
                    <div className="text-xs text-white/50">On-Chain Checked</div>
                    {onChainTriggered > 0 && (
                        <div className="text-xs text-red-400 mt-1">{onChainTriggered} triggered</div>
                    )}
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{offChainChecked}/{offChainList.length}</div>
                    <div className="text-xs text-white/50">Off-Chain Checked</div>
                    {offChainTriggered > 0 && (
                        <div className="text-xs text-red-400 mt-1">{offChainTriggered} triggered</div>
                    )}
                </div>
            </div>

            {/* Params Grid */}
            <div className="space-y-3">
                <div>
                    <h4 className="text-xs text-white/40 uppercase tracking-wide mb-2">On-Chain Parameters</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        {onChainList.slice(0, 10).map(([key, val]) => (
                            <div key={key} className={`flex items-center gap-1 py-1 px-2 rounded ${val.triggered ? 'bg-red-500/10 text-red-400' : val.checked ? 'text-white/70' : 'text-white/30'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${val.triggered ? 'bg-red-500' : val.checked ? 'bg-green-500/50' : 'bg-white/20'}`} />
                                <span className="truncate">{formatParamName(key)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs text-white/40 uppercase tracking-wide mb-2">Off-Chain Parameters</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        {offChainList.slice(0, 8).map(([key, val]) => (
                            <div key={key} className={`flex items-center gap-1 py-1 px-2 rounded ${val.triggered ? 'bg-red-500/10 text-red-400' : val.checked ? 'text-white/70' : 'text-white/30'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${val.triggered ? 'bg-red-500' : val.checked ? 'bg-green-500/50' : 'bg-white/20'}`} />
                                <span className="truncate">{formatParamName(key)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
