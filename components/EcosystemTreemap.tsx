'use client';

import { useMemo, useState } from 'react';
import { formatUSDExact, formatPercent } from '@/lib/utils/format';
import Card from './Card';

// ============================================
// TYPES
// ============================================

export interface TreemapItem {
    name: string;
    value: number; // TVL or Volume
    change24h?: number;
    category?: string;
    color?: string;
}

export interface TreemapNode extends TreemapItem {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface EcosystemTreemapProps {
    data: TreemapItem[];
    title?: string;
    height?: number;
    onItemClick?: (item: TreemapItem) => void;
}

// ============================================
// COLOR PALETTES
// ============================================

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    dexs: { bg: '#064e3b', border: '#065f46', text: '#ffff' },       // emerald-900/800
    lending: { bg: '#4c1d95', border: '#5b21b6', text: '#ffff' },    // violet-900/800
    staking: { bg: '#164e63', border: '#155e75', text: '#ffff' },    // cyan-900/800
    nft: { bg: '#831843', border: '#9d174d', text: '#ffff' },        // pink-900/800
    bridges: { bg: '#312e81', border: '#3730a3', text: '#ffff' },    // indigo-900/800
    yield: { bg: '#713f12', border: '#854d0e', text: '#ffff' },      // yellow-900/800
    perpetuals: { bg: '#7c2d12', border: '#9a3412', text: '#ffff' }, // orange-900/800
    derivatives: { bg: '#7f1d1d', border: '#991b1b', text: '#ffff' },// red-900/800
    default: { bg: '#1f2937', border: '#374151', text: '#9ca3af' },  // gray-800/700
};

// Get color based on performance change
function getChangeColors(change?: number) {
    if (change === undefined || change === null) return CATEGORY_COLORS.default;
    // Solid colors for heatmap
    if (change >= 5) return { bg: '#16a34a', border: '#22c55e', text: '#ffffff' };  // green-600
    if (change >= 0) return { bg: '#064e3b', border: '#065f46', text: '#e2e8f0' };  // green-900 (darker for small gains)
    if (change >= -5) return { bg: '#450a0a', border: '#7f1d1d', text: '#e2e8f0' }; // red-950 (darker for small losses)
    return { bg: '#b91c1c', border: '#dc2626', text: '#ffffff' };                   // red-700
}

// ============================================
// TREEMAP LAYOUT ALGORITHM (Squarified)
// ============================================

