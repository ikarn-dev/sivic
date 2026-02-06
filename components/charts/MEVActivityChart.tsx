'use client';

import { ChartData } from 'chart.js';
import { LineChart } from './LineChart';
import { DEX_COLORS } from './config';

interface MEVActivityChartProps {
    labels: string[];
    jupiter: number[];
    raydium: number[];
    orca: number[];
    height?: number;
}

/**
 * MEV Activity Chart
 * Shows MEV incidents over time by DEX as a multi-line chart
 */
export function MEVActivityChart({
    labels,
    jupiter,
    raydium,
    orca,
    height = 250,
}: MEVActivityChartProps) {
    const data: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: 'Jupiter',
                data: jupiter,
                borderColor: DEX_COLORS.jupiter,
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
            },
            {
                label: 'Raydium',
                data: raydium,
                borderColor: DEX_COLORS.raydium,
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
            },
            {
                label: 'Orca',
                data: orca,
                borderColor: DEX_COLORS.orca,
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
            },
        ],
    };

    return <LineChart data={data} height={height} />;
}

export default MEVActivityChart;
