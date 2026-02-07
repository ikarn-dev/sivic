# Sivic Detection Parameters Reference

> Complete reference for all 62 detection parameters used in the Sivic Exploit Detector.

**Live:** [https://www.sivic.xyz/](https://www.sivic.xyz/) | **Backup:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)

---

## Overview

The Sivic Exploit Detector uses a dual-mode detection system:

- **Token Mode**: 31 parameters (18 on-chain + 13 off-chain)
- **DEX Mode**: 31 parameters (19 on-chain + 12 off-chain)

The system automatically detects whether an address is a **Token** (SPL Token mint) or **DEX/Program** and applies the appropriate parameter set.

---

## Token Detection Parameters (31 Total)

### On-Chain Parameters (18)

These parameters analyze data directly from the Solana blockchain.

#### 1. Massive Token Mints
```
ID: massiveMints
Threshold: >1,000,000,000 tokens in single transaction
Severity: CRITICAL
Source: Helius RPC / Transaction History
```
**Why it matters**: Unauthorized mass minting can instantly devalue a token and drain liquidity from holders. This is a primary indicator of mint authority exploitation.

**What triggers it**:
- Single mint instruction creating >1B tokens
- Repeated large mints in short timeframe
- Mints from unexpected/unknown addresses

---

#### 2. Governance Proposal Exploits
```
ID: governanceExploits
Threshold: Quorum bypass detection
Severity: HIGH
Source: Governance Account Analysis
```
**Why it matters**: Attackers can manipulate governance by exploiting low quorum requirements or flash-loaning voting power.

**What triggers it**:
- Proposals passing with minimal participation
- Sudden voting power concentration
- Flash loan voting patterns

---

#### 3. Bonding Curve Distortions
```
ID: bondingCurveDistortions
Threshold: >20% price deviation from curve
Severity: HIGH
Source: DexScreener / Price Analysis
```
**Why it matters**: Bonding curve manipulation allows attackers to extract value by exploiting pricing mechanism weaknesses.

**What triggers it**:
- Price deviations from expected curve
- Unusual liquidity additions/removals
- Curve parameter modifications

---

#### 4. Asset Freezes/Locks
```
ID: assetFreezes
Threshold: Sudden halt in mint/burn activity
Severity: MEDIUM
Source: Helius Transaction Analysis
```
**Why it matters**: Freeze authority abuse can lock user funds permanently, preventing transfers or sales.

**What triggers it**:
- Active freeze authority on token
- Recent freeze transactions
- Pattern of targeted freezes

---

#### 5. Wallet Drains
```
ID: walletDrains
Threshold: Mass transfers to suspicious addresses
Severity: CRITICAL
Source: Helius / SolanaFM Transaction History
```
**Why it matters**: Coordinated wallet drains indicate active exploitation, whether through compromised keys or smart contract vulnerabilities.

**What triggers it**:
- Multiple wallets sending to single destination
- Large transfers in rapid succession
- Transfers to known exploit addresses

---

#### 6. Over-Borrowing in Pools
```
ID: overBorrowing
Threshold: >10% of reserves in single borrow
Severity: HIGH
Source: Pool Account Analysis
```
**Why it matters**: Over-borrowing can drain liquidity pools and leave lenders unable to withdraw funds.

**What triggers it**:
- Large borrow relative to pool size
- Multiple borrows without repayment
- Utilization rate spikes

---

#### 7. ZK Proof Anomalies
```
ID: zkProofAnomalies
Threshold: Invalid ElGamal/ZK proofs
Severity: CRITICAL
Source: Transaction Verification
```
**Why it matters**: Zero-knowledge proof failures in confidential transfers can indicate attempted balance manipulation.

**What triggers it**:
- Failed proof verification
- Unusual proof patterns
- Proof generation from unexpected sources

---

#### 8. Race Conditions
```
ID: raceConditions
Threshold: Inflated balances from concurrent transactions
Severity: HIGH
Source: Transaction Ordering Analysis
```
**Why it matters**: Race conditions can allow double-spending or balance inflation through carefully timed transactions.

**What triggers it**:
- Same-slot conflicting transactions
- Balance inconsistencies
- Transaction reordering patterns

---

#### 9. Signer/Owner Check Failures
```
ID: signerCheckFailures
Threshold: Missing validation in critical operations
Severity: CRITICAL
Source: Transaction Analysis / Pattern Detection
```
**Why it matters**: Missing signer checks allow unauthorized users to execute privileged operations.

**What triggers it**:
- Critical operations without proper authorization
- PDA ownership not verified
- Missing account constraint checks

---

#### 10. Treasury Drains
```
ID: treasuryDrains
Threshold: <50% multisig confirmations
Severity: CRITICAL
Source: Multisig Account Analysis
```
**Why it matters**: Treasury drains with insufficient signatures indicate compromised or bypassed multisig security.

**What triggers it**:
- Single-signature treasury withdrawals
- Multisig threshold bypasses
- Large treasury movements

---

#### 11. Unauthorized Withdrawals
```
ID: unauthorizedWithdrawals
Threshold: Fake mint + dump patterns
Severity: CRITICAL
Source: Transaction Flow Analysis
```
**Why it matters**: Unauthorized minting followed by immediate selling is a classic rug pull execution pattern.

**What triggers it**:
- Mint immediately followed by DEX sale
- Mints from non-standard addresses
- Value extraction patterns

---

#### 12. Slow Drain Patterns
```
ID: slowDrainPatterns
Threshold: <1% per transaction over extended period
Severity: MEDIUM
Source: Long-term Transaction Analysis
```
**Why it matters**: Some exploits operate slowly to avoid detection, extracting small amounts over weeks or months.

**What triggers it**:
- Consistent small withdrawals
- Regular timing patterns
- Gradual TVL decrease

---

#### 13. Victim Wallet Spikes
```
ID: victimWalletSpikes
Threshold: >80,000 unique affected wallets
Severity: CRITICAL
Source: Transfer Analysis
```
**Why it matters**: Large-scale wallet compromises indicate sophisticated phishing campaigns or widespread vulnerability exploitation.

**What triggers it**:
- Mass approvals to single address
- Coordinated drain patterns
- Known phishing signatures

---

#### 14. Token Supply Inflation
```
ID: tokenSupplyInflation
Threshold: >10% supply increase
Severity: HIGH
Source: Token Supply Tracking
```
**Why it matters**: Unexpected supply increases dilute holder value and may indicate mint authority abuse.

**What triggers it**:
- Supply exceeds expected cap
- Large single mints
- Repeated inflationary mints

---

#### 15. Approval Hijacking
```
ID: approvalHijacking
Threshold: ApproveForAll to unknown addresses
Severity: HIGH
Source: Approval Transaction Analysis
```
**Why it matters**: Approval hijacking allows attackers to transfer or burn tokens without owner consent.

**What triggers it**:
- Approvals to unrecognized contracts
- Unlimited approval amounts
- Approval patterns matching known scams

---

#### 16. Failed Project Signatures
```
ID: failedProjectSignatures
Threshold: >95% value drop
Severity: CRITICAL
Source: Price History / DexScreener
```
**Why it matters**: Massive value drops typically indicate rug pulls, exploits, or complete project failures.

**What triggers it**:
- Price drops >95% from ATH
- Liquidity removal patterns
- Developer wallet dumps

---

#### 17. Account Impersonation
```
ID: accountImpersonation
Threshold: PDA collision detection
Severity: CRITICAL
Source: Program Account Analysis
```
**Why it matters**: PDA impersonation can trick programs into trusting malicious accounts.

**What triggers it**:
- Unexpected PDA derivations
- Account data mismatches
- Collision exploit patterns

---

#### 18. Hardware Wallet Breaches
```
ID: hardwareWalletBreaches
Threshold: Cross-chain dump patterns
Severity: CRITICAL
Source: Cross-chain Transaction Analysis
```
**Why it matters**: Compromised hardware wallets often show coordinated dumps across multiple chains.

**What triggers it**:
- Simultaneous multi-chain activity
- Known compromised wallet interaction
- Unusual signing patterns

---

### Off-Chain Parameters (13)

These parameters analyze data from external sources outside the blockchain.

#### 1. Key Leak Indicators
```
ID: keyLeakIndicators
Source: Known compromised wallet databases
Severity: CRITICAL
```
**Why it matters**: Leaked private keys are a primary attack vector for cryptocurrency theft.

---

#### 2. DAO Engagement Alerts
```
ID: daoEngagementAlerts
Source: Governance participation metrics
Severity: MEDIUM
```
**Why it matters**: Low governance participation makes protocols vulnerable to governance attacks.

---

#### 3. Economic Model Stress
```
ID: economicModelStress
Source: Flash loan vulnerability analysis
Severity: HIGH
```
**Why it matters**: Weak economic models can be exploited through flash loans or other capital-intensive attacks.

---

#### 4. Audit Gap Warnings
```
ID: auditGapWarnings
Source: DefiLlama audit database
Severity: MEDIUM
```
**Why it matters**: Unaudited or outdated audits leave security vulnerabilities undetected.

---

#### 5. Centralization Warnings
```
ID: centralizationWarnings
Source: Authority analysis
Severity: HIGH
```
**Why it matters**: Single points of failure create rug pull and key compromise risks.

---

#### 6. Phishing Transaction Clusters
```
ID: phishingTxClusters
Threshold: >8,000 detected phishes
Source: Scam databases / Community reports
Severity: CRITICAL
```
**Why it matters**: Active phishing campaigns targeting a token indicate systematic user exploitation.

---

#### 7. Malware App Indicators
```
ID: malwareAppIndicators
Source: Security reports / App analysis
Severity: CRITICAL
```
**Why it matters**: Fake apps harvesting seed phrases lead to large-scale wallet compromises.

---

#### 8. AI-Generated Package Alerts
```
ID: aiPackageAlerts
Source: npm / Dependency analysis
Severity: HIGH
```
**Why it matters**: AI-generated malicious packages are increasingly used to infiltrate developer environments.

---

#### 9. Rug Pull Prevalence Metrics
```
ID: rugPullMetrics
Threshold: 98% fraud rate indicators
Source: Historical rug pull database
Severity: CRITICAL
```
**Why it matters**: Pattern matching against known rug pulls helps predict future incidents.

---

#### 10. Deepfake/Impersonation Signals
```
ID: deepfakeSignals
Source: Social media analysis
Severity: MEDIUM
```
**Why it matters**: Fake team accounts and AI-generated personas are common in scam projects.

---

#### 11. Social Media Signals
```
ID: socialMediaSignals
Source: Twitter/Discord analysis
Severity: LOW
```
**Why it matters**: Social buzz patterns can indicate pump-and-dump coordination.

---

#### 12. User Report Aggregation
```
ID: userReportAggregation
Source: Scam report databases
Severity: HIGH
```
**Why it matters**: Community reports are often the first warning sign of exploits or scams.

---

#### 13. Victim Report Analysis
```
ID: victimReportAnalysis
Source: Victim testimony pattern matching
Severity: MEDIUM
```
**Why it matters**: Analyzing victim reports reveals attack vectors and warning signs.

---

## DEX Detection Parameters (31 Total)

### On-Chain Parameters (19)

#### 1. Flash Loan Patterns
```
ID: flashLoanPatterns
Threshold: >5x average daily volume in single transaction
Severity: CRITICAL
Source: Transaction volume analysis
```
**Why it matters**: Flash loans enable capital-free exploitation of vulnerable protocols.

---

#### 2. Oracle Feed Discrepancies
```
ID: oracleFeedDiscrepancies
Threshold: >10% price deviation between oracles
Severity: CRITICAL
Source: Multi-oracle comparison
```
**Why it matters**: Oracle manipulation is one of the most common DeFi attack vectors.

---

#### 3. Unauthorized Admin Withdrawals
```
ID: unauthorizedAdminWithdrawals
Threshold: Withdrawals without multisig
Severity: CRITICAL
Source: Admin transaction analysis
```
**Why it matters**: Admin key compromise allows complete protocol fund extraction.

---

#### 4. Price Pumps in Perpetual Trades
```
ID: pricePumps
Threshold: >50% price movement in minutes
Severity: HIGH
Source: Price monitoring
```
**Why it matters**: Rapid price movements indicate manipulation or coordinated trading.

---

#### 5. Bridge Transfer Anomalies
```
ID: bridgeTransferAnomalies
Threshold: <$7k transfers to mixers
Severity: MEDIUM
Source: Cross-chain analysis
```
**Why it matters**: Small bridge transfers to mixers indicate laundering of exploited funds.

---

#### 6. Tick Account Creations
```
ID: tickAccountCreations
Threshold: Without owner checks
Severity: HIGH
Source: CLMM pool analysis
```
**Why it matters**: Improper tick account handling in concentrated liquidity pools can be exploited.

---

#### 7. Wallet Approval Spikes
```
ID: walletApprovalSpikes
Threshold: Mass approvals to single address
Severity: HIGH
Source: Approval transaction analysis
```
**Why it matters**: Coordinated approval spikes precede phishing/drain attacks.

---

#### 8. Large Vault Withdrawals
```
ID: largeVaultWithdrawals
Threshold: >20% TVL in single withdrawal
Severity: CRITICAL
Source: Vault balance monitoring
```
**Why it matters**: Large sudden withdrawals may indicate exploits or bank runs.

---

#### 9. Transaction Volume Surges
```
ID: transactionVolumeSurges
Threshold: >100x normal volume
Severity: HIGH
Source: Transaction count analysis
```
**Why it matters**: Volume surges often accompany exploits or coordinated attacks.

---

#### 10. Sandwich Attacks
```
ID: sandwichAttacks
Threshold: >1% value extracted per sandwich
Severity: HIGH
Source: MEV analysis / Jito
```
**Why it matters**: Sandwich attacks extract value from regular users' trades.

---

#### 11. Rounding Errors in Pool Calculations
```
ID: roundingErrors
Threshold: <0.01% precision deviation
Severity: MEDIUM
Source: Pool calculation verification
```
**Why it matters**: Rounding errors can be accumulated over many transactions for profit.

---

#### 12. Hot Wallet Drains
```
ID: hotWalletDrains
Threshold: >10% in <5 minutes
Severity: CRITICAL
Source: Exchange wallet monitoring
```
**Why it matters**: Fast hot wallet drains indicate active key compromise.

---

#### 13. Insider Wallet Clusters
```
ID: insiderWalletClusters
Threshold: 100+ affiliated wallets
Severity: HIGH
Source: Wallet relationship analysis
```
**Why it matters**: Insider trading and team dumping often use wallet clusters.

---

#### 14. Rug Pull Signatures
```
ID: rugPullSignatures
Threshold: >50% LP withdrawal
Severity: CRITICAL
Source: Liquidity pool monitoring
```
**Why it matters**: Large LP withdrawals are the final step of rug pulls.

---

#### 15. Malicious Transaction Approvals
```
ID: maliciousTxApprovals
Threshold: Unknown delegate addresses
Severity: HIGH
Source: Delegation analysis
```
**Why it matters**: Malicious approvals enable unauthorized fund transfers.

---

#### 16. MEV Bot Exploitation Spikes
```
ID: mevBotExploitation
Threshold: >1,000 sandwiches/day
Severity: HIGH
Source: MEV statistics / Jito
```
**Why it matters**: High MEV activity indicates poor transaction protection.

---

#### 17. Cross-Chain Bridge Anomalies
```
ID: crossChainBridgeAnomalies
Threshold: Mint/burn accounting mismatch
Severity: CRITICAL
Source: Bridge verification
```
**Why it matters**: Bridge vulnerabilities have caused billions in losses.

---

#### 18. Fee Recovery Failures
```
ID: feeRecoveryFailures
Threshold: >20% fee drop from expected
Severity: MEDIUM
Source: Fee analysis
```
**Why it matters**: Fee mechanism failures indicate protocol logic errors.

---

#### 19. Program Upgrade Vulnerabilities
```
ID: programUpgradeVulns
Threshold: >5% transaction error rate
Severity: HIGH
Source: Error rate analysis
```
**Why it matters**: High error rates post-upgrade suggest bugs that may be exploitable.

---

### Off-Chain Parameters (12)

#### 1. Validator Client Monitoring
```
ID: validatorClientMonitoring
Source: Jito network adoption
Severity: LOW
```

#### 2. Social Media Signals  
```
ID: socialMediaSignals
Source: MEV discussion tracking
Severity: LOW
```

#### 3. Block Engine Logs
```
ID: blockEngineLogs
Source: Jito bundle inspection
Severity: MEDIUM
```

#### 4. RPC Provider Anomalies
```
ID: rpcProviderAnomalies
Threshold: <200ms transaction visibility
Source: RPC latency analysis
Severity: MEDIUM
```

#### 5. News and Research Buzz
```
ID: newsResearchBuzz
Source: Security report aggregation
Severity: MEDIUM
```

#### 6. Audit and Simulation Results
```
ID: auditSimulationResults
Source: Audit databases
Severity: HIGH
```

#### 7. Forum and Validator Discussions
```
ID: forumValidatorDiscussions
Source: Community monitoring
Severity: LOW
```

#### 8. Bot Configuration Alerts
```
ID: botConfigAlerts
Source: Risk parameter monitoring
Severity: MEDIUM
```

#### 9. Dependency Scans
```
ID: dependencyScans
Source: Package vulnerability databases
Severity: HIGH
```

#### 10. Research Reports
```
ID: researchReports
Source: MEV research publications
Severity: LOW
```

#### 11. Simulation Tools
```
ID: simulationTools
Source: Liquidation simulation results
Severity: MEDIUM
```

#### 12. Validator Communications
```
ID: validatorCommunications
Source: Unstaking alert monitoring
Severity: LOW
```

---

## Risk Calculation

### Severity Weights

| Severity | Points |
|----------|--------|
| Low | 5 |
| Medium | 15 |
| High | 30 |
| Critical | 50 |

### Overall Risk Determination

```
if (score >= 50 OR hasCritical) → CRITICAL
else if (score >= 30) → HIGH  
else if (score >= 10) → MEDIUM
else → LOW
```

### Grade Assignment

| Grade | Score Range |
|-------|-------------|
| A | 0-20 |
| B | 21-40 |
| C | 41-60 |
| D | 61-80 |
| F | 81-100 |

---

## Data Source Mapping

| Parameter Category | Primary Source | Fallback Source |
|--------------------|----------------|-----------------|
| Token Authority | Helius RPC | SolanaFM |
| Price Data | Birdeye | DexScreener |
| Holder Analysis | Helius DAS | SolanaFM |
| Security Score | RugCheck | Birdeye |
| Slippage | Jupiter | Calculated |
| DEX Pairs | DexScreener | DefiLlama |
| MEV Data | Jito Explorer | Bitquery |
| Audit History | DefiLlama | Manual |

---

## Usage Notes

1. **Not all parameters trigger for every address** - Parameters are contextually relevant
2. **Multiple triggers are weighted** - A single critical is worse than multiple lows
3. **Off-chain data enhances but doesn't replace on-chain analysis**
4. **AI analysis provides context but may have lower confidence**
5. **Regular monitoring is recommended** - New exploits emerge daily
