/**
 * useEcosystem Hook
 * 
 * Fetches Solana ecosystem TVL data with error handling and toasts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { clientLogger } from '@/lib/utils/logger';

export interface ProtocolTVL {
    name: string;
    slug: string;
    tvl: number;
    change24h?: number;
}

export interface CategoryData {
    name: string;
    totalTvl: number;
    protocols: ProtocolTVL[];
}

export interface EcosystemData {
    totalTvl: number;
    solPrice: number;
    categories: CategoryData[];
    lastUpdated: string;
}

interface UseEcosystemResult {
    data: EcosystemData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useEcosystem(refreshInterval = 300000): UseEcosystemResult {
    const [data, setData] = useState<EcosystemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (silent = false) => {
        const hookName = 'useEcosystem';
        clientLogger.fetch(hookName, '/api/ecosystem');

        try {
            setError(null);
            const response = await fetch('/api/ecosystem');

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            clientLogger.success(hookName, `TVL: $${(result.totalTvl / 1e9).toFixed(2)}B, Categories: ${result.categories.length}`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMsg);
            clientLogger.error(hookName, errorMsg);

            if (!silent) {
                toast.error('Ecosystem Data Error', {
                    description: errorMsg,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(true); // Silent on first load

        if (refreshInterval > 0) {
            const interval = setInterval(() => fetchData(true), refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        await fetchData(false);
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}
