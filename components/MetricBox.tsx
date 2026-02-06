'use client';

import Card from './Card';

interface MetricBoxProps {
    label: string;
    value: string;
    status?: 'ok' | 'warning' | 'danger';
}

const statusColors = {
    ok: 'text-[#4ade80]',
    warning: 'text-[#facc15]',
    danger: 'text-[#f87171]',
};

const statusRings = {
    ok: 'ring-green-500/20',
    warning: 'ring-yellow-500/20',
    danger: 'ring-red-500/20',
};

/**
 * Metric Box Component
 * Premium card displaying a single metric with label, value, and status
 */
export function MetricBox({ label, value, status = 'ok' }: MetricBoxProps) {
    return (
        <Card
            className={`p-4 ring-1 ${statusRings[status]}`}
            hover={false}
            blobIntensity="subtle"
            rounded="md"
        >
            <p className="text-white/40 text-xs font-medium mb-1">{label}</p>
            <p className={`text-lg font-bold capitalize ${statusColors[status]}`}>{value}</p>
        </Card>
    );
}

interface MetricGridProps {
    metrics: MetricBoxProps[];
    columns?: 2 | 3 | 4;
}

/**
 * Metric Grid Component
 * Displays a responsive grid of metric boxes
 */
export function MetricGrid({ metrics, columns = 2 }: MetricGridProps) {
    const colClass = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4',
    };

    return (
        <div className={`grid ${colClass[columns]} gap-4`}>
            {metrics.map((metric) => (
                <MetricBox key={metric.label} {...metric} />
            ))}
        </div>
    );
}
