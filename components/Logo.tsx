'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
    const sizes = {
        sm: { shield: 24, text: 'text-xl' },
        md: { shield: 32, text: 'text-2xl' },
        lg: { shield: 40, text: 'text-3xl' },
    };

    const { shield, text } = sizes[size];

    return (
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="/shield_logo.svg"
                alt="Sivic Shield"
                width={shield}
                height={shield * 1.125}
                className="flex-shrink-0"
            />
            {showText && (
                <span className={`font-ahsing ${text} text-white tracking-wide`}>SIVIC</span>
            )}
        </Link>
    );
}
