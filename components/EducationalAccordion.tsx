'use client';

import { useState } from 'react';
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

/**
 * Educational Accordion Component
 * Expandable FAQ section for MEV education
 */
export function EducationalAccordion({
    items = defaultFAQItems,
    className = '',
}: EducationalAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'protection' | 'advanced'>('all');

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
        <GlassContainerCard title="MEV Education & FAQ" className={className}>
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
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${activeCategory === category
                                ? 'bg-[#f97316] border-[#f97316] text-white'
                                : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)] hover:border-[rgba(255,255,255,0.2)]'
                                }`}
                        >
                            {category === 'all' ? 'All Topics' : getCategoryLabel(category)}
                        </button>
                    ))}
                </div>

                {/* FAQ Items */}
                <div className="space-y-2">
                    {filteredItems.map((item, index) => {
                        const isOpen = openIndex === index;
                        const originalIndex = items.indexOf(item);

                        return (
                            <div
                                key={originalIndex}
                                className="border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden"
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {item.category && (
                                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getCategoryColor(item.category)}`}>
                                                {item.category.toUpperCase()}
                                            </span>
                                        )}
                                        <span className="text-sm text-white font-medium">
                                            {item.question}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-[rgba(255,255,255,0.4)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Answer Content - Using grid for smooth animation */}
                                <div
                                    className="grid transition-all duration-300 ease-out"
                                    style={{
                                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                                    }}
                                >
                                    <div className="overflow-hidden">
                                        <div className="p-4 pt-0 border-t border-[rgba(255,255,255,0.06)]">
                                            <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed mt-3">
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
                    <div className="text-center py-8 text-[rgba(255,255,255,0.4)]">
                        No items found in this category
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <p className="text-xs text-[rgba(255,255,255,0.3)] text-center">
                        Understanding MEV is the first step to protecting your transactions
                    </p>
                </div>
            </div>
        </GlassContainerCard>
    );
}

export default EducationalAccordion;
