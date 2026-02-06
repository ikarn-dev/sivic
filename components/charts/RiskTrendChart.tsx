'use client';

import { ChartData, ChartOptions } from 'chart.js';
import { LineChart } from './LineChart';
import { CHART_COLORS } from './config';

interface RiskTrendChartProps {
    labels: string[];
    data: number[];
    height?: number;
}

/**
 * Risk Trend Chart
 * Shows risk score over time as a line chart with area fill
 */
export function RiskTrendChart({ labels, data, height = 200 }: RiskTrendChartProps) {
    const chartData: ChartData<'line'> = {
        labels,
        datasets: [{
            label: 'Risk Score',
            data,
            borderColor: CHART_COLORS.primary,
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: CHART_COLORS.primary,
            pointBorderColor: 'transparent',
        }],
    };

    const options: ChartOptions<'line'> = {
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 25,
                },
            },
        },
    };

    return <LineChart data={chartData} options={options} height={height} />;
}

export default RiskTrendChart;
