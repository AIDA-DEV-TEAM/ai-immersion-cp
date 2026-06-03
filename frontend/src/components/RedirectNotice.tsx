interface RedirectNoticeProps {
  message: string
}

/** Guardrail redirect — a muted, centered notice (not a facilitator bubble) that
 *  anchors the participant back to their current step. */
export function RedirectNotice({ message }: RedirectNoticeProps) {
  return (
    <div className="flex justify-center px-4">
      <div
        role="status"
        className="flex max-w-md items-start gap-2 rounded-lg border border-surface-border bg-surface-muted px-4 py-3 text-center text-sm text-gray-500"
      >
        <span aria-hidden="true" className="mt-0.5 shrink-0">
          ⟲
        </span>
        <span>{message}</span>
      </div>
    </div>
  )
}
