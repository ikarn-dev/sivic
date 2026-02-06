'use client';

interface IconProps {
    active?: boolean;
    className?: string;
}

// Checklist icon for Pre-Audit Checklist page
export default function ChecklistIcon({ active = false, className = '' }: IconProps) {
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
            <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect
                x="9"
                y="3"
                width="6"
                height="4"
                rx="1"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M9 12l2 2 4-4"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 17h6"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
