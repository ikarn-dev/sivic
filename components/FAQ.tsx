'use client';

import { useState, useRef, useEffect } from 'react';
import { GlassContainerCard } from '@/components/Card';

interface FAQItem {
    question: string;
    answer: string;
    category?: 'basics' | 'protection' | 'advanced';
}

interface FAQProps {
    items?: FAQItem[];
    className?: string;
}

// Default MEV educational content
const defaultFAQItems: FAQItem[] = [
    {
        category: 'basics',
        question: 'What is MEV (Maximal Extractable Value)?',
        answer: 'MEV refers to the maximum value that can be extracted from block production beyond standard block rewards and gas fees. On Solana, this typically involves validators or bots reordering, inserting, or censoring transactions within a block to capture profit at the expense of regular users.',
    },
    {
        category: 'basics',
        question: 'How does MEV affect my transactions?',
        answer: 'MEV can result in: (1) Higher costs - you may pay more than expected for swaps, (2) Failed transactions - your transaction might fail if conditions change, (3) Worse prices - sandwich attacks can move prices against you. The impact is most significant for large DEX trades during high network activity.',
    },
    {
        category: 'basics',
        question: 'What is a sandwich attack?',
        answer: 'A sandwich attack occurs when a bot detects your pending swap, places a buy order before yours (front-run), waits for your transaction to execute (pushing the price up), then immediately sells (back-run). The attacker profits from the price difference while you receive a worse price than expected.',
    },
    {
        category: 'protection',
        question: 'How can I protect myself from MEV?',
        answer: 'Key protection strategies: (1) Use private RPC endpoints that don\'t broadcast to public mempools, (2) Set appropriate slippage tolerance (0.5-1% for most trades), (3) Use DEX aggregators with MEV protection like Jupiter, (4) Split large trades into smaller chunks, (5) Avoid trading during high congestion periods.',
    },
    {
        category: 'protection',
        question: 'What slippage tolerance should I use?',
        answer: 'For most trades, 0.5-1% slippage is recommended. Lower slippage (0.1-0.3%) may cause transaction failures but offers better protection. Higher slippage (2-5%) increases MEV risk but ensures execution. For volatile tokens or low liquidity pairs, higher slippage may be necessary.',
    },
    {
        category: 'protection',
        question: 'What are private/protected RPC endpoints?',
        answer: 'Private RPC endpoints send your transactions directly to validators without broadcasting to public mempools. This prevents MEV bots from seeing and front-running your transactions. Services like Jito, Helius, and dedicated validator connections offer this protection.',
    },
    {
        category: 'advanced',
        question: 'How does Solana\'s architecture affect MEV?',
        answer: 'Unlike Ethereum, Solana doesn\'t have a traditional mempool due to its leader-based consensus. However, MEV still exists through: (1) Transaction propagation delays, (2) Parallel transaction processing, (3) Priority fees affecting ordering. Solana\'s speed actually reduces some MEV opportunities but creates others.',
    },
    {
        category: 'advanced',
        question: 'What is Jito and how does it help?',
        answer: 'Jito is a MEV infrastructure on Solana that provides: (1) Bundle transactions - group transactions atomically, (2) Backrun auctions - redirect MEV to users/protocols, (3) Private transaction sending. Using Jito-enabled wallets and DEXes can significantly reduce MEV exposure.',
    },
    {
        category: 'advanced',
        question: 'Why does MEV increase during high congestion?',
        answer: 'High congestion creates more MEV opportunities because: (1) Transaction queues are longer, giving bots more time to analyze, (2) Priority fee competition makes ordering manipulable, (3) Price volatility increases during congestion, (4) Failed transactions create additional arbitrage opportunities.',
    },
];

