'use client';

import Card from './Card';

interface InfoCardProps {
    name: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    badge?: string;
}

const severityConfig = {
    low: { color: 'text-[#4ade80]', bg: 'bg-[rgba(74,222,128,0.15)]', ring: 'ring-green-500/20' },
    medium: { color: 'text-[#facc15]', bg: 'bg-[rgba(250,204,21,0.15)]', ring: 'ring-yellow-500/20' },
    high: { color: 'text-[#f87171]', bg: 'bg-[rgba(248,113,113,0.15)]', ring: 'ring-red-500/20' },
};

/**
 * Info Card Component
 * Premium card with title, description, and optional severity badge
 */
export function InfoCard({ name, description, severity, badge }: InfoCardProps) {
    const config = severity ? severityConfig[severity] : null;

    return (
        <Card
            className={`p-5 ${config?.ring || ''}`}
            hover={true}
            blobIntensity="subtle"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-white font-semibold text-base">{name}</h4>
                {(severity || badge) && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config?.bg || 'bg-white/10'} ${config?.color || 'text-white/80'}`}>
                        {badge || severity?.toUpperCase()}
                    </span>
                )}
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </Card>
    );
}

interface InfoCardGridProps {
    cards: InfoCardProps[];
    columns?: 1 | 2 | 3 | 4;
}

/**
 * Info Card Grid Component
 * Displays a responsive grid of info cards
 */
export function InfoCardGrid({ cards, columns = 4 }: InfoCardGridProps) {
    const colClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={`grid ${colClass[columns]} gap-4`}>
            {cards.map((card) => (
                <InfoCard key={card.name} {...card} />
            ))}
        </div>
    );
}
