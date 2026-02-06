'use client';

import { Badge, BadgeVariant } from './Badge';

interface StatusItemProps {
    label: string;
    status: 'active' | 'inactive' | 'warning';
}

/**
 * Status Item Component
 * Displays a labeled status indicator with animated dot using Badge
 */
export function StatusItem({ label, status }: StatusItemProps) {
    const getBadgeProps = (status: string): { variant: BadgeVariant, label: string, animate: boolean } => {
        switch (status) {
            case 'active':
                return { variant: 'success', label: 'Active', animate: true };
            case 'warning':
                return { variant: 'warning', label: 'Warning', animate: true };
            case 'inactive':
            default:
                return { variant: 'neutral', label: 'Inactive', animate: false };
        }
    };

    const { variant, label: statusLabel, animate } = getBadgeProps(status);

    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 transition-colors group">
            <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
            <Badge variant={variant} dot animate={animate} size="sm">
                {statusLabel}
            </Badge>
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
        <div className="space-y-3">
            {items.map((item) => (
                <StatusItem key={item.label} {...item} />
            ))}
        </div>
    );
}

