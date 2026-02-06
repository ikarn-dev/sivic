'use client';

interface IconProps {
    active?: boolean;
    className?: string;
}

// Dashboard grid icon for Overview page
export default function DashboardIcon({ active = false, className = '' }: IconProps) {
    const color = active ? '#f97316' : '#9ca3af';

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill={color} />
            <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" fill={color} />
            <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" fill={color} />
            <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" fill={color} />
        </svg>
    );
}
