/**
 * usePrefetch Hook
 * 
 * Warms the server cache on app load to ensure fast subsequent requests.
 * Should be used once at the app root level.
 */

'use client';

import { useEffect, useRef } from 'react';
import { clientLogger } from '@/lib/utils/logger';

export function usePrefetch() {
    const hasPrefetched = useRef(false);

    useEffect(() => {
        // Only prefetch once per session
        if (hasPrefetched.current) return;
        hasPrefetched.current = true;

        const prefetchData = async () => {
            clientLogger.fetch('usePrefetch', '/api/prefetch');

            try {
                const response = await fetch('/api/prefetch');

                if (response.ok) {
                    const result = await response.json();
                    clientLogger.success('usePrefetch', `Cache warmed in ${result.duration}ms`);
                }
            } catch (error) {
                // Silent fail - prefetch is optional
                console.warn('[Prefetch] Failed to warm cache:', error);
            }
        };

        // Slight delay to not block initial render
        const timer = setTimeout(prefetchData, 100);
        return () => clearTimeout(timer);
    }, []);
}
