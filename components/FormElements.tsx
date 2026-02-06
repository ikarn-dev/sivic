'use client';

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

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: Array<{ value: string; label: string }>;
}

/**
 * Form Select Component
 * Styled select with optional label
 */
export function FormSelect({ label, options, ...props }: FormSelectProps) {
    return (
        <div>
            {label && (
                <label className="text-xs text-[rgba(255,255,255,0.4)] mb-1 block">{label}</label>
            )}
            <select
                {...props}
                className={`w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[#f97316] transition-colors ${props.className || ''}`}
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
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
            className={`py-2 px-4 text-sm md:py-2.5 md:px-5 md:text-base rounded-lg bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${props.className || ''}`}
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
            className={`py-2 px-4 text-sm md:py-2.5 md:px-5 md:text-base rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${props.className || ''}`}
        >
            {children}
        </button>
    );
}
