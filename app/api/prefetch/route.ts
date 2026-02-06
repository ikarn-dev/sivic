/**
 * Prefetch API Route
 * 
 * Warms the cache by fetching all required data upfront.
 * Call this on app load to minimize subsequent request times.
 */

import { NextResponse } from 'next/server';
import { getEcosystemData, getDexData, getTreemapData, getCacheStats } from '@/lib/api/defillama-service';
import { apiLogger, withTiming } from '@/lib/utils/logger';

export async function GET() {
    const endpoint = '/api/prefetch';

    return withTiming(
        async () => {
            apiLogger.request(endpoint);

            try {
                // Fetch all data in parallel to warm the cache
                const startTime = Date.now();

                const [ecosystem, dex, treemap] = await Promise.all([
                    getEcosystemData(),
                    getDexData(),
                    getTreemapData(50),
                ]);

                const duration = Date.now() - startTime;
                const cacheStats = getCacheStats();

                apiLogger.data('Prefetch complete', {
                    ecosystemCategories: ecosystem.categories.length,
                    dexCount: dex.dexes.length,
                    treemapProtocols: treemap.protocols.length,
                    cacheKeys: cacheStats.keys.length,
                    duration: `${duration}ms`,
                });

                return NextResponse.json({
                    success: true,
                    warmed: {
                        ecosystem: true,
                        dex: true,
                        treemap: true,
                    },
                    cache: cacheStats,
                    duration,
                });
            } catch (error) {
                apiLogger.error(endpoint, error);
                return NextResponse.json(
                    {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                    { status: 500 }
                );
            }
        },
        (duration) => apiLogger.response(endpoint, 200, duration)
    );
}
