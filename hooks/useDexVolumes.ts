/**
 * useDexVolumes Hook
 * 
 * Fetches DEX volume data with error handling and toasts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { clientLogger } from '@/lib/utils/logger';

export interface DexVolume {
    name: string;
    displayName?: string;
    total24h: number;
    total7d?: number;
    change_1d: number;
    change_7d?: number;
}

export interface DexData {
    totalVolume24h: number;
    dexes: DexVolume[];
    lastUpdated: string;
}

interface UseDexVolumesResult {
    data: DexData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDexVolumes(refreshInterval = 300000): UseDexVolumesResult {
    const [data, setData] = useState<DexData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (silent = false) => {
        const hookName = 'useDexVolumes';
        clientLogger.fetch(hookName, '/api/dex');

        try {
            setError(null);
            const response = await fetch('/api/dex');

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            clientLogger.success(hookName, `Volume: $${(result.totalVolume24h / 1e9).toFixed(2)}B, DEXes: ${result.dexes.length}`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMsg);
            clientLogger.error(hookName, errorMsg);

            if (!silent) {
                toast.error('DEX Data Error', {
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
