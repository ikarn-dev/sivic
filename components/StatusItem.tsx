'use client';

interface StatusItemProps {
    label: string;
    status: 'active' | 'inactive' | 'warning';
}

const statusConfig = {
    active: {
        color: 'bg-green-400',
        text: 'text-green-400',
        label: 'Active',
        glow: 'shadow-[0_0_8px_rgba(74,222,128,0.5)]'
    },
    inactive: {
        color: 'bg-gray-500',
        text: 'text-gray-400',
        label: 'Inactive',
        glow: ''
    },
    warning: {
        color: 'bg-yellow-400',
        text: 'text-yellow-400',
        label: 'Warning',
        glow: 'shadow-[0_0_8px_rgba(250,204,21,0.5)]'
    },
};

/**
 * Status Item Component
 * Displays a labeled status indicator with animated dot
 */
export function StatusItem({ label, status }: StatusItemProps) {
    const config = statusConfig[status];

    return (
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <span className="text-white/70 text-sm font-medium">{label}</span>
            <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 ${config.color} rounded-full ${config.glow} ${status === 'active' ? 'animate-pulse' : ''}`} />
                <span className={`${config.text} text-sm font-semibold`}>{config.label}</span>
            </span>
        </div>
    );
}

interface StatusListProps {
    items: StatusItemProps[];
}

/**
 * Status List Component
 * Displays a list of status items with consistent spacing
 */
export function StatusList({ items }: StatusListProps) {
    return (
        <div className="space-y-2">
            {items.map((item) => (
                <StatusItem key={item.label} {...item} />
            ))}
        </div>
    );
}
