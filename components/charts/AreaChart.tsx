'use client';

import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from './config';

// Import config to ensure Chart.js is registered
import './config';

interface AreaChartProps {
    data: ChartData<'line'>;
    options?: ChartOptions<'line'>;
    height?: number;
}

/**
 * AreaChart Component
 * Multi-series area chart with gradient fills
 * Based on reference design with smooth curves
 */
export function AreaChart({ data, options, height = 250 }: AreaChartProps) {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: CHART_COLORS.text,
                    font: {
                        family: 'Nohemi, system-ui, sans-serif',
                        size: 11,
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
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
                    color: CHART_COLORS.grid,
                    drawTicks: false,
                },
                ticks: {
                    color: CHART_COLORS.textMuted,
                    font: {
                        family: 'Nohemi, system-ui, sans-serif',
                        size: 10,
                    },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    color: CHART_COLORS.grid,
                    drawTicks: false,
                },
                ticks: {
                    color: CHART_COLORS.textMuted,
                    font: {
                        family: 'Nohemi, system-ui, sans-serif',
                        size: 10,
                    },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
        },
        elements: {
            line: {
                tension: 0.4, // Smooth curves
                borderWidth: 2,
            },
            point: {
                radius: 0, // Hide points by default
                hoverRadius: 4,
            },
        },
        ...options,
    };

    return (
        <div style={{ height }}>
            <Line data={data} options={defaultOptions} />
        </div>
    );
}

export default AreaChart;
