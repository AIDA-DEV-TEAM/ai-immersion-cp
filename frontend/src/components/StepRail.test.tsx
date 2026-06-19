import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StepRail } from '@/components/StepRail'
import { STEP_TEMPLATES } from '@/data/stepTemplates'

describe('StepRail', () => {
  it('renders every step name', () => {
    render(<StepRail steps={STEP_TEMPLATES} currentStep={0} onSelectStep={() => {}} />)

    for (const step of STEP_TEMPLATES) {
      expect(screen.getByText(step.name)).toBeInTheDocument()
    }
  })

  it('renders a descriptor under every step name', () => {
    render(<StepRail steps={STEP_TEMPLATES} currentStep={0} onSelectStep={() => {}} />)

    for (const step of STEP_TEMPLATES) {
      expect(screen.getByText(step.descriptor)).toBeInTheDocument()
    }
  })

  it('marks only the current step with aria-current="step" (guardrail anchoring)', () => {
    render(<StepRail steps={STEP_TEMPLATES} currentStep={2} onSelectStep={() => {}} />)

    const current = screen.getByRole('button', { name: /diagnose/i })
    expect(current).toHaveAttribute('aria-current', 'step')

    const other = screen.getByRole('button', { name: /frame/i })
    expect(other).not.toHaveAttribute('aria-current')
  })

  it('checks completed steps that are behind the current one', () => {
    render(<StepRail steps={STEP_TEMPLATES} currentStep={2} onSelectStep={() => {}} />)

    // Frame and Widen are done → checked; Diagnose (current) and later keep numbers.
    expect(screen.getByRole('button', { name: /frame/i })).toHaveTextContent('✓')
    expect(screen.getByRole('button', { name: /diagnose/i })).toHaveTextContent('3')
  })

  it('calls onSelectStep with the chosen step index', async () => {
    const onSelectStep = vi.fn()
    const user = userEvent.setup()
    render(<StepRail steps={STEP_TEMPLATES} currentStep={0} onSelectStep={onSelectStep} />)

    await user.click(screen.getByRole('button', { name: /ideate/i }))

    expect(onSelectStep).toHaveBeenCalledWith(3)
  })
})
