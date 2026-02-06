'use client';

import Card from './Card';

interface RecommendationItemProps {
    text: string;
    type?: 'success' | 'warning' | 'danger';
}

/**
 * Recommendation Item Component
 * Premium card displaying a single recommendation with icon
 */
export function RecommendationItem({ text, type = 'success' }: RecommendationItemProps) {
    const config = {
        success: {
            icon: '✓',
            color: 'text-green-400',
            ring: 'ring-green-500/20',
            bg: 'bg-green-500/5'
        },
        warning: {
            icon: '⚠',
            color: 'text-yellow-400',
            ring: 'ring-yellow-500/20',
            bg: 'bg-yellow-500/5'
        },
        danger: {
            icon: '✕',
            color: 'text-red-400',
            ring: 'ring-red-500/20',
            bg: 'bg-red-500/5'
        },
    };

    const { icon, color, ring, bg } = config[type];

    return (
        <Card
            className={`p-4 ring-1 ${ring}`}
            hover={false}
            blobIntensity="subtle"
            rounded="md"
        >
            <div className="flex items-start gap-3">
                <span className={`text-lg ${color} mt-0.5`}>{icon}</span>
                <span className="text-white/80 text-sm leading-relaxed">{text}</span>
            </div>
        </Card>
    );
}

interface RecommendationListProps {
    items: string[];
    type?: 'success' | 'warning' | 'danger';
}

/**
 * Recommendation List Component
 * Displays a list of recommendation cards
 */
export function RecommendationList({ items, type = 'success' }: RecommendationListProps) {
    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <RecommendationItem key={i} text={item} type={type} />
            ))}
        </div>
    );
}

interface ThreatItemProps {
    text: string;
    isLow?: boolean;
}

/**
 * Threat Item Component
 * Premium card displaying a single threat with status indicator
 */
export function ThreatItem({ text, isLow = false }: ThreatItemProps) {
    const ring = isLow ? 'ring-green-500/20' : 'ring-red-500/20';
    const textClass = isLow ? 'text-green-400' : 'text-red-400';
    const icon = isLow ? '○' : '⚠';

    return (
        <Card
            className={`p-4 ring-1 ${ring}`}
            hover={false}
            blobIntensity="subtle"
            rounded="md"
        >
            <div className="flex items-start gap-3">
                <span className={`${textClass} mt-0.5`}>{icon}</span>
                <span className="text-white/80 text-sm leading-relaxed">{text}</span>
            </div>
        </Card>
    );
}

interface ThreatListProps {
    threats: string[];
    isLow?: boolean;
}

/**
 * Threat List Component
 * Displays a list of threat cards
 */
export function ThreatList({ threats, isLow = false }: ThreatListProps) {
    return (
        <div className="space-y-2">
            {threats.map((threat, i) => (
                <ThreatItem key={i} text={threat} isLow={isLow} />
            ))}
        </div>
    );
}
