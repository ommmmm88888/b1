import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { GrammarB1Screen } from './GrammarB1Screen'

describe('GrammarB1Screen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders search, filters, and handbook sections from data', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.getByRole('heading', { name: 'Справочник польского B1' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Поиск по справочнику' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Как сказать?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Все' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Скоро' })).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: 'Поиск по справочнику' })

    await user.type(search, 'Szukam pracy')
    expect(screen.getByRole('heading', { name: 'Падежи без паники' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Глаголы: время, вид, управление' })).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'byłem')
    expect(screen.getByRole('heading', { name: 'Глаголы: время, вид, управление' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Падежи без паники' })).not.toBeInTheDocument()

    await user.clear(search)
    await user.click(screen.getByRole('button', { name: 'Скоро' }))
    expect(screen.getByRole('heading', { name: 'Предлоги и типичные связки' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Порядок слов' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Падежи без паники' })).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'Несуществующая фраза')
    expect(screen.getByText('Ничего не найдено. Попробуйте: падежи, глаголы, письмо.')).toBeInTheDocument()

    await user.clear(search)
    await user.click(screen.getByRole('button', { name: 'Все' }))
    expect(screen.getByRole('heading', { name: 'Падежи без паники' })).toBeInTheDocument()
  })

  it('keeps mini-test answers hidden until reveal', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.queryByText('Нужно:')).not.toBeInTheDocument()
    const revealButtons = screen.getAllByRole('button', { name: 'Показать ответ' })
    expect(revealButtons.length).toBeGreaterThan(0)

    await user.click(revealButtons[0])

    expect(screen.getAllByText('Нужно:').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Скрыть ответ' })).toBeInTheDocument()
  })

  it('checks phrases from the helper and supports Ctrl+Enter', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    const textarea = screen.getByRole('textbox', { name: 'Фраза для проверки' })
    const button = screen.getByRole('button', { name: 'Проверить фразу' })

    fireEvent.change(textarea, { target: { value: 'Я ищу работу.' } })
    await user.click(button)
    expect(screen.getByText('Можно сказать так')).toBeInTheDocument()
    expect(screen.getAllByText('Szukam pracy.').length).toBeGreaterThan(0)

    fireEvent.change(textarea, { target: { value: 'Szukam pracę.' } })
    await user.click(button)
    expect(screen.getByText('Лучше исправить')).toBeInTheDocument()
    expect(screen.getAllByText('Szukam pracy.').length).toBeGreaterThan(0)

    fireEvent.change(textarea, { target: { value: 'Szukam pracy.' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
    expect(await screen.findByText('Похоже, так можно')).toBeInTheDocument()

    fireEvent.change(textarea, { target: { value: 'Музыка.' } })
    await user.click(button)
    expect(screen.getByText('Пока нет точного ответа')).toBeInTheDocument()
    expect(screen.getByText(/Пока нет точного варианта|Я пока проверяю только частые B1-шаблоны/)).toBeInTheDocument()
  })
})
