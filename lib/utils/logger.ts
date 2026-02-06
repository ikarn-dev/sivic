/**
 * Debug Logger Utility
 * 
 * API debugging with formatted console output
 */

const isDev = process.env.NODE_ENV === 'development';

// Colors for console styling
const styles = {
    api: 'color: #60a5fa; font-weight: bold;',
    success: 'color: #4ade80; font-weight: bold;',
    error: 'color: #f87171; font-weight: bold;',
    warn: 'color: #facc15; font-weight: bold;',
    info: 'color: #a78bfa; font-weight: bold;',
    data: 'color: #9ca3af;',
};

// Server-side logger (for API routes)
export const apiLogger = {
    request: (endpoint: string, params?: unknown) => {
        if (!isDev) return;
        console.log(`[API] 📡 Request: ${endpoint}`);
        if (params) console.log('[API] Params:', params);
    },

    response: (endpoint: string, status: number, duration: number) => {
        if (!isDev) return;
        const icon = status >= 200 && status < 300 ? '✅' : '❌';
        console.log(`[API] ${icon} Response: ${endpoint} | Status: ${status} | ${duration}ms`);
    },

    error: (endpoint: string, error: unknown) => {
        console.error(`[API] ❌ Error: ${endpoint}`);
        console.error('[API] Details:', error instanceof Error ? error.message : error);
    },

    warn: (endpoint: string, message: string) => {
        if (!isDev) return;
        console.warn(`[API] ⚠️ Warning: ${endpoint} - ${message}`);
    },

    data: (label: string, data: unknown) => {
        if (!isDev) return;
        console.log(`[API] 📦 ${label}:`, typeof data === 'object' ? JSON.stringify(data, null, 2).slice(0, 500) : data);
    },
};

// Client-side logger (for hooks)
export const clientLogger = {
    fetch: (hook: string, endpoint: string) => {
        if (!isDev) return;
        console.log(`%c[${hook}]%c Fetching: ${endpoint}`, styles.api, styles.data);
    },

    success: (hook: string, summary: string) => {
        if (!isDev) return;
        console.log(`%c[${hook}]%c ✅ ${summary}`, styles.success, styles.data);
    },

    error: (hook: string, error: string) => {
        console.error(`%c[${hook}]%c ❌ ${error}`, styles.error, styles.data);
    },

    warn: (hook: string, message: string) => {
        if (!isDev) return;
        console.warn(`%c[${hook}]%c ⚠️ ${message}`, styles.warn, styles.data);
    },

    data: (hook: string, label: string, value: unknown) => {
        if (!isDev) return;
        console.log(`%c[${hook}]%c 📊 ${label}:`, styles.info, styles.data, value);
    },
};

// Timing helper for API calls
export function withTiming<T>(
    fn: () => Promise<T>,
    onComplete: (duration: number) => void
): Promise<T> {
    const start = Date.now();
    return fn().finally(() => onComplete(Date.now() - start));
}
