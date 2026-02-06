'use client';

import { ChartData } from 'chart.js';
import { DoughnutChart } from './DoughnutChart';
import { THREAT_COLORS } from './config';

interface ThreatDistributionChartProps {
    mev: number;
    exploits: number;
    sybil: number;
    centralization: number;
    quantum: number;
    height?: number;
}

/**
 * Threat Distribution Chart
 * Shows breakdown of detected threat types as a doughnut chart
 */
export function ThreatDistributionChart({
    mev,
    exploits,
    sybil,
    centralization,
    quantum,
    height = 250,
}: ThreatDistributionChartProps) {
    const data: ChartData<'doughnut'> = {
        labels: ['MEV Attacks', 'Contract Exploits', 'Sybil Activity', 'Centralization', 'Quantum Risk'],
        datasets: [{
            data: [mev, exploits, sybil, centralization, quantum],
            backgroundColor: [
                THREAT_COLORS.mev,
                THREAT_COLORS.exploits,
                THREAT_COLORS.sybil,
                THREAT_COLORS.centralization,
                THREAT_COLORS.quantum,
            ],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    const total = mev + exploits + sybil + centralization + quantum;

    return (
        <DoughnutChart
            data={data}
            height={height}
            centerValue={total.toString()}
            centerText="Total Threats"
        />
    );
}

export default ThreatDistributionChart;
