import React from 'react';

interface DatabaseIconProps {
    active?: boolean;
}

export const DatabaseIcon: React.FC<DatabaseIconProps> = ({ active = false }) => {
    const color = active ? '#f97316' : '#9ca3af';

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Database cylinder */}
            <ellipse
                cx="12"
                cy="5"
                rx="8"
                ry="3"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <path
                d="M4 5v14c0 1.657 3.582 3 8 3s8-1.343 8-3V5"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M4 12c0 1.657 3.582 3 8 3s8-1.343 8-3"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Warning indicator */}
            {active && (
                <circle
                    cx="18"
                    cy="18"
                    r="4"
                    fill="#f97316"
                    stroke="#0a0a0a"
                    strokeWidth="1"
                />
            )}
        </svg>
    );
};

export default DatabaseIcon;
