/**
 * Detection Types & Interfaces
 * 
 * Separate type definitions for Token vs DEX exploit detection.
 * NO OVERLAP between Token and DEX parameters.
 */

// ===========================================
// COMMON TYPES
// ===========================================

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RiskIndicator {
    id: string;
    category: string;
    name: string;
    severity: RiskSeverity;
    value: string;
    description: string;
    paramType: 'on-chain' | 'off-chain';
}

export interface DetectionResult {
    address: string;
    detectionMode: 'token' | 'dex';
    totalParamsChecked: number;
    totalParamsTriggered: number;
    onChainParamsChecked: number;
    offChainParamsChecked: number;
    riskIndicators: RiskIndicator[];
    riskScore: number; // 0-100
    overallRisk: RiskSeverity;
}

// ===========================================
// TOKEN DETECTION TYPES (31 params total)
// ===========================================

/**
 * Token On-Chain Parameters (18)
 * From detection_parameters.txt Section 1.2
 */
export interface TokenOnChainParams {
    // 1. Massive Token Mints - >1B tokens in one tx
    massiveMints: { checked: boolean; triggered: boolean; value?: string };

    // 2. Governance Proposal Exploits - Quorum bypass
    governanceExploits: { checked: boolean; triggered: boolean; value?: string };

    // 3. Bonding Curve Distortions - >20% price deviation
    bondingCurveDistortions: { checked: boolean; triggered: boolean; value?: string };

    // 4. Asset Freezes/Locks - Sudden halt in mint/burn
    assetFreezes: { checked: boolean; triggered: boolean; value?: string };

    // 5. Wallet Drains - Mass transfers to attacker
    walletDrains: { checked: boolean; triggered: boolean; value?: string };

    // 6. Over-Borrowing in Pools - >10% of reserves
    overBorrowing: { checked: boolean; triggered: boolean; value?: string };

    // 7. ZK Proof Anomalies - Invalid ElGamal proofs
    zkProofAnomalies: { checked: boolean; triggered: boolean; value?: string };

    // 8. Race Conditions - Inflated balances
    raceConditions: { checked: boolean; triggered: boolean; value?: string };

    // 9. Signer/Owner Check Failures - Missing validations
    signerCheckFailures: { checked: boolean; triggered: boolean; value?: string };

    // 10. Treasury Drains - <50% multisig confirmations
    treasuryDrains: { checked: boolean; triggered: boolean; value?: string };

    // 11. Unauthorized Withdrawals - Fake mints + dumps
    unauthorizedWithdrawals: { checked: boolean; triggered: boolean; value?: string };

    // 12. Slow Drain Patterns - <1% per tx over days
    slowDrainPatterns: { checked: boolean; triggered: boolean; value?: string };

    // 13. Victim Wallet Spikes - >80k unique victims
    victimWalletSpikes: { checked: boolean; triggered: boolean; value?: string };

    // 14. Token Supply Inflation - >10% supply increase
    tokenSupplyInflation: { checked: boolean; triggered: boolean; value?: string };

    // 15. Approval Hijacking - ApproveForAll to unknown
    approvalHijacking: { checked: boolean; triggered: boolean; value?: string };

    // 16. Failed Project Signatures - >95% value drop
    failedProjectSignatures: { checked: boolean; triggered: boolean; value?: string };

    // 17. Account Impersonation - PDA collisions
    accountImpersonation: { checked: boolean; triggered: boolean; value?: string };

    // 18. Hardware Wallet Breaches - Cross-chain dumps
    hardwareWalletBreaches: { checked: boolean; triggered: boolean; value?: string };
}

/**
 * Token Off-Chain Parameters (13)
 * From detection_parameters.txt Section 1.2
 */
export interface TokenOffChainParams {
    // 1. Key Leak Indicators - Known wallet patterns
    keyLeakIndicators: { checked: boolean; triggered: boolean; value?: string };

    // 2. DAO Engagement Alerts - Low governance activity
    daoEngagementAlerts: { checked: boolean; triggered: boolean; value?: string };

    // 3. Economic Model Stress - Flash loan loopholes
    economicModelStress: { checked: boolean; triggered: boolean; value?: string };

    // 4. Audit Gap Warnings - No recent audits
    auditGapWarnings: { checked: boolean; triggered: boolean; value?: string };

