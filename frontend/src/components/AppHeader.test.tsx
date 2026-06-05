import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { AppHeader } from '@/components/AppHeader'

afterEach(() => {
  document.documentElement.classList.remove('dark')
  localStorage.clear()
})

describe('AppHeader', () => {
  it('toggles the dark theme on the document element', async () => {
    const user = userEvent.setup()
    render(<AppHeader />)

    expect(document.documentElement).not.toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    expect(document.documentElement).toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: /switch to light theme/i }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
