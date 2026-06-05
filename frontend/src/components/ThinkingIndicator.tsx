/** Subtle animated dots shown while awaiting the first streamed token. CSS-only. */
export function ThinkingIndicator() {
  return (
    <div className="flex animate-fade-in justify-start">
      <div
        aria-live="polite"
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface px-4 py-3.5 shadow-card ring-1 ring-border"
      >
        <span className="sr-only">Assistant is thinking…</span>
        <span aria-hidden="true" className="h-2 w-2 animate-thinking-bounce rounded-full bg-fg-muted" />
        <span
          aria-hidden="true"
          className="h-2 w-2 animate-thinking-bounce rounded-full bg-fg-muted [animation-delay:0.15s]"
        />
        <span
          aria-hidden="true"
          className="h-2 w-2 animate-thinking-bounce rounded-full bg-fg-muted [animation-delay:0.3s]"
        />
      </div>
    </div>
  )
}
