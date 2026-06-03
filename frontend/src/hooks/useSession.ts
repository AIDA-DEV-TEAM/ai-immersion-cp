import { useMutation } from '@tanstack/react-query'

import { createSession } from '@/api/chat'
import type { SessionResponse } from '@/types/api'

/** React Query mutation that provisions a session (the one non-streaming call). */
export function useSession() {
  return useMutation<SessionResponse, Error>({
    mutationFn: createSession,
  })
}
