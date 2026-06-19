interface StepHeaderProps {
  /** Zero-based step index; shown 1-based in the eyebrow. */
  step: number
  name: string
  descriptor: string
}

/**
 * Per-step section header: a muted eyebrow (STEP N · NAME), the step name, and its
 * one-line descriptor. Marks where each step's exchange begins so the participant
 * always knows which step they're in. The eyebrow is muted on purpose — it recurs
 * down the page, so amber stays reserved for the CTA and the active StepRail node.
 */
export function StepHeader({ step, name, descriptor }: StepHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        Step {step + 1} · {name}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-fg">{name}</h2>
      <p className="text-sm leading-relaxed text-fg-muted">{descriptor}</p>
    </div>
  )
}
