'use client';

import { Doughnut } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { CHART_COLORS } from './config';

// Import config to ensure Chart.js is registered
import './config';

interface DoughnutChartProps {
    data: ChartData<'doughnut'>;
    options?: ChartOptions<'doughnut'>;
    height?: number;
    centerText?: string;
    centerValue?: string;
}

export function DoughnutChart({
    data,
    options,
    height = 250,
    centerText,
    centerValue,
}: DoughnutChartProps) {
    const defaultOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: CHART_COLORS.text,
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 11,
                    },
                    padding: 12,
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
                padding: 10,
                cornerRadius: 6,
            },
        },
        ...options,
    };

    return (
        <div style={{ height, position: 'relative' }}>
            <Doughnut data={data} options={defaultOptions} />
            {(centerText || centerValue) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {centerValue && (
                        <span className="text-2xl font-bold text-white">{centerValue}</span>
                    )}
                    {centerText && (
                        <span className="text-xs text-[rgba(255,255,255,0.5)]">{centerText}</span>
                    )}
                </div>
            )}
        </div>
    );
}

export default DoughnutChart;
