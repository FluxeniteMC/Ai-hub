interface BrandLogoProps {
  size?: number;
  className?: string;
  /**
   * `mark` renders the symbol alone, `wordmark` adds the "AI Hub" lettering.
   * Both use the identical geometry as the exported SVG assets.
   */
  variant?: 'mark' | 'wordmark';
  title?: string;
}

/**
 * Inline brand logo. Mirrors public/assets/brand/logo-symbol.svg and
 * logo-horizontal.svg so the header needs no extra network request.
 */
export function BrandLogo({
  size = 28,
  className,
  variant = 'mark',
  title = 'Fluxenite AI Hub',
}: BrandLogoProps) {
  const height = size;
  const width = variant === 'wordmark' ? size * (284 / 64) : size;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={variant === 'wordmark' ? '0 0 284 64' : '0 0 64 64'}
      role="img"
      aria-label={title}
      fill="none"
    >
      {variant === 'wordmark' ? (
        <g
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M32 7 57 32 32 57 7 32Z" />
          <path d="M32 17 32 23M47 32 41 32M32 47 32 41M17 32 23 32" />
        </g>
      ) : (
        <g
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M32 7 57 32 32 57 7 32Z" />
          <path d="M32 17 32 23M47 32 41 32M32 47 32 41M17 32 23 32" />
        </g>
      )}
      <circle cx="7" cy="32" r="4.5" fill="#FFFFFF" />
      <circle cx="32" cy="7" r="4.5" fill="#FFFFFF" />
      <circle cx="57" cy="32" r="4.5" fill="#FFFFFF" />
      <circle cx="32" cy="57" r="4.5" fill="#FFFFFF" />
      <path d="M32 23 41 32 32 41 23 32Z" fill="#F59E0B" />
      {variant === 'wordmark' ? (
        <g
          stroke="#FFFFFF"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M91 52 104 15M117 52 104 15M97.5 36h13" />
          <path d="M131 12v40" />
          <path d="M163 12v40M189 12v40M163 32h26" />
          <path d="M206 12v25q0 12 13 12t13-12V12" />
          <path d="M249 6v46M249 24h11q15 0 15 14t-15 14h-11" />
        </g>
      ) : null}
    </svg>
  );
}