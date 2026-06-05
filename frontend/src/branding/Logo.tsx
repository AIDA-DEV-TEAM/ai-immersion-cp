import { PRODUCT_NAME } from '@/branding/branding'
import { cn } from '@/lib/cn'

interface LogoProps {
  /** Hide the wordmark and render the mark only (e.g. tight layouts). */
  markOnly?: boolean
  className?: string
}

/**
 * Placeholder logo — a token-colored mark plus the product wordmark. Swap this
 * component (and `branding.ts`) to rebrand; nothing else references the logo.
 */
export function Logo({ markOnly = false, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-fg shadow-card"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            d="M12 3l7.5 4.33v8.66L12 21l-7.5-4.33V7.33L12 3z"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      </span>
      {!markOnly && (
        <span className="text-base font-semibold tracking-tight text-fg">{PRODUCT_NAME}</span>
      )}
    </span>
  )
}
