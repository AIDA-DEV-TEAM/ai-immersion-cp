import { cn } from '@/lib/cn'
import type { StepTemplate } from '@/types/api'

interface StepRailProps {
  steps: readonly StepTemplate[]
  currentStep: number
  onSelectStep: (step: number) => void
}

/**
 * Guardrail layer 1: anchors the participant to the six-step flow and the step
 * they are on. The bot never auto-advances — the participant moves here.
 *
 * Reads as a connected journey: numbered nodes linked by a path (vertical on
 * desktop, horizontal on mobile) whose traversed portion fills brand-teal behind
 * the current step. Three states are distinct at a glance — completed (teal,
 * checked), current (amber, focal), upcoming (muted, waiting).
 */
export function StepRail({ steps, currentStep, onSelectStep }: StepRailProps) {
  return (
    <nav
      aria-label="Workshop steps"
      className="shrink-0 border-b border-border bg-surface md:w-60 md:border-b-0 md:border-r"
    >
      <ol className="flex p-3 md:flex-col">
        {steps.map((step) => {
          const isCurrent = step.step === currentStep
          const isDone = step.step < currentStep
          const isFirst = step.step === 0
          const isLast = step.step === steps.length - 1
          // The path behind a reached node is traversed (teal); the path ahead is muted.
          const beforeTraversed = step.step <= currentStep
          const afterTraversed = step.step < currentStep

          return (
            <li key={step.step} className="flex-1 md:flex-none">
              <button
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelectStep(step.step)}
                className={cn(
                  'flex min-h-[44px] w-full flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center transition md:flex-row md:gap-3 md:px-3 md:text-left',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isCurrent ? 'bg-surface-muted' : 'hover:bg-surface-muted',
                )}
              >
                <span className="relative flex h-6 w-full shrink-0 items-center justify-center md:h-11 md:w-6">
                  {!isFirst && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transition-colors duration-300 md:left-1/2 md:top-0 md:h-1/2 md:w-0.5 md:-translate-x-1/2 md:translate-y-0',
                        beforeTraversed ? 'bg-brand' : 'bg-border',
                      )}
                    />
                  )}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transition-colors duration-300 md:bottom-0 md:left-1/2 md:right-auto md:top-auto md:h-1/2 md:w-0.5 md:-translate-x-1/2 md:translate-y-0',
                        afterTraversed ? 'bg-brand' : 'bg-border',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300',
                      isCurrent
                        ? 'bg-accent text-accent-fg ring-2 ring-accent/30'
                        : isDone
                          ? 'bg-brand text-brand-fg'
                          : 'bg-surface text-fg-muted ring-1 ring-inset ring-border',
                    )}
                  >
                    {isDone ? '✓' : step.step + 1}
                  </span>
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-[11px] font-medium transition-colors md:text-sm',
                    isCurrent ? 'text-fg' : isDone ? 'text-fg-muted' : 'text-fg-muted/70',
                  )}
                >
                  {step.name}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
