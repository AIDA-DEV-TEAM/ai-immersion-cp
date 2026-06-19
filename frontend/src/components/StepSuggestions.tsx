interface StepSuggestionsProps {
  /** 1-2 model-generated suggestions; renders nothing when empty. */
  suggestions: string[]
  /** True while the suggestions request is in flight — shows a loading line. */
  loading: boolean
  /** Insert the suggestion text into the composer for review — never auto-sends. */
  onSelect: (text: string) => void
}

/** Model-generated next-action suggestions beneath the fixed Continue/Refine
 *  buttons. Clicking one inserts its text into the composer (never auto-sends,
 *  never fills [blanks]). While the request is in flight it shows a muted loading
 *  line; on empty/failed generation it renders nothing, so the absence is silent. */
export function StepSuggestions({ suggestions, loading, onSelect }: StepSuggestionsProps) {
  if (suggestions.length === 0) {
    // Fail-to-nothing: only the in-flight state shows the line. Empty or errored
    // results fall through to null, so the indicator never sticks.
    if (!loading) return null
    return (
      <p role="status" className="animate-pulse px-1 py-2 text-sm text-fg-muted">
        Generating suggestions…
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-stretch gap-2.5">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="inline-flex min-h-[44px] max-w-sm items-start gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-fg-muted shadow-card transition hover:border-fg-muted hover:bg-surface-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-border"
        >
          <span aria-hidden="true" className="mt-px text-fg-muted">
            ✦
          </span>
          {suggestion}
        </button>
      ))}
    </div>
  )
}
