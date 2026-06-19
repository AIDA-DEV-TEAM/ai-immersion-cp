import { STEP_TEMPLATES } from '@/data/stepTemplates'

interface StepActionsProps {
  /** Zero-based step this completed assistant message belongs to. */
  step: number
  /** Advance to the next step and insert its template — the sidebar + template-insert
   *  mechanisms, wired contextually. Receives the step the message belongs to. */
  onContinue: (fromStep: number) => void
  /** Focus the composer so the participant can type a refinement in their own words. */
  onRefine: () => void
}

/** Fixed, deterministic actions beneath a completed step's output so participants
 *  discover how to proceed without knowing the sidebar is clickable. No model calls:
 *  "Continue" advances + inserts the next verbatim template (never auto-sends or
 *  auto-fills [blanks]); "Refine this step" just focuses the composer. */
export function StepActions({ step, onContinue, onRefine }: StepActionsProps) {
  // The next step's template; undefined on the final step (Build), where Continue hides.
  const nextStep = STEP_TEMPLATES[step + 1]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {nextStep && (
        <button
          type="button"
          onClick={() => onContinue(step)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition hover:border-fg-muted hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          Continue to {nextStep.name}
          <span aria-hidden="true">→</span>
        </button>
      )}
      <button
        type="button"
        onClick={onRefine}
        className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
      >
        Refine this step
      </button>
    </div>
  )
}
