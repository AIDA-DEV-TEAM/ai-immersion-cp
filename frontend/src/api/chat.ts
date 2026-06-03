import { apiClient } from '@/api/client'
import type { SessionResponse } from '@/types/api'

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
 * Stream one chat turn. Yields assistant text tokens as they arrive.
 *
 * Uses `fetch` + a ReadableStream reader (not React Query / axios) because token
 * streaming over SSE isn't React Query's model. Each SSE frame is JSON: either
 * `{ token }` or `{ done: true }`.
 */
export async function* streamChat(
  sessionId: string,
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
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
      const payload: { token?: string; done?: boolean } = JSON.parse(line.slice('data: '.length))
      if (payload.token) yield payload.token
    }
  }
}
