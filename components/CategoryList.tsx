'use client';

import { formatUSDExact } from '@/lib/utils/format';

interface CategoryRowProps {
    name: string;
    value: number;
}

/**
 * Category Row Component
 * Displays a category with name and value
 */
export function CategoryRow({ name, value }: CategoryRowProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-white">{name}</span>
            <span className="text-[rgba(255,255,255,0.6)]">
                {formatUSDExact(value, 0)}
            </span>
        </div>
    );
}

interface CategoryListProps {
    categories: Array<{ name: string; totalTvl: number }>;
    maxItems?: number;
}

/**
 * Category List Component
 * Displays a list of categories with TVL values
 */
export function CategoryList({ categories, maxItems = 6 }: CategoryListProps) {
    return (
        <div className="space-y-3">
            {categories.slice(0, maxItems).map((category) => (
                <CategoryRow key={category.name} name={category.name} value={category.totalTvl} />
            ))}
        </div>
    );
}
