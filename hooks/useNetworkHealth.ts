/**
 * useNetworkHealth Hook
 * 
 * Fetches real-time network health data with error handling and toasts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { clientLogger } from '@/lib/utils/logger';

export interface NetworkHealth {
    tps: number;
    blockHeight: number;
    slot: number;
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
    congestion: 'low' | 'moderate' | 'high';
    health: 'ok' | 'error';
    successRate: number;
    lastUpdated: string;
}

interface UseNetworkHealthResult {
    data: NetworkHealth | null;
    isLoading: boolean;
    error: string | null;
    isConfigured: boolean;
    refetch: () => Promise<void>;
}

export function useNetworkHealth(refreshInterval = 30000): UseNetworkHealthResult {
    const [data, setData] = useState<NetworkHealth | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(true);
    const [hasShownConfigError, setHasShownConfigError] = useState(false);

    const fetchData = useCallback(async (silent = false) => {
        const hookName = 'useNetworkHealth';
        clientLogger.fetch(hookName, '/api/network');

        try {
            setError(null);
            const response = await fetch('/api/network');

            if (response.status === 503) {
                const result = await response.json();
                setIsConfigured(false);
                setError(result.error || 'API not configured');
                clientLogger.warn(hookName, 'Helius API not configured');

                // Only show toast once
                if (!hasShownConfigError && !silent) {
                    toast.warning('Network API Not Configured', {
                        description: 'Add your Helius API key to enable network data.',
                    });
                    setHasShownConfigError(true);
                }
                return;
            }

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            setIsConfigured(true);
            clientLogger.success(hookName, `TPS: ${result.tps}, Congestion: ${result.congestion}`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
            setError(errorMsg);
            clientLogger.error(hookName, errorMsg);

            if (!silent) {
                toast.error('Network Data Error', {
                    description: errorMsg,
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [hasShownConfigError]);

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

    return { data, isLoading, error, isConfigured, refetch };
}