    // 5. Centralization Warnings - Single authority
    centralizationWarnings: { checked: boolean; triggered: boolean; value?: string };

    // 6. Phishing Transaction Clusters - >8k detected phishes
    phishingTxClusters: { checked: boolean; triggered: boolean; value?: string };

    // 7. Malware App Indicators - Seed phrase theft
    malwareAppIndicators: { checked: boolean; triggered: boolean; value?: string };

    // 8. AI-Generated Package Alerts - Suspicious npm
    aiPackageAlerts: { checked: boolean; triggered: boolean; value?: string };

    // 9. Rug Pull Prevalence Metrics - 98% fraud rate
    rugPullMetrics: { checked: boolean; triggered: boolean; value?: string };

    // 10. Deepfake/Impersonation Signals - Fake socials
    deepfakeSignals: { checked: boolean; triggered: boolean; value?: string };

    // 11. Social Media Signals - Token buzz
    socialMediaSignals: { checked: boolean; triggered: boolean; value?: string };

    // 12. User Report Aggregation - Known scam lists
    userReportAggregation: { checked: boolean; triggered: boolean; value?: string };

    // 13. Victim Report Analysis - Pattern matching
    victimReportAnalysis: { checked: boolean; triggered: boolean; value?: string };
}

export interface TokenDetectionResult extends DetectionResult {
    detectionMode: 'token';
    onChainParams: TokenOnChainParams;
    offChainParams: TokenOffChainParams;

    // Token-specific data
    tokenData: {
        name?: string;
        symbol?: string;
        decimals?: number;
        supply?: number;
        mintAuthority?: string | null;
        freezeAuthority?: string | null;
        price?: number;
        marketCap?: number;
        liquidity?: number;
        holders?: number;
        creatorAddress?: string;
        creatorPercentage?: number;
        lpBurned?: boolean;
        lpBurnedPercent?: number;
        createdAt?: number;
        ageInDays?: number;

        // Top holders list
        topHolders?: Array<{
            rank: number;
            address: string;
            amount: string;
            amountFormatted: number;
            percentage: number;
        }>;

        // RugCheck data
        rugCheckScore?: number;
        rugCheckRiskLevel?: 'safe' | 'caution' | 'danger' | 'unknown';

        // Slippage data
        buySlippage?: number;
        sellSlippage?: number;
        isHoneypot?: boolean;

        // DEX data
        dexPairs?: number;
        dexNames?: string[];

        // Volume data
        volume24h?: number;
        priceChange24h?: number;
    };
}

// ===========================================
// DEX DETECTION TYPES (31 params total)
// ===========================================

/**
 * DEX On-Chain Parameters (19)
 * From detection_parameters.txt Section 1.1
 */
export interface DexOnChainParams {
    // 1. Flash Loan Patterns - >5x avg daily volume
    flashLoanPatterns: { checked: boolean; triggered: boolean; value?: string };

    // 2. Oracle Feed Discrepancies - >10% deviation
    oracleFeedDiscrepancies: { checked: boolean; triggered: boolean; value?: string };

    // 3. Unauthorized Admin Withdrawals - No multisig
    unauthorizedAdminWithdrawals: { checked: boolean; triggered: boolean; value?: string };

    // 4. Price Pumps in Perpetual Trades - >50% in minutes
    pricePumps: { checked: boolean; triggered: boolean; value?: string };

    // 5. Bridge Transfer Anomalies - <$7k to mixers
    bridgeTransferAnomalies: { checked: boolean; triggered: boolean; value?: string };

    // 6. Tick Account Creations - Without owner checks
    tickAccountCreations: { checked: boolean; triggered: boolean; value?: string };

    // 7. Wallet Approval Spikes - Mass approvals
    walletApprovalSpikes: { checked: boolean; triggered: boolean; value?: string };

    // 8. Large Vault Withdrawals - >20% TVL
    largeVaultWithdrawals: { checked: boolean; triggered: boolean; value?: string };

    // 9. Transaction Volume Surges - >100x normal
    transactionVolumeSurges: { checked: boolean; triggered: boolean; value?: string };

    // 10. Sandwich Attacks - >1% extracted
    sandwichAttacks: { checked: boolean; triggered: boolean; value?: string };

