'use client';

import Card from './Card';

interface RiskScoreDisplayProps {
    score: number;
    level: string;
    isLoading?: boolean;
    label?: string;
    sublabel?: string;
}

/**
 * Risk Score Display Component
 * Premium circular risk score with gradient effects
 */
export function RiskScoreDisplay({
    score,
    level,
    isLoading = false,
    label = 'Current MEV Risk',
    sublabel = 'Based on network conditions'
}: RiskScoreDisplayProps) {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical': return {
                text: 'text-red-400',
                ring: 'ring-red-500/50',
                glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
                gradient: 'from-red-500 to-red-600'
            };
            case 'High': return {
                text: 'text-orange-400',
                ring: 'ring-orange-500/50',
                glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
                gradient: 'from-orange-500 to-orange-600'
            };
            case 'Medium': return {
                text: 'text-yellow-400',
                ring: 'ring-yellow-500/50',
                glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
                gradient: 'from-yellow-500 to-yellow-600'
            };
            case 'Low': return {
                text: 'text-green-400',
                ring: 'ring-green-500/50',
                glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
                gradient: 'from-green-500 to-green-600'
            };
            default: return {
                text: 'text-gray-400',
                ring: 'ring-gray-500/50',
                glow: '',
                gradient: 'from-gray-500 to-gray-600'
            };
        }
    };

    const colors = getRiskColor(level);

    return (
        <div className="flex flex-col items-center py-6">
            <p className="text-white/50 text-sm font-medium mb-6">{label}</p>

            {/* Circular Score Display */}
            <div
                className={`relative w-40 h-40 rounded-full flex items-center justify-center ring-4 ${colors.ring} ${colors.glow} transition-all duration-500`}
            >
                {/* Outer gradient ring */}
                <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10`}
                />

                {/* Inner dark circle */}
                <div className="absolute inset-3 rounded-full bg-[#0a0a0a]" />

                {/* Score content */}
                <div className="relative text-center z-10">
                    <span className="text-5xl font-bold text-white tracking-tight">
                        {isLoading ? '...' : score}
                    </span>
                    <p className={`text-sm font-semibold mt-1 ${colors.text}`}>{level}</p>
                </div>

                {/* Animated pulse */}
                <div
                    className={`absolute inset-0 rounded-full ring-2 ${colors.ring} animate-ping opacity-20`}
                    style={{ animationDuration: '2s' }}
                />
            </div>

            <div className="mt-6 text-center">
                <p className="text-white/30 text-xs">{sublabel}</p>
            </div>
        </div>
    );
}
