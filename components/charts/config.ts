'use client';

/**
 * Chart.js Registration and Configuration
 * Centralized setup for Chart.js components
 */

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

// Register Chart.js components once
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ============================================
// CHART COLORS
// ============================================

export const CHART_COLORS = {
    primary: '#f97316', // Orange accent
    secondary: '#8b5cf6', // Purple
    success: '#4ade80', // Green
    warning: '#facc15', // Yellow
    danger: '#f87171', // Red
    info: '#38bdf8', // Blue
    muted: 'rgba(255, 255, 255, 0.3)',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.4)',
};

// Threat category colors
export const THREAT_COLORS = {
    mev: '#f97316', // Orange
    exploits: '#f87171', // Red
    sybil: '#8b5cf6', // Purple
    centralization: '#facc15', // Yellow
    quantum: '#38bdf8', // Blue
    rugPulls: '#ec4899', // Pink
};

// Severity colors
export const SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#f87171',
    medium: '#facc15',
    low: '#4ade80',
};

// DEX colors
export const DEX_COLORS = {
    jupiter: '#10b981',
    raydium: '#8b5cf6',
    orca: '#f97316',
    meteora: '#38bdf8',
    drift: '#ec4899',
};
