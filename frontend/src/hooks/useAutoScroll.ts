import { useCallback, useEffect, useRef } from 'react'

const PIN_THRESHOLD_PX = 80

/**
 * Keeps a scroll container pinned to the newest content as `signal` changes
 * (new messages / streamed tokens), but **yields when the participant scrolls
 * up** — and re-engages once they return near the bottom.
 */
export function useAutoScroll<T extends HTMLElement>(signal: unknown) {
  const ref = useRef<T>(null)
  const pinnedRef = useRef(true)

  const handleScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    pinnedRef.current = distanceFromBottom < PIN_THRESHOLD_PX
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !pinnedRef.current) return
    // Optional chaining: jsdom doesn't implement Element.scrollTo.
    el.scrollTo?.({ top: el.scrollHeight, behavior: 'smooth' })
  }, [signal])

  return { ref, onScroll: handleScroll }
}