function squarify(
    items: TreemapItem[],
    containerWidth: number,
    containerHeight: number,
    x: number = 0,
    y: number = 0
): TreemapNode[] {
    if (items.length === 0) return [];

    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return [];

    const nodes: TreemapNode[] = [];
    let remainingItems = [...items].sort((a, b) => b.value - a.value);
    let currentX = x;
    let currentY = y;
    let remainingWidth = containerWidth;
    let remainingHeight = containerHeight;
    let remainingValue = totalValue;

    while (remainingItems.length > 0) {
        const isHorizontal = remainingWidth >= remainingHeight;
        const side = isHorizontal ? remainingHeight : remainingWidth;

        // Find best row
        let row: TreemapItem[] = [];
        let rowValue = 0;
        let bestRatio = Infinity;

        for (let i = 0; i < remainingItems.length; i++) {
            const testRow = remainingItems.slice(0, i + 1);
            const testValue = testRow.reduce((sum, item) => sum + item.value, 0);
            const testSize = (testValue / remainingValue) * (isHorizontal ? remainingWidth : remainingHeight);

            // Calculate worst aspect ratio in this row
            let worstRatio = 0;
            for (const item of testRow) {
                const itemSize = (item.value / testValue) * side;
                const ratio = Math.max(testSize / itemSize, itemSize / testSize);
                worstRatio = Math.max(worstRatio, ratio);
            }

            if (worstRatio <= bestRatio) {
                bestRatio = worstRatio;
                row = testRow;
                rowValue = testValue;
            } else {
                break;
            }
        }

        // Layout the row
        const rowSize = (rowValue / remainingValue) * (isHorizontal ? remainingWidth : remainingHeight);
        let offset = 0;

        for (const item of row) {
            const itemSize = (item.value / rowValue) * side;

            nodes.push({
                ...item,
                x: isHorizontal ? currentX : currentX + offset,
                y: isHorizontal ? currentY + offset : currentY,
                width: isHorizontal ? rowSize : itemSize,
                height: isHorizontal ? itemSize : rowSize,
            });

            offset += itemSize;
        }

        // Update remaining space
        if (isHorizontal) {
            currentX += rowSize;
            remainingWidth -= rowSize;
        } else {
            currentY += rowSize;
            remainingHeight -= rowSize;
        }

        remainingItems = remainingItems.slice(row.length);
        remainingValue -= rowValue;
    }

    return nodes;
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

interface TooltipProps {
    item: TreemapNode | null;
    x: number;
    y: number;
}

function Tooltip({ item, x, y }: TooltipProps) {
    if (!item) return null;

    const changeColor = item.change24h && item.change24h >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]';

    // Determine if cursor is on the right half of the screen
    const isRightSide = typeof window !== 'undefined' ? x > window.innerWidth / 2 : false;

    return (
        <div
            className="fixed z-50 pointer-events-none transition-transform duration-75"
            style={{
                left: x,
                top: y + 12,
                transform: isRightSide ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            }}
        >
            <div className="bg-[rgba(10,10,10,0.95)] backdrop-blur-lg border border-[rgba(255,255,255,0.15)] rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white font-medium text-sm">{item.name}</p>
                <p className="text-[#9ca3af] text-xs mt-1">{formatUSDExact(item.value)}</p>
                {item.change24h !== undefined && (
                    <p className={`text-xs mt-0.5 ${changeColor}`}>
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}% (24h)
                    </p>
                )}
                {item.category && (
                    <p className="text-[rgba(255,255,255,0.4)] text-xs mt-1 capitalize">{item.category}</p>
                )}
            </div>
        </div>
    );
}

// ============================================
// TREEMAP ITEM COMPONENT
// ============================================

interface TreemapItemComponentProps {
    node: TreemapNode;
    colorMode: 'category' | 'performance';
    onHover: (node: TreemapNode | null, e: React.MouseEvent) => void;
    onClick?: (item: TreemapItem) => void;
}

