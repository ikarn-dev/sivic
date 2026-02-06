/**
 * Security Rules Engine
 * 
 * Defines security rules derived from historical exploit patterns.
 * These rules are used for pattern matching and UI-based checks.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityRule {
    id: string;
    name: string;
    category: string;
    severity: Severity;
    description: string;
    patterns: RegExp[];
    codePatterns?: string[];
    onChainIndicators?: string[];
    remediation: string;
    references: string[];
    exploitExamples?: string[];
}

export interface SecurityFinding {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    description: string;
    evidence: string;
    location?: string;
    remediation: string;
    confidence: number; // 0-100
}

export interface RiskScore {
    overall: number;
    confidence: number;
    breakdown: {
        patternMatch: number;
        onChain: number;
        aiAnalysis: number;
    };
    grade: RiskGrade;
}

// Exploit Categories based on DeFiLlama data
export const EXPLOIT_CATEGORIES = {
    A: 'Reentrancy',
    B: 'Oracle/Price Manipulation',
    C: 'Access Control',
    D: 'Token Minting/Burning',
    E: 'Flashloan Attacks',
    F: 'Logic/Math Errors',
    G: 'Contract Exploitation',
    H: 'Liquidity/Pool Attacks',
    I: 'Governance Attacks',
    J: 'Signature/Validation',
} as const;

// Solana-specific security rules
export const SOLANA_SECURITY_RULES: SecurityRule[] = [
    // ====== CATEGORY A: Reentrancy ======
    {
        id: 'SOL-REENT-001',
        name: 'Missing Reentrancy Guard',
        category: 'A',
        severity: 'critical',
        description: 'No reentrancy protection in functions with external calls',
        patterns: [
            /invoke_signed\s*\(/gi,
            /invoke\s*\(/gi,
            /CpiContext/gi,
        ],
        codePatterns: ['CPI without mutex/lock pattern'],
        remediation: 'Implement reentrancy guard using mutex pattern or Anchor\'s #[access_control]. Use check-effects-interactions pattern.',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/9-closing-accounts',
        ],
        exploitExamples: ['Siren ($3.45M)', 'Conic Finance ($3.2M)', 'EraLend ($3.4M)'],
    },
    {
        id: 'SOL-REENT-002',
        name: 'State Update After External Call',
        category: 'A',
        severity: 'high',
        description: 'State variables updated after making external calls',
        patterns: [
            /invoke.*\n.*=\s*\d/gi,
            /invoke.*\n.*\.set\(/gi,
        ],
        remediation: 'Move all state updates before external calls (check-effects-interactions pattern).',
        references: [],
        exploitExamples: ['Penpie ($27M)'],
    },

    // ====== CATEGORY B: Oracle/Price Manipulation ======
    {
        id: 'SOL-ORACLE-001',
        name: 'Single Oracle Dependency',
        category: 'B',
        severity: 'high',
        description: 'Protocol relies on a single price oracle source',
        patterns: [
            /get_price\s*\(/gi,
            /fetch_price\s*\(/gi,
            /oracle\.get/gi,
            /pyth.*get_price/gi,
        ],
        onChainIndicators: ['Single oracle account referenced'],
        remediation: 'Use multiple oracle sources (Pyth + Switchboard + Chainlink). Implement TWAP for price smoothing.',
        references: [
            'https://www.halborn.com/blog/post/explained-the-mango-markets-exploit-october-2022',
        ],
        exploitExamples: ['Mango Markets ($115M)', 'Harvest Finance ($25M)', 'Polter Finance ($12M)'],
    },
    {
        id: 'SOL-ORACLE-002',
        name: 'Missing Price Staleness Check',
        category: 'B',
        severity: 'high',
        description: 'No validation of oracle price freshness/timestamp',
        patterns: [
            /price(?!.*timestamp)/gi,
            /get_price(?!.*stale)/gi,
        ],
        remediation: 'Always check oracle price timestamp. Reject prices older than threshold (e.g., 60 seconds).',
        references: [],
        exploitExamples: ['Tender Finance ($1.6M)', 'Blizz Finance ($21.8M)'],
    },
    {
        id: 'SOL-ORACLE-003',
        name: 'Missing Price Bounds Check',
        category: 'B',
        severity: 'medium',
        description: 'No sanity check on oracle price values',
        patterns: [
            /price\s*[<>=]/gi,
        ],
        remediation: 'Implement price deviation checks. Reject prices that deviate >X% from last known price.',
        references: [],
        exploitExamples: ['LeadBlock Morpho Blue ($250K)'],
    },

    // ====== CATEGORY C: Access Control ======
    {
        id: 'SOL-ACCESS-001',
        name: 'Missing Signer Verification',
        category: 'C',
        severity: 'critical',
        description: 'Privileged function without signer check',
        patterns: [
            /admin|owner|authority/i,
            /set_.*\(/gi,
            /update_.*\(/gi,
            /withdraw\s*\(/gi,
        ],
        codePatterns: ['Admin function without is_signer check'],
        remediation: 'Add require!(ctx.accounts.authority.is_signer) for all privileged operations.',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/0-signer-authorization',
        ],
        exploitExamples: ['Crema Finance ($8.8M)', 'Radiant V2 ($53M)', 'Safemoon ($8.9M)'],
    },
    {
        id: 'SOL-ACCESS-002',
        name: 'Missing Account Owner Validation',
        category: 'C',
        severity: 'critical',
        description: 'PDA or program accounts not validated for ownership',
        patterns: [
            /AccountInfo/gi,
            /UncheckedAccount/gi,
            /Account<.*>/gi,
        ],
        codePatterns: ['Account used without owner constraint'],
        remediation: 'Use Anchor\'s owner constraint or manually verify account.owner == expected_program_id.',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/2-owner-checks',
        ],
        exploitExamples: ['Wormhole ($326M)', 'Cashio ($48M)'],
    },
    {
        id: 'SOL-ACCESS-003',
        name: 'Missing Multisig for Admin',
        category: 'C',
        severity: 'high',
        description: 'Single address controls critical protocol functions',
        patterns: [
            /admin|owner|authority/i,
        ],
        onChainIndicators: ['Admin is single signature, not multisig'],
        remediation: 'Use multi-signature wallet (Squads, Realms) for admin functions. Minimum 2/3 signatures.',
        references: [],
        exploitExamples: ['Various private key compromises'],
    },
    {
        id: 'SOL-ACCESS-004',
        name: 'Upgradeable Without Timelock',
        category: 'C',
        severity: 'high',
        description: 'Contract can be upgraded without delay',
        patterns: [
            /upgrade/i,
            /set_program/i,
        ],
        onChainIndicators: ['Program is upgradeable', 'No timelock in upgrade path'],
        remediation: 'Implement timelock (24-48 hours minimum) for program upgrades to allow user exit.',
        references: [],
        exploitExamples: ['UPCX', 'Munchables ($62.5M)'],
    },

    // ====== CATEGORY D: Token Minting/Burning ======
    {
        id: 'SOL-MINT-001',
        name: 'Unrestricted Mint Authority',
        category: 'D',
        severity: 'critical',
        description: 'Token mint authority not disabled or controlled by multisig',
        patterns: [
            /mint_to\s*\(/gi,
            /MintTo/gi,
        ],
        onChainIndicators: ['Mint authority is single wallet', 'Mint authority not null'],
        remediation: 'Disable mint authority after initial supply or use multisig control.',
        references: [],
        exploitExamples: ['Gala ($22M)', 'Holograph ($6.7M)', 'Super Sushi Samurai ($4.8M)'],
    },
    {
        id: 'SOL-MINT-002',
        name: 'No Supply Cap',
        category: 'D',
        severity: 'high',
        description: 'Token has no maximum supply limit enforced',
        patterns: [
            /max_supply/i,
            /supply_cap/i,
        ],
        remediation: 'Implement hard-coded maximum supply limit in mint function.',
        references: [],
        exploitExamples: ['Infinite mint attacks'],
    },
    {
        id: 'SOL-MINT-003',
        name: 'Public Mint Function',
        category: 'D',
        severity: 'medium',
        description: 'Minting function accessible without proper access control',
        patterns: [
            /pub\s+fn\s+mint/gi,
            /#\[access_control\].*mint/gi,
        ],
        remediation: 'Restrict mint function to authorized addresses only.',
        references: [],
        exploitExamples: ['Raft ($3.3M)', 'Port3 Network ($166K)'],
    },

    // ====== CATEGORY E: Flashloan Attacks ======
    {
        id: 'SOL-FLASH-001',
        name: 'Single Block State Change Vulnerability',
        category: 'E',
        severity: 'high',
        description: 'Critical operations can complete within single block/transaction',
        patterns: [
            /deposit.*withdraw/gi,
            /stake.*unstake/gi,
            /borrow.*repay/gi,
        ],
        codePatterns: ['No multi-block delay for large operations'],
        remediation: 'Implement time delays or multi-block confirmation for large value operations.',
        references: [],
        exploitExamples: ['Euler V1 ($197M)', 'Beanstalk ($181M)', 'Saddle Finance ($11M)'],
    },
    {
        id: 'SOL-FLASH-002',
        name: 'Flash Loan Donation Attack Vector',
        category: 'E',
        severity: 'high',
        description: 'Donation/empty market attack possible through flashloan',
        patterns: [
            /donate\s*\(/gi,
            /transfer.*total_supply/gi,
        ],
        remediation: 'Prevent pool manipulation by implementing minimum liquidity requirements.',
        references: [],
        exploitExamples: ['Hundred Finance ($7M)', 'Onyx Protocol ($2.1M)', 'Sonne Finance ($20M)'],
    },

    // ====== CATEGORY F: Logic/Math Errors ======
    {
        id: 'SOL-MATH-001',
        name: 'Unchecked Arithmetic',
        category: 'F',
        severity: 'high',
        description: 'Arithmetic operations without overflow/underflow protection',
        patterns: [
            /\+\s*\d/g,
            /\-\s*\d/g,
            /\*\s*\d/g,
            /\/\s*\d/g,
        ],
        codePatterns: ['Direct arithmetic without checked_* methods'],
        remediation: 'Use checked_add, checked_sub, checked_mul, checked_div. Enable overflow-checks in Cargo.toml.',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/4-integer-overflow',
        ],
        exploitExamples: ['Compound V2 ($147M)', 'ValueDefi ($11M)'],
    },
    {
        id: 'SOL-MATH-002',
        name: 'Division Before Multiplication',
        category: 'F',
        severity: 'medium',
        description: 'Division performed before multiplication causing precision loss',
        patterns: [
            /\/.*\*/g,
        ],
        remediation: 'Always multiply before dividing to maintain precision.',
        references: [],
        exploitExamples: ['Wise Lending V1 ($464K)', 'Decimal miscalculation exploits'],
    },
    {
        id: 'SOL-MATH-003',
        name: 'Rounding Error Vulnerability',
        category: 'F',
        severity: 'medium',
        description: 'Rounding in token calculations can be exploited',
        patterns: [
            /round|floor|ceil/gi,
            /as u\d+/g,
        ],
        remediation: 'Implement dust thresholds. Use consistent rounding direction. Consider all edge cases.',
        references: [],
        exploitExamples: ['Midas Capital ($600K)', 'Tropykus RSK ($150K)'],
    },

    // ====== CATEGORY G: Contract Exploitation ======
    {
        id: 'SOL-CPI-001',
        name: 'Unvalidated CPI Call',
        category: 'G',
        severity: 'critical',
        description: 'Cross-Program Invocation without program ID validation',
        patterns: [
            /invoke\s*\(/gi,
            /invoke_signed\s*\(/gi,
            /CpiContext/gi,
        ],
        codePatterns: ['CPI call without verifying target program ID'],
        remediation: 'Always validate the program ID of CPI targets against known constants.',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/8-arbitrary-cpi',
        ],
        exploitExamples: ['Cashio ($48M)', 'Various CPI exploits'],
    },
    {
        id: 'SOL-CPI-002',
        name: 'User-Controlled Call Data',
        category: 'G',
        severity: 'critical',
        description: 'External call parameters controlled by user input',
        patterns: [
            /invoke.*user|input|param/gi,
            /data:.*ctx\.accounts/gi,
        ],
        remediation: 'Strictly validate and sanitize all user inputs before use in CPI calls.',
        references: [],
        exploitExamples: ['Unizen ($2.1M)', 'Router exploits'],
    },

    // ====== CATEGORY H: Liquidity/Pool Attacks ======
    {
        id: 'SOL-LIQ-001',
        name: 'Concentrated LP Holdings',
        category: 'H',
        severity: 'high',
        description: 'Single address holds majority of LP tokens',
        patterns: [],
        onChainIndicators: ['Top holder has >50% of LP tokens'],
        remediation: 'Ensure LP token distribution or implement vesting for team allocations.',
        references: [],
        exploitExamples: ['Bald ($23M)', 'Various rugpulls'],
    },
    {
        id: 'SOL-LIQ-002',
        name: 'Missing Slippage Protection',
        category: 'H',
        severity: 'medium',
        description: 'No slippage limits on swap operations',
        patterns: [
            /slippage|min_out|minimum/gi,
            /swap(?!.*slippage)/gi,
        ],
        remediation: 'Implement user-definable slippage tolerance. Default to reasonable limits (0.5-3%).',
        references: [],
        exploitExamples: ['MEV sandwich attacks'],
    },

    // ====== CATEGORY I: Governance Attacks ======
    {
        id: 'SOL-GOV-001',
        name: 'Flash Loan Governance Attack Vector',
        category: 'I',
        severity: 'high',
        description: 'Governance voting possible within single block (flash-voteable)',
        patterns: [
            /vote|proposal|governance/gi,
        ],
        codePatterns: ['No voting delay', 'Voting power snapshot in same block'],
        remediation: 'Implement voting delay (at least 1 block). Snapshot voting power before proposal.',
        references: [],
        exploitExamples: ['Beanstalk ($181M)', 'Curio ($16M)'],
    },
    {
        id: 'SOL-GOV-002',
        name: 'Insufficient Quorum',
        category: 'I',
        severity: 'medium',
        description: 'Governance quorum too low for critical decisions',
        patterns: [
            /quorum/gi,
        ],
        onChainIndicators: ['Quorum < 10% of total supply'],
        remediation: 'Set appropriate quorum levels (minimum 10-20% for critical decisions).',
        references: [],
        exploitExamples: ['Voting power inflation attacks'],
    },

    // ====== CATEGORY J: Signature/Validation ======
    {
        id: 'SOL-VAL-001',
        name: 'Missing Account Discriminator',
        category: 'J',
        severity: 'high',
        description: 'Account type not verified with discriminator byte',
        patterns: [
            /Account<|AccountLoader</gi,
            /AccountInfo/gi,
        ],
        codePatterns: ['Account deserialized without type check'],
        remediation: 'Use Anchor discriminators or implement manual account type tags (first 8 bytes).',
        references: [
            'https://github.com/coral-xyz/sealevel-attacks/tree/main/programs/3-type-cosplay',
        ],
        exploitExamples: ['Type confusion attacks'],
    },
    {
        id: 'SOL-VAL-002',
        name: 'Signature Replay Vulnerability',
        category: 'J',
        severity: 'high',
        description: 'Signed messages can be replayed',
        patterns: [
            /verify.*signature/gi,
            /ed25519_verify/gi,
        ],
        codePatterns: ['Signature verified without nonce/timestamp'],
        remediation: 'Include nonce or timestamp in signed message. Track used signatures to prevent replay.',
        references: [],
        exploitExamples: ['Portal ($326M)', 'AzukiDAO ($68K)'],
    },
    {
        id: 'SOL-VAL-003',
        name: 'Missing Input Validation',
        category: 'J',
        severity: 'medium',
        description: 'User inputs not properly validated before use',
        patterns: [
            /param|input|arg/gi,
        ],
        codePatterns: ['Function parameters used without bounds checking'],
        remediation: 'Validate all user inputs: check ranges, types, and sanity of values.',
        references: [],
        exploitExamples: ['Convergence ($210K)', 'Various input validation exploits'],
    },
];

