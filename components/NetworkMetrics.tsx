'use client';

interface NetworkMetricRowProps {
    label: string;
    value: string | number;
    valueColor?: string;
}

/**
 * Network Metric Row Component
 * Displays a single metric with label and value
 */
export function NetworkMetricRow({ label, value, valueColor = 'text-white' }: NetworkMetricRowProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[rgba(255,255,255,0.6)] text-sm">{label}</span>
            <span className={`font-medium ${valueColor}`}>{value}</span>
        </div>
    );
}

interface NetworkMetricsProps {
    metrics: NetworkMetricRowProps[];
}

/**
 * Network Metrics Component
 * Displays a list of network metric rows
 */
export function NetworkMetrics({ metrics }: NetworkMetricsProps) {
    return (
        <div className="space-y-3">
            {metrics.map((metric) => (
                <NetworkMetricRow key={metric.label} {...metric} />
            ))}
        </div>
    );
}
