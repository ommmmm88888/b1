import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

describe('App navigation', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders accessible navigation with an obvious active section', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Основные разделы' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Тренировка' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Пробный экзамен' }))

    expect(screen.getByRole('button', { name: 'Пробный экзамен' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Пробный мини-экзамен' })).toBeInTheDocument()
  })
})
