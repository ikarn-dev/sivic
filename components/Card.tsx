'use client';

import { ReactNode, CSSProperties } from 'react';

/* ... imports ... */

/* ========================================
   Base Card Component
   ======================================== */

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  withBlobs?: boolean;
  blobIntensity?: 'subtle' | 'normal' | 'strong';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Premium Card Component
 * The unified card design with gradient blobs, noise texture, and depth
 */
export default function Card({
  children,
  className = '',
  style = {},
  hover = true,
  withBlobs = true,
  blobIntensity = 'normal',
  rounded = 'lg'
}: CardProps) {
  const roundedClasses = {
    sm: 'rounded-[16px]',
    md: 'rounded-[20px]',
    lg: 'rounded-[24px]',
    xl: 'rounded-[32px]'
  };

  return (
    <div
      className={`relative overflow-hidden shadow-2xl transition-all duration-200 ${roundedClasses[rounded]} ${hover ? 'hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]' : ''} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #050505 0%, #080808 50%, #030303 100%)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        transform: 'translateZ(0)', // GPU acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        ...style
      }}
    >
      {/* Gradient Blobs */}
      {withBlobs && <GradientBlobs intensity={blobIntensity} />}

      {/* Noise Texture */}
      <NoiseTexture />

      {/* Vignette Effect */}
      <Vignette />

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

/* ... Stat Card Variants ... */

/* ... */

/* ========================================
   Container Card Variants
   ======================================== */

interface GlassContainerCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Glass Container Card
 * For larger content areas like lists, tables, charts
 */
export function GlassContainerCard({ children, title, className = '', style = {} }: GlassContainerCardProps) {
  return (
    <Card className={`p-4 sm:p-6 ${className}`} hover={false} blobIntensity="subtle" style={style}>
      {title && (
        <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-6 font-nohemi">{title}</h2>
      )}
      <div className="relative z-10 font-satoshi">
        {children}
      </div>
    </Card>
  );
}
/**
 * Noise Texture Layer
 * Adds organic grain texture for depth
 */
const NoiseTexture = () => (
  <>
    {/* Fine grain noise texture - increased opacity */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        zIndex: 1
      }}
    />
    {/* Coarse grain texture layer - increased opacity */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-soft-light"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise2)'/%3E%3C/svg%3E")`,
        zIndex: 1
      }}
    />
    {/* Extra fine grain for premium look */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-multiply"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise3)'/%3E%3C/svg%3E")`,
        zIndex: 1
      }}
    />
  </>
);

/**
 * Gradient Blobs
 * Premium organic gradient blobs with smooth animation
 */
const GradientBlobs = ({ intensity = 'normal' }: { intensity?: 'subtle' | 'normal' | 'strong' }) => {
  // Reduced opacity multiplier for less intense orange
  const opacityMultiplier = intensity === 'subtle' ? 0.25 : intensity === 'strong' ? 0.6 : 0.4;

  return (
    <>
      {/* CSS Keyframes for blob animation - removed */}
      <style jsx>{`
        /* Animations removed */
      `}</style>

      {/* Primary orange gradient blob - static */}
      <div
        className="pointer-events-none absolute -right-8 -top-8"
        style={{
          width: '200px',
          height: '240px',
          background: `radial-gradient(ellipse 70% 80% at 60% 40%, rgba(255, 120, 40, ${0.45 * opacityMultiplier}) 0%, rgba(255, 80, 20, ${0.3 * opacityMultiplier}) 35%, rgba(200, 60, 10, ${0.15 * opacityMultiplier}) 60%, transparent 85%)`,
          filter: 'blur(50px)',
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          zIndex: 0,
        }}
      />

      {/* Secondary gradient blob - static */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3"
        style={{
          width: '150px',
          height: '200px',
          background: `radial-gradient(ellipse 60% 90% at 50% 50%, rgba(255, 100, 30, ${0.35 * opacityMultiplier}) 0%, rgba(230, 70, 15, ${0.2 * opacityMultiplier}) 40%, rgba(180, 50, 10, ${0.08 * opacityMultiplier}) 70%, transparent 90%)`,
          filter: 'blur(60px)',
          borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
          zIndex: 0,
        }}
      />

      {/* Accent blob - static */}
      <div
        className="pointer-events-none absolute -bottom-12 left-1/3"
        style={{
          width: '180px',
          height: '140px',
          background: `radial-gradient(ellipse 80% 60% at 50% 70%, rgba(255, 90, 20, ${0.25 * opacityMultiplier}) 0%, rgba(200, 60, 10, ${0.12 * opacityMultiplier}) 50%, transparent 80%)`,
          filter: 'blur(55px)',
          borderRadius: '50% 50% 40% 60% / 40% 50% 50% 60%',
          zIndex: 0,
        }}
      />

      {/* Dark overlay for depth - increased for more black */}
      <div
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: '80%',
          height: '80%',
          background: 'radial-gradient(ellipse 80% 100% at 80% 80%, rgba(5, 5, 5, 0.8) 0%, rgba(10, 10, 10, 0.5) 40%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 0
        }}
      />

      {/* Additional dark overlay for more black presence */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 20%, rgba(0, 0, 0, 0.4) 80%)',
          zIndex: 0
        }}
      />
    </>
  );
};

/**
 * Vignette Effect
 * Adds depth at the edges
 */
const Vignette = () => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.4) 100%)',
      zIndex: 1
    }}
  />
);



/* ========================================
   Stat Card Variants
   ======================================== */

interface StatCardProps {
  title: string;
  value: string;
  className?: string;
}

/**
 * Stat Card
 * Displays a single statistic with title and value
 */
export function StatCard({ title, value, className = '' }: StatCardProps) {
  return (
    <Card className={`p-4 sm:p-6 ${className}`} hover={true}>
      <div className="flex flex-col justify-end h-full">
        <p className="text-white/60 text-[10px] sm:text-sm font-medium tracking-wide mb-1 sm:mb-2 font-nohemi">{title}</p>
        <h3 className="text-white text-xl sm:text-3xl font-bold tracking-tight font-satoshi">{value}</h3>
      </div>
    </Card>
  );
}

interface GlassStatCardProps {
  title: string;
  value: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  large?: boolean;
  className?: string;
}

/**
 * Glass Stat Card
 * Premium stat card with optional accent colors
 */
export function GlassStatCard({
  title,
  value,
  variant = 'default',
  large = false,
  className = ''
}: GlassStatCardProps) {
  // Variant-based accent glow effects
  const variantStyles = {
    default: '',
    accent: 'ring-1 ring-orange-500/20',
    success: 'ring-1 ring-green-500/20',
    warning: 'ring-1 ring-yellow-500/20',
    danger: 'ring-1 ring-red-500/20',
  };

  // Value color based on variant
  const valueColors = {
    default: 'text-white',
    accent: 'text-orange-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <Card className={`p-4 sm:p-6 ${variantStyles[variant]} ${className}`} hover={true}>
      <div className="flex flex-col justify-end h-full min-h-[50px] sm:min-h-[80px]">
        <p className="text-white/60 text-[10px] sm:text-sm font-medium tracking-wide mb-0.5 sm:mb-2 font-nohemi">{title}</p>
        <h3 className={`font-bold tracking-tight font-satoshi ${valueColors[variant]} ${large ? 'text-lg sm:text-4xl' : 'text-base sm:text-3xl'}`}>
          {value}
        </h3>
      </div>
    </Card>
  );
}



interface GlassContainerEmptyProps {
  message?: string;
}

/**
 * Empty State for Container Cards
 */
export function GlassContainerEmpty({ message = 'No data available' }: GlassContainerEmptyProps) {
  return (
    <div className="flex items-center justify-center min-h-[80px] sm:min-h-[100px] text-white/30 text-sm font-satoshi">
      {message}
    </div>
  );
}

/* ========================================
   Feature Card Variants
   ======================================== */

interface GradientCardProps {
  title?: string;
  value?: string;
  className?: string;
  children?: ReactNode;
  aspectRatio?: string;
}

/**
 * Premium Gradient Card
 * Large feature card with strong gradient effect
 */
export function GradientCard({
  title,
  value,
  className = '',
  children,
  aspectRatio
}: GradientCardProps) {
  return (
    <Card
      className={`${aspectRatio ? `aspect-${aspectRatio}` : ''} ${className}`}
      hover={true}
      blobIntensity="strong"
      rounded="xl"
    >
      <div className="relative z-10 p-8 h-full flex flex-col justify-end">
        {children ? children : (
          <>
            {title && (
              <p className="text-sm font-medium tracking-wide text-white/80">{title}</p>
            )}
            {value && (
              <p className="text-5xl font-semibold tracking-tight text-white">{value}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

interface FeatureCardProps {
  children: ReactNode;
  gradient?: boolean;
  className?: string;
}

/**
 * Feature Card
 * Flexible card for feature sections
 */
export function FeatureCard({ children, gradient = false, className = '' }: FeatureCardProps) {
  return (
    <Card
      className={className}
      withBlobs={gradient}
      blobIntensity={gradient ? 'normal' : 'subtle'}
    >
      <div className="p-6">
        {children}
      </div>
    </Card>
  );
}

interface LargeFeatureCardProps {
  title: string;
  value: string;
  className?: string;
}

/**
 * Large Feature Card
 * For hero-style statistics
 */
export function LargeFeatureCard({ title, value, className = '' }: LargeFeatureCardProps) {
  return (
    <Card className={`p-8 ${className}`} blobIntensity="strong" rounded="xl">
      <div className="flex flex-col justify-end h-full min-h-[120px]">
        <p className="text-white/60 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-white text-4xl font-bold tracking-tight">{value}</h3>
      </div>
    </Card>
  );
}

/* ========================================
   Mini Card Variants
   ======================================== */

interface MiniCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Mini Card
 * Compact card for small items like tags, protocol items
 */
export function MiniCard({ children, className = '', hover = true }: MiniCardProps) {
  return (
    <Card
      className={`p-3 ${className}`}
      hover={hover}
      blobIntensity="subtle"
      rounded="md"
    >
      {children}
    </Card>
  );
}

interface CategoryCardProps {
  label: string;
  value: string;
  className?: string;
}

/**
 * Category Card
 * For displaying category data in grids
 */
export function CategoryCard({ label, value, className = '' }: CategoryCardProps) {
  return (
    <Card className={`p-4 ${className}`} hover={false} blobIntensity="subtle" rounded="md">
      <p className="text-white/40 text-xs capitalize mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </Card>
  );
}

/* ========================================
   Exported Visual Elements (for custom use)
   ======================================== */

export { NoiseTexture, GradientBlobs, Vignette };
