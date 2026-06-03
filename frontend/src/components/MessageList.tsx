import { MessageBubble } from '@/components/MessageBubble'
import { RedirectNotice } from '@/components/RedirectNotice'
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

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
      {isEmpty && (
        <div className="m-auto max-w-md text-center text-gray-500">
          <p className="text-base font-medium text-gray-700">
            You're on the {currentStepName} step.
          </p>
          <p className="mt-2 text-sm">
            Insert the step template below, fill in the bracketed blanks with your own context,
            and send to begin.
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

      {streamingContent !== null && (
        <MessageBubble role="assistant" content={streamingContent} streaming={isStreaming} />
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  )
}
