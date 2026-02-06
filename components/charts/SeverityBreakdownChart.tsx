'use client';

import { ChartData, ChartOptions } from 'chart.js';
import { BarChart } from './BarChart';
import { SEVERITY_COLORS } from './config';

interface SeverityBreakdownChartProps {
    critical: number;
    high: number;
    medium: number;
    low: number;
    height?: number;
}

/**
 * Severity Breakdown Chart
 * Shows issues by severity level as a bar chart
 */
export function SeverityBreakdownChart({
    critical,
    high,
    medium,
    low,
    height = 200,
}: SeverityBreakdownChartProps) {
    const data: ChartData<'bar'> = {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
            label: 'Issues',
            data: [critical, high, medium, low],
            backgroundColor: [
                SEVERITY_COLORS.critical,
                SEVERITY_COLORS.high,
                SEVERITY_COLORS.medium,
                SEVERITY_COLORS.low,
            ],
            borderRadius: 4,
            barThickness: 32,
        }],
    };

    const options: ChartOptions<'bar'> = {
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return <BarChart data={data} options={options} height={height} />;
}

export default SeverityBreakdownChart;
