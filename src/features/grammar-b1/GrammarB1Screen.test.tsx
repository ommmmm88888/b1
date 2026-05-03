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
    expect(screen.getByRole('heading', { name: 'Быстрый повтор' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Падежи без паники' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Существительные и прилагательные' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Глаголы: время, вид, управление' })).toBeInTheDocument()
    expect(screen.getAllByText('Когда это нужно').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Главное правило').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Частая ошибка').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Правильно по-польски').length).toBeGreaterThan(0)
    expect(screen.getAllByText('На экзамене пригодится').length).toBeGreaterThan(0)
    expect(screen.getByText('Mam problem z mieszkaniem.')).toBeInTheDocument()
    expect(screen.getByText('Szukam pracy.')).toBeInTheDocument()
    expect(screen.getAllByText((_, element) => (element?.textContent ?? '').toLowerCase().includes('byłem')).length).toBeGreaterThan(0)
    expect(screen.getAllByText((_, element) => (element?.textContent ?? '').toLowerCase().includes('robiłem')).length).toBeGreaterThan(0)
    expect(screen.getAllByText((_, element) => (element?.textContent ?? '').toLowerCase().includes('czekam na')).length).toBeGreaterThan(0)
    expect(screen.getByText('Jadę do lekarza i czekam na wizytę.')).toBeInTheDocument()
    expect(screen.getByText('Dzień dobry, piszę w sprawie pracy.')).toBeInTheDocument()

    expect(screen.queryByText('Нужно:')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Показать ответ' })[0])

    expect(screen.getAllByText('Нужно:').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Скрыть ответ' }).length).toBeGreaterThan(0)
  })
})
