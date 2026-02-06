'use client';

import { formatUSDExact } from '@/lib/utils/format';
import Card, { MiniCard } from './Card';

interface ProtocolCardProps {
    name: string;
    tvl: number;
    category: string;
}

const categoryColors: Record<string, { ring: string; glow: string }> = {
    dexs: { ring: 'ring-green-600/30', glow: 'shadow-[0_0_15px_rgba(22,101,52,0.2)]' },
    lending: { ring: 'ring-purple-600/30', glow: 'shadow-[0_0_15px_rgba(126,34,206,0.2)]' },
    staking: { ring: 'ring-cyan-600/30', glow: 'shadow-[0_0_15px_rgba(14,116,144,0.2)]' },
    nft: { ring: 'ring-pink-600/30', glow: 'shadow-[0_0_15px_rgba(190,24,93,0.2)]' },
    launch: { ring: 'ring-orange-600/30', glow: 'shadow-[0_0_15px_rgba(194,65,12,0.2)]' },
    bridges: { ring: 'ring-indigo-600/30', glow: 'shadow-[0_0_15px_rgba(67,56,202,0.2)]' },
};

/**
 * Protocol Card Component
 * Premium card displaying a protocol with its TVL and category styling
 */
export function ProtocolCard({ name, tvl, category }: ProtocolCardProps) {
    const colorConfig = categoryColors[category] || { ring: 'ring-white/10', glow: '' };

    return (
        <Card
            className={`p-4 ring-1 ${colorConfig.ring} ${colorConfig.glow}`}
            hover={true}
            blobIntensity="subtle"
            rounded="md"
        >
            <p className="text-white text-sm font-semibold truncate mb-1">{name}</p>
            <p className="text-white/60 text-xs">{formatUSDExact(tvl)}</p>
        </Card>
    );
}

interface ProtocolGridProps {
    protocols: ProtocolCardProps[];
    maxItems?: number;
}

/**
 * Protocol Grid Component
 * Displays a responsive grid of protocol cards
 */
export function ProtocolGrid({ protocols, maxItems = 12 }: ProtocolGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {protocols.slice(0, maxItems).map((protocol) => (
                <ProtocolCard key={protocol.name} {...protocol} />
            ))}
        </div>
    );
}
