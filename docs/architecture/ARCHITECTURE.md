# Sivic Architecture Documentation

> Technical architecture overview with UML diagrams for the Sivic Dashboard.

**Live:** [https://www.sivic.xyz/](https://www.sivic.xyz/) | **Backup:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)

---

## System Overview

Areta is a **Next.js 15** application using the App Router architecture. It provides real-time Solana blockchain security analysis through a layered architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│  React Components • Server-Side Rendering • Real-time Updates (SSE)     │
├─────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                   │
│  Next.js API Routes • Data Aggregation • Caching • Rate Limiting        │
├─────────────────────────────────────────────────────────────────────────┤
│                            BUSINESS LOGIC                                │
│  Detectors • Risk Aggregator • Security Rules • Pattern Matching         │
├─────────────────────────────────────────────────────────────────────────┤
│                            DATA ACCESS                                   │
│  API Clients (Helius, Jupiter, Birdeye, etc.) • Cache Layer             │
├─────────────────────────────────────────────────────────────────────────┤
│                         EXTERNAL SERVICES                                │
│  Solana RPC • DeFi APIs • MEV Services • AI Providers                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              app/                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  layout.tsx ──────────► Root Layout (Metadata, Fonts, Providers)        │
│       │                                                                  │
│       ├── page.tsx ──────────────► Home / Overview Dashboard            │
│       ├── exploit-detector/                                              │
│       │       └── page.tsx ──────► Exploit Detection Interface          │
│       ├── mev-shield/                                                    │
│       │       └── page.tsx ──────► MEV Protection Dashboard             │
│       ├── pre-audit/                                                     │
│       │       └── page.tsx ──────► Contract Pre-Audit Tool              │
│       └── reports/                                                       │
│               └── page.tsx ──────► Analysis Reports View                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── NavigationItems
│   └── MobileHeader
│
├── MainContent
│   ├── PageHeader
│   │   ├── Title
│   │   ├── Description
│   │   └── RightContent (actions)
│   │
│   ├── ContentArea
│   │   ├── Card (base)
│   │   │   ├── GlassStatCard
│   │   │   ├── GlassContainerCard
│   │   │   ├── GradientCard
│   │   │   └── MiniCard
│   │   │
│   │   ├── Charts
│   │   │   ├── BarChart
│   │   │   ├── HorizontalBarChart
│   │   │   └── LineChart
│   │   │
│   │   └── DataDisplays
│   │       ├── EcosystemTreemap
│   │       ├── NetworkMetrics
│   │       ├── TVLOverview
│   │       └── DEXVolumeOverview
│   │
│   └── TimelineOverlay (floating)
│       ├── StepList
│       └── ProgressIndicator
│
└── Footer
    ├── Links
    ├── Branding
    └── SocialLinks
```

---

## Detection System Architecture

### Class Diagram

```
                        ┌──────────────────────────┐
                        │     DetectionResult      │
                        │       «interface»        │
                        ├──────────────────────────┤
                        │ + address: string        │
                        │ + detectionMode: enum    │
                        │ + totalParamsChecked     │
                        │ + totalParamsTriggered   │
                        │ + riskIndicators[]       │
                        │ + riskScore: number      │
                        │ + overallRisk: enum      │
                        └──────────┬───────────────┘
                                   │
            ┌──────────────────────┴───────────────────────┐
            │                                              │
┌───────────▼──────────────┐              ┌───────────────▼─────────────┐
│  TokenDetectionResult    │              │    DexDetectionResult       │
│      «extends»           │              │        «extends»            │
├──────────────────────────┤              ├─────────────────────────────┤
│ + detectionMode: 'token' │              │ + detectionMode: 'dex'      │
│ + onChainParams (18)     │              │ + onChainParams (19)        │
│ + offChainParams (13)    │              │ + offChainParams (12)       │
│ + tokenData: {}          │              │ + dexData: {}               │
└──────────────────────────┘              └─────────────────────────────┘

            ▲                                          ▲
            │ produces                                 │ produces
            │                                          │

┌───────────┴──────────────┐              ┌───────────┴─────────────────┐
│     TokenDetector        │              │       DexDetector           │
├──────────────────────────┤              ├─────────────────────────────┤
│ - address: string        │              │ - address: string           │
│ - onChainParams          │              │ - onChainParams             │
│ - offChainParams         │              │ - offChainParams            │
│ - riskIndicators[]       │              │ - riskIndicators[]          │
│ - tokenData: {}          │              │ - dexData: {}               │
│ - onStep: callback       │              │ - onStep: callback          │
├──────────────────────────┤              ├─────────────────────────────┤
│ + analyze()              │              │ + analyze()                 │
│ + analyzeBasicInfo()     │              │ + analyzeProgramInfo()      │
│ + analyzeMarketData()    │              │ + analyzeTransactionVolume()│
│ + analyzeSecurityInfo()  │              │ + analyzeDexPairs()         │
│ + analyzeDexPairs()      │              │ + analyzeMevActivity()      │
│ + analyzeSlippage()      │              │ + analyzeAccountActivity()  │
│ + analyzeHolders()       │              │ + analyzeOffChain()         │
│ + analyzeTransactions()  │              │ + addRisk()                 │
│ + analyzeOffChain()      │              │ + getParamCounts()          │
│ + addRisk()              │              └─────────────────────────────┘
│ + getParamCounts()       │
└──────────────────────────┘
            │
            │ uses
            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          External API Clients                             │
├───────────┬──────────┬──────────┬─────────────┬──────────┬──────────────┤
│  Helius   │ Jupiter  │ Birdeye  │ DexScreener │ SolanaFM │   RugCheck   │
└───────────┴──────────┴──────────┴─────────────┴──────────┴──────────────┘
```

### Sequence Diagram: Contract Analysis Flow

```
┌──────┐      ┌──────────┐      ┌────────────┐      ┌───────────┐      ┌────────────┐
│Client│      │ Frontend │      │  API Route │      │  Detector │      │External API│
└──┬───┘      └────┬─────┘      └─────┬──────┘      └─────┬─────┘      └──────┬─────┘
   │               │                  │                   │                   │
   │ Enter address │                  │                   │                   │
   │──────────────>│                  │                   │                   │
   │               │                  │                   │                   │
   │               │ GET /api/contract│                   │                   │
   │               │ /analyze-stream  │                   │                   │
   │               │═════════════════>│                   │                   │
   │               │                  │                   │                   │
   │               │                  │ Fetch account info│                   │
   │               │                  │═══════════════════════════════════════>
   │               │                  │                   │                   │
   │               │                  │<══════════════════════════════════════│
   │               │                  │                   │                   │
   │               │                  │ Detect account    │                   │
   │               │                  │ type              │                   │
   │               │                  │──────────────────>│                   │
   │               │                  │                   │                   │
   │               │ SSE: step_start  │                   │                   │
   │               │<─────────────────│                   │                   │
   │               │                  │                   │                   │
   │ Show progress │                  │                   │                   │
   │<──────────────│                  │                   │                   │
   │               │                  │                   │                   │
   │               │                  │     ┌─────────────┴─────────────┐     │
   │               │                  │     │                           │     │
   │               │                  │     │  For each analysis step:  │     │
   │               │                  │     │                           │     │
   │               │                  │     │  1. Fetch external data   │     │
   │               │                  │     │────────────────────────────────>│
   │               │                  │     │                           │     │
   │               │                  │     │<────────────────────────────────│
   │               │                  │     │                           │     │
   │               │                  │     │  2. Check parameters      │     │
   │               │                  │     │  3. Add risk indicators   │     │
   │               │                  │     │                           │     │
   │               │ SSE: step_complete│    │                           │     │
   │               │<─────────────────│<────│                           │     │
   │               │                  │     │                           │     │
   │ Update UI     │                  │     └─────────────┬─────────────┘     │
   │<──────────────│                  │                   │                   │
   │               │                  │                   │                   │
   │               │                  │ Complete result   │                   │
   │               │                  │<──────────────────│                   │
   │               │                  │                   │                   │
   │               │ SSE: complete    │                   │                   │
   │               │<─────────────────│                   │                   │
   │               │                  │                   │                   │
   │               │ POST /api/ai/    │                   │                   │
   │               │ analyze          │                   │                   │
   │               │═════════════════>│                   │                   │
   │               │                  │                   │     ┌────────────┐│
   │               │                  │                   │     │ OpenRouter ││
   │               │                  │ AI Analysis       │     └──────┬─────┘│
   │               │                  │════════════════════════════════>      │
   │               │                  │                   │            │      │
   │               │                  │<═══════════════════════════════│      │
   │               │                  │                   │                   │
   │               │ AI Result        │                   │                   │
   │               │<═════════════════│                   │                   │
   │               │                  │                   │                   │
   │ Display final │                  │                   │                   │
   │ results       │                  │                   │                   │
   │<──────────────│                  │                   │                   │
   │               │                  │                   │                   │
```

---

## Data Flow Architecture

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CACHE HIERARCHY                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      React Query Cache                              │ │
│  │                  (Client-side, per-user)                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │networkHealth │  │ ecosystemData│  │  dexVolumes  │             │ │
│  │  │  TTL: 30s    │  │  TTL: 5min   │  │  TTL: 5min   │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     API Route Cache                                 │ │
│  │               (lib/cache.ts - In-memory)                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │ │
│  │  │ defillama    │  │ dexscreener  │  │   birdeye    │             │ │
│  │  │  TTL: 5min   │  │  TTL: 5min   │  │  TTL: 1min   │             │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    External API Responses                           │ │
│  │                (HTTP cache headers respected)                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hook Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CUSTOM HOOKS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  useNetworkHealth(refreshInterval: 30000)                                │
│  ├── Fetches: /api/network                                               │
│  ├── Returns: { data, isLoading, isConfigured, refetch }                │
│  └── Used by: Home, MEV Shield                                          │
│                                                                          │
│  useEcosystem(refreshInterval: 300000)                                   │
│  ├── Fetches: /api/ecosystem                                             │
│  ├── Returns: { data, isLoading }                                        │
│  └── Used by: Home (TVL Overview)                                        │
│                                                                          │
│  useDexVolumes(refreshInterval: 300000)                                  │
│  ├── Fetches: /api/dex                                                   │
│  ├── Returns: { data, isLoading }                                        │
│  └── Used by: Home (DEX Charts)                                          │
│                                                                          │
│  useMEVStats(refreshInterval: 60000)                                     │
│  ├── Fetches: /api/mev-stats                                             │
│  ├── Returns: { data, isLoading }                                        │
│  └── Used by: MEV Shield (On-Chain Metrics)                              │
│                                                                          │
│  useProtocolsTreemap(refreshInterval: 300000)                            │
│  ├── Fetches: /api/protocols-treemap                                     │
│  ├── Returns: { data, isLoading }                                        │
│  └── Used by: Home (Ecosystem Heatmap)                                   │
│                                                                          │
│  usePrefetch()                                                           │
│  ├── Warms: All above caches on page load                               │
│  └── Strategy: Parallel fetch, fail-silent                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Route Architecture

### Route Map

```
/api/
│
├── ai/
│   └── analyze/route.ts ────────► POST: AI analysis via OpenRouter
│
├── contract/
│   ├── analyze/route.ts ────────► POST: Full contract analysis
│   └── analyze-stream/route.ts ─► GET:  SSE streaming analysis
│
├── dex/route.ts ────────────────► GET:  DEX volume rankings
│
├── ecosystem/route.ts ──────────► GET:  Ecosystem TVL data
│
├── exploits/route.ts ───────────► GET:  Recent exploit data
│
├── mev-analysis/route.ts ───────► POST: Transaction MEV analysis
│
├── mev-stats/route.ts ──────────► GET:  Jito MEV statistics
│
├── network/route.ts ────────────► GET:  Network health data
│
├── prefetch/route.ts ───────────► GET:  Cache warming endpoint
│
└── protocols-treemap/route.ts ──► GET:  Protocol TVL for treemap
```

### SSE Stream Protocol

The `/api/contract/analyze-stream` endpoint uses Server-Sent Events:

```typescript
// Event Types
interface SSEEvent {
  type: 'step_start' | 'step_complete' | 'step_error' | 'data_update' | 'complete';
  stepId?: string;
  stepName?: string;
  duration?: number;
  data?: any;
  error?: string;
  paramsChecked?: number;
  paramsTriggered?: number;
  detectionMode?: 'token' | 'dex';
}

// Example stream:
data: {"type":"step_start","stepId":"fetch_account","stepName":"Fetching Account Info"}

data: {"type":"step_complete","stepId":"fetch_account","duration":234}

data: {"type":"step_start","stepId":"analyze_security","stepName":"Security Analysis"}

data: {"type":"step_complete","stepId":"analyze_security","duration":1823,"paramsChecked":5,"paramsTriggered":2}

data: {"type":"complete","data":{...fullResult},"paramsChecked":31,"paramsTriggered":4}
```

---

## Security Architecture

### API Key Protection

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       API KEY SECURITY MODEL                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CLIENT SIDE                    │         SERVER SIDE                   │
│  (Browser)                      │         (Node.js)                     │
│                                 │                                        │
│  ┌─────────────────────┐       │  ┌─────────────────────────────────┐  │
│  │                     │       │  │                                 │  │
│  │  React Components   │ ────────► │  Next.js API Routes            │  │
│  │                     │  HTTP     │                                 │  │
│  │  - No API keys      │       │  │  - process.env.HELIUS_API_KEY   │  │
│  │  - No secrets       │       │  │  - process.env.BIRDEYE_API_KEY  │  │
│  │  - Public data only │       │  │  - process.env.JUPITER_API_KEY  │  │
│  │                     │       │  │  - etc.                         │  │
│  └─────────────────────┘       │  └───────────────┬─────────────────┘  │
│                                 │                  │                    │
│                                 │                  ▼                    │
│                                 │  ┌─────────────────────────────────┐  │
│                                 │  │   External API Requests         │  │
│                                 │  │   (Server-to-Server)            │  │
│                                 │  │                                 │  │
│                                 │  │   - API keys in headers         │  │
│                                 │  │   - Not exposed to client       │  │
│                                 │  └─────────────────────────────────┘  │
│                                 │                                        │
└─────────────────────────────────┴────────────────────────────────────────┘
```

### Environment Variables

```
NEXT_PUBLIC_*     → Exposed to browser (use sparingly)
All other env vars → Server-side only (secure)

Sensitive:
- *_API_KEY
- *_SECRET
- OPENROUTER_API_KEY

Public-only:
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_SOLANA_NETWORK
```

---

## State Management

### Client State Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                      SERVER STATE                                    ││
│  │                    (TanStack Query)                                  ││
│  │                                                                      ││
│  │  • Network health data                                               ││
│  │  • Ecosystem TVL                                                     ││
│  │  • DEX volumes                                                       ││
│  │  • Protocol data                                                     ││
│  │  • MEV statistics                                                    ││
│  │                                                                      ││
│  │  Features: Caching, Background refresh, Stale-while-revalidate      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                       LOCAL STATE                                    ││
│  │                    (React useState)                                  ││
│  │                                                                      ││
│  │  • Form inputs (contract address)                                    ││
│  │  • UI state (tabs, overlays, modals)                                ││
│  │  • Analysis progress (steps, duration)                               ││
│  │  • Detection results (current analysis)                              ││
│  │                                                                      ││
│  │  Scope: Per-component, not persisted                                 ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                       URL STATE                                      ││
│  │                  (Next.js Router)                                    ││
│  │                                                                      ││
│  │  • Current page/route                                                ││
│  │  • Query parameters (address to analyze)                             ││
│  │                                                                      ││
│  │  Benefits: Shareable URLs, Browser history                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Styling Architecture

### CSS Structure

```
app/
├── globals.css ──────────────► Global styles, CSS variables, animations
│   ├── Tailwind base imports
│   ├── CSS custom properties (colors, fonts)
│   ├── Global animation keyframes
│   └── Utility classes
│
└── css/
    └── (additional module CSS if needed)

components/
├── Component.tsx ────────────► Component with inline styles/Tailwind
└── Component.module.css ─────► (Scoped CSS if needed)
```

### Design System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DESIGN TOKENS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  COLORS                                                                  │
│  ────────────────────────────────────────────                           │
│  Primary:     #f97316 (Orange)                                          │
│  Background:  #0d1117 (Dark)                                            │
│  Surface:     #161b22 (Dark surface)                                    │
│  Border:      #30363d (Subtle border)                                   │
│  Text:        #ffffff (Primary), #8b949e (Secondary)                    │
│                                                                          │
│  Severity Colors:                                                        │
│  - Critical:  #ef4444 (Red)                                             │
│  - High:      #f97316 (Orange)                                          │
│  - Medium:    #eab308 (Yellow)                                          │
│  - Low:       #22c55e (Green)                                           │
│                                                                          │
│  TYPOGRAPHY                                                              │
│  ────────────────────────────────────────────                           │
│  Headings:    font-nohemi                                               │
│  Body:        font-satoshi                                              │
│  Mono:        font-mono (system)                                        │
│                                                                          │
│  SPACING                                                                 │
│  ────────────────────────────────────────────                           │
│  Base unit:   4px                                                       │
│  Gaps:        gap-4 (16px), gap-5 (20px), gap-6 (24px)                 │
│  Padding:     p-4, p-6, p-8 (Cards)                                     │
│                                                                          │
│  EFFECTS                                                                 │
│  ────────────────────────────────────────────                           │
│  Cards:       Glass-morphism with gradient blobs                        │
│  Hover:       -translate-y-0.5, increased shadow                        │
│  Transitions: 300ms ease                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Build Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BUILD PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  npm run build                                                           │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────────┐                                                    │
│  │ TypeScript      │ ───► Type checking                                 │
│  │ Compilation     │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Next.js Build   │ ───► Route analysis                                │
│  │                 │ ───► Static generation (where possible)            │
│  │                 │ ───► API route bundling                            │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ Output          │                                                    │
│  │ .next/          │ ───► Production-ready bundle                       │
│  └─────────────────┘                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Runtime Requirements

```
Production Deployment:
├── Node.js >= 18
├── Environment variables configured
├── Network access to external APIs
└── Optional: Redis for distributed caching (future)

Recommended Platforms:
├── Vercel (recommended - optimal Next.js support)
├── Railway
├── AWS (ECS/Lambda)
└── Self-hosted (Docker)
```

---

## Error Handling

### Error Boundary Strategy

```typescript
// API Route Error Handling
try {
  const result = await detector.analyze(input);
  return NextResponse.json(result);
} catch (error) {
  console.error('[API Error]', error);
  return NextResponse.json(
    { error: 'Analysis failed', message: error.message },
    { status: 500 }
  );
}

// Client-side Error Handling (SSE)
eventSource.onerror = (err) => {
  setIsAnalyzing(false);
  eventSource.close();
  toast.error('Connection error', { 
    description: 'Failed to connect to analysis stream' 
  });
};
```

### Graceful Degradation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FALLBACK STRATEGY                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  API Failure                 │  Fallback                                │
│  ──────────────────────────────────────────────────────                 │
│  Helius RPC                  │  PublicNode RPC                          │
│  Birdeye price data          │  DexScreener prices                       │
│  Jupiter slippage            │  Calculated from DEX data                 │
│  SolanaFM holders            │  Helius DAS API                           │
│  RugCheck score              │  Birdeye security data                    │
│  OpenRouter AI               │  Static analysis only (no AI)             │
│  DefiLlama TVL               │  Cached last-known value                  │
│                                                                          │
│  All APIs fail → Show partial data with warning banner                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Optimization Strategies

1. **Parallel Data Fetching**: All independent API calls execute simultaneously
2. **Streaming Responses**: SSE for real-time progress updates
3. **Aggressive Caching**: Multi-layer cache (React Query + API route + HTTP)
4. **Lazy Loading**: Components load on demand
5. **Pre-fetching**: `usePrefetch` warms cache on page load

### Metrics Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3s | ~2.5s |
| Analysis Latency | < 10s | ~5-8s |
| API Response | < 500ms | ~200-400ms |

---

## Future Architecture Considerations

### Planned Improvements

1. **WebSocket Support**: Replace SSE with WebSocket for bidirectional communication
2. **Distributed Caching**: Redis/Upstash for multi-instance deployments
3. **Worker Threads**: Off-main-thread analysis processing
4. **GraphQL Gateway**: Unified API layer for external services
5. **ML Pipeline**: On-device inference for pattern detection
