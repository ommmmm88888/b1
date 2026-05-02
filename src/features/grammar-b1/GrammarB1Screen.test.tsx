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

    expect(screen.getByRole('heading', { name: 'Справочник польского B1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Что повторить быстро' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Падежи без паники' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Существительные и прилагательные' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Глаголы: время, вид, управление' })).toBeInTheDocument()
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('Mieszkam w ładnym mieście.') ?? false).length,
    ).toBeGreaterThan(0)

    expect(screen.queryByText('Нужно:')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Проверить себя' })[0])

    expect(screen.getAllByText('Нужно:').length).toBeGreaterThan(0)
  })
})
