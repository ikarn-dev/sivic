'use client';

interface IconProps {
    active?: boolean;
    className?: string;
}

// Analytics chart icon for Ecosystem Analytics page
export default function AnalyticsIcon({ active = false, className = '' }: IconProps) {
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
                d="M18 20V10M12 20V4M6 20v-6"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 3v18h18"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
