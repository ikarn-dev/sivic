/**
 * useProtocolsTreemap Hook
 * 
 * Fetches Solana protocol data formatted for treemap visualization
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { clientLogger } from '@/lib/utils/logger';
import type { TreemapItem } from '@/components/EcosystemTreemap';

export interface ProtocolsTreemapData {
    protocols: TreemapItem[];
    totalTvl: number;
    lastUpdated: string;
}

interface UseProtocolsTreemapResult {
    data: ProtocolsTreemapData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useProtocolsTreemap(refreshInterval = 300000): UseProtocolsTreemapResult {
    const [data, setData] = useState<ProtocolsTreemapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (silent = false) => {
        const hookName = 'useProtocolsTreemap';
        clientLogger.fetch(hookName, '/api/protocols-treemap');

        try {
            setError(null);
            const response = await fetch('/api/protocols-treemap');

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            clientLogger.success(hookName, `Protocols: ${result.protocols.length}, TVL: $${(result.totalTvl / 1e9).toFixed(2)}B`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMsg);
            clientLogger.error(hookName, errorMsg);

            if (!silent) {
                toast.error('Protocols Treemap Error', {
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
