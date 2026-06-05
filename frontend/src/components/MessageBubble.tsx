import { Markdown } from '@/components/Markdown'
import { cn } from '@/lib/cn'
import { completeMarkdown } from '@/lib/streamingMarkdown'
import type { MessageRole } from '@/types/api'

interface MessageBubbleProps {
  role: MessageRole
  content: string
  /** True while this assistant turn is still streaming (not yet complete). */
  streaming?: boolean
}

export function MessageBubble({ role, content, streaming = false }: MessageBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex animate-fade-in', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-brand text-brand-fg'
            : 'rounded-bl-sm bg-surface text-fg shadow-card ring-1 ring-border',
        )}
      >
        {isUser ? (
          // User turns hold verbatim [bracket] templates — render as plain text.
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          // Assistant turns always render as markdown. While streaming, dangling
          // syntax is closed first so partial tokens (e.g. **NOC) show as in-progress
          // formatting rather than raw markers; the completed turn renders raw.
          <Markdown content={streaming ? completeMarkdown(content) : content} streaming={streaming} />
        )}
      </div>
    </div>
  )
}