    // 11. Rounding Errors in Pool Calculations - <0.01% deviation
    roundingErrors: { checked: boolean; triggered: boolean; value?: string };

    // 12. Hot Wallet Drains - >10% in <5 min
    hotWalletDrains: { checked: boolean; triggered: boolean; value?: string };

    // 13. Insider Wallet Clusters - 100+ affiliated wallets
    insiderWalletClusters: { checked: boolean; triggered: boolean; value?: string };

    // 14. Rug Pull Signatures - >50% LP withdrawal
    rugPullSignatures: { checked: boolean; triggered: boolean; value?: string };

    // 15. Malicious Transaction Approvals - Unknown delegates
    maliciousTxApprovals: { checked: boolean; triggered: boolean; value?: string };

    // 16. MEV Bot Exploitation Spikes - >1000 sandwiches/day
    mevBotExploitation: { checked: boolean; triggered: boolean; value?: string };

    // 17. Cross-Chain Bridge Anomalies - Mint/burn mismatch
    crossChainBridgeAnomalies: { checked: boolean; triggered: boolean; value?: string };

    // 18. Fee Recovery Failures - >20% fee drop
    feeRecoveryFailures: { checked: boolean; triggered: boolean; value?: string };

    // 19. Program Upgrade Vulnerabilities - >5% error rate
    programUpgradeVulns: { checked: boolean; triggered: boolean; value?: string };
}

/**
 * DEX Off-Chain Parameters (12)
 * From detection_parameters.txt Section 1.1
 */
export interface DexOffChainParams {
    // 1. Validator Client Monitoring - Jito adoption
    validatorClientMonitoring: { checked: boolean; triggered: boolean; value?: string };

    // 2. Social Media Signals - MEV discussions
    socialMediaSignals: { checked: boolean; triggered: boolean; value?: string };

    // 3. Block Engine Logs - Jito bundle inspections
    blockEngineLogs: { checked: boolean; triggered: boolean; value?: string };

    // 4. RPC Provider Anomalies - Tx visibility <200ms
    rpcProviderAnomalies: { checked: boolean; triggered: boolean; value?: string };

    // 5. News and Research Buzz - Exploit reports
    newsResearchBuzz: { checked: boolean; triggered: boolean; value?: string };

    // 6. Audit and Simulation Results - Known vulns
    auditSimulationResults: { checked: boolean; triggered: boolean; value?: string };

    // 7. Forum and Validator Discussions - MEV complaints
    forumValidatorDiscussions: { checked: boolean; triggered: boolean; value?: string };

    // 8. Bot Configuration Alerts - Risk params
    botConfigAlerts: { checked: boolean; triggered: boolean; value?: string };

    // 9. Dependency Scans - Malicious packages
    dependencyScans: { checked: boolean; triggered: boolean; value?: string };

    // 10. Research Reports - MEV activity
    researchReports: { checked: boolean; triggered: boolean; value?: string };

    // 11. Simulation Tools - Liquidation tests
    simulationTools: { checked: boolean; triggered: boolean; value?: string };

    // 12. Validator Communications - Unstaking alerts
    validatorCommunications: { checked: boolean; triggered: boolean; value?: string };
}

export interface DexDetectionResult extends DetectionResult {
    detectionMode: 'dex';
    onChainParams: DexOnChainParams;
    offChainParams: DexOffChainParams;

