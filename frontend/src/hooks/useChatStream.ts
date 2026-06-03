import { useCallback, useState } from 'react'

import { streamChat } from '@/api/chat'
import type { Message } from '@/types/api'

interface ChatStreamState {
  messages: Message[]
  /** The assistant message currently being streamed, or null when idle. */
  streamingContent: string | null
  isStreaming: boolean
  error: string | null
}

export function useChatStream() {
  const [state, setState] = useState<ChatStreamState>({
    messages: [],
    streamingContent: null,
    isStreaming: false,
    error: null,
  })

  const send = useCallback(async (sessionId: string, text: string): Promise<void> => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: text }],
      streamingContent: '',
      isStreaming: true,
      error: null,
    }))

    try {
      let assembled = ''
      for await (const event of streamChat(sessionId, text)) {
        if (event.type === 'blocked') {
          // Guardrail redirect: render a notice, not a facilitator reply, and stop.
          setState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              { role: 'assistant', content: event.message, redirect: true },
            ],
            streamingContent: null,
            isStreaming: false,
          }))
          return
        }
        assembled += event.value
        setState((prev) => ({ ...prev, streamingContent: assembled }))
      }
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: assembled }],
        streamingContent: null,
        isStreaming: false,
      }))
    } catch {
      setState((prev) => ({
        ...prev,
        streamingContent: null,
        isStreaming: false,
        error: 'The assistant could not respond. Please try again.',
      }))
    }
  }, [])

  return { ...state, send }
}
