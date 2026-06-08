import { useEffect, useRef, useState } from 'react'

interface BuildActionsProps {
  /** The Build-step PRD's raw markdown source — copied/exported verbatim. */
  content: string
}

const COPIED_FEEDBACK_MS = 2000
const EXPORT_FILENAME = 'build-prompt.md'

/** Copy / export controls for the Build-step product-requirements prompt. The
 *  primary action is Copy (the participant pastes the PRD into a build platform);
 *  Export downloads the same raw markdown as a .md file. */
export function BuildActions({ content }: BuildActionsProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current)
    },
    [],
  )

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    if (resetTimer.current !== null) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = EXPORT_FILENAME
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const buttonClass =
    'inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-border'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy the build prompt to the clipboard"
        className={buttonClass}
      >
        <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <button
        type="button"
        onClick={handleExport}
        aria-label="Export the build prompt as a markdown file"
        className={buttonClass}
      >
        <span aria-hidden="true">↓</span>
        Export .md
      </button>
    </div>
  )
}
