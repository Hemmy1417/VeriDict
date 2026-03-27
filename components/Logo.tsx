/**
 * VeriDict Logo Component
 * AI-Powered Contribution Evaluator on GenLayer
 *
 * Variants:
 * - "full": Mark + Wordmark + optional tagline
 * - "mark": Mark only (mobile/compact)
 * - "wordmark": Wordmark only
 */

import React from 'react';

export type LogoVariant = 'full' | 'mark' | 'wordmark';
export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoTheme = 'light' | 'dark';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  sm: { mark: 'w-7 h-7',  text: 'text-lg',  tag: 'text-[9px]'  },
  md: { mark: 'w-9 h-9',  text: 'text-2xl', tag: 'text-[10px]' },
  lg: { mark: 'w-12 h-12', text: 'text-3xl', tag: 'text-xs'     },
};

export function Logo({
  variant = 'full',
  size = 'md',
  theme = 'dark',
  className = '',
  showTagline = false,
}: LogoProps) {
  const { mark: markSize, text: textSize, tag: tagSize } = sizeMap[size];

  /**
   * VeriDict Mark:
   * - Hexagon shield = trust, verification, on-chain security
   * - Checkmark beam = AI verdict / approval
   * - Spark nodes at corners = decentralised AI agents
   * - Purple-to-blue gradient = GenLayer brand
   */
  const Mark = () => (
    <svg
      className={markSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VeriDict logo mark"
    >
      <defs>
        {/* Primary purple → blue gradient */}
        <linearGradient id="vd-grad-main" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#9B6AF6" />
          <stop offset="100%" stopColor="#110FFF" />
        </linearGradient>
        {/* Accent pink → purple for glow ring */}
        <linearGradient id="vd-grad-ring" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E37DF7" />
          <stop offset="100%" stopColor="#9B6AF6" />
        </linearGradient>
        {/* Soft glow filter */}
        <filter id="vd-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vd-glow-strong" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Outer hexagon shield (background fill) ── */}
      <path
        d="M24 3L43 13.5V34.5L24 45L5 34.5V13.5L24 3Z"
        fill="url(#vd-grad-main)"
        opacity="0.12"
      />

      {/* ── Outer hexagon shield (stroke) ── */}
      <path
        d="M24 3L43 13.5V34.5L24 45L5 34.5V13.5L24 3Z"
        stroke="url(#vd-grad-ring)"
        strokeWidth="1.5"
        fill="none"
        filter="url(#vd-glow)"
      />

      {/* ── Inner hexagon (smaller, filled, creates depth) ── */}
      <path
        d="M24 10L37 17.5V32.5L24 40L11 32.5V17.5L24 10Z"
        fill="url(#vd-grad-main)"
        opacity="0.18"
      />
      <path
        d="M24 10L37 17.5V32.5L24 40L11 32.5V17.5L24 10Z"
        stroke="url(#vd-grad-main)"
        strokeWidth="0.75"
        fill="none"
        opacity="0.5"
      />

      {/* ── AI verdict checkmark beam ── */}
      {/* Left arm: coming from bottom-left */}
      <path
        d="M14 25.5L20.5 32"
        stroke="url(#vd-grad-ring)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#vd-glow-strong)"
      />
      {/* Right arm: sweeping up to top-right */}
      <path
        d="M20.5 32L34 18"
        stroke="url(#vd-grad-main)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#vd-glow-strong)"
      />

      {/* ── Spark node at checkmark pivot point ── */}
      <circle cx="20.5" cy="32" r="2" fill="#E37DF7" filter="url(#vd-glow-strong)" />

      {/* ── Three AI agent nodes (top, bottom-left, bottom-right) ── */}
      {/* Top node */}
      <circle cx="24" cy="5.5"  r="2"   fill="url(#vd-grad-ring)" filter="url(#vd-glow)" />
      <circle cx="24" cy="5.5"  r="1"   fill="white" opacity="0.9" />
      {/* Bottom-left node */}
      <circle cx="6.5"  cy="38" r="2"   fill="url(#vd-grad-ring)" filter="url(#vd-glow)" />
      <circle cx="6.5"  cy="38" r="1"   fill="white" opacity="0.9" />
      {/* Bottom-right node */}
      <circle cx="41.5" cy="38" r="2"   fill="url(#vd-grad-ring)" filter="url(#vd-glow)" />
      <circle cx="41.5" cy="38" r="1"   fill="white" opacity="0.9" />

      {/* ── Connector lines from nodes to shield corners (dashed, subtle) ── */}
      <line x1="24"  y1="7.5"  x2="24"  y2="10"   stroke="#9B6AF6" strokeWidth="0.75" strokeDasharray="1.5 1.5" opacity="0.6" />
      <line x1="8"   y1="37"   x2="11"  y2="35"   stroke="#9B6AF6" strokeWidth="0.75" strokeDasharray="1.5 1.5" opacity="0.6" />
      <line x1="40"  y1="37"   x2="37"  y2="35"   stroke="#9B6AF6" strokeWidth="0.75" strokeDasharray="1.5 1.5" opacity="0.6" />
    </svg>
  );

  const Wordmark = () => (
    <div className="flex flex-col leading-none">
      <span
        className={`${textSize} font-bold tracking-tight font-[family-name:var(--font-display)]`}
        style={{
          background: 'linear-gradient(135deg, #9B6AF6 0%, #E37DF7 50%, #110FFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.03em',
        }}
      >
        VeriDict
      </span>
      {showTagline && (
        <span
          className={`${tagSize} text-muted-foreground tracking-widest uppercase mt-0.5`}
          style={{ letterSpacing: '0.18em' }}
        >
          Verify. Trust. Build.
        </span>
      )}
    </div>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Mark />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Wordmark />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark />
      <Wordmark />
    </div>
  );
}

export function LogoFull(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="full" />;
}

export function LogoMark(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="mark" />;
}

export function LogoWordmark(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="wordmark" />;
}