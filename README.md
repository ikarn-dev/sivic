# Sivic Dashboard

> **Real-time Solana Ecosystem Security Intelligence Platform**

**Live:** [https://www.sivic.xyz/](https://www.sivic.xyz/) | **Backup:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)

Sivic is a comprehensive security dashboard for the Solana blockchain ecosystem. It provides real-time MEV protection, exploit detection, contract analysis, and ecosystem monitoring powered by multiple data providers and AI-driven insights.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Solana](https://img.shields.io/badge/Solana-Mainnet-purple?logo=solana)
![License](https://img.shields.io/badge/License-Proprietary-orange)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [System Components](#system-components)
- [Detection Parameters](#detection-parameters)
- [MEV Protection](#mev-protection)
- [API Providers](#api-providers)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Manual](#user-manual)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

---

## Features

### MEV Shield
Real-time network-based MEV (Maximal Extractable Value) risk analysis:
- Network congestion monitoring
- Sandwich attack detection
- Front-running protection insights
- Transaction simulation sandbox
- Jito bundle analysis

### Exploit Detector
Comprehensive on-chain security analysis with **62 detection parameters**:
- **Token Mode**: 31 parameters (18 on-chain + 13 off-chain)
- **DEX Mode**: 31 parameters (19 on-chain + 12 off-chain)
- Real-time analysis timeline
- AI-powered vulnerability assessment
- Risk scoring and grading (A-F)

### Ecosystem Overview
Live Solana ecosystem monitoring:
- Total Value Locked (TVL) tracking
- DEX volume comparison
- Protocol rankings
- Ecosystem heatmaps

### Pre-Audit
Smart contract pre-audit capabilities:
- Pattern-based vulnerability detection
- Security rules engine
- Remediation recommendations

---

## Architecture

### High-Level System Architecture

```
+-----------------------------------------------------------------------------+
|                              SIVIC DASHBOARD                                 |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +---------------------------------------------------------------------+    |
|  |                         FRONTEND LAYER                               |    |
|  |  +----------+ +-----------+ +--------------+ +----------+ +-------+ |    |
|  |  |  Home    | |MEV Shield | |Exploit       | |Pre-Audit | |Reports| |    |
|  |  |  Page    | |           | |Detector      | |          | |       | |    |
|  |  +----+-----+ +-----+-----+ +------+-------+ +----+-----+ +---+---+ |    |
|  +-------+-----------+--------------+----------------+-----------+-----+    |
|          |           |              |                |           |          |
|  +-------v-----------v--------------v----------------v-----------v-----+    |
|  |                          API LAYER (Next.js)                         |    |
|  |  /api/network  /api/mev-stats  /api/contract/analyze  /api/ai       |    |
|  |  /api/ecosystem  /api/dex  /api/protocols-treemap  /api/exploits    |    |
|  +------------------------------+---------------------------------------+    |
|                                 |                                            |
|  +------------------------------v---------------------------------------+    |
|  |                         CORE LIBRARIES                                |    |
|  |  +----------------+  +----------------+  +-------------------------+ |    |
|  |  | On-Chain       |  | Token Detector |  | DEX Detector            | |    |
|  |  | Analyzer       |  | (31 params)    |  | (31 params)             | |    |
|  |  +----------------+  +----------------+  +-------------------------+ |    |
|  |  +----------------+  +----------------+  +-------------------------+ |    |
|  |  | Security Rules |  | Risk           |  | Exploit Patterns        | |    |
|  |  | Engine         |  | Aggregator     |  | Library                 | |    |
|  |  +----------------+  +----------------+  +-------------------------+ |    |
|  +----------------------------------------------------------------------+    |
|                                                                              |
+------------------------------------------------------------------------------+
                                      |
                                      v
+------------------------------------------------------------------------------+
|                         EXTERNAL DATA SOURCES                                 |
+----------+----------+----------+-------------+----------+----------+---------+
|  Helius  | Jupiter  | Birdeye  | DexScreener |DefiLlama |   Jito   |OpenAI   |
|   RPC    |   API    |   API    |    API      |   API    | Explorer |Router   |
+----------+----------+----------+-------------+----------+----------+---------+
| Solana   | Quotes   | Token    | DEX Pairs   | TVL      | MEV      |   AI    |
| On-Chain | Slippage | Security | Liquidity   | Audits   | Bundles  |Analysis |
+----------+----------+----------+-------------+----------+----------+---------+
```

### Component Interaction Flow (UML Sequence)

```
+--------+     +---------+     +------------+     +-----------+     +------------+
|  User  |     |Frontend |     |  API Route |     |  Detector |     |External API|
+---+----+     +----+----+     +-----+------+     +-----+-----+     +-----+------+
    |               |                |                  |                  |
    | Enter Address |                |                  |                  |
    |-------------->|                |                  |                  |
    |               |                |                  |                  |
    |               | SSE: analyze   |                  |                  |
    |               |--------------->|                  |                  |
    |               |                |                  |                  |
    |               |                | Detect Type      |                  |
    |               |                |----------------->|                  |
    |               |                |                  |                  |
    |               |                |                  | Fetch On-Chain   |
    |               |                |                  |----------------->|
    |               |                |                  |                  |
    |               |                |                  |<-----------------|
    |               |                |                  |                  |
    |               |                | Stream Steps     |                  |
    |               |<---------------|<-----------------|                  |
    |               |                |                  |                  |
    | Live Updates  |                |                  |                  |
    |<--------------|                |                  |                  |
    |               |                |                  |                  |
    |               |                | AI Analysis      |                  |
    |               |                |----------------------------------->|
    |               |                |                  |                  |
    |               |                |<-----------------------------------|
    |               |                |                  |                  |
    | Final Results |                |                  |                  |
    |<--------------|<---------------|                  |                  |
    |               |                |                  |                  |
```

### Class Diagram (Core Detection System)

```
+----------------------------------------------------------------------------+
|                           DETECTION SYSTEM                                  |
+----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------+              +---------------------+              |
|  |   TokenDetector     |              |    DexDetector      |              |
|  +---------------------+              +---------------------+              |
|  | - address: string   |              | - address: string   |              |
|  | - onChainParams     |              | - onChainParams     |              |
|  | - offChainParams    |              | - offChainParams    |              |
|  | - riskIndicators[]  |              | - riskIndicators[]  |              |
|  +---------------------+              +---------------------+              |
|  | + analyze()         |              | + analyze()         |              |
|  | + analyzeBasicInfo()|              | + analyzeProgramInfo|              |
|  | + analyzeMarketData |              | + analyzeTxVolume() |              |
|  | + analyzeSecurityInfo              | + analyzeDexPairs() |              |
|  | + analyzeDexPairs() |              | + analyzeMevActivity|              |
|  | + analyzeSlippage() |              | + analyzeOffChain() |              |
|  | + analyzeHolders()  |              | + addRisk()         |              |
|  | + analyzeOffChain() |              | + getParamCounts()  |              |
|  | + addRisk()         |              +----------+----------+              |
|  | + getParamCounts()  |                         |                         |
|  +----------+----------+                         |                         |
|             |                                    |                         |
|             +----------------+-------------------+                         |
|                              |                                             |
|                              v                                             |
|                 +------------------------+                                 |
|                 |    DetectionResult     |                                 |
|                 +------------------------+                                 |
|                 | - address: string      |                                 |
|                 | - detectionMode        |                                 |
|                 | - totalParamsChecked   |                                 |
|                 | - totalParamsTriggered |                                 |
|                 | - riskIndicators[]     |                                 |
|                 | - riskScore: number    |                                 |
|                 | - overallRisk          |                                 |
|                 +------------------------+                                 |
|                              |                                             |
|                              v                                             |
|                 +------------------------+                                 |
|                 |    RiskAggregator      |                                 |
|                 +------------------------+                                 |
|                 | + calculateOnChainScore|                                 |
|                 | + calculateAIScore()   |                                 |
|                 | + aggregateRiskScore() |                                 |
|                 | + generateSummary()    |                                 |
|                 | + prioritizeRemediation|                                 |
|                 +------------------------+                                 |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## System Components

### Frontend Components

| Component | Description |
|-----------|-------------|
| `DashboardLayout` | Main layout wrapper with sidebar navigation |
| `Card` / `GlassContainerCard` | Premium glass-morphism card components |
| `AnalysisTimeline` | Real-time analysis step visualization |
| `TimelineOverlay` | Floating overlay showing detection progress |
| `TransactionSandbox` | MEV simulation and transaction testing |
| `EcosystemTreemap` | Interactive protocol TVL visualization |
| `NetworkActivityVisualization` | Live network metrics display |

### Core Libraries

| Library | Purpose | Location |
|---------|---------|----------|
| `on-chain-analyzer.ts` | Fetches and analyzes Solana on-chain data | `/lib/` |
| `token-detector.ts` | Token-specific exploit detection (31 params) | `/lib/detection/` |
| `dex-detector.ts` | DEX/program exploit detection (31 params) | `/lib/detection/` |
| `security-rules.ts` | Security rules engine with pattern matching | `/lib/` |
| `exploit-patterns.ts` | Known exploit technique library | `/lib/` |
| `risk-aggregator.ts` | Multi-layer risk score aggregation | `/lib/` |

### API Clients

| Client | Provider | Purpose |
|--------|----------|---------|
| `helius.ts` | Helius | Solana RPC, DAS API, transaction parsing |
| `jupiter.ts` | Jupiter | Swap quotes, slippage analysis, routing |
| `birdeye.ts` | Birdeye | Token security, prices, holder analysis |
| `dexscreener.ts` | DexScreener | DEX pairs, liquidity, price changes |
| `defillama.ts` | DefiLlama | Protocol TVL, audit history, hacks |
| `solanafm.ts` | SolanaFM | Token holders, transfers, account info |

---

## Detection Parameters

### Token Detection (31 Parameters)

#### On-Chain Parameters (18)

| # | Parameter | Threshold | Description |
|---|-----------|-----------|-------------|
| 1 | Massive Mints | >1B tokens/tx | Detects unauthorized token inflation |
| 2 | Governance Exploits | Quorum bypass | Identifies governance manipulation |
| 3 | Bonding Curve Distortions | >20% deviation | Price manipulation detection |
| 4 | Asset Freezes | Sudden halt | Monitors mint/burn activity |
| 5 | Wallet Drains | Mass transfers | Tracks suspicious fund movements |
| 6 | Over-Borrowing | >10% reserves | Lending pool exploitation |
| 7 | ZK Proof Anomalies | Invalid proofs | Zero-knowledge verification failures |
| 8 | Race Conditions | Inflated balances | Concurrent transaction issues |
| 9 | Signer Check Failures | Missing validation | Authorization bypasses |
| 10 | Treasury Drains | <50% confirmations | Multisig security breaches |
| 11 | Unauthorized Withdrawals | Fake mints | Token creation exploits |
| 12 | Slow Drain Patterns | <1% per tx | Long-term extraction attacks |
| 13 | Victim Wallet Spikes | >80k victims | Mass attack detection |
| 14 | Token Supply Inflation | >10% increase | Supply manipulation |
| 15 | Approval Hijacking | Unknown approvals | Token allowance exploitation |
| 16 | Failed Project Signatures | >95% value drop | Rug pull detection |
| 17 | Account Impersonation | PDA collisions | Address spoofing |
| 18 | Hardware Wallet Breaches | Cross-chain dumps | Compromised key detection |

#### Off-Chain Parameters (13)

| # | Parameter | Description |
|---|-----------|-------------|
| 1 | Key Leak Indicators | Known compromised wallet patterns |
| 2 | DAO Engagement Alerts | Low governance participation |
| 3 | Economic Model Stress | Flash loan vulnerability analysis |
| 4 | Audit Gap Warnings | Missing recent security audits |
| 5 | Centralization Warnings | Single authority control |
| 6 | Phishing TX Clusters | >8k detected phishing transactions |
| 7 | Malware App Indicators | Seed phrase theft patterns |
| 8 | AI Package Alerts | Suspicious npm package detection |
| 9 | Rug Pull Metrics | 98% fraud rate indicators |
| 10 | Deepfake Signals | Fake social media presence |
| 11 | Social Media Signals | Token buzz analysis |
| 12 | User Report Aggregation | Known scam list matching |
| 13 | Victim Report Analysis | Attack pattern matching |

### DEX Detection (31 Parameters)

#### On-Chain Parameters (19)

| # | Parameter | Threshold | Description |
|---|-----------|-----------|-------------|
| 1 | Flash Loan Patterns | >5x daily volume | Detects flash loan attacks |
| 2 | Oracle Feed Discrepancies | >10% deviation | Price oracle manipulation |
| 3 | Unauthorized Admin Withdrawals | No multisig | Admin key exploitation |
| 4 | Price Pumps | >50% in minutes | Pump-and-dump schemes |
| 5 | Bridge Transfer Anomalies | <$7k to mixers | Money laundering detection |
| 6 | Tick Account Creations | No owner checks | CLMM vulnerability |
| 7 | Wallet Approval Spikes | Mass approvals | Approval farming attacks |
| 8 | Large Vault Withdrawals | >20% TVL | Liquidity exploitation |
| 9 | Transaction Volume Surges | >100x normal | Abnormal activity detection |
| 10 | Sandwich Attacks | >1% extracted | MEV sandwich detection |
| 11 | Rounding Errors | <0.01% deviation | Precision exploitation |
| 12 | Hot Wallet Drains | >10% in <5 min | Exchange security breach |
| 13 | Insider Wallet Clusters | 100+ affiliated | Coordinated manipulation |
| 14 | Rug Pull Signatures | >50% LP withdrawal | Liquidity rug detection |
| 15 | Malicious TX Approvals | Unknown delegates | Authorization attacks |
| 16 | MEV Bot Exploitation | >1000 sandwiches/day | MEV activity monitoring |
| 17 | Cross-Chain Bridge Anomalies | Mint/burn mismatch | Bridge exploitation |
| 18 | Fee Recovery Failures | >20% fee drop | Fee mechanism attacks |
| 19 | Program Upgrade Vulns | >5% error rate | Upgrade vulnerability |

#### Off-Chain Parameters (12)

| # | Parameter | Description |
|---|-----------|-------------|
| 1 | Validator Client Monitoring | Jito adoption tracking |
| 2 | Social Media Signals | MEV discussion monitoring |
| 3 | Block Engine Logs | Jito bundle analysis |
| 4 | RPC Provider Anomalies | <200ms transaction visibility |
| 5 | News Research Buzz | Exploit report monitoring |
| 6 | Audit Simulation Results | Known vulnerability matching |
| 7 | Forum Validator Discussions | MEV complaint tracking |
| 8 | Bot Configuration Alerts | Risk parameter monitoring |
| 9 | Dependency Scans | Malicious package detection |
| 10 | Research Reports | MEV activity research |
| 11 | Simulation Tools | Liquidation testing |
| 12 | Validator Communications | Unstaking alert monitoring |

---

## MEV Protection

### What is MEV?

**MEV (Maximal Extractable Value)** refers to the profit that validators or searchers can extract from regular users by manipulating transaction ordering within a block.

### MEV Attack Types

```
+---------------------------------------------------------------------+
|                        MEV ATTACK TYPES                              |
+---------------------------------------------------------------------+
|                                                                      |
|  +-------------------------------------------------------------+    |
|  | SANDWICH ATTACK                           Severity: HIGH     |    |
|  | +-------+    +-----------+    +-------+                     |    |
|  | |Buy TX | -> |Victim Swap| -> |Sell TX|                     |    |
|  | +---+---+    +-----+-----+    +---+---+                     |    |
|  |     |              |              |                          |    |
|  |  Attacker      User's TX      Attacker                       |    |
|  |  Front-runs    Executes at    Back-runs                      |    |
|  |  to raise      worse price    to profit                      |    |
|  |  price                                                        |    |
|  +-------------------------------------------------------------+    |
|                                                                      |
|  +-------------------------------------------------------------+    |
|  | FRONT-RUNNING                             Severity: MEDIUM   |    |
|  |                                                               |    |
|  |  Attacker sees pending profitable TX in mempool              |    |
|  |  Copies TX with higher gas fee                               |    |
|  |  Attacker TX executes first, stealing profit                 |    |
|  +-------------------------------------------------------------+    |
|                                                                      |
|  +-------------------------------------------------------------+    |
|  | BACK-RUNNING                              Severity: MEDIUM   |    |
|  |                                                               |    |
|  |  Attacker waits for large trade to execute                   |    |
|  |  Immediately captures resulting arbitrage opportunity        |    |
|  +-------------------------------------------------------------+    |
|                                                                      |
|  +-------------------------------------------------------------+    |
|  | LIQUIDATION MEV                           Severity: LOW      |    |
|  |                                                               |    |
|  |  Monitors DeFi positions approaching liquidation threshold   |    |
|  |  Competes to execute liquidation for protocol rewards        |    |
|  +-------------------------------------------------------------+    |
|                                                                      |
+---------------------------------------------------------------------+
```

### Why MEV Protection Matters

| Risk Factor | Impact | Sivic's Solution |
|-------------|--------|------------------|
| Price Slippage | 1-5% per transaction | Real-time slippage analysis |
| Transaction Failures | Wasted gas fees | Pre-execution simulation |
| Value Extraction | $1B+ extracted annually | Sandwich attack detection |
| Network Congestion | Higher fees | Congestion monitoring |

### MEV Data Sources

Sivic integrates with **Jito** for MEV bundle analysis:
- Bundle success rates
- Tip distributions
- Validator MEV adoption
- Real-time sandwich detection

---

## API Providers

### Provider Integration Map

```
+----------------------------------------------------------------------------+
|                         DATA PROVIDER INTEGRATION                           |
+----------------------------------------------------------------------------+
|                                                                             |
|  +-------------+                                                           |
|  |   HELIUS    | --> Solana RPC - DAS API - Transaction Parsing            |
|  |   (Primary) |     Account Info - Token Metadata - Signatures            |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  |  JUPITER    | --> Swap Quotes - Routing - Slippage Analysis             |
|  |             |     Price Impact - Token Validation                        |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  |  BIRDEYE    | --> Token Security - Price Data - Holder Analysis         |
|  |             |     Volatility - Trading Volume                            |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  | DEXSCREENER | --> DEX Pairs - Liquidity Pools - Price Charts            |
|  |             |     Trading Activity - Pool Analytics                      |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  | DEFILLAMA   | --> Protocol TVL - Audit History - Hack Database          |
|  |             |     Chain Analytics - Stablecoin Data                      |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  |   JITO      | --> MEV Bundle Data - Sandwich Detection                  |
|  |  Explorer   |     Validator Tips - Block Engine Analytics               |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  | RUGCHECK    | --> Token Safety Scores - Scam Detection                  |
|  |             |     Risk Assessment - Community Reports                    |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  | SOLANAFM    | --> Token Holders - Transfer History                      |
|  |             |     Account Analytics - On-chain Data                      |
|  +-------------+                                                           |
|                                                                             |
|  +-------------+                                                           |
|  | OPENROUTER  | --> AI Analysis - Vulnerability Assessment                |
|  |    (AI)     |     Natural Language Insights - Recommendations           |
|  +-------------+                                                           |
|                                                                             |
+----------------------------------------------------------------------------+
```

### Rate Limits and Tiers

| Provider | Free Tier | Rate Limit |
|----------|-----------|------------|
| Helius | 1M credits/month | 10 req/sec |
| Jupiter | Generous | Unspecified |
| Birdeye | 100 req/min | Public API |
| DexScreener | Unlimited | ~300 req/min |
| DefiLlama | Unlimited | Public API |
| Jito | Unlimited | Public API |
| RugCheck | Unlimited | Public API |
| SolanaFM | 100k req/month | 10 req/sec |
| OpenRouter | 50 req/day | Per key |

---

## Installation

### Prerequisites

- **Node.js** >= 18.0
- **npm** or **yarn**
- API keys (see Configuration)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure API keys (see Configuration section)

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Configuration

### Environment Variables

Create `.env.local` with the following configuration:

```env
# ===========================================
# REQUIRED: Helius RPC (Primary Data Source)
# ===========================================
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com
HELIUS_API_URL=https://api-mainnet.helius-rpc.com/v0

# ===========================================
# OPTIONAL: Enhanced Features
# ===========================================

# Jupiter API (Slippage Analysis)
JUPITER_API_KEY=your_jupiter_api_key
JUPITER_API_URL=https://api.jup.ag

# Birdeye API (Token Security)
BIRDEYE_API_KEY=your_birdeye_api_key
BIRDEYE_API_URL=https://public-api.birdeye.so

# OpenRouter API (AI Analysis)
OPENROUTER_API_KEY=your_openrouter_api_key

# ===========================================
# PUBLIC APIs (No Key Required)
# ===========================================
DEFILLAMA_API_URL=https://api.llama.fi
RUGCHECK_API_URL=https://api.rugcheck.xyz/v1
JITO_EXPLORER_URL=https://explorer.jito.wtf/api
SOLANAFM_API_URL=https://api.solana.fm/v0

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_MEV_SHIELD=true
ENABLE_CONTRACT_AUDIT=true
ENABLE_NETWORK_MONITOR=true
ENABLE_AI_ANALYSIS=true
ENABLE_EXPLOIT_DETECTOR=true
```

---

## User Manual

### Home Page (Overview)

1. **Network Status Cards** - View real-time MEV risk level, TPS, success rate, and SOL price
2. **DEX Volume Charts** - Compare 24h trading volumes across Solana DEXs
3. **TVL Overview** - Monitor Total Value Locked across DeFi protocols
4. **Ecosystem Heatmap** - Visual representation of protocol sizes by TVL
5. **API Providers Strip** - Shows all integrated data sources

### Exploit Detector

#### How to Analyze a Contract:

1. Navigate to **Exploit Detector** page
2. Enter a Solana address (token mint or program ID)
3. Click **"Analyze"** button
4. Watch the real-time analysis timeline:
   - Account type detection (Token vs DEX)
   - On-chain data fetching
   - Security parameter checks
   - Off-chain analysis
   - AI vulnerability assessment
5. Review results:
   - **Risk Score** (0-100) and **Grade** (A-F)
   - **Risk Indicators** - triggered security parameters
   - **AI Analysis** - natural language vulnerability summary
   - **Top Holders** - token holder distribution (Token mode)

#### Understanding Risk Grades:

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A | 0-20 | Very Safe - Minimal risk detected |
| B | 21-40 | Low Risk - Minor issues found |
| C | 41-60 | Medium Risk - Notable vulnerabilities |
| D | 61-80 | High Risk - Significant vulnerabilities |
| F | 81-100 | Critical Risk - Severe issues requiring immediate attention |

### MEV Shield

1. **Network Activity** - Real-time TPS and congestion visualization
2. **On-Chain MEV Metrics** - Bundle success rates, tip data from Jito
3. **Transaction Sandbox** - Simulate transactions to check MEV exposure
4. **Attack Type Reference** - Educational content about MEV attack vectors

### Pre-Audit

1. Enter contract address or paste contract code
2. System checks against security rules engine
3. Pattern-based vulnerability detection
4. View findings with remediation recommendations

### Reports

- Export analysis results as JSON
- View historical analysis records
- Generate shareable reports

---

## API Reference

### Analyze Contract (SSE Stream)

```
GET /api/contract/analyze-stream?address={address}
```

Returns Server-Sent Events with analysis progress:

```typescript
// Event types
type: 'step_start' | 'step_complete' | 'step_error' | 'data_update' | 'complete'

// Complete event payload
{
  type: 'complete',
  data: {
    address: string,
    type: 'token' | 'program',
    detectionMode: 'token' | 'dex',
    riskScore: { score: number, grade: string },
    riskIndicators: RiskIndicator[],
    // ... additional analysis data
  },
  paramsChecked: number,
  paramsTriggered: number
}
```

### AI Analysis

```
POST /api/ai/analyze
Content-Type: application/json

{
  "detectionData": { /* Detection result from analyze-stream */ }
}
```

### Other Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/network` | GET | Network health data |
| `/api/mev-stats` | GET | MEV statistics from Jito |
| `/api/ecosystem` | GET | Ecosystem TVL data |
| `/api/dex` | GET | DEX volume rankings |
| `/api/protocols-treemap` | GET | Protocol data for treemap |
| `/api/exploits` | GET | Recent exploit data |

---

## Project Structure

```
dashboard/
|-- app/                          # Next.js App Router
|   |-- api/                      # API routes
|   |   |-- ai/                   # AI analysis endpoints
|   |   |-- contract/             # Contract analysis
|   |   |-- dex/                  # DEX volume data
|   |   |-- ecosystem/            # Ecosystem TVL
|   |   |-- exploits/             # Exploit database
|   |   |-- mev-stats/            # MEV statistics
|   |   |-- network/              # Network health
|   |   +-- protocols-treemap/    # Treemap data
|   |-- exploit-detector/         # Exploit detector page
|   |-- mev-shield/               # MEV shield page
|   |-- pre-audit/                # Pre-audit page
|   |-- reports/                  # Reports page
|   |-- globals.css               # Global styles
|   |-- layout.tsx                # Root layout
|   +-- page.tsx                  # Home page
|
|-- components/                   # React components
|   |-- AnalysisTimeline.tsx      # Analysis progress display
|   |-- Card.tsx                  # Glass-morphism cards
|   |-- DashboardLayout.tsx       # Main layout
|   |-- EcosystemTreemap.tsx      # TVL visualization
|   |-- TransactionSandbox.tsx    # MEV simulation
|   |-- TimelineOverlay.tsx       # Analysis overlay
|   +-- ...                       # Other components
|
|-- lib/                          # Core libraries
|   |-- api/                      # API clients
|   |   |-- birdeye.ts            # Birdeye API
|   |   |-- defillama.ts          # DefiLlama API
|   |   |-- dexscreener.ts        # DexScreener API
|   |   |-- helius.ts             # Helius RPC
|   |   |-- jupiter.ts            # Jupiter API
|   |   +-- solanafm.ts           # SolanaFM API
|   |-- detection/                # Detection system
|   |   |-- token-detector.ts     # Token analysis (31 params)
|   |   |-- dex-detector.ts       # DEX analysis (31 params)
|   |   +-- types.ts              # Type definitions
|   |-- exploit-patterns.ts       # Known exploit patterns
|   |-- on-chain-analyzer.ts      # On-chain data fetching
|   |-- risk-aggregator.ts        # Risk score calculation
|   +-- security-rules.ts         # Security rules engine
|
|-- hooks/                        # React hooks
|   |-- useDexVolumes.ts          # DEX volume data
|   |-- useEcosystem.ts           # Ecosystem data
|   |-- useMEVStats.ts            # MEV statistics
|   +-- useNetworkHealth.ts       # Network health
|
|-- public/                       # Static assets
|   |-- fonts/                    # Custom fonts
|   +-- providers/                # API provider logos
|
|-- .env.example                  # Environment template
|-- .env.local                    # Local configuration (gitignored)
|-- package.json                  # Dependencies
|-- tsconfig.json                 # TypeScript config
+-- README.md                     # This file
```

---

## Risk Scoring Algorithm

### Layer Weights

```typescript
LAYER_WEIGHTS = {
    patternMatch: 0.25,   // 25% - Fast pattern detection
    onChain: 0.45,        // 45% - Primary blockchain evidence
    aiAnalysis: 0.30,     // 30% - AI contextual analysis
}
```

### Severity Scoring

| Severity | Base Points |
|----------|-------------|
| Low | 5 |
| Medium | 15 |
| High | 30 |
| Critical | 50 |

### Final Score Calculation

```
Final Score = (PatternScore x 0.25) + (OnChainScore x 0.45) + (AIScore x 0.30)
```

---

## Security Considerations

- All API keys are server-side only
- No sensitive data exposed to client
- Rate limiting on API routes
- Input validation on all endpoints
- SSE streams with proper cleanup

---

## License

Proprietary - All Rights Reserved

---

## Support

**Live Application:** [https://www.sivic.xyz/](https://www.sivic.xyz/)

**Backup Application:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)

For issues and feature requests, please contact the development team.
