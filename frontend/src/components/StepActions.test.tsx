import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StepActions } from '@/components/StepActions'

describe('StepActions', () => {
  it('renders Continue (named for the next step) and Refine on a non-final step', () => {
    render(<StepActions step={0} onContinue={() => {}} onRefine={() => {}} />)

    expect(screen.getByRole('button', { name: /continue to widen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refine this step/i })).toBeInTheDocument()
  })

  it('does not render Continue on the final Build step, but still offers Refine', () => {
    render(<StepActions step={5} onContinue={() => {}} onRefine={() => {}} />)

    expect(screen.queryByRole('button', { name: /continue to/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refine this step/i })).toBeInTheDocument()
  })

  it('passes the message step to onContinue and fires onRefine', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const onRefine = vi.fn()
    render(<StepActions step={2} onContinue={onContinue} onRefine={onRefine} />)

    await user.click(screen.getByRole('button', { name: /continue to ideate/i }))
    expect(onContinue).toHaveBeenCalledWith(2)

    await user.click(screen.getByRole('button', { name: /refine this step/i }))
    expect(onRefine).toHaveBeenCalledTimes(1)
  })
})
