import { MessageBubble } from '@/components/MessageBubble'
import { RedirectNotice } from '@/components/RedirectNotice'
import { ThinkingIndicator } from '@/components/ThinkingIndicator'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Message } from '@/types/api'

interface MessageListProps {
  messages: Message[]
  streamingContent: string | null
  isStreaming: boolean
  error: string | null
  currentStepName: string
}

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
  error,
  currentStepName,
}: MessageListProps) {
  const isEmpty = messages.length === 0 && streamingContent === null
  // Tokens arrive on `streamingContent`; before the first one it is the empty string.
  const isThinking = isStreaming && streamingContent === ''
  const { ref, onScroll } = useAutoScroll<HTMLDivElement>(
    `${messages.length}:${streamingContent ?? ''}:${error ?? ''}`,
  )

  return (
    <div ref={ref} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 md:px-6">
        {isEmpty && (
          <div className="m-auto max-w-md py-12 text-center">
            <p className="text-base font-medium text-fg">You're on the {currentStepName} step.</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Insert the step template below, fill in the bracketed blanks with your own context, and
              send to begin.
            </p>
          </div>
        )}

        {messages.map((message, index) =>
          message.redirect ? (
            <RedirectNotice key={index} message={message.content} />
          ) : (
            <MessageBubble key={index} role={message.role} content={message.content} />
          ),
        )}

        {isThinking && <ThinkingIndicator />}

        {streamingContent !== null && streamingContent !== '' && (
          <MessageBubble role="assistant" content={streamingContent} streaming={isStreaming} />
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
