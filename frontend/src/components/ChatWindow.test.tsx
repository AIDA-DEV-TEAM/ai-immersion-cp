import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchSuggestions, streamChat } from '@/api/chat'
import { ChatWindow } from '@/components/ChatWindow'
import { DUMMY_DATA_REMINDER } from '@/components/DummyDataReminder'
import { STEP_TEMPLATES } from '@/data/stepTemplates'
import type { StreamEvent } from '@/types/api'

// Mock the API layer — the smoke test exercises the UI, not the network.
vi.mock('@/api/chat', () => ({
  createSession: vi.fn(async () => ({ session_id: 'test-session', step_index: 0 })),
  updateStep: vi.fn(async () => ({ session_id: 'test-session', step_index: 0 })),
  streamChat: vi.fn(),
  // Default to no suggestions; individual tests override to exercise the buttons.
  fetchSuggestions: vi.fn(async () => ({ suggestions: [] })),
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

  it('shows the persistent dummy-data reminder in the composer area', async () => {
    const user = userEvent.setup()
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))

    // The reminder lives inside the composer form and is non-dismissible.
    const composer = await screen.findByRole('form', { name: /message composer/i })
    expect(within(composer).getByText(DUMMY_DATA_REMINDER)).toBeInTheDocument()
  })

  // Streaming tests below drive the smoothed-reveal rAF loop, so they need a per-test
  // timeout well above the 5s default under full-suite parallel load (slow CI env).
  const STREAM_TIMEOUT = 15000

  it('Continue advances the step and inserts the next template without sending', async () => {
    const user = userEvent.setup()
    vi.mocked(streamChat).mockReturnValue(streamOf({ type: 'token', value: 'Restated challenge.' }))
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    const textarea = await screen.findByLabelText(/your message/i)
    await user.type(textarea, 'our framed challenge')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    // Once the Frame output finishes streaming (smoothed reveal + finalize), its
    // Continue action appears — allow extra time for the animation loop to drain.
    const continueButton = await screen.findByRole(
      'button',
      { name: /continue to widen/i },
      { timeout: 8000 },
    )
    expect(vi.mocked(streamChat)).toHaveBeenCalledTimes(1)

    await user.click(continueButton)

    // Step advanced (Widen composer affordances) and the Widen template is inserted…
    expect(screen.getByRole('button', { name: /insert widen template/i })).toBeInTheDocument()
    await waitFor(() => expect(textarea).toHaveValue(STEP_TEMPLATES[1].template))
    // …but nothing was sent — streamChat is not called a second time.
    expect(vi.mocked(streamChat)).toHaveBeenCalledTimes(1)
  }, STREAM_TIMEOUT)

  it('inserts a clicked suggestion as a refine directive without sending', async () => {
    const user = userEvent.setup()
    vi.mocked(streamChat).mockReturnValue(streamOf({ type: 'token', value: 'Restated challenge.' }))
    vi.mocked(fetchSuggestions).mockResolvedValue({
      suggestions: ['Sharpen the success metric for the night-shift NOC engineer.'],
    })
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    const textarea = await screen.findByLabelText(/your message/i)
    await user.type(textarea, 'our framed challenge')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    // The suggestion is fetched only after the turn finishes and rendered as a button.
    const suggestionButton = await screen.findByRole(
      'button',
      { name: /sharpen the success metric/i },
      { timeout: 8000 },
    )
    expect(vi.mocked(fetchSuggestions)).toHaveBeenCalledTimes(1)

    await user.click(suggestionButton)

    // Clicking inserts a refine directive aimed at the prior output — but never sends it,
    // so the model revises that step's output rather than answering a fresh request.
    await waitFor(() =>
      expect(textarea).toHaveValue(
        'Refine your previous response to: Sharpen the success metric for the night-shift NOC engineer.',
      ),
    )
    expect(vi.mocked(streamChat)).toHaveBeenCalledTimes(1)
  }, STREAM_TIMEOUT)

  it('shows a loading line while the suggestions call is in flight', async () => {
    const user = userEvent.setup()
    vi.mocked(streamChat).mockReturnValue(streamOf({ type: 'token', value: 'Restated challenge.' }))
    // Never resolves — the suggestions query stays pending so the indicator persists.
    vi.mocked(fetchSuggestions).mockReturnValue(new Promise(() => {}))
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    const textarea = await screen.findByLabelText(/your message/i)
    await user.type(textarea, 'our framed challenge')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    // Continue/Refine are available immediately; the loading line sits in the
    // suggestion spot while the separate call is in flight.
    await screen.findByRole('button', { name: /continue to widen/i }, { timeout: 8000 })
    expect(screen.getByText(/generating suggestions/i)).toBeInTheDocument()
  }, STREAM_TIMEOUT)

  it('renders no suggestion buttons when the suggestions call fails', async () => {
    const user = userEvent.setup()
    vi.mocked(streamChat).mockReturnValue(streamOf({ type: 'token', value: 'Restated challenge.' }))
    vi.mocked(fetchSuggestions).mockRejectedValue(new Error('suggestions unavailable'))
    renderWithClient(<ChatWindow />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    const textarea = await screen.findByLabelText(/your message/i)
    await user.type(textarea, 'our framed challenge')
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    // The fixed Continue and Refine actions still appear — step output is unaffected.
    await screen.findByRole('button', { name: /continue to widen/i }, { timeout: 8000 })
    expect(screen.getByRole('button', { name: /refine this step/i })).toBeInTheDocument()
    await waitFor(() => expect(vi.mocked(fetchSuggestions)).toHaveBeenCalledTimes(1))
    // Fail-to-nothing: the loading line clears and no suggestion buttons remain.
    await waitFor(() =>
      expect(screen.queryByText(/generating suggestions/i)).not.toBeInTheDocument(),
    )
  }, STREAM_TIMEOUT)

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
