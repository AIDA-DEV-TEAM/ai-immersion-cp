import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MessageList } from '@/components/MessageList'
import type { Message } from '@/types/api'

const baseProps = {
  messages: [],
  error: null,
  currentStep: 0,
  onContinue: () => {},
  onRefine: () => {},
  suggestions: [],
  suggestionsLoading: false,
  onSelectSuggestion: () => {},
}

describe('MessageList', () => {
  it('shows the thinking indicator while awaiting the first token', () => {
    render(<MessageList {...baseProps} streamingContent="" isStreaming />)

    expect(screen.getByText(/thinking/i)).toBeInTheDocument()
  })

  it('replaces the thinking indicator with content once tokens arrive', () => {
    render(<MessageList {...baseProps} streamingContent="Here is the restated challenge." isStreaming />)

    expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument()
    expect(screen.getByText(/restated challenge/i)).toBeInTheDocument()
  })

  it('shows suggestions only on the latest current-step output, not superseded ones', () => {
    const messages: Message[] = [
      { role: 'user', content: 'frame our challenge' },
      { role: 'assistant', content: 'First restatement.', step: 0 },
      { role: 'user', content: 'refine it' },
      { role: 'assistant', content: 'Refined restatement.', step: 0 },
    ]
    render(
      <MessageList
        {...baseProps}
        messages={messages}
        streamingContent={null}
        isStreaming={false}
        suggestions={['Sharpen the success metric.']}
      />,
    )

    // The suggestion attaches once — to the latest current-step output only.
    expect(
      screen.getAllByRole('button', { name: /sharpen the success metric/i }),
    ).toHaveLength(1)
  })

  it('renders a per-step header where each step section begins (not just the empty state)', () => {
    const messages: Message[] = [
      { role: 'user', content: 'frame our challenge', step: 0 },
      { role: 'assistant', content: 'Framed.', step: 0 },
      { role: 'user', content: 'widen it', step: 1 },
      { role: 'assistant', content: 'Widened.', step: 1 },
    ]
    render(
      <MessageList
        {...baseProps}
        messages={messages}
        currentStep={1}
        streamingContent={null}
        isStreaming={false}
      />,
    )

    // The Widen section is announced mid-thread with the same eyebrow/heading/descriptor.
    expect(screen.getByText(/step 2 · widen/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Widen' })).toBeInTheDocument()
    expect(screen.getByText('Explore the problem space')).toBeInTheDocument()
    // And the earlier Frame section still has its own header.
    expect(screen.getByText(/step 1 · frame/i)).toBeInTheDocument()
  })
})
