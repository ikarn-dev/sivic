'use client';

import Card from './Card';

interface EmptyStateProps {
    icon?: React.ReactNode;
    message?: string;
    title?: string;
    description?: string;
}

/**
 * Empty State Component
 * Premium empty state with icon and message/title/description
 */
export function EmptyState({ icon, message, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && (
                <div className="w-16 h-16 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}
            {title && (
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
            )}
            {description && (
                <p className="text-white/50 text-sm max-w-md leading-relaxed">{description}</p>
            )}
            {message && (
                <p className="text-white/50 text-sm">{message}</p>
            )}
        </div>
    );
}

/**
 * Default Shield Icon for Empty State
 */
export function ShieldEmptyIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

interface ProgressBarProps {
    progress: number;
    max: number;
}

/**
 * Progress Bar Component
 * Premium progress bar with orange gradient
 */
export function ProgressBar({ progress, max }: ProgressBarProps) {
    const percentage = max > 0 ? (progress / max) * 100 : 0;

    return (
        <div className="w-full h-2.5 rounded-full bg-white/5 ring-1 ring-white/10 overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

interface ProgressBadgeProps {
    current: number;
    total: number;
}

/**
 * Progress Badge Component
 * Premium progress badge display - compact on mobile
 */
export function ProgressBadge({ current, total }: ProgressBadgeProps) {
    return (
        <Card className="px-2.5 py-1.5 sm:px-4 sm:py-2.5" hover={false} blobIntensity="subtle" rounded="md">
            <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-white/50 text-[10px] sm:text-xs font-medium">Progress</span>
                <span className="text-white font-bold text-xs sm:text-base">{current} / {total}</span>
            </div>
        </Card>
    );
}
