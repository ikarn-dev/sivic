/**
 * API Services Index
 * 
 * Central export point for all API services
 */

// Helius RPC (Solana blockchain data, DAS API, Transaction Parsing)
export * from './helius';

// Birdeye (Token security, prices, market data, volatility)
// Using namespace to avoid conflicts with Jupiter
export * as Birdeye from './birdeye';

// DeFiLlama (TVL, volumes, DeFi data)
export * from './defillama';

// DexScreener (DEX pairs, price charts)
export * from './dexscreener';

// Jupiter (Quotes, slippage, routing)
// Using namespace to avoid conflicts with Birdeye
export * as Jupiter from './jupiter';

// SolanaFM (Token holders, transfers, on-chain analysis)
// Using namespace to avoid conflicts with Helius
export * as SolanaFM from './solanafm';

// Off-Chain Data (DIA Oracle, RugCheck, DeFiLlama audits, Jito MEV)
export * as OffChain from './offchain';

// Re-export config utilities
export {
    isHeliusConfigured,
    getConfigStatus
} from '../config';


