import { Fragment } from 'react'

import { STEP_TEMPLATES } from '@/data/stepTemplates'

/**
 * Muted, numbered preview of the six-step journey participants are about to take.
 * Sourced from STEP_TEMPLATES so step names stay swap-safe and are never hardcoded.
 * Presentational only — the amber accent is reserved for the CTA, not used here.
 */
export function StepFlowPreview() {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
      {STEP_TEMPLATES.map((step, index) => (
        <Fragment key={step.step}>
          <li className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
              {index + 1}
            </span>
            <span className="text-xs font-medium text-fg-muted">{step.name}</span>
          </li>
          {index < STEP_TEMPLATES.length - 1 && (
            <span aria-hidden="true" className="hidden text-fg-muted/50 sm:inline">
              →
            </span>
          )}
        </Fragment>
      ))}
    </ol>
  )
}