function TreemapItemComponent({ node, colorMode, onHover, onClick }: TreemapItemComponentProps) {
    const colors = colorMode === 'performance'
        ? getChangeColors(node.change24h)
        : CATEGORY_COLORS[node.category || 'default'] || CATEGORY_COLORS.default;

    const showLabel = node.width > 60 && node.height > 40;
    const showValue = node.width > 80 && node.height > 55;
    const showChange = node.width > 100 && node.height > 70 && node.change24h !== undefined;

    return (
        <div
            className="absolute transition-all duration-200 cursor-pointer group"
            style={{
                left: node.x,
                top: node.y,
                width: node.width - 2,
                height: node.height - 2,
                background: colors.bg,
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => onHover(node, e)}
            onMouseMove={(e) => onHover(node, e)}
            onMouseLeave={() => onHover(null, {} as React.MouseEvent)}
            onClick={() => onClick?.(node)}
        >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors rounded-[5px]" />

            {/* Content */}
            <div className="relative h-full p-2 flex flex-col justify-center overflow-hidden">
                {showLabel && (
                    <p
                        className="font-medium text-white truncate leading-tight"
                        style={{ fontSize: node.width > 120 ? '13px' : '11px' }}
                    >
                        {node.name}
                    </p>
                )}
                {showValue && (
                    <p
                        className="text-[rgba(255,255,255,0.7)] truncate leading-tight mt-0.5"
                        style={{ fontSize: node.width > 120 ? '11px' : '10px' }}
                    >
                        {formatUSDExact(node.value)}
                    </p>
                )}
                {showChange && (
                    <p
                        className={`leading-tight mt-0.5 ${node.change24h! >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}
                        style={{ fontSize: '10px' }}
                    >
                        {node.change24h! >= 0 ? '+' : ''}{node.change24h!.toFixed(1)}%
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================
// MAIN TREEMAP COMPONENT
// ============================================

export function EcosystemTreemap({
    data,
    title = 'Market Overview',
    height = 400,
    onItemClick,
}: EcosystemTreemapProps) {
    const [hoveredItem, setHoveredItem] = useState<TreemapNode | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [colorMode, setColorMode] = useState<'category' | 'performance'>('performance');
    const [containerWidth, setContainerWidth] = useState(800);

    // Calculate treemap layout
    const nodes = useMemo(() => {
        if (data.length === 0) return [];
        return squarify(data, containerWidth, height);
    }, [data, containerWidth, height]);

    // Handle hover
    const handleHover = (node: TreemapNode | null, e: React.MouseEvent) => {
        setHoveredItem(node);
        if (node) {
            setMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    // Total value for stats
    const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const avgChange = useMemo(() => {
        const changes = data.filter(item => item.change24h !== undefined).map(item => item.change24h!);
        return changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;
    }, [data]);

    return (
        <Card className="p-6" hover={false} blobIntensity="subtle">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="text-white/50 text-xs mt-1">
                        {data.length} protocols • Total: {formatUSDExact(totalValue)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Color Mode Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setColorMode('performance')}
                            className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${colorMode === 'performance'
                                ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                                : 'text-white/50 hover:text-white'
                                }`}
                        >
                            Performance
                        </button>
                        <button
                            onClick={() => setColorMode('category')}
                            className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${colorMode === 'category'
                                ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30'
                                : 'text-white/50 hover:text-white'
                                }`}
                        >
                            Category
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex gap-6 mb-4 text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Avg 24h:</span>
                    <span className={`font-semibold ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Top:</span>
                    <span className="text-white font-medium">{data[0]?.name || '-'}</span>
                </div>
            </div>

            {/* Treemap Container */}
            <div
                className="relative bg-black/30 rounded-xl overflow-hidden ring-1 ring-white/5"
                style={{ height }}
                ref={(el) => {
                    if (el && el.offsetWidth !== containerWidth) {
                        setContainerWidth(el.offsetWidth);
                    }
                }}
            >
                {nodes.map((node, index) => (
                    <TreemapItemComponent
                        key={`${node.name}-${index}`}
                        node={node}
                        colorMode={colorMode}
                        onHover={handleHover}
                        onClick={onItemClick}
                    />
                ))}

                {/* Empty state */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                        No data available
                    </div>
                )}
            </div>

            {/* Legend */}
            {colorMode === 'performance' && (
                <div className="flex items-center justify-center gap-6 mt-5 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ background: '#16a34a', border: '1px solid #22c55e' }} />
                        <span className="text-white/40">+5% or more</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ background: '#064e3b', border: '1px solid #065f46' }} />
                        <span className="text-white/40">0% to +5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ background: '#450a0a', border: '1px solid #7f1d1d' }} />
                        <span className="text-white/40">0% to -5%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded" style={{ background: '#b91c1c', border: '1px solid #dc2626' }} />
                        <span className="text-white/40">-5% or more</span>
                    </div>
                </div>
            )}

            {colorMode === 'category' && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs">
                    {Object.entries(CATEGORY_COLORS).slice(0, 6).map(([category, colors]) => (
                        <div key={category} className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded"
                                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                            />
                            <span className="text-white/40 capitalize">{category}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Tooltip */}
            <Tooltip item={hoveredItem} x={mousePos.x} y={mousePos.y} />
        </Card>
    );
}

export default EcosystemTreemap;
