'use client';

import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from './config';

// Import config to ensure Chart.js is registered
import './config';

interface HorizontalBarChartProps {
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    height?: number;
}

/**
 * HorizontalBarChart Component
 * Horizontal bar chart for ranking displays
 * Based on reference design with teal/green bars
 */
export function HorizontalBarChart({ data, options, height = 250 }: HorizontalBarChartProps) {
    const defaultOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bars
        plugins: {
            legend: {
                display: false, // Hide legend for ranking charts
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                titleColor: '#ffffff',
                bodyColor: CHART_COLORS.text,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: {
                    family: 'Nohemi, system-ui, sans-serif',
                    weight: 600,
                },
                bodyFont: {
                    family: 'Nohemi, system-ui, sans-serif',
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: CHART_COLORS.textMuted,
                    font: {
                        family: 'Nohemi, system-ui, sans-serif',
                        size: 10,
                    },
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: CHART_COLORS.text,
                    font: {
                        family: 'Nohemi, system-ui, sans-serif',
                        size: 11,
                        weight: 500,
                    },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
        },
        elements: {
            bar: {
                borderRadius: 4,
                borderSkipped: false,
            },
        },
        ...options,
    };

    return (
        <div style={{ height }}>
            <Bar data={data} options={defaultOptions} />
        </div>
    );
}

export default HorizontalBarChart;
