'use client';

interface IconProps {
    active?: boolean;
    className?: string;
}

// Briefcase icon for Audit Providers page
export default function BriefcaseIcon({ active = false, className = '' }: IconProps) {
    const color = active ? '#f97316' : '#9ca3af';

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2 12h20"
                stroke={color}
                strokeWidth="1.5"
            />
            <circle
                cx="12"
                cy="12"
                r="2"
                stroke={color}
                strokeWidth="1.5"
            />
        </svg>
    );
}