// Animated Plus/Minus Icon
const ExpandIcon = ({ isOpen }: { isOpen: boolean }) => (
    <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Glow effect */}
        <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${isOpen ? 'bg-orange-500/20 scale-125' : 'bg-white/5 scale-100'
                }`}
        />

        {/* Circle border */}
        <div
            className={`absolute inset-0 rounded-full border transition-all duration-300 ${isOpen ? 'border-orange-500/50' : 'border-white/20'
                }`}
        />

        {/* Horizontal line */}
        <div
            className={`absolute w-3 h-[2px] rounded-full transition-all duration-300 ${isOpen ? 'bg-orange-400' : 'bg-white/60'
                }`}
        />

        {/* Vertical line (animates to hidden when open) */}
        <div
            className={`absolute w-[2px] h-3 rounded-full transition-all duration-300 ${isOpen
                    ? 'bg-orange-400 rotate-90 opacity-0 scale-0'
                    : 'bg-white/60 rotate-0 opacity-100 scale-100'
                }`}
        />
    </div>
);

// Individual FAQ Item Component
const FAQItemComponent = ({
    item,
    isOpen,
    onToggle,
    index
}: {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [item.answer]);

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'basics':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-400',
                    glow: 'shadow-blue-500/20'
                };
            case 'protection':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-400',
                    glow: 'shadow-emerald-500/20'
                };
            case 'advanced':
                return {
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/30',
                    text: 'text-purple-400',
                    glow: 'shadow-purple-500/20'
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/30',
                    text: 'text-gray-400',
                    glow: 'shadow-gray-500/20'
                };
        }
    };

    const categoryStyles = item.category ? getCategoryStyles(item.category) : getCategoryStyles('default');

    return (
        <div
            className="group"
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeSlideIn 0.4s ease-out forwards'
            }}
        >
            <style jsx>{`
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* FAQ Item Container */}
            <div
                className={`relative overflow-hidden rounded-xl transition-all duration-500 ease-out ${isOpen
                        ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg'
                        : 'bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                style={{
                    border: isOpen
                        ? '1px solid rgba(255, 255, 255, 0.15)'
                        : '1px solid rgba(255, 255, 255, 0.06)'
                }}
            >
                {/* Gradient border glow when open */}
                {isOpen && (
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, transparent 50%, rgba(249, 115, 22, 0.05) 100%)'
                        }}
                    />
                )}

                {/* Question Header */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-all duration-300 cursor-pointer group/btn"
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Category Badge */}
                        {item.category && (
                            <span
                                className={`
                                    shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider 
                                    rounded-md border backdrop-blur-sm transition-all duration-300
                                    ${categoryStyles.bg} ${categoryStyles.border} ${categoryStyles.text}
                                    ${isOpen ? `shadow-lg ${categoryStyles.glow}` : ''}
                                `}
                            >
                                {item.category}
                            </span>
                        )}

                        {/* Question Text */}
                        <span
                            className={`
                                text-sm font-medium leading-relaxed transition-colors duration-300
                                ${isOpen ? 'text-white' : 'text-white/80 group-hover/btn:text-white'}
                            `}
                        >
                            {item.question}
                        </span>
                    </div>

                    {/* Expand Icon */}
                    <div className="shrink-0">
                        <ExpandIcon isOpen={isOpen} />
                    </div>
                </button>

                {/* Answer Content with Smooth Height Animation */}
                <div
                    className="overflow-hidden transition-all duration-500 ease-out"
                    style={{
                        maxHeight: isOpen ? `${contentHeight + 40}px` : '0px',
                        opacity: isOpen ? 1 : 0
                    }}
                >
                    <div ref={contentRef} className="px-5 pb-5">
                        {/* Divider */}
                        <div
                            className="h-px mb-4 transition-all duration-500"
                            style={{
                                background: isOpen
                                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                                    : 'transparent'
                            }}
                        />

                        {/* Answer Text */}
                        <p
                            className="text-sm text-white/60 leading-relaxed pl-0 md:pl-[calc(2.5rem+1rem)]"
                            style={{
                                transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'transform 0.4s ease-out 0.1s'
                            }}
                        >
                            {item.answer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Premium FAQ Component
 * Modern accordion with smooth animations and premium design
 */
export function FAQ({
    items = defaultFAQItems,
    className = '',
}: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'protection' | 'advanced'>('all');

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredItems = activeCategory === 'all'
        ? items
        : items.filter(item => item.category === activeCategory);

    const categories = [
        { key: 'all', label: 'All Topics' },
        { key: 'basics', label: 'Basics' },
        { key: 'protection', label: 'Protection' },
        { key: 'advanced', label: 'Advanced' }
    ] as const;

    return (
        <GlassContainerCard title="MEV Education & FAQ" className={className}>
            <div className="space-y-6">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.key}
                            onClick={() => {
                                setActiveCategory(category.key);
                                setOpenIndex(null);
                            }}
                            className={`
                                relative px-4 py-2 text-xs font-semibold rounded-full 
                                transition-all duration-300 ease-out
                                ${activeCategory === category.key
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10'
                                }
                            `}
                        >
                            {/* Active background with glow */}
                            {activeCategory === category.key && (
                                <>
                                    <div
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                        style={{ zIndex: -1 }}
                                    />
                                    <div
                                        className="absolute inset-0 rounded-full bg-orange-500/40 blur-md"
                                        style={{ zIndex: -2, transform: 'scale(1.1)' }}
                                    />
                                </>
                            )}
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {filteredItems.map((item, index) => {
                        const originalIndex = items.indexOf(item);
                        return (
                            <FAQItemComponent
                                key={originalIndex}
                                item={item}
                                isOpen={openIndex === index}
                                onToggle={() => toggleItem(index)}
                                index={index}
                            />
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p className="text-sm">No items found in this category</p>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-xs text-white/30 text-center flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        Understanding MEV is the first step to protecting your transactions
                    </p>
                </div>
            </div>
        </GlassContainerCard>
    );
}

export default FAQ;
