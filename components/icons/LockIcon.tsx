interface IconProps {
    className?: string;
}

export default function LockIcon({ className = '' }: IconProps) {
    return (
        <div className={`icon-orange-outline ${className}`}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="6" width="10" height="7" rx="1.5" stroke="#f97316" strokeWidth="1.5" fill="none" />
                <path d="M3 6V4a3 3 0 116 0v2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
        </div>
    );
}
