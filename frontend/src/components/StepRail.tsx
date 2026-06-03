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
 */
export function StepRail({ steps, currentStep, onSelectStep }: StepRailProps) {
  return (
    <nav aria-label="Workshop steps" className="border-b border-surface-border bg-surface px-4 py-3">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step) => {
          const isCurrent = step.step === currentStep
          return (
            <li key={step.step}>
              <button
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelectStep(step.step)}
                className={cn(
                  'flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isCurrent
                    ? 'bg-brand text-brand-fg'
                    : 'bg-surface-muted text-gray-600 hover:bg-surface-border',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                    isCurrent ? 'bg-brand-fg text-brand' : 'bg-white text-gray-500',
                  )}
                >
                  {step.step + 1}
                </span>
                {step.name}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
