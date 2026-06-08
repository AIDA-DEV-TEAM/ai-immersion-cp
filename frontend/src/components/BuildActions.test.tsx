import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MessageList } from '@/components/MessageList'
import type { Message } from '@/types/api'

const baseProps = {
  streamingContent: null,
  isStreaming: false,
  error: null,
  currentStepName: 'Build',
}

function renderMessages(messages: Message[]) {
  return render(<MessageList {...baseProps} messages={messages} />)
}

describe('Build-step export controls', () => {
  it('renders copy and export controls on a completed Build-step message', () => {
    renderMessages([{ role: 'assistant', content: '# PRD\n\nBuild this.', step: 5 }])

    expect(screen.getByRole('button', { name: /copy the build prompt/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export the build prompt/i })).toBeInTheDocument()
  })

  it('does not render controls on non-Build assistant or user messages', () => {
    renderMessages([
      { role: 'user', content: 'My challenge…' },
      { role: 'assistant', content: 'Widen-step insights.', step: 1 },
    ])

    expect(screen.queryByRole('button', { name: /copy the build prompt/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /export the build prompt/i }),
    ).not.toBeInTheDocument()
  })

  it('copies the raw markdown source and shows feedback when Copy is clicked', async () => {
    const prd = '# PRD\n\n- **product**: Acme'
    const user = userEvent.setup()
    // userEvent.setup() installs a clipboard stub; spy on its writeText to assert.
    const writeText = vi.spyOn(navigator.clipboard, 'writeText')
    renderMessages([{ role: 'assistant', content: prd, step: 5 }])

    await user.click(screen.getByRole('button', { name: /copy the build prompt/i }))

    expect(writeText).toHaveBeenCalledWith(prd)
    expect(await screen.findByText('Copied')).toBeInTheDocument()
  })
})
