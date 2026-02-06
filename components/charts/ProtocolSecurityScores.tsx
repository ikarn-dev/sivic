'use client';

import { ChartData, ChartOptions } from 'chart.js';
import { BarChart } from './BarChart';

interface ProtocolSecurityScoresProps {
    protocols: { name: string; score: number }[];
    height?: number;
}

/**
 * Protocol Security Scores
 * Horizontal bar chart for protocol security score comparison
 */
export function ProtocolSecurityScores({ protocols, height = 200 }: ProtocolSecurityScoresProps) {
    const data: ChartData<'bar'> = {
        labels: protocols.map(p => p.name),
        datasets: [{
            label: 'Security Score',
            data: protocols.map(p => p.score),
            backgroundColor: protocols.map(p =>
                p.score >= 70 ? '#4ade80' :
                    p.score >= 40 ? '#facc15' :
                        '#f87171'
            ),
            borderRadius: 4,
            barThickness: 20,
        }],
    };

    const options: ChartOptions<'bar'> = {
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                min: 0,
                max: 100,
            },
        },
    };

    return <BarChart data={data} options={options} height={height} horizontal />;
}

export default ProtocolSecurityScores;
