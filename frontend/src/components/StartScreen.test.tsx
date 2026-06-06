import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StartScreen } from '@/components/StartScreen'
import { STEP_TEMPLATES } from '@/data/stepTemplates'

describe('StartScreen', () => {
  it('previews all six steps of the flow', () => {
    render(<StartScreen onBegin={() => {}} isPending={false} isError={false} />)

    for (const step of STEP_TEMPLATES) {
      expect(screen.getByText(step.name)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('calls onBegin when the primary CTA is clicked', async () => {
    const user = userEvent.setup()
    const onBegin = vi.fn()
    render(<StartScreen onBegin={onBegin} isPending={false} isError={false} />)

    await user.click(screen.getByRole('button', { name: /begin session/i }))
    expect(onBegin).toHaveBeenCalledOnce()
  })
})
