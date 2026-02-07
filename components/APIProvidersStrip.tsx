'use client';

import Image from 'next/image';

/**
 * API Provider Definition
 */
interface Provider {
    id: string;
    name: string;
    logoPath: string;
}

/**
 * All API providers used in the Sivic dashboard
 * Order: Jito first (as requested), then alphabetically
 */
const providers: Provider[] = [
    { id: 'jito', name: 'Jito', logoPath: '/providers/jitoLabs.svg' },
    { id: 'birdeye', name: 'Birdeye', logoPath: '/providers/birdeye.svg' },
    { id: 'bitquery', name: 'Bitquery', logoPath: '/providers/bitquery.svg' },
    { id: 'defillama', name: 'DefiLlama', logoPath: '/providers/defillama.svg' },
    { id: 'dexscreener', name: 'DEX Screener', logoPath: '/providers/dexscreener.svg' },
    { id: 'dia', name: 'DIA', logoPath: '/providers/DIA.svg' },
    { id: 'helius', name: 'Helius', logoPath: '/providers/helius.svg' },
    { id: 'jupiter', name: 'Jupiter', logoPath: '/providers/jup.svg' },
    { id: 'openrouter', name: 'OpenRouter', logoPath: '/providers/openrouter.svg' },
    { id: 'rugcheck', name: 'RugCheck', logoPath: '/providers/rugcheck.svg' },
    { id: 'solanafm', name: 'SolanaFM', logoPath: '/providers/solanafm.svg' },
];

/**
 * Provider Image Component
 * Displays a single provider logo with consistent sizing
 */
function ProviderImage({ provider }: { provider: Provider }) {
    return (
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-16 sm:w-32 sm:h-20 mx-4 sm:mx-6">
            <Image
                src={provider.logoPath}
                alt={provider.name}
                width={120}
                height={60}
                className="object-contain w-full h-full brightness-110 hover:brightness-125 transition-all duration-300"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
        </div>
    );
}

/**
 * API Providers Strip Component
 * Infinite horizontal scrolling strip displaying all API provider logos
 */
export function APIProvidersStrip() {
    // Duplicate providers array for seamless infinite scroll
    const duplicatedProviders = [...providers, ...providers];

    return (
        <div className="w-full py-4 sm:py-6">
            {/* Top white border strip */}
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent mb-4" />

            {/* Scrolling container */}
            <div className="overflow-hidden">
                <div
                    className="flex animate-scroll"
                    style={{
                        width: 'max-content',
                    }}
                >
                    {duplicatedProviders.map((provider, index) => (
                        <ProviderImage key={`${provider.id}-${index}`} provider={provider} />
                    ))}
                </div>
            </div>

            {/* Bottom white border strip */}
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent mt-4" />

            {/* CSS Animation */}
            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}

export default APIProvidersStrip;
