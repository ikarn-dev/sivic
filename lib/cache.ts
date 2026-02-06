/**
 * Server-Side Cache Module
 * 
 * In-memory cache for API responses to prevent:
 * - Redundant API calls
 * - Rate limiting issues
 * - Large response caching errors (Next.js 2MB limit)
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class ServerCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private pendingFetches: Map<string, Promise<unknown>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    /**
     * Get cached data or fetch if expired/missing
     * Deduplicates concurrent requests for the same key
     */
    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMs: number = this.defaultTTL
    ): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key) as CacheEntry<T> | undefined;

        // Return cached data if valid
        if (cached && cached.expiresAt > now) {
            return cached.data;
        }

        // Check if there's already a pending fetch for this key
        const pendingFetch = this.pendingFetches.get(key) as Promise<T> | undefined;
        if (pendingFetch) {
            return pendingFetch;
        }

        // Create new fetch promise
        const fetchPromise = this.executeFetch<T>(key, fetcher, ttlMs, cached);
        this.pendingFetches.set(key, fetchPromise);

        try {
            const result = await fetchPromise;
            return result;
        } finally {
            // Clean up pending fetch
            this.pendingFetches.delete(key);
        }
    }

    /**
     * Execute fetch and store in cache
     */
    private async executeFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMs: number,
        cached?: CacheEntry<T>
    ): Promise<T> {
        try {
            const data = await fetcher();
            const now = Date.now();

            // Store in cache
            this.cache.set(key, {
                data,
                timestamp: now,
                expiresAt: now + ttlMs,
            });

            return data;
        } catch (error) {
            // If fetch fails but we have stale cache, return stale data
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }

    /**
     * Manually set cache data
     */
    set<T>(key: string, data: T, ttlMs: number = this.defaultTTL): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttlMs,
        });
    }

    /**
     * Get cache data without fetching
     */
    get<T>(key: string): T | null {
        const cached = this.cache.get(key) as CacheEntry<T> | undefined;
        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }
        return null;
    }

    /**
     * Invalidate specific cache key
     */
    invalidate(key: string): void {
        this.cache.delete(key);
        console.log(`[Cache] 🗑️ INVALIDATED: ${key}`);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
        console.log(`[Cache] 🗑️ CLEARED: All cache entries`);
    }

    /**
     * Get cache statistics
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton instance
export const serverCache = new ServerCache();

// Cache keys constants
export const CACHE_KEYS = {
    DEFILLAMA_PROTOCOLS: 'defillama:protocols',
    DEFILLAMA_CHAINS: 'defillama:chains',
    DEFILLAMA_SOL_PRICE: 'defillama:sol-price',
    DEFILLAMA_DEX_OVERVIEW: 'defillama:dex-overview',
    SOLANA_PROTOCOLS: 'solana:protocols', // Processed Solana-only protocols
} as const;

// Cache TTLs
export const CACHE_TTL = {
    SHORT: 60 * 1000,           // 1 minute - for frequently changing data
    MEDIUM: 5 * 60 * 1000,      // 5 minutes - default
    LONG: 15 * 60 * 1000,       // 15 minutes - for stable data
    VERY_LONG: 60 * 60 * 1000,  // 1 hour - for rarely changing data
} as const;
