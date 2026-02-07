# Sivic API Providers Documentation

> Complete guide to all external API providers integrated into Sivic Dashboard.

**Live:** [https://www.sivic.xyz/](https://www.sivic.xyz/) | **Backup:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)

---

## Table of Contents

- [Provider Overview](#provider-overview)
- [Helius](#helius)
- [Jupiter](#jupiter)
- [Birdeye](#birdeye)
- [DexScreener](#dexscreener)
- [DefiLlama](#defillama)
- [Jito](#jito)
- [RugCheck](#rugcheck)
- [SolanaFM](#solanafm)
- [OpenRouter](#openrouter)
- [Bitquery](#bitquery)
- [DIA](#dia)
- [Configuration Guide](#configuration-guide)
- [Error Handling](#error-handling)

---

## Provider Overview

Sivic integrates with 11 external API providers to gather comprehensive blockchain data:

| Provider | Type | Primary Use | Auth Required |
|----------|------|-------------|---------------|
| Helius | RPC + API | Core Solana data | Yes (API Key) |
| Jupiter | REST API | Swap quotes, slippage | Optional |
| Birdeye | REST API | Token security, prices | Yes (API Key) |
| DexScreener | REST API | DEX pairs, liquidity | No |
| DefiLlama | REST API | TVL, audits, hacks | No |
| Jito | REST API | MEV data, bundles | No |
| RugCheck | REST API | Token safety scores | No |
| SolanaFM | REST API | Holder data, transfers | Optional |
| OpenRouter | REST API | AI analysis | Yes (API Key) |
| Bitquery | GraphQL | Historical blockchain data | Yes (API Key) |
| DIA | REST API | Price oracles | No |

---

## Helius

**Website:** [https://helius.dev](https://helius.dev)

### Description
Helius is the primary Solana RPC provider for Sivic. It provides enhanced RPC methods, the Digital Asset Standard (DAS) API for NFT/token metadata, and transaction parsing capabilities.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` (RPC) | POST | Standard Solana RPC calls |
| `/v0/addresses/{address}/transactions` | GET | Parsed transaction history |
| `/v0/token-metadata` | POST | Batch token metadata |
| `/v1/nft-events` | GET | NFT activity tracking |

### Data Retrieved
- Account information (balance, owner, data)
- Token metadata (name, symbol, decimals, supply)
- Token holder lists via DAS API
- Transaction history with parsed instructions
- Program account data

### Configuration
```env
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_URL=https://api-mainnet.helius-rpc.com/v0
```

### Rate Limits
| Tier | Credits/Month | Requests/Second |
|------|---------------|-----------------|
| Free | 1,000,000 | 10 |
| Developer | 10,000,000 | 50 |
| Business | Unlimited | 200 |

### Usage in Sivic
```typescript
// lib/api/helius.ts
import { HeliusClient } from './helius';

const client = new HeliusClient(process.env.HELIUS_API_KEY);

// Get account info
const accountInfo = await client.getAccountInfo(address);

// Get token metadata
const metadata = await client.getTokenMetadata(mintAddress);

// Get parsed transactions
const transactions = await client.getTransactions(address, { limit: 100 });

// Get token holders (DAS API)
const holders = await client.getTokenHolders(mintAddress);
```

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check HELIUS_API_KEY |
| 429 Too Many Requests | Rate limit exceeded | Implement backoff |
| 404 Not Found | Account doesn't exist | Validate address |

---

## Jupiter

**Website:** [https://jup.ag](https://jup.ag)

### Description
Jupiter is Solana's leading DEX aggregator. Sivic uses Jupiter primarily for swap quotes, slippage analysis, and price impact calculations.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/quote` | GET | Get swap quote |
| `/price` | GET | Get token price in USDC |
| `/tokens` | GET | List all tradeable tokens |

### Data Retrieved
- Swap quotes with routing information
- Price impact percentages
- Slippage estimations
- Token validation (is tradeable)
- Best route analysis

### Configuration
```env
JUPITER_API_URL=https://api.jup.ag
JUPITER_API_KEY=optional_api_key  # For higher rate limits
```

### Rate Limits
| Access | Requests/Minute |
|--------|-----------------|
| Public | ~60 |
| With Key | ~600 |

### Usage in Sivic
```typescript
// lib/api/jupiter.ts
import { JupiterClient } from './jupiter';

const client = new JupiterClient();

// Get swap quote for slippage analysis
const quote = await client.getQuote({
  inputMint: 'So11111111111111111111111111111111111111112', // SOL
  outputMint: tokenMint,
  amount: 1000000000, // 1 SOL in lamports
  slippageBps: 50, // 0.5%
});

// Analyze price impact
const priceImpact = quote.priceImpactPct;
const route = quote.routePlan;

// Get token price
const price = await client.getPrice(tokenMint);
```

### Slippage Detection
Sivic uses Jupiter quotes to detect abnormal slippage:
- Buy slippage > 5%: Warning flag
- Sell slippage > 10%: Critical (potential honeypot)
- Asymmetric slippage: High risk indicator

---

## Birdeye

**Website:** [https://birdeye.so](https://birdeye.so)

### Description
Birdeye provides token security analysis, price data, holder distribution, and trading volume metrics for Solana tokens.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/defi/token_security` | GET | Security analysis |
| `/defi/price` | GET | Current token price |
| `/defi/price_history` | GET | Historical prices |
| `/defi/token_overview` | GET | Token summary data |
| `/defi/token_holder` | GET | Holder distribution |

### Data Retrieved
- Token security metrics
- Price and market cap
- 24h volume and price change
- Top holder percentages
- Liquidity depth
- Creator information

### Configuration
```env
BIRDEYE_API_KEY=your_birdeye_api_key
BIRDEYE_API_URL=https://public-api.birdeye.so
```

### Rate Limits
| Tier | Requests/Minute |
|------|-----------------|
| Free | 100 |
| Pro | 1000 |

### Usage in Sivic
```typescript
// lib/api/birdeye.ts
import { BirdeyeClient } from './birdeye';

const client = new BirdeyeClient(process.env.BIRDEYE_API_KEY);

// Get security data
const security = await client.getTokenSecurity(mintAddress);
// Returns: { ownerBalance, creatorBalance, top10HolderPercent, ... }

// Get price data
const price = await client.getPrice(mintAddress);
// Returns: { value, updateUnixTime, ... }

// Get token overview
const overview = await client.getTokenOverview(mintAddress);
// Returns: { name, symbol, decimals, supply, holder, ... }
```

### Security Metrics
Birdeye provides these security indicators:
| Metric | Type | Risk Threshold |
|--------|------|----------------|
| ownerBalance | number | >10% = High Risk |
| creatorBalance | number | >20% = High Risk |
| top10HolderPercent | number | >50% = Medium Risk |
| creatorPercentage | number | >30% = High Risk |
| isMutable | boolean | true = Low Risk |
| isFreezeable | boolean | true = Medium Risk |

---

## DexScreener

**Website:** [https://dexscreener.com](https://dexscreener.com)

### Description
DexScreener aggregates DEX pair data across multiple chains. Sivic uses it for liquidity analysis, pair discovery, and price charts.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/latest/dex/tokens/{address}` | GET | Token pairs data |
| `/latest/dex/pairs/solana/{pairAddress}` | GET | Specific pair data |
| `/latest/dex/search` | GET | Search tokens |

### Data Retrieved
- All trading pairs for a token
- Liquidity (USD value)
- 24h volume and transactions
- Price changes (5m, 1h, 6h, 24h)
- DEX name (Raydium, Orca, etc.)
- Pair creation timestamp

### Configuration
```env
DEXSCREENER_API_URL=https://api.dexscreener.com
# No API key required
```

### Rate Limits
| Access | Requests/Minute |
|--------|-----------------|
| Public | ~300 |

### Usage in Sivic
```typescript
// lib/api/dexscreener.ts
import { DexScreenerClient } from './dexscreener';

const client = new DexScreenerClient();

// Get all pairs for a token
const pairs = await client.getTokenPairs(mintAddress);

// Example response processing
for (const pair of pairs) {
  console.log({
    dex: pair.dexId,
    liquidity: pair.liquidity?.usd,
    volume24h: pair.volume?.h24,
    priceChange24h: pair.priceChange?.h24,
    pairAge: Date.now() - pair.pairCreatedAt,
  });
}
```

### Pair Analysis
Sivic analyzes DEX pairs for:
- Liquidity depth (risk if <$10k)
- Volume-to-liquidity ratio
- Number of active pairs
- Age of pairs (young = higher risk)

---

## DefiLlama

**Website:** [https://defillama.com](https://defillama.com)

### Description
DefiLlama is the largest TVL aggregator in DeFi. Sivic uses it for protocol TVL data, audit history, and hack tracking.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/protocols` | GET | All protocol data |
| `/protocol/{slug}` | GET | Specific protocol |
| `/tvl/{protocol}` | GET | Current TVL |
| `/hacks` | GET | Hack database |
| `/chains` | GET | Chain TVL data |

### Data Retrieved
- Protocol TVL (current and historical)
- Audit information
- Hack history and amounts
- Chain distribution
- Category classification

### Configuration
```env
DEFILLAMA_API_URL=https://api.llama.fi
# No API key required
```

### Rate Limits
| Access | Requests/Minute |
|--------|-----------------|
| Public | Unlimited (fair use) |

### Usage in Sivic
```typescript
// lib/api/defillama.ts
import { DefiLlamaClient } from './defillama';

const client = new DefiLlamaClient();

// Get Solana ecosystem data
const protocols = await client.getProtocols();
const solanaProtocols = protocols.filter(p => 
  p.chains.includes('Solana')
);

// Get total Solana TVL
const chainTvl = await client.getChainTvl('Solana');

// Get hack history
const hacks = await client.getHacks();
const solanaHacks = hacks.filter(h => h.chain === 'Solana');

// Check if protocol was audited
const protocol = await client.getProtocol('marinade-finance');
const audits = protocol.audits;
```

### Ecosystem Metrics
Sivic displays on the homepage:
- Total Solana TVL
- Top protocols by TVL
- TVL change trends
- Protocol categories

---

## Jito

**Website:** [https://jito.wtf](https://jito.wtf)

### Description
Jito provides MEV infrastructure for Solana. Sivic uses Jito Explorer API for MEV statistics, bundle data, and sandwich attack tracking.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/bundles` | GET | Recent bundles |
| `/api/v1/block-engine/stats` | GET | MEV statistics |
| `/api/v1/validators` | GET | Validator MEV data |

### Data Retrieved
- Bundle success rates
- Tip distributions
- Sandwich attack counts
- Validator MEV adoption
- Block engine statistics

### Configuration
```env
JITO_EXPLORER_URL=https://explorer.jito.wtf/api
# No API key required
```

### Rate Limits
| Access | Requests/Minute |
|--------|-----------------|
| Public | Unlimited (fair use) |

### Usage in Sivic
```typescript
// lib/api/jito.ts
import { JitoClient } from './jito';

const client = new JitoClient();

// Get MEV statistics
const stats = await client.getMevStats();
// Returns: { bundlesPerDay, avgTip, sandwichCount, ... }

// Get recent bundles
const bundles = await client.getRecentBundles({ limit: 50 });

// Calculate sandwich attack rate
const sandwichRate = stats.sandwichCount / stats.totalTransactions;
```

### MEV Metrics
| Metric | Description | Risk Indicator |
|--------|-------------|----------------|
| sandwichCount | Daily sandwich attacks | >1000 = High MEV activity |
| avgTip | Average bundle tip | Market conditions |
| bundleSuccessRate | % successful bundles | Network health |

---

## RugCheck

**Website:** [https://rugcheck.xyz](https://rugcheck.xyz)

### Description
RugCheck provides automated token safety analysis specifically designed to detect rug pull risks on Solana.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/tokens/{mint}` | GET | Token safety report |
| `/v1/tokens/{mint}/report` | GET | Detailed analysis |

### Data Retrieved
- Overall safety score (0-100)
- Risk level (safe, caution, danger)
- Specific risk flags
- Mint authority status
- Freeze authority status
- LP status

### Configuration
```env
RUGCHECK_API_URL=https://api.rugcheck.xyz/v1
# No API key required
```

### Rate Limits
| Access | Requests/Minute |
|--------|-----------------|
| Public | Unlimited (fair use) |

### Usage in Sivic
```typescript
// lib/api/rugcheck.ts
import { RugCheckClient } from './rugcheck';

const client = new RugCheckClient();

// Get safety report
const report = await client.getTokenReport(mintAddress);

// Analyze risks
console.log({
  score: report.score,
  riskLevel: report.riskLevel,
  mintAuthority: report.mintAuthority,
  freezeAuthority: report.freezeAuthority,
  lpBurned: report.lpBurned,
  risks: report.risks, // Array of specific risk flags
});
```

### Risk Flags
| Flag | Severity | Description |
|------|----------|-------------|
| mintable | High | Token can be minted |
| freezable | Medium | Accounts can be frozen |
| lpNotBurned | Medium | LP tokens not burned |
| lowLiquidity | High | <$10k liquidity |
| singleHolder | Critical | >50% held by one wallet |
| noSocials | Low | No social media presence |

---

## SolanaFM

**Website:** [https://solana.fm](https://solana.fm)

### Description
SolanaFM is a Solana block explorer with API access. Sivic uses it for detailed holder analysis and transfer history.

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v0/tokens/{mint}` | GET | Token information |
| `/v0/tokens/{mint}/holders` | GET | Holder list |
| `/v0/accounts/{address}/transfers` | GET | Transfer history |

### Data Retrieved
- Detailed token metadata
- Complete holder list with balances
- Transfer history
- Account activity patterns

### Configuration
```env
SOLANAFM_API_URL=https://api.solana.fm/v0
SOLANAFM_API_KEY=optional_api_key
```

### Rate Limits
| Tier | Requests/Month | Requests/Second |
|------|----------------|-----------------|
| Free | 100,000 | 10 |
| Pro | 1,000,000 | 50 |

### Usage in Sivic
```typescript
// lib/api/solanafm.ts
import { SolanaFMClient } from './solanafm';

const client = new SolanaFMClient();

// Get token holders
const holders = await client.getTokenHolders(mintAddress, { 
  limit: 100,
  sort: 'balance:desc'
});

// Analyze distribution
const topHolders = holders.slice(0, 10);
const topHolderPercent = topHolders.reduce(
  (sum, h) => sum + h.percentage, 
  0
);
```

---

## OpenRouter

**Website:** [https://openrouter.ai](https://openrouter.ai)

### Description
OpenRouter provides access to multiple AI models through a unified API. Sivic uses it for AI-powered vulnerability analysis and natural language summaries.

### Models Used
| Model | Purpose | Cost |
|-------|---------|------|
| meta-llama/llama-3.2-3b-instruct:free | General analysis | Free |
| google/gemini-2.0-flash-exp:free | Fast analysis | Free |

### Configuration
```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Usage in Sivic
```typescript
// lib/api/openrouter.ts
import { OpenRouterClient } from './openrouter';

const client = new OpenRouterClient(process.env.OPENROUTER_API_KEY);

// Generate vulnerability analysis
const analysis = await client.analyze({
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  systemPrompt: 'You are a blockchain security expert...',
  userPrompt: `Analyze this token data: ${JSON.stringify(tokenData)}`,
});
```

### AI Analysis Output
The AI provides:
- Vulnerability summary in plain English
- Risk assessment reasoning
- Specific recommendations
- Comparison to known exploit patterns

---

## Bitquery

**Website:** [https://bitquery.io](https://bitquery.io)

### Description
Bitquery provides GraphQL access to blockchain data. Sivic uses it for historical analysis and complex queries.

### Configuration
```env
BITQUERY_API_KEY=your_bitquery_api_key
BITQUERY_API_URL=https://streaming.bitquery.io/graphql
```

### Usage Examples
```graphql
query TokenTransfers($mint: String!) {
  Solana {
    Transfers(
      where: { Transfer: { Currency: { MintAddress: { is: $mint } } } }
      limit: 100
    ) {
      Transfer {
        Amount
        Sender { Address }
        Receiver { Address }
      }
      Block { Time }
    }
  }
}
```

---

## DIA

**Website:** [https://diadata.org](https://diadata.org)

### Description
DIA provides decentralized oracle data. Sivic uses it for price verification and oracle comparison.

### Configuration
```env
DIA_API_URL=https://api.diadata.org
# No API key required for basic access
```

---

## Configuration Guide

### Complete .env.local Example

```env
# ===========================================
# REQUIRED PROVIDERS
# ===========================================

# Helius - Primary Solana RPC and API
HELIUS_API_KEY=your_helius_api_key_here
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_API_URL=https://api-mainnet.helius-rpc.com/v0

# ===========================================
# RECOMMENDED PROVIDERS
# ===========================================

# Birdeye - Token Security Analysis
BIRDEYE_API_KEY=your_birdeye_api_key_here
BIRDEYE_API_URL=https://public-api.birdeye.so

# OpenRouter - AI Analysis
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ===========================================
# OPTIONAL PROVIDERS (Enhanced Features)
# ===========================================

# Jupiter - Swap Quotes
JUPITER_API_URL=https://api.jup.ag
JUPITER_API_KEY=optional_key_for_higher_limits

# SolanaFM - Holder Analysis
SOLANAFM_API_URL=https://api.solana.fm/v0
SOLANAFM_API_KEY=optional_key

# Bitquery - Historical Data
BITQUERY_API_KEY=your_bitquery_api_key

# ===========================================
# PUBLIC PROVIDERS (No Auth Required)
# ===========================================

# DexScreener
DEXSCREENER_API_URL=https://api.dexscreener.com

# DefiLlama
DEFILLAMA_API_URL=https://api.llama.fi

# Jito Explorer
JITO_EXPLORER_URL=https://explorer.jito.wtf/api

# RugCheck
RUGCHECK_API_URL=https://api.rugcheck.xyz/v1

# DIA
DIA_API_URL=https://api.diadata.org
```

### Obtaining API Keys

| Provider | Sign Up URL | Free Tier |
|----------|-------------|-----------|
| Helius | [helius.dev/signup](https://dev.helius.xyz/signup) | 1M credits/month |
| Birdeye | [birdeye.so/developers](https://birdeye.so/developers) | 100 req/min |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | Free models available |
| Bitquery | [bitquery.io/signup](https://account.bitquery.io/auth/signup) | 10k queries/month |
| SolanaFM | [solana.fm/developers](https://solana.fm/developers) | 100k req/month |

---

## Error Handling

### Common Error Patterns

```typescript
// Recommended error handling pattern
async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn(`[${errorContext}] Primary failed, trying fallback:`, error);
    try {
      return await fallback();
    } catch (fallbackError) {
      console.error(`[${errorContext}] Fallback also failed:`, fallbackError);
      throw fallbackError;
    }
  }
}

// Example usage
const price = await fetchWithFallback(
  () => birdeyeClient.getPrice(mint),
  () => dexscreenerClient.getPrice(mint),
  'Price Fetch'
);
```

### Fallback Chain

| Primary | Fallback | Data Type |
|---------|----------|-----------|
| Helius RPC | PublicNode RPC | Account data |
| Birdeye | DexScreener | Price data |
| Helius DAS | SolanaFM | Holder data |
| RugCheck | Birdeye Security | Safety score |
| Jupiter | DexScreener | Slippage data |

---

## Support

**Live Application:** [https://www.sivic.xyz/](https://www.sivic.xyz/)

**Backup Application:** [https://sivic-kappa.vercel.app/](https://sivic-kappa.vercel.app/)
