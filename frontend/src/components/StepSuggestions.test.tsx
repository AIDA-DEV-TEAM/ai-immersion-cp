import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StepSuggestions } from '@/components/StepSuggestions'

describe('StepSuggestions', () => {
  it('renders nothing when there are no suggestions and not loading', () => {
    const { container } = render(
      <StepSuggestions suggestions={[]} loading={false} onSelect={() => {}} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a loading line while suggestions are in flight', () => {
    render(<StepSuggestions suggestions={[]} loading onSelect={() => {}} />)

    expect(screen.getByText(/generating suggestions/i)).toBeInTheDocument()
    // No buttons yet — the line stands in until results arrive.
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('replaces the loading line with buttons once suggestions arrive', () => {
    render(
      <StepSuggestions
        suggestions={['Sharpen the success metric.', 'Add the night-shift persona.']}
        loading
        onSelect={() => {}}
      />,
    )

    // Results take precedence over the in-flight state — no lingering loading line.
    expect(screen.queryByText(/generating suggestions/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sharpen the success metric/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add the night-shift persona/i })).toBeInTheDocument()
  })

  it('renders each suggestion as a card with a leading icon', () => {
    render(
      <StepSuggestions
        suggestions={['Sharpen the success metric.']}
        loading={false}
        onSelect={() => {}}
      />,
    )

    const card = screen.getByRole('button', { name: /sharpen the success metric/i })
    // Card styling: bordered surface, not a plain button.
    expect(card).toHaveClass('rounded-xl', 'border', 'bg-surface')
    // A decorative leading icon adorns the card without affecting its accessible name.
    expect(card.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('passes the suggestion text to onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <StepSuggestions
        suggestions={['Sharpen the success metric.']}
        loading={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: /sharpen the success metric/i }))

    expect(onSelect).toHaveBeenCalledWith('Sharpen the success metric.')
  })
})
