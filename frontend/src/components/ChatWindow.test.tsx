import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { streamChat } from '@/api/chat'
import { ChatWindow } from '@/components/ChatWindow'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import type { StreamEvent } from '@/types/api'

// Mock the API layer — the smoke test exercises the UI, not the network.
vi.mock('@/api/chat', () => ({
  createSession: vi.fn(async () => ({ session_id: 'test-session', step_index: 0 })),
  updateStep: vi.fn(async () => ({ session_id: 'test-session', step_index: 0 })),
  streamChat: vi.fn(),
}))

async function* streamOf(...events: StreamEvent[]): AsyncGenerator<StreamEvent> {
  for (const event of events) yield event
}

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the start screen before a session exists', () => {
    renderWithClient(<ChatWindow />)
    expect(screen.getByRole('button', { name: /begin session/i })).toBeInTheDocument()
  })

  it('inserts the current step template verbatim into the composer', async () => {
    const user = userEvent.setup()
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))

    // Once the session starts, the Frame step composer appears.
    const insertButton = await screen.findByRole('button', { name: /insert frame template/i })
    await user.click(insertButton)

    const textarea = screen.getByLabelText(/your message/i)
    await waitFor(() => {
      expect(textarea).toHaveValue(STEP_TEMPLATES[0].template)
    })
  })

  it('renders a guardrail block as a distinct redirect notice, not a chat bubble', async () => {
    const user = userEvent.setup()
    vi.mocked(streamChat).mockReturnValue(
      streamOf({ type: 'blocked', message: "That's outside what this session covers — Frame step." }),
    )
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    const textarea = await screen.findByLabelText(/your message/i)
    await user.type(textarea, 'what is the capital of France?')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    // The redirect is shown via a role="status" notice referencing the step.
    const notice = await screen.findByRole('status')
    expect(notice).toHaveTextContent(/Frame step/i)
  })
})
