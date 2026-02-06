/**
 * DeFiLlama Ecosystem API Route
 * 
 * Fetches Solana ecosystem TVL data using the centralized DeFiLlama service
 */

import { NextResponse } from 'next/server';
import { getEcosystemData } from '@/lib/api/defillama-service';
import { apiLogger, withTiming } from '@/lib/utils/logger';

export async function GET() {
    const endpoint = '/api/ecosystem';

    return withTiming(
        async () => {
            apiLogger.request(endpoint);

            try {
                const data = await getEcosystemData();

                apiLogger.data('Ecosystem response', {
                    totalTvl: data.totalTvl,
                    solPrice: data.solPrice,
                    categoryCount: data.categories.length,
                });

                return NextResponse.json(data);
            } catch (error) {
                apiLogger.error(endpoint, error);
                return NextResponse.json(
                    {
                        error: 'Failed to fetch ecosystem data',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                    { status: 500 }
                );
            }
        },
        (duration) => apiLogger.response(endpoint, 200, duration)
    );
}
