/**
 * Protocols Treemap API Route
 * 
 * Fetches Solana protocols for treemap visualization using the centralized DeFiLlama service
 */

import { NextResponse } from 'next/server';
import { getTreemapData } from '@/lib/api/defillama-service';
import { apiLogger, withTiming } from '@/lib/utils/logger';

export async function GET() {
    const endpoint = '/api/protocols-treemap';

    return withTiming(
        async () => {
            apiLogger.request(endpoint);

            try {
                const data = await getTreemapData(50);

                apiLogger.data('Treemap response', {
                    protocolCount: data.protocols.length,
                    totalTvl: data.totalTvl,
                });

                return NextResponse.json(data);
            } catch (error) {
                apiLogger.error(endpoint, error);
                return NextResponse.json(
                    {
                        error: 'Failed to fetch protocols data',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                    { status: 500 }
                );
            }
        },
        (duration) => apiLogger.response(endpoint, 200, duration)
    );
}