    // DEX-specific data
    dexData: {
        programId: string;
        programName?: string;
        isUpgradeable?: boolean;
        upgradeAuthority?: string | null;
        tvl?: number;
        volume24h?: number;
        transactionCount?: number;
        recentErrorRate?: number;
        sandwichAttacksDetected?: number;
        flashLoanVolume?: number;
    };
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export function createDefaultTokenOnChainParams(): TokenOnChainParams {
    const defaultParam = { checked: false, triggered: false };
    return {
        massiveMints: { ...defaultParam },
        governanceExploits: { ...defaultParam },
        bondingCurveDistortions: { ...defaultParam },
        assetFreezes: { ...defaultParam },
        walletDrains: { ...defaultParam },
        overBorrowing: { ...defaultParam },
        zkProofAnomalies: { ...defaultParam },
        raceConditions: { ...defaultParam },
        signerCheckFailures: { ...defaultParam },
        treasuryDrains: { ...defaultParam },
        unauthorizedWithdrawals: { ...defaultParam },
        slowDrainPatterns: { ...defaultParam },
        victimWalletSpikes: { ...defaultParam },
        tokenSupplyInflation: { ...defaultParam },
        approvalHijacking: { ...defaultParam },
        failedProjectSignatures: { ...defaultParam },
        accountImpersonation: { ...defaultParam },
        hardwareWalletBreaches: { ...defaultParam },
    };
}

export function createDefaultTokenOffChainParams(): TokenOffChainParams {
    const defaultParam = { checked: false, triggered: false };
    return {
        keyLeakIndicators: { ...defaultParam },
        daoEngagementAlerts: { ...defaultParam },
        economicModelStress: { ...defaultParam },
        auditGapWarnings: { ...defaultParam },
        centralizationWarnings: { ...defaultParam },
        phishingTxClusters: { ...defaultParam },
        malwareAppIndicators: { ...defaultParam },
        aiPackageAlerts: { ...defaultParam },
        rugPullMetrics: { ...defaultParam },
        deepfakeSignals: { ...defaultParam },
        socialMediaSignals: { ...defaultParam },
        userReportAggregation: { ...defaultParam },
        victimReportAnalysis: { ...defaultParam },
    };
}

export function createDefaultDexOnChainParams(): DexOnChainParams {
    const defaultParam = { checked: false, triggered: false };
    return {
        flashLoanPatterns: { ...defaultParam },
        oracleFeedDiscrepancies: { ...defaultParam },
        unauthorizedAdminWithdrawals: { ...defaultParam },
        pricePumps: { ...defaultParam },
        bridgeTransferAnomalies: { ...defaultParam },
        tickAccountCreations: { ...defaultParam },
        walletApprovalSpikes: { ...defaultParam },
        largeVaultWithdrawals: { ...defaultParam },
        transactionVolumeSurges: { ...defaultParam },
        sandwichAttacks: { ...defaultParam },
        roundingErrors: { ...defaultParam },
        hotWalletDrains: { ...defaultParam },
        insiderWalletClusters: { ...defaultParam },
        rugPullSignatures: { ...defaultParam },
        maliciousTxApprovals: { ...defaultParam },
        mevBotExploitation: { ...defaultParam },
        crossChainBridgeAnomalies: { ...defaultParam },
        feeRecoveryFailures: { ...defaultParam },
        programUpgradeVulns: { ...defaultParam },
    };
}

export function createDefaultDexOffChainParams(): DexOffChainParams {
    const defaultParam = { checked: false, triggered: false };
    return {
        validatorClientMonitoring: { ...defaultParam },
        socialMediaSignals: { ...defaultParam },
        blockEngineLogs: { ...defaultParam },
        rpcProviderAnomalies: { ...defaultParam },
        newsResearchBuzz: { ...defaultParam },
        auditSimulationResults: { ...defaultParam },
        forumValidatorDiscussions: { ...defaultParam },
        botConfigAlerts: { ...defaultParam },
        dependencyScans: { ...defaultParam },
        researchReports: { ...defaultParam },
        simulationTools: { ...defaultParam },
        validatorCommunications: { ...defaultParam },
    };
}

export function countParams(params: Record<string, { checked: boolean; triggered: boolean }>): {
    checked: number;
    triggered: number;
    total: number;
} {
    const keys = Object.keys(params);
    let checked = 0;
    let triggered = 0;

    for (const key of keys) {
        if (params[key].checked) checked++;
        if (params[key].triggered) triggered++;
    }

    return { checked, triggered, total: keys.length };
}

export function calculateRiskScore(indicators: RiskIndicator[]): number {
    if (indicators.length === 0) return 0;

    const severityWeight: Record<RiskSeverity, number> = {
        low: 5,
        medium: 15,
        high: 30,
        critical: 50,
    };

    let totalWeight = 0;
    for (const indicator of indicators) {
        totalWeight += severityWeight[indicator.severity];
    }

    return Math.min(100, totalWeight);
}

export function getOverallRisk(score: number, hasCritical: boolean = false): RiskSeverity {
    // If there's any critical vulnerability, always report as critical
    if (hasCritical || score >= 50) return 'critical';
    if (score >= 30) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
}
