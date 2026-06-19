import { apiClient } from '@/api/client'
import type { SessionResponse, StreamEvent, SuggestionsResponse } from '@/types/api'

export async function createSession(): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>('/session')
  return data
}

export async function updateStep(sessionId: string, stepIndex: number): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>('/step', {
    session_id: sessionId,
    step_index: stepIndex,
  })
  return data
}

/**
 * Fetch 1-2 next-action suggestions for a completed step's assistant output.
 * Separate, non-streaming call made after the turn finishes — never blocks the
 * stream. The backend fails open to an empty list, so the caller renders nothing.
 */
export async function fetchSuggestions(
  sessionId: string,
  stepIndex: number,
  assistantMessage: string,
): Promise<SuggestionsResponse> {
  const { data } = await apiClient.post<SuggestionsResponse>('/suggestions', {
    session_id: sessionId,
    step_index: stepIndex,
    assistant_message: assistantMessage,
  })
  return data
}

/**
 * Stream one chat turn. Yields `StreamEvent`s as they arrive.
 *
 * Uses `fetch` + a ReadableStream reader (not React Query / axios) because token
 * streaming over SSE isn't React Query's model. Each SSE frame is JSON: a
 * `{ token }` (allowed turn), a `{ blocked, message }` (guardrail redirect), or
 * `{ done: true }`.
 */
export async function* streamChat(
  sessionId: string,
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed (${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are separated by a blank line.
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      const line = frame.trim()
      if (!line.startsWith('data: ')) continue
      const payload: { token?: string; blocked?: boolean; message?: string; done?: boolean } =
        JSON.parse(line.slice('data: '.length))
      if (payload.token) yield { type: 'token', value: payload.token }
      else if (payload.blocked && payload.message)
        yield { type: 'blocked', message: payload.message }
    }
  }
}
