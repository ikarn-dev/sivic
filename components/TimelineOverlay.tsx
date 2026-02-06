'use client';

import { useEffect, useState, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface TimelineStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    duration?: number;
    data?: any;
    error?: string;
}

// ============================================
// NOISE TEXTURE COMPONENT
// ============================================

const NoiseTexture = () => (
    <>
        {/* Fine grain noise texture */}
        <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                zIndex: 1
            }}
        />
        {/* Coarse grain texture layer */}
        <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise2)'/%3E%3C/svg%3E")`,
                zIndex: 1
            }}
        />
    </>
);

// ============================================
// HORIZONTAL STEP INDICATOR
// ============================================

function HorizontalStepIndicator({
    step,
    index,
    totalSteps,
    isActive
}: {
    step: TimelineStep;
    index: number;
    totalSteps: number;
    isActive: boolean;
}) {
    return (
        <div
            className={`flex flex-col items-center relative flex-shrink-0 transition-all duration-500 ease-out ${isActive ? 'scale-110' : 'scale-100'
                }`}
            style={{ width: '100px' }}
        >
            {/* Connector line to next step */}
            {index < totalSteps - 1 && (
                <div
                    className={`absolute top-3 left-[calc(50%+12px)] h-[2px] transition-all duration-500 ease-out ${step.status === 'complete' ? 'bg-white/40' : 'bg-white/10'
                        }`}
                    style={{ width: 'calc(100px - 24px + 16px)' }}
                />
            )}

            {/* Status Circle with smooth animation */}
            <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${step.status === 'complete' ? 'bg-white/20 border border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]' :
                    step.status === 'running' ? 'bg-white/10 border-2 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                        step.status === 'error' ? 'bg-white/10 border border-white/30' :
                            'bg-white/5 border border-white/15'
                    }`}
            >
                {step.status === 'complete' && (
                    <svg className="w-3 h-3 text-white animate-in fade-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {step.status === 'running' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                {step.status === 'error' && (
                    <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                {step.status === 'pending' && (
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                )}
            </div>

            {/* Step Name */}
            <div className="mt-2 text-center w-full px-1">
                <p className={`text-xs font-medium truncate transition-all duration-500 ${step.status === 'complete' ? 'text-white' :
                    step.status === 'running' ? 'text-white/90' :
                        step.status === 'error' ? 'text-white/60' :
                            'text-white/40'
                    }`}>
                    {step.name.replace(/\(.*\)/, '').trim()}
                </p>
                {step.duration !== undefined && (
                    <p className="text-[10px] text-white/40 mt-0.5 transition-opacity duration-300">
                        {step.duration}ms
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================
// VERTICAL STEP INDICATOR (FOR MOBILE)
// ============================================

function VerticalStepIndicator({
    step,
    index,
    totalSteps,
    isActive
}: {
    step: TimelineStep;
    index: number;
    totalSteps: number;
    isActive: boolean;
}) {
    return (
        <div
            className={`flex items-start gap-3 relative transition-all duration-500 ease-out ${isActive ? 'scale-[1.02]' : 'scale-100'
                }`}
        >
            {/* Connector line to next step */}
            {index < totalSteps - 1 && (
                <div
                    className={`absolute left-3 top-7 w-[2px] h-[calc(100%+8px)] transition-all duration-500 ease-out ${step.status === 'complete' ? 'bg-white/40' : 'bg-white/10'
                        }`}
                />
            )}

            {/* Status Circle with smooth animation */}
            <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-out ${step.status === 'complete' ? 'bg-white/20 border border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]' :
                    step.status === 'running' ? 'bg-white/10 border-2 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                        step.status === 'error' ? 'bg-white/10 border border-white/30' :
                            'bg-white/5 border border-white/15'
                    }`}
            >
                {step.status === 'complete' && (
                    <svg className="w-3 h-3 text-white animate-in fade-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {step.status === 'running' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                {step.status === 'error' && (
                    <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
                {step.status === 'pending' && (
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                )}
            </div>

            {/* Step Info */}
            <div className="flex-1 pb-4">
                <p className={`text-sm font-medium transition-all duration-500 ${step.status === 'complete' ? 'text-white' :
                    step.status === 'running' ? 'text-white/90' :
                        step.status === 'error' ? 'text-white/60' :
                            'text-white/40'
                    }`}>
                    {step.name.replace(/\(.*\)/, '').trim()}
                </p>
                {step.duration !== undefined && (
                    <p className="text-xs text-white/40 mt-0.5 transition-opacity duration-300">
                        {step.duration}ms
                    </p>
                )}
            </div>
        </div>
    );
}

// ============================================
// TIMELINE OVERLAY COMPONENT
// ============================================

interface TimelineOverlayProps {
    isVisible: boolean;
    steps: TimelineStep[];
    totalDuration: number;
    isAnalyzing: boolean;
    onClose?: () => void;
    paramsChecked?: number;
    paramsTriggered?: number;
    detectionMode?: 'token' | 'dex';
}

export function TimelineOverlay({
    isVisible,
    steps,
    totalDuration,
    isAnalyzing,
    onClose,
    paramsChecked = 0,
    paramsTriggered = 0,
    detectionMode
}: TimelineOverlayProps) {
    const totalParams = detectionMode === 'token' ? 31 : detectionMode === 'dex' ? 31 : 0;
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeStepIndex, setActiveStepIndex] = useState(-1);

    // Track active step for animations
    useEffect(() => {
        const runningIndex = steps.findIndex(s => s.status === 'running');
        if (runningIndex !== -1) {
            setActiveStepIndex(runningIndex);
        }
    }, [steps]);

    // Auto-scroll to active step on larger screens
    useEffect(() => {
        if (scrollContainerRef.current && activeStepIndex !== -1) {
            const container = scrollContainerRef.current;
            const stepWidth = 116; // 100px width + 16px gap
            const scrollPosition = activeStepIndex * stepWidth - (container.clientWidth / 2) + (stepWidth / 2);

            container.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: 'smooth'
            });
        }
    }, [activeStepIndex]);

    // Handle close with animation
    const handleClose = () => {
        if (!isAnalyzing && onClose) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setIsAnimatingOut(false);
                onClose();
            }, 300);
        }
    };

    // Auto-close after analysis completes (with delay)
    useEffect(() => {
        if (!isAnalyzing && steps.length > 0 && steps.every(s => s.status === 'complete' || s.status === 'error')) {
            const timer = setTimeout(() => {
                handleClose();
            }, 2000); // Close 2 seconds after completion
            return () => clearTimeout(timer);
        }
    }, [isAnalyzing, steps]);

    if (!isVisible) return null;

    const completedSteps = steps.filter(s => s.status === 'complete').length;
    const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-8 px-4 transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Timeline Card */}
            <div
                className={`relative w-full max-w-4xl mx-auto transition-all duration-300 ${isAnimatingOut ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                {/* Card Container with matte black bg */}
                <div
                    className="relative overflow-hidden rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #080808 100%)',
                        border: '0.5px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                    }}
                >
                    {/* Noise Texture */}
                    <NoiseTexture />

                    {/* Content */}
                    <div className="relative z-10 p-4 sm:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isAnalyzing ? 'bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/40'
                                    }`} />
                                <h3 className="text-white font-semibold text-sm sm:text-base">Analysis Timeline</h3>
                                {detectionMode && (
                                    <span className="px-2 py-0.5 rounded text-xs uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                        {detectionMode}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                {/* Param Count Display */}
                                {totalParams > 0 && (
                                    <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
                                        <span className="text-white/40">Params:</span>
                                        <span className="text-white/70 font-mono">{paramsChecked}/{totalParams}</span>
                                        {paramsTriggered > 0 && (
                                            <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                                                {paramsTriggered} triggered
                                            </span>
                                        )}
                                    </div>
                                )}
                                <span className="text-white/50 text-xs sm:text-sm">
                                    {(totalDuration / 1000).toFixed(1)}s
                                </span>
                                {!isAnalyzing && (
                                    <button
                                        onClick={handleClose}
                                        className="text-white/40 hover:text-white transition-colors p-1"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 sm:mb-6">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white/40 transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-white/40 text-xs mt-2 text-right">
                                {completedSteps} of {steps.length} steps complete
                            </p>
                        </div>

                        {/* Horizontal Timeline - Hidden on mobile */}
                        <div
                            ref={scrollContainerRef}
                            className="hidden sm:block overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255,255,255,0.2) transparent'
                            }}
                        >
                            <div
                                className="flex gap-4 px-4"
                                style={{
                                    width: 'max-content',
                                    paddingRight: '40px' // Extra padding on the right to prevent cropping
                                }}
                            >
                                {steps.map((step, index) => (
                                    <HorizontalStepIndicator
                                        key={step.id}
                                        step={step}
                                        index={index}
                                        totalSteps={steps.length}
                                        isActive={index === activeStepIndex}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Vertical Timeline - Visible only on mobile */}
                        <div className="sm:hidden max-h-[50vh] overflow-y-auto pr-2">
                            <div className="space-y-2">
                                {steps.map((step, index) => (
                                    <VerticalStepIndicator
                                        key={step.id}
                                        step={step}
                                        index={index}
                                        totalSteps={steps.length}
                                        isActive={index === activeStepIndex}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Current Step Detail */}
                        {isAnalyzing && steps.find(s => s.status === 'running') && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="text-white/70 text-xs sm:text-sm">
                                        {steps.find(s => s.status === 'running')?.name}...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TimelineOverlay;
