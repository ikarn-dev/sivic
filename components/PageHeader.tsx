'use client';

interface PageHeaderProps {
    title: string;
    description: string;
    rightContent?: React.ReactNode;
}

/**
 * Page Header Component
 * Displays page title, description, and optional right content
 */
export function PageHeader({ title, description, rightContent }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{title}</h1>
                <p className="text-[#9ca3af] text-sm">{description}</p>
            </div>
            {rightContent}
        </div>
    );
}

interface ConnectionStatusBadgeProps {
    isConnected: boolean;
}

/**
 * Connection Status Badge Component
 * Displays connection status with animated dot
 */
export function ConnectionStatusBadge({ isConnected }: ConnectionStatusBadgeProps) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#4ade80]' : 'bg-[#6b7280]'} animate-pulse`}></span>
            <span className="text-[#9ca3af] text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
            </span>
        </div>
    );
}

interface WarningBannerProps {
    title: string;
    message: string;
}

/**
 * Warning Banner Component
 * Displays a warning message with orange accent
 */
export function WarningBanner({ title, message }: WarningBannerProps) {
    return (
        <div className="p-4 rounded-lg bg-[rgba(251,146,60,0.1)] border border-[rgba(251,146,60,0.3)]">
            <p className="text-[#fb923c] font-medium">{title}</p>
            <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">{message}</p>
        </div>
    );
}
