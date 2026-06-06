import { Logo } from '@/branding/Logo'
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/branding/branding'
import { StepFlowPreview } from '@/components/StepFlowPreview'

interface StartScreenProps {
  onBegin: () => void
  isPending: boolean
  isError: boolean
}

/** Pre-session entry screen for the guided workshop. Presentational only —
 *  session-start logic lives in the caller. */
export function StartScreen({ onBegin, isPending, isError }: StartScreenProps) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-bg p-6">
      {/* Subtle brand-teal wash for depth — token-driven, flips with the theme. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgb(var(--brand)/0.10),transparent)]"
      />

      <div className="relative w-full max-w-lg animate-fade-in rounded-2xl border border-border bg-surface p-8 text-center shadow-card md:p-10">
        <div className="mb-6 flex justify-center">
          <Logo markOnly className="scale-125" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg-muted">
          Guided workshop
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">{PRODUCT_NAME}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
          {PRODUCT_TAGLINE}
        </p>

        <div className="mt-7 border-t border-border pt-7">
          <StepFlowPreview />
        </div>

        <button
          type="button"
          onClick={onBegin}
          disabled={isPending}
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-card transition hover:bg-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        >
          {isPending ? 'Starting…' : 'Begin session'}
        </button>

        {isError && (
          <p role="alert" className="mt-4 text-sm text-danger">
            Could not start a session. Please try again.
          </p>
        )}
      </div>
    </div>
  )
}
