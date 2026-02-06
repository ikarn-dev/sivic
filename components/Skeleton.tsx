/**
 * Skeleton Loading Components
 * 
 * Premium shimmer animations for loading states with gradient effects
 */

import React from 'react';
import Card from './Card';

/**
 * Base Skeleton with shimmer animation
 */
export function Skeleton({
    className = '',
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`skeleton-shimmer rounded ${className}`}
            {...props}
        />
    );
}

/**
 * Stat Card Skeleton
 * Matches the premium GlassStatCard design
 */
export function SkeletonStatCard() {
    return (
        <Card className="p-6" hover={false} blobIntensity="subtle">
            <div className="flex flex-col justify-end h-full min-h-[80px]">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
            </div>
        </Card>
    );
}

/**
 * Container Card Skeleton
 * Matches the premium GlassContainerCard design
 */
export function SkeletonContainerCard({ rows = 3 }: { rows?: number }) {
    return (
        <Card className="p-6" hover={false} blobIntensity="subtle">
            <Skeleton className="h-6 w-36 mb-6" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-4"
                        style={{ width: `${100 - i * 12}%` }}
                    />
                ))}
            </div>
        </Card>
    );
}

/**
 * Table Row Skeleton
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 py-3 px-3 rounded-lg bg-white/[0.02]">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
}

/**
 * Protocol Card Skeleton
 * Matches the premium ProtocolCard design
 */
export function SkeletonProtocolCard() {
    return (
        <Card className="p-4" hover={false} blobIntensity="subtle" rounded="md">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
        </Card>
    );
}

/**
 * Full Stats Grid Skeleton
 */
export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonStatCard key={i} />
            ))}
        </div>
    );
}

/**
 * Circle/Risk Score Skeleton
 */
export function SkeletonCircle({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-36 h-36',
    };

    return (
        <Skeleton className={`${sizeClasses[size]} rounded-full`} />
    );
}

/**
 * List Item Skeleton
 */
export function SkeletonListItem() {
    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
            <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-4 rounded" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
        </div>
    );
}

/**
 * DEX List Skeleton
 */
export function SkeletonDexList({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    );
}

/**
 * Category Grid Skeleton
 */
export function SkeletonCategoryGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="p-4" hover={false} blobIntensity="subtle" rounded="md">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                </Card>
            ))}
        </div>
    );
}

/**
 * Feature Card Skeleton
 */
export function SkeletonFeatureCard() {
    return (
        <Card className="p-8" hover={false} blobIntensity="normal" rounded="xl">
            <div className="flex flex-col justify-end h-full min-h-[120px]">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-10 w-28" />
            </div>
        </Card>
    );
}
