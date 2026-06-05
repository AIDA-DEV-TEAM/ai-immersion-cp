import { useEffect, useRef } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'

import { DummyDataReminder } from '@/components/DummyDataReminder'
import { TemplateInsert } from '@/components/TemplateInsert'

interface ComposerProps {
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onInsertTemplate: () => void
  currentStepName: string
  disabled: boolean
}

const MAX_TEXTAREA_HEIGHT_PX = 160

export function Composer({
  draft,
  onDraftChange,
  onSend,
  onInsertTemplate,
  currentStepName,
  disabled,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow: size the textarea to its content, capped, then scroll past the cap.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }, [draft])

  const canSend = !disabled && draft.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSend) onSend()
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onDraftChange(event.target.value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-surface p-4"
      aria-label="Message composer"
    >
      <DummyDataReminder />
      <div className="mb-2 flex items-center justify-between">
        <TemplateInsert stepName={currentStepName} onInsert={onInsertTemplate} disabled={disabled} />
      </div>
      <label htmlFor="composer-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="composer-input"
        ref={textareaRef}
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={`Insert the ${currentStepName} template, fill the [blanks], then send.`}
        className="block max-h-[160px] w-full resize-none overflow-y-auto rounded-lg border border-border bg-surface p-3 text-sm text-fg placeholder:text-fg-muted focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-accent-fg shadow-card transition hover:bg-accent-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        >
          {disabled ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
