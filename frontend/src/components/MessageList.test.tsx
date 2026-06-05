import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MessageList } from '@/components/MessageList'

const baseProps = {
  messages: [],
  error: null,
  currentStepName: 'Frame',
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
})
