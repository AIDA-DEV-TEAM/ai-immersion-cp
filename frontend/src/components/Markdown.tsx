import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/cn'

// Thin blinking streaming caret, trailing the last rendered line via ::after.
// CSS-only, token-colored — no extra DOM node, consistent with the restrained motion.
const STREAMING_CARET =
  "[&>*:last-child]:after:ml-0.5 [&>*:last-child]:after:inline-block [&>*:last-child]:after:h-[1.05em] [&>*:last-child]:after:w-0.5 [&>*:last-child]:after:translate-y-[0.15em] [&>*:last-child]:after:animate-pulse [&>*:last-child]:after:rounded-full [&>*:last-child]:after:bg-fg-muted [&>*:last-child]:after:align-text-bottom [&>*:last-child]:after:content-['']"

/**
 * Token-styled markdown for assistant messages. GFM enabled (lists, tables);
 * raw HTML disabled (no rehype-raw). Code blocks are cleanly styled monospace —
 * no syntax highlighting by design.
 */
const components: Components = {
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-semibold text-fg">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-semibold text-fg">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-3 text-sm font-semibold text-fg">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand underline underline-offset-2 hover:text-brand-strong"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-fg-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  code: ({ className, children }) => {
    // Fenced blocks carry a `language-*` class; everything else is inline.
    const isBlock = /language-/.test(className ?? '')
    if (isBlock) return <code className="font-mono text-[0.85em]">{children}</code>
    return (
      <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-surface-muted p-3 text-[0.85em] leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-surface-muted px-2 py-1 font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
}

interface MarkdownProps {
  content: string
  /** Show the trailing streaming caret on the last line (while tokens arrive). */
  streaming?: boolean
}

export function Markdown({ content, streaming = false }: MarkdownProps) {
  return (
    <div
      className={cn(
        'text-sm text-fg [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        streaming && STREAMING_CARET,
        // Each newly mounted markdown node (new segment/line/word) eases in once;
        // persisting nodes keep their text and don't re-animate.
        streaming && '[&_*]:animate-text-fade-in',
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
