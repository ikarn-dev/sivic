'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MEVIncident {
    dex: string;
    type: 'sandwich' | 'frontrun' | 'backrun' | 'arbitrage';
    profitSol: number;
    timestamp: string;
    txSignature: string;
}

export interface MEVStats {
    incidents: {
        available: boolean;
        recent: MEVIncident[];
        totalLast24h: number;
        profitLast24hSol: number;
    };
    dexActivity: {
        jupiterTx24h: number;
        raydiumTx24h: number;
        orcaTx24h: number;
        totalMevExposure: number;
    };
    networkMetrics: {
        avgTps: number;
        peakTps: number;
        avgBlockTime: number;
        slotRange: {
            start: number;
            end: number;
        };
    };
    mevIndicators: {
        sandwichRisk: 'low' | 'medium' | 'high';
        frontRunRisk: 'low' | 'medium' | 'high';
        estimatedMevOpportunities: number;
    };
    lastUpdated: string;
}

interface UseMEVStatsResult {
    data: MEVStats | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useMEVStats(refreshInterval = 60000): UseMEVStatsResult {
    const [data, setData] = useState<MEVStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch('/api/mev-stats');

            if (response.status === 503) {
                setError('API not configured');
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch MEV stats');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        await fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}
