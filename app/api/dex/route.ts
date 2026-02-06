/**
 * DEX Volumes API Route
 * 
 * Fetches DEX volume data using the centralized DeFiLlama service
 */

import { NextResponse } from 'next/server';
import { getDexData } from '@/lib/api/defillama-service';
import { apiLogger, withTiming } from '@/lib/utils/logger';

export async function GET() {
    const endpoint = '/api/dex';

    return withTiming(
        async () => {
            apiLogger.request(endpoint);

            try {
                const data = await getDexData();

                apiLogger.data('DEX response', {
                    totalVolume24h: data.totalVolume24h,
                    dexCount: data.dexes.length,
                });

                return NextResponse.json(data);
            } catch (error) {
                apiLogger.error(endpoint, error);
                return NextResponse.json(
                    {
                        error: 'Failed to fetch DEX data',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                    { status: 500 }
                );
            }
        },
        (duration) => apiLogger.response(endpoint, 200, duration)
    );
}
