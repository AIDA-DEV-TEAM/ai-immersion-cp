import type { ChangeEvent, FormEvent } from 'react'

import { TemplateInsert } from '@/components/TemplateInsert'

interface ComposerProps {
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onInsertTemplate: () => void
  currentStepName: string
  disabled: boolean
}

export function Composer({
  draft,
  onDraftChange,
  onSend,
  onInsertTemplate,
  currentStepName,
  disabled,
}: ComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!disabled && draft.trim()) onSend()
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onDraftChange(event.target.value)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-surface-border bg-surface p-4"
      aria-label="Message composer"
    >
      <div className="mb-2 flex items-center justify-between">
        <TemplateInsert stepName={currentStepName} onInsert={onInsertTemplate} disabled={disabled} />
      </div>
      <label htmlFor="composer-input" className="sr-only">
        Your message
      </label>
      <textarea
        id="composer-input"
        value={draft}
        onChange={handleChange}
        rows={5}
        placeholder={`Insert the ${currentStepName} template, fill the [blanks], then send.`}
        className="w-full resize-none rounded-lg border border-surface-border p-3 text-sm focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="min-h-[44px] rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-brand-fg transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        >
          {disabled ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  )
}
