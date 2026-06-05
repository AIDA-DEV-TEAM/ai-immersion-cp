interface TemplateInsertProps {
  stepName: string
  onInsert: () => void
  disabled?: boolean
}

/** Inserts the current step's verbatim template into the composer for the
 *  participant to fill the [bracketed] blanks. Never auto-fills them. */
export function TemplateInsert({ stepName, onInsert, disabled = false }: TemplateInsertProps) {
  return (
    <button
      type="button"
      onClick={onInsert}
      disabled={disabled}
      className="min-h-[44px] rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand hover:text-brand-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
    >
      Insert {stepName} template
    </button>
  )
}
