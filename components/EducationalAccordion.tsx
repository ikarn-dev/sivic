'use client';

import { useState, useCallback } from 'react';
import { GlassContainerCard } from '@/components/Card';

interface FAQItem {
    question: string;
    answer: string;
    category?: 'basics' | 'protection' | 'advanced';
}

interface EducationalAccordionProps {
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
        answer: 'MEV can result in: (1) Higher costs - you may pay more than expected for swaps, (2) Failed transactions - your transaction might fail if conditions change, (3) Worse prices - sandwich attacks can move prices against you.',
    },
    {
        category: 'basics',
        question: 'What is a sandwich attack?',
        answer: 'A sandwich attack occurs when a bot detects your pending swap, places a buy order before yours (front-run), waits for your transaction to execute (pushing the price up), then immediately sells (back-run). The attacker profits from the price difference.',
    },
    {
        category: 'protection',
        question: 'How can I protect myself from MEV?',
        answer: 'Key strategies: (1) Use private RPC endpoints, (2) Set appropriate slippage (0.5-1%), (3) Use DEX aggregators with MEV protection like Jupiter, (4) Split large trades into smaller chunks, (5) Avoid high congestion periods.',
    },
    {
        category: 'protection',
        question: 'What slippage tolerance should I use?',
        answer: 'For most trades, 0.5-1% slippage is recommended. Lower slippage (0.1-0.3%) may cause failures but offers better protection. Higher slippage (2-5%) increases MEV risk but ensures execution.',
    },
    {
        category: 'protection',
        question: 'What are private/protected RPC endpoints?',
        answer: 'Private RPC endpoints send your transactions directly to validators without broadcasting to public mempools. This prevents MEV bots from seeing and front-running your transactions.',
    },
    {
        category: 'advanced',
        question: 'How does Solana\'s architecture affect MEV?',
        answer: 'Unlike Ethereum, Solana doesn\'t have a traditional mempool. However, MEV still exists through transaction propagation delays, parallel processing, and priority fees affecting ordering.',
    },
    {
        category: 'advanced',
        question: 'What is Jito and how does it help?',
        answer: 'Jito is a MEV infrastructure on Solana that provides bundle transactions, backrun auctions, and private transaction sending. Using Jito-enabled wallets can significantly reduce MEV exposure.',
    },
    {
        category: 'advanced',
        question: 'Why does MEV increase during high congestion?',
        answer: 'High congestion creates more MEV opportunities because transaction queues are longer, priority fee competition makes ordering manipulable, and price volatility increases during congestion.',
    },
];

/**
 * Educational Accordion Component
 * Optimized for smooth mobile animations with no jitter
 */
export function EducationalAccordion({
    items = defaultFAQItems,
    className = '',
}: EducationalAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'protection' | 'advanced'>('all');

    const toggleItem = useCallback((index: number) => {
        setOpenIndex(prev => prev === index ? null : index);
    }, []);

    const filteredItems = activeCategory === 'all'
        ? items
        : items.filter(item => item.category === activeCategory);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'basics': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            case 'protection': return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'advanced': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'basics': return 'Basics';
            case 'protection': return 'Protection';
            case 'advanced': return 'Advanced';
            default: return category;
        }
    };

    return (
        <GlassContainerCard
            title="MEV Education & FAQ"
            className={className}
            style={{ transition: 'none' }}
        >
            <div className="space-y-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    {(['all', 'basics', 'protection', 'advanced'] as const).map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setOpenIndex(null);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 ${activeCategory === category
                                ? 'bg-[#f97316] border-[#f97316] text-white'
                                : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:border-[rgba(255,255,255,0.2)]'
                                }`}
                        >
                            {category === 'all' ? 'All Topics' : getCategoryLabel(category)}
                        </button>
                    ))}
                </div>

                {/* FAQ Items - Optimized */}
                <div className="space-y-2">
                    {filteredItems.map((item, index) => {
                        const isOpen = openIndex === index;
                        const originalIndex = items.indexOf(item);

                        return (
                            <div
                                key={originalIndex}
                                className="border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden will-change-auto"
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full flex items-center justify-between p-3 sm:p-4 text-left bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                        {item.category && (
                                            <span className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium rounded border shrink-0 ${getCategoryColor(item.category)}`}>
                                                {item.category.toUpperCase()}
                                            </span>
                                        )}
                                        <span className="text-xs sm:text-sm text-white font-medium truncate">
                                            {item.question}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 sm:w-5 sm:h-5 text-[rgba(255,255,255,0.4)] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Answer Content - Optimized CSS Grid Animation */}
                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="p-3 sm:p-4 pt-0 border-t border-[rgba(255,255,255,0.06)]">
                                            <p className="text-xs sm:text-sm text-[rgba(255,255,255,0.7)] leading-relaxed mt-2 sm:mt-3">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-[rgba(255,255,255,0.4)] text-sm">
                        No items found in this category
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <p className="text-[10px] sm:text-xs text-[rgba(255,255,255,0.3)] text-center">
                        Understanding MEV is the first step to protecting your transactions
                    </p>
                </div>
            </div>
        </GlassContainerCard>
    );
}

export default EducationalAccordion;
