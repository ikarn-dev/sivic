/**
 * Environment Configuration
 * 
 * Typed environment variables with validation.
 * Access patterns:
 * - Server-side: Import and use directly
 * - Client-side: Only NEXT_PUBLIC_ prefixed vars available via publicConfig
 */

// ===========================================
// SERVER-SIDE CONFIGURATION (Not exposed to client)
// ===========================================

export const serverConfig = {
    // Helius RPC (Solana)
    helius: {
        apiKey: process.env.HELIUS_API_KEY || '',
        rpcUrl: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com',
        apiUrl: process.env.HELIUS_API_URL || 'https://api-mainnet.helius-rpc.com/v0',

        // Computed URLs with API key
        get rpcEndpoint() {
            return this.apiKey
                ? `${this.rpcUrl}/?api-key=${this.apiKey}`
                : this.rpcUrl;
        },
        get transactionsEndpoint() {
            return `${this.apiUrl}/transactions/?api-key=${this.apiKey}`;
        },
        getAddressTransactions(address: string) {
            return `${this.apiUrl}/addresses/${address}/transactions/?api-key=${this.apiKey}`;
        },
    },

    // AI Configuration - no server config needed

    // DeFiLlama (No API key needed)
    defillama: {
        apiUrl: process.env.DEFILLAMA_API_URL || 'https://api.llama.fi',
        coinsUrl: process.env.DEFILLAMA_COINS_URL || 'https://coins.llama.fi',
        stablecoinsUrl: process.env.DEFILLAMA_STABLECOINS_URL || 'https://stablecoins.llama.fi',
        yieldsUrl: process.env.DEFILLAMA_YIELDS_URL || 'https://yields.llama.fi',
    },

    // Birdeye (Token data, pricing, security)
    birdeye: {
        apiKey: process.env.BIRDEYE_API_KEY || '',
        apiUrl: process.env.BIRDEYE_API_URL || 'https://public-api.birdeye.so',
    },

    // Jupiter (Price, quotes, swaps)
    jupiter: {
        apiKey: process.env.JUPITER_API_KEY || '',
        apiUrl: process.env.JUPITER_API_URL || 'https://api.jup.ag',
    },

    // Backup Providers
    backupRpc: {
        chainstack: {
            apiKey: process.env.CHAINSTACK_API_KEY || '',
            rpcUrl: process.env.CHAINSTACK_RPC_URL || '',
        },
        publicNode: {
            rpcUrl: process.env.PUBLICNODE_RPC_URL || 'https://solana-mainnet.publicnode.com',
        },
    },

    // AI Fallback
    huggingface: {
        apiKey: process.env.HUGGINGFACE_API_KEY || '',
    },

    // Bitquery (MEV Incident Data)
    bitquery: {
        apiKey: process.env.BITQUERY_API_KEY || '',
        graphqlUrl: process.env.BITQUERY_GRAPHQL_URL || 'https://streaming.bitquery.io/graphql',
    },

    // Jito Explorer (MEV Bundles)
    jito: {
        explorerUrl: process.env.JITO_EXPLORER_URL || 'https://explorer.jito.wtf/api',
    },

    // Feature Flags
    features: {
        mevShield: process.env.ENABLE_MEV_SHIELD === 'true',
        contractAudit: process.env.ENABLE_CONTRACT_AUDIT === 'true',
        networkMonitor: process.env.ENABLE_NETWORK_MONITOR === 'true',
        aiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
    },
} as const;

// ===========================================
// CLIENT-SIDE CONFIGURATION (Exposed to browser)
// ===========================================

export const publicConfig = {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'Sivic',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    solanaNetwork: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta',
} as const;

// ===========================================
// VALIDATION HELPERS
// ===========================================

export function isHeliusConfigured(): boolean {
    return !!serverConfig.helius.apiKey;
}

export function isBirdeyeConfigured(): boolean {
    return !!serverConfig.birdeye.apiKey;
}

export function isJupiterConfigured(): boolean {
    return !!serverConfig.jupiter.apiKey;
}

export function isBitqueryConfigured(): boolean {
    return !!serverConfig.bitquery.apiKey && serverConfig.bitquery.apiKey !== 'your_bitquery_api_key_here';
}

export function getConfigStatus() {
    return {
        helius: isHeliusConfigured(),
        birdeye: isBirdeyeConfigured(),
        jupiter: isJupiterConfigured(),
        bitquery: isBitqueryConfigured(),
        chainstack: !!serverConfig.backupRpc.chainstack.apiKey,
        huggingface: !!serverConfig.huggingface.apiKey,
        // DeFiLlama doesn't need a key
        defillama: true,
        // DexScreener is free (no key needed)
        dexscreener: true,
    };
}

// ===========================================
// SOLANA PROTOCOL SLUGS (for DeFiLlama API)
// ===========================================
// NOTE: These slugs are verified against DeFiLlama API
// Run `https://api.llama.fi/tvl/{slug}` to verify a slug

export const SOLANA_PROTOCOLS = {
    // DEXs
    dexs: {
        jupiter: 'jupiter',
        raydium: 'raydium',
        orca: 'orca',
        phoenix: 'phoenix',
        meteora: 'meteora',
        lifinity: 'lifinity',
        saber: 'saber',
        crema: 'crema-finance',
        aldrin: 'aldrin',
        serum: 'serum',
    },

    // Lending
    lending: {
        marginfi: 'marginfi',
        solend: 'solend',
        kamino: 'kamino',
        portFinance: 'port-finance',
        larix: 'larix',
    },

    // Staking (Verified slugs - removed socean as it returns HTTP 400)
    staking: {
        marinade: 'marinade', // Fixed: was 'marinade-finance', correct slug is 'marinade'
        jito: 'jito',
        lido: 'lido',
        sanctum: 'sanctum-validator-lsts', // Added: major Solana staking protocol
    },

    // NFT (Only magic-eden has TVL data, tensor and solanart return HTTP 400)
    nft: {
        magicEden: 'magic-eden',
    },

    // Bridges
    bridges: {
        wormhole: 'wormhole',
        allbridge: 'allbridge',
    },
} as const;

// Get all protocol slugs as array
export function getAllProtocolSlugs(): string[] {
    const slugs: string[] = [];
    for (const category of Object.values(SOLANA_PROTOCOLS)) {
        slugs.push(...Object.values(category));
    }
    return slugs;
}

// ===========================================
// TYPE EXPORTS
// ===========================================

export type ServerConfig = typeof serverConfig;
export type PublicConfig = typeof publicConfig;
export type ConfigStatus = ReturnType<typeof getConfigStatus>;
