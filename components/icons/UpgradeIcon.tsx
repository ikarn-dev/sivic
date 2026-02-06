interface IconProps {
    className?: string;
}

export default function UpgradeIcon({ className = '' }: IconProps) {
    return (
        <div className={`icon-orange-outline ${className}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5" stroke="#f97316" strokeWidth="1.5" fill="none" />
                <path d="M7 4v6M4.5 7l2.5-2.5L9.5 7" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
