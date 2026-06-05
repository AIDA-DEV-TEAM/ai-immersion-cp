import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MessageBubble } from '@/components/MessageBubble'

describe('MessageBubble', () => {
  it('renders an assistant message as structured markdown', () => {
    const content = '## Findings\n\n- first insight\n- second insight\n\n**Recommendation:** pilot it.'
    render(<MessageBubble role="assistant" content={content} />)

    expect(screen.getByRole('heading', { level: 2, name: /findings/i })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText(/recommendation:/i).tagName).toBe('STRONG')
  })

  it('renders an in-progress streaming assistant message as formatted markdown', () => {
    // Mid-stream the markdown is incomplete; the dangling ** must format as
    // in-progress bold, never show as a raw asterisk.
    const { container } = render(<MessageBubble role="assistant" content={'**NOC'} streaming />)

    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('NOC')
    expect(container.textContent).not.toContain('*')
  })

  it('renders a user message as plain text, not markdown', () => {
    // Leading "## " must survive verbatim (templates hold literal text/brackets).
    render(<MessageBubble role="user" content="## not a heading [BLANK]" />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('## not a heading [BLANK]')).toBeInTheDocument()
  })
})
