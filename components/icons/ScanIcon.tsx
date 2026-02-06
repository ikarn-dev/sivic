'use client';

interface IconProps {
    active?: boolean;
    className?: string;
}

// Magnifying glass/scan icon for MEV Shield page
export default function ScanIcon({ active = false, className = '' }: IconProps) {
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
            <circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth="1.5" fill="none" />
            <line x1="12" y1="12" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
