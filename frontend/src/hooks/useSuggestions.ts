import { useQuery } from '@tanstack/react-query'

import { fetchSuggestions } from '@/api/chat'
import type { SuggestionsResponse } from '@/types/api'

interface UseSuggestionsParams {
  sessionId: string | null
  stepIndex: number
  /** Completed step output to ground suggestions in; null while none is ready. */
  assistantMessage: string | null
}

/**
 * Fetch next-action suggestions for a completed step's output. Keyed on the
 * message content so it runs once per finished step and refetches when a new
 * output lands. `enabled` gates it until both a session and a completed message
 * exist — so it never blocks the stream. `retry: false` makes failure render
 * nothing (fail-open-to-nothing), matching the backend.
 */
export function useSuggestions({ sessionId, stepIndex, assistantMessage }: UseSuggestionsParams) {
  return useQuery<SuggestionsResponse, Error>({
    queryKey: ['suggestions', sessionId, stepIndex, assistantMessage],
    queryFn: () => {
      // Guarded by `enabled`; narrow explicitly so no non-null assertion is needed.
      if (!sessionId || !assistantMessage) throw new Error('No completed message to suggest on')
      return fetchSuggestions(sessionId, stepIndex, assistantMessage)
    },
    enabled: Boolean(sessionId && assistantMessage),
    // A given output's suggestions never change, so never refetch or retry.
    staleTime: Infinity,
    retry: false,
  })
}
