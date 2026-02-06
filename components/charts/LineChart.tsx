'use client';

import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from './config';

// Import config to ensure Chart.js is registered
import './config';

interface LineChartProps {
    data: ChartData<'line'>;
    options?: ChartOptions<'line'>;
    height?: number;
}

export function LineChart({ data, options, height = 250 }: LineChartProps) {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: CHART_COLORS.text,
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 11,
                    },
                    padding: 12,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                titleColor: '#ffffff',
                bodyColor: CHART_COLORS.text,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 6,
            },
        },
        scales: {
            x: {
                grid: {
                    color: CHART_COLORS.grid,
                },
                ticks: {
                    color: CHART_COLORS.textMuted,
                    font: { size: 10 },
                },
            },
            y: {
                grid: {
                    color: CHART_COLORS.grid,
                },
                ticks: {
                    color: CHART_COLORS.textMuted,
                    font: { size: 10 },
                },
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

export default LineChart;
