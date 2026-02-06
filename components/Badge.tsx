'use client';

import React from 'react';

export type BadgeVariant = 'default' | 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
    dot?: boolean;
    animate?: boolean;
    icon?: React.ReactNode;
}

const variants = {
    default: 'bg-white/10 text-white border-white/10',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    accent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const dotColors = {
    default: 'bg-white',
    neutral: 'bg-gray-400',
    accent: 'bg-orange-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400',
};

const sizes = {
    sm: 'text-xs px-2 py-0.5 min-h-[20px]',
    md: 'text-sm px-2.5 py-0.5 min-h-[24px]',
    lg: 'text-sm px-3 py-1 min-h-[28px]',
};

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    dot = false,
    animate = false,
    icon,
}: BadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center justify-center gap-1.5 
                rounded-full border font-medium whitespace-nowrap
                ${variants[variant]} 
                ${sizes[size]} 
                ${className}
            `}
        >
            {dot && (
                <span className={`relative flex h-2 w-2`}>
                    {animate && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
                </span>
            )}
            {icon && <span className="h-3.5 w-3.5">{icon}</span>}
            {children}
        </span>
    );
}

export default Badge;
