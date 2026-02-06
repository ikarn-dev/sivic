'use client';

import Link from 'next/link';
import Card, { MiniCard } from './Card';

export interface QuickNavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    description: string;
}

interface QuickNavGridProps {
    items: QuickNavItem[];
    title?: string;
}

/**
 * Quick Navigation Grid Component
 * Premium card grid with navigation links and icons
 */
export function QuickNavGrid({ items, title = 'Quick Access' }: QuickNavGridProps) {
    return (
        <Card className="p-6" hover={false} blobIntensity="subtle">
            <h3 className="text-lg font-semibold text-white mb-5">{title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="block"
                    >
                        <Card
                            className="p-4 h-full ring-1 ring-white/5 hover:ring-orange-500/20 transition-all"
                            hover={true}
                            blobIntensity="subtle"
                            rounded="md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-white/40 text-xs truncate">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </Card>
    );
}
