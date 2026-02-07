'use client';

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

/**
 * Form Input Component
 * Styled input field with optional label
 */
export function FormInput({ label, ...props }: FormInputProps) {
    return (
        <div>
            {label && (
                <label className="text-xs text-[rgba(255,255,255,0.4)] mb-1 block">{label}</label>
            )}
            <input
                {...props}
                className={`w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#f97316] transition-colors ${props.className || ''}`}
            />
        </div>
    );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

/**
 * Form Textarea Component
 * Styled textarea with optional label
 */
export function FormTextarea({ label, ...props }: FormTextareaProps) {
    return (
        <div>
            {label && (
                <label className="text-xs text-[rgba(255,255,255,0.4)] mb-1 block">{label}</label>
            )}
            <textarea
                {...props}
                className={`w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#f97316] transition-colors resize-none ${props.className || ''}`}
            />
        </div>
    );
}

interface FormSelectProps {
    label?: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    className?: string;
}

/**
 * Form Select Component
 * Custom styled dropdown - dark themed, opens downward, hidden scrollbar
 */
export function FormSelect({ label, options, value, onChange, className }: FormSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || '');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with external value
    React.useEffect(() => {
        setSelectedValue(value || '');
    }, [value]);

    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || 'Select...';

    const handleSelect = (optValue: string) => {
        setSelectedValue(optValue);
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { value: optValue } });
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="text-xs text-[rgba(255,255,255,0.4)] mb-1 block">{label}</label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-left focus:outline-none focus:border-[#f97316] transition-colors flex items-center justify-between ${className || ''}`}
            >
                <span className={selectedValue ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'}>
                    {selectedLabel}
                </span>
                <svg
                    className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl overflow-hidden">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div
                            onClick={() => handleSelect('')}
                            className={`px-4 py-2.5 cursor-pointer transition-colors ${selectedValue === '' ? 'bg-[#f97316]/20 text-[#f97316]' : 'text-white/70 hover:bg-white/10'
                                }`}
                        >
                            Select...
                        </div>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-4 py-2.5 cursor-pointer transition-colors ${selectedValue === opt.value ? 'bg-[#f97316]/20 text-[#f97316]' : 'text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * Primary Button Component
 * Orange gradient button - compact and responsive
 */
export function PrimaryButton({ children, fullWidth = false, ...props }: PrimaryButtonProps) {
    return (
        <button
            {...props}
            className={`py-1.5 px-3 text-xs sm:py-2 sm:px-4 sm:text-sm rounded-lg bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${props.className || ''}`}
        >
            {children}
        </button>
    );
}

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * Secondary Button Component
 * Glass-style button - compact and responsive
 */
export function SecondaryButton({ children, fullWidth = false, ...props }: SecondaryButtonProps) {
    return (
        <button
            {...props}
            className={`py-1.5 px-3 text-xs sm:py-2 sm:px-4 sm:text-sm rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${props.className || ''}`}
        >
            {children}
        </button>
    );
}
