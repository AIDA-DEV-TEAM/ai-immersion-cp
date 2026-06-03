import { cn } from '@/lib/cn'
import type { MessageRole } from '@/types/api'

interface MessageBubbleProps {
  role: MessageRole
  content: string
  /** Show a blinking caret while this bubble is still streaming. */
  streaming?: boolean
}

export function MessageBubble({ role, content, streaming = false }: MessageBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-brand text-brand-fg rounded-br-sm'
            : 'bg-surface-muted text-gray-900 rounded-bl-sm',
        )}
      >
        {content}
        {streaming && <span className="ml-0.5 inline-block animate-pulse">▋</span>}
      </div>
    </div>
  )
}
