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
 * Vertical sidebar on desktop, horizontal stepper on small screens.
 */
export function StepRail({ steps, currentStep, onSelectStep }: StepRailProps) {
  return (
    <nav
      aria-label="Workshop steps"
      className="shrink-0 border-b border-border bg-surface md:w-60 md:border-b-0 md:border-r"
    >
      <ol className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        {steps.map((step) => {
          const isCurrent = step.step === currentStep
          const isDone = step.step < currentStep
          return (
            <li key={step.step} className="shrink-0 md:shrink">
              <button
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelectStep(step.step)}
                className={cn(
                  'flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isCurrent
                    ? 'bg-surface-muted text-fg'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
                    isCurrent
                      ? 'bg-accent text-accent-fg'
                      : isDone
                        ? 'bg-brand text-brand-fg'
                        : 'bg-surface text-fg-muted ring-1 ring-inset ring-border',
                  )}
                >
                  {isDone ? '✓' : step.step + 1}
                </span>
                <span className="whitespace-nowrap">{step.name}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