// Severity scoring weights
export const SEVERITY_SCORES: Record<Severity, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
};

// Calculate risk grade from score
export function getRiskGrade(score: number): RiskGrade {
    if (score <= 20) return 'A';
    if (score <= 40) return 'B';
    if (score <= 60) return 'C';
    if (score <= 80) return 'D';
    return 'F';
}

// Pattern matching function
export function matchSecurityPatterns(
    code: string,
    rules: SecurityRule[] = SOLANA_SECURITY_RULES
): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    for (const rule of rules) {
        for (const pattern of rule.patterns) {
            const matches = code.match(pattern);
            if (matches) {
                findings.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    severity: rule.severity,
                    description: rule.description,
                    evidence: `Found ${matches.length} occurrence(s): "${matches[0]}"`,
                    remediation: rule.remediation,
                    confidence: 70, // Pattern match confidence
                });
                break; // Only report once per rule
            }
        }
    }

    return findings;
}

// Get rules by category
export function getRulesByCategory(category: string): SecurityRule[] {
    return SOLANA_SECURITY_RULES.filter(rule => rule.category === category);
}

// Get rules by severity
export function getRulesBySeverity(severity: Severity): SecurityRule[] {
    return SOLANA_SECURITY_RULES.filter(rule => rule.severity === severity);
}

// Calculate pattern match score
export function calculatePatternScore(findings: SecurityFinding[]): number {
    let score = 0;
    for (const finding of findings) {
        score += SEVERITY_SCORES[finding.severity];
    }
    return Math.min(score, 100);
}

export default SOLANA_SECURITY_RULES;
