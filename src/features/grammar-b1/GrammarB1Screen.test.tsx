import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { GrammarB1Screen } from './GrammarB1Screen'

describe('GrammarB1Screen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders the new grammar section from the main app navigation', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.getByRole('heading', { name: 'Грамматика B1' })).toBeInTheDocument()
    expect(screen.getAllByText('Падежи')[0]).toBeInTheDocument()
    expect(screen.getByText('7 przypadków')).toBeInTheDocument()
    expect(screen.getByText('Mieszkam w ładnym mieście.')).toBeInTheDocument()

    expect(screen.queryByText('Нужно:')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Проверить себя' })[0])

    expect(screen.getAllByText('Нужно:').length).toBeGreaterThan(0)
  })
})
