'use client';

import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from './config';

// Import config to ensure Chart.js is registered
import './config';

interface BarChartProps {
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    height?: number;
    horizontal?: boolean;
}

export function BarChart({ data, options, height = 250, horizontal = false }: BarChartProps) {
    const defaultOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
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
            <Bar data={data} options={defaultOptions} />
        </div>
    );
}

export default BarChart;
