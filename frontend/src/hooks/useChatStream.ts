import { useCallback, useEffect, useRef, useState } from 'react'

import { streamChat } from '@/api/chat'
import type { Message } from '@/types/api'

interface ChatStreamState {
  messages: Message[]
  /** The assistant message currently being revealed, or null when idle. */
  streamingContent: string | null
  isStreaming: boolean
  error: string | null
}

// Smoothing-buffer cadence (characters per second). Floored so short bursts still
// read as steady typing; raised with backlog so the reveal never lags far behind
// the network and the turn still finishes promptly.
const MIN_CHARS_PER_SECOND = 80
const MAX_CHARS_PER_SECOND = 600

export function useChatStream() {
  const [state, setState] = useState<ChatStreamState>({
    messages: [],
    streamingContent: null,
    isStreaming: false,
    error: null,
  })

  // Decouple network arrival from on-screen reveal: the network fills `target`, and
  // an animation loop releases it ~character-by-character into `streamingContent`.
  const targetRef = useRef('')
  const shownRef = useRef(0)
  const fracRef = useRef(0)
  const lastTickRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const runningRef = useRef(false)
  const doneRef = useRef(false)
  // The step active when the in-flight turn was sent, stamped onto the finalized
  // assistant message so the Build-step PRD can surface its export controls.
  const sentStepRef = useRef<number | null>(null)

  const stopLoop = useCallback(() => {
    runningRef.current = false
    doneRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const finalize = useCallback(() => {
    runningRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    const full = targetRef.current
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: 'assistant', content: full, step: sentStepRef.current ?? undefined },
      ],
      streamingContent: null,
      isStreaming: false,
    }))
  }, [])

  const tick = useCallback(
    (now: number) => {
      if (!runningRef.current) return
      // Clamp large gaps (tab backgrounded) so we don't dump a huge chunk at once.
      const dt = Math.min(now - lastTickRef.current, 100)
      lastTickRef.current = now

      const backlog = targetRef.current.length - shownRef.current
      if (backlog > 0) {
        const cps = Math.min(MAX_CHARS_PER_SECOND, Math.max(MIN_CHARS_PER_SECOND, backlog * 6))
        fracRef.current += (cps * dt) / 1000
        const reveal = Math.min(Math.floor(fracRef.current), backlog)
        if (reveal > 0) {
          fracRef.current -= reveal
          shownRef.current += reveal
          const shown = targetRef.current.slice(0, shownRef.current)
          setState((prev) => ({ ...prev, streamingContent: shown }))
        }
      }

      if (shownRef.current >= targetRef.current.length && doneRef.current) {
        finalize()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [finalize],
  )

  const send = useCallback(
    async (sessionId: string, text: string, step: number): Promise<void> => {
      targetRef.current = ''
      shownRef.current = 0
      fracRef.current = 0
      doneRef.current = false
      sentStepRef.current = step

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, { role: 'user', content: text }],
        streamingContent: '',
        isStreaming: true,
        error: null,
      }))

      const hasRaf = typeof requestAnimationFrame === 'function'
      const startLoop = () => {
        if (runningRef.current) return
        runningRef.current = true
        if (hasRaf) {
          lastTickRef.current = performance.now()
          rafRef.current = requestAnimationFrame(tick)
        }
      }

      try {
        for await (const event of streamChat(sessionId, text)) {
          if (event.type === 'blocked') {
            // Guardrail redirect: render a notice, not a facilitator reply, and stop.
            stopLoop()
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
          targetRef.current += event.value
          startLoop()
          if (!hasRaf) {
            // No animation frames (non-browser): reveal immediately, no smoothing.
            shownRef.current = targetRef.current.length
            setState((prev) => ({ ...prev, streamingContent: targetRef.current }))
          }
        }
        doneRef.current = true
        // No tokens streamed, or no rAF to drain the buffer → commit now. Otherwise
        // the running loop finalizes once it has revealed the last character.
        if (!runningRef.current || !hasRaf) finalize()
      } catch {
        stopLoop()
        setState((prev) => ({
          ...prev,
          streamingContent: null,
          isStreaming: false,
          error: 'The assistant could not respond. Please try again.',
        }))
      }
    },
    [tick, finalize, stopLoop],
  )

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  return { ...state, send }
}
