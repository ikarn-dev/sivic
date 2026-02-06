/**
 * Formatting Utilities
 * 
 * Number and currency formatting helpers
 */

/**
 * Format large numbers with K, M, B suffixes (compact mode)
 */
export function formatNumber(num: number | null | undefined, decimals = 1): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    if (num === 0) return '0';

    const absNum = Math.abs(num);

    if (absNum >= 1e12) {
        return (num / 1e12).toFixed(decimals) + 'T';
    }
    if (absNum >= 1e9) {
        return (num / 1e9).toFixed(decimals) + 'B';
    }
    if (absNum >= 1e6) {
        return (num / 1e6).toFixed(decimals) + 'M';
    }
    if (absNum >= 1e3) {
        return (num / 1e3).toFixed(decimals) + 'K';
    }

    return num.toFixed(decimals);
}

/**
 * Format number with exact value (thousands separators, no abbreviations)
 */
export function formatNumberExact(num: number | null | undefined, decimals = 0): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    if (num === 0) return '0';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format as USD currency (compact mode with K/M/B)
 */
export function formatUSD(num: number | null | undefined, compact = true): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    if (num === 0) return '$0';

    if (compact) {
        return '$' + formatNumber(num, 2);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}

/**
 * Format as USD currency with exact value (no abbreviations)
 */
export function formatUSDExact(num: number | null | undefined, decimals = 2): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    if (num === 0) return '$0';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format percentage
 */
export function formatPercent(num: number | null | undefined, decimals = 1): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    return num.toFixed(decimals) + '%';
}

/**
 * Format percentage change with + or -
 */
export function formatChange(num: number | null | undefined, decimals = 1): string {
    if (num === null || num === undefined || isNaN(num)) return '—';
    const sign = num >= 0 ? '+' : '';
    return sign + num.toFixed(decimals) + '%';
}

/**
 * Get color class based on change value
 */
export function getChangeColor(num: number | null | undefined): string {
    if (num === null || num === undefined || isNaN(num)) return 'text-[rgba(255,255,255,0.5)]';
    if (num > 0) return 'text-[#4ade80]';
    if (num < 0) return 'text-[#f87171]';
    return 'text-[rgba(255,255,255,0.5)]';
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleDateString();
}
