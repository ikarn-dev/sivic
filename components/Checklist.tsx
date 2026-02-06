'use client';

import Card from './Card';

interface ChecklistItemData {
    id: number;
    item: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ChecklistItemProps extends ChecklistItemData {
    checked?: boolean;
    onChange?: (id: number, checked: boolean) => void;
}

const severityConfig = {
    critical: {
        color: 'text-red-400',
        ring: 'ring-red-500/20',
        badge: 'bg-red-500/20 text-red-400'
    },
    high: {
        color: 'text-orange-400',
        ring: 'ring-orange-500/20',
        badge: 'bg-orange-500/20 text-orange-400'
    },
    medium: {
        color: 'text-yellow-400',
        ring: 'ring-yellow-500/20',
        badge: 'bg-yellow-500/20 text-yellow-400'
    },
    low: {
        color: 'text-green-400',
        ring: 'ring-green-500/20',
        badge: 'bg-green-500/20 text-green-400'
    },
};

/**
 * Checklist Item Component
 * Premium checkbox card with severity badge
 */
export function ChecklistItem({ id, item, severity, checked = false, onChange }: ChecklistItemProps) {
    const config = severityConfig[severity];

    return (
        <Card
            className={`ring-1 ${checked ? 'ring-orange-500/30' : config.ring} ${checked ? 'opacity-60' : ''} transition-all`}
            hover={true}
            blobIntensity="subtle"
            rounded="md"
        >
            <label className="flex items-start gap-4 p-4 cursor-pointer group">
                {/* Custom Checkbox */}
                <div className="relative mt-0.5">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange?.(id, e.target.checked)}
                        className="peer sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all ${checked
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-white/30 group-hover:border-orange-500/50'
                        }`}>
                        {checked && (
                            <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`text-white text-sm font-medium group-hover:text-orange-400 transition-colors ${checked ? 'line-through' : ''}`}>
                        {item}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold uppercase ${config.badge}`}>
                        {severity}
                    </span>
                </div>
            </label>
        </Card>
    );
}

interface ChecklistGroupProps {
    items: ChecklistItemData[];
    checkedItems?: Set<number>;
    onItemChange?: (id: number, checked: boolean) => void;
}

/**
 * Checklist Group Component
 * Group of premium checklist items
 */
export function ChecklistGroup({ items, checkedItems = new Set(), onItemChange }: ChecklistGroupProps) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <ChecklistItem
                    key={item.id}
                    {...item}
                    checked={checkedItems.has(item.id)}
                    onChange={onItemChange}
                />
            ))}
        </div>
    );
}
