import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GrammarB1Screen } from './GrammarB1Screen'
import { copyPhraseToClipboard } from '../../lib/clipboard'

describe('GrammarB1Screen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders search, filters, gender chips, and handbook sections from data', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.getByRole('heading', { name: 'Справочник польского B1' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Поиск по справочнику' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Как сказать?' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Все' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Скоро' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'мужской' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'женский' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'оба' })).toBeInTheDocument()

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
    await user.click(screen.getAllByRole('button', { name: 'Все' })[0])
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

  it('respects gender preference and renders variant-aware helper phrases', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    const textarea = screen.getByRole('textbox', { name: 'Фраза для проверки' })
    const button = screen.getByRole('button', { name: 'Проверить фразу' })

    await user.click(screen.getByRole('button', { name: 'женский' }))
    fireEvent.change(textarea, { target: { value: 'Я хотел бы спросить.' } })
    await user.click(button)
    expect(screen.getByText('Женский вариант')).toBeInTheDocument()
    expect(screen.getAllByText('Chciałabym zapytać.').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'мужской' }))
    fireEvent.change(textarea, { target: { value: 'Я хотел бы спросить.' } })
    await user.click(button)
    expect(screen.getByText('Мужской вариант')).toBeInTheDocument()
    expect(screen.getAllByText('Chciałbym zapytać.').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'оба' }))
    fireEvent.change(textarea, { target: { value: 'Я хотел бы спросить.' } })
    await user.click(button)
    expect(screen.getByText('Мужской вариант')).toBeInTheDocument()
    expect(screen.getByText('Женский вариант')).toBeInTheDocument()
    expect(screen.getAllByText('Chciałbym zapytać.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chciałabym zapytać.').length).toBeGreaterThan(0)
  })

  it('checks phrases from the helper and supports Ctrl+Enter', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    const textarea = screen.getByRole('textbox', { name: 'Фраза для проверки' })
    const button = screen.getByRole('button', { name: 'Проверить фразу' })

    fireEvent.change(textarea, { target: { value: 'Я хотел бы сказать, что это важно.' } })
    await user.click(button)
    expect(screen.getByText('Можно сказать так')).toBeInTheDocument()
    expect(screen.getByText('Chciałbym powiedzieć, że...')).toBeInTheDocument()

    fireEvent.change(textarea, { target: { value: 'Я пишу по поводу курса.' } })
    await user.click(button)
    expect(screen.getAllByText('Piszę w sprawie...').length).toBeGreaterThan(0)

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

  it('renders category buttons and popular templates', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    expect(screen.getAllByRole('button', { name: 'Письмо' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Говорение' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Работа' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Экзамен' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Ошибки' }).length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Письмо' })[1])
    expect(screen.getByText('Популярные шаблоны')).toBeInTheDocument()
    expect(screen.getAllByText(/Piszę w sprawie|Chciałbym uzyskać więcej informacji/).length).toBeGreaterThan(0)
  })

  it('shows related suggestions and supports copy feedback', async () => {
    const user = userEvent.setup()
    render(<GrammarB1Screen />)

    const textarea = screen.getByRole('textbox', { name: 'Фраза для проверки' })
    const button = screen.getByRole('button', { name: 'Проверить фразу' })

    fireEvent.change(textarea, { target: { value: 'Я хочу странную фразу без шаблона.' } })
    await user.click(button)

    expect(screen.getByText('Пока нет точного ответа')).toBeInTheDocument()
    expect(screen.getByText('Вот похожие шаблоны:')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Письмо|Говорение|Работа|Экзамен|Просьбы|Жалобы|Ошибки/ }).length).toBeGreaterThan(0)

    fireEvent.change(textarea, { target: { value: 'Я ищу работу.' } })
    await user.click(button)
    expect(screen.getByText('Можно сказать так')).toBeInTheDocument()
    const copyButtons = screen.getAllByRole('button', { name: 'Скопировать' })
    await user.click(copyButtons[0])
    expect(await screen.findByText('Скопировано')).toBeInTheDocument()
  })

  it('returns copy failure feedback when clipboard write fails', async () => {
    const feedback = await copyPhraseToClipboard('Szukam pracy.', {
      writeText: vi.fn().mockRejectedValue(new Error('clipboard unavailable')),
    })

    expect(feedback).toBe('Не удалось скопировать. Можно выделить текст вручную.')
  })
})
