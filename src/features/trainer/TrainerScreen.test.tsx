import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TrainerScreen } from './TrainerScreen'

describe('TrainerScreen retry-after-error UX', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('allows correcting a wrong answer and checking again without using "Повторить ошибки"', async () => {
    const user = userEvent.setup()
    render(<TrainerScreen />)

    const input = screen.getByLabelText('Введите перевод на польский')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const repeatMistakesButtons = screen.getAllByRole('button', { name: 'Повторить ошибки' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
    expect(screen.getByText('новая ошибка')).toBeInTheDocument()
    expect(screen.getByText('Ваш ответ:')).toBeInTheDocument()
    expect(screen.getByLabelText('Разбор различий в ответе')).toBeInTheDocument()
    expect(checkButton).toBeDisabled()
    expect(repeatMistakesButtons[0]).toBeEnabled()
    const correctAnswerLabel = screen.getByText('Правильный ответ:')
    const correctedAnswer = correctAnswerLabel.parentElement?.textContent
      ?.replace('Правильный ответ:', '')
      .trim()
    expect(correctedAnswer).toBeTruthy()

    await user.clear(input)
    await user.type(input, correctedAnswer as string)

    expect(checkButton).toBeEnabled()
    expect(screen.queryByText('Ответ неверный')).not.toBeInTheDocument()

    await user.click(checkButton)

    expect(screen.getByText('Ответ верный')).toBeInTheDocument()
    expect(screen.queryByText('Ответ неверный')).not.toBeInTheDocument()
    expect(screen.getByText('Ежедневная практика')).toBeInTheDocument()
  })

  it('shows register badge, accepts an informal variant, and separates grammar from register notes', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      'b1-polish-trainer-session-v0',
      JSON.stringify({
        schemaVersion: 1,
        capturedAt: new Date().toISOString(),
        mode: 'daily',
        itemIds: ['write-if-questions'],
        currentIndex: 0,
        answer: '',
        checked: false,
        correct: null,
        revealedHint: false,
        finished: false,
      }),
    )

    render(<TrainerScreen />)

    expect(screen.getByText('formalnie')).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Введите перевод на польский'),
      'Jeśli masz pytania, napisz do mnie.',
    )
    await user.click(screen.getByRole('button', { name: 'Проверить' }))

    expect(screen.getByText('Ответ верный')).toBeInTheDocument()
    expect(screen.getByText('Jeśli mają Państwo pytania, proszę pisać do mnie')).toBeInTheDocument()
    expect(screen.getByText(/Jeśli masz pytania, napisz do mnie \(nieformalnie\)/)).toBeInTheDocument()
    expect(screen.getByText('Грамматика:')).toBeInTheDocument()
    expect(screen.getByText('Стиль/регистр:')).toBeInTheDocument()
    expect(screen.getByText(/ответ грамматически допустим, но звучит nieformalnie/)).toBeInTheDocument()
  })

  it('shows a neutral register badge for neutral trainer cards', () => {
    window.localStorage.setItem(
      'b1-polish-trainer-session-v0',
      JSON.stringify({
        schemaVersion: 1,
        capturedAt: new Date().toISOString(),
        mode: 'daily',
        itemIds: ['search-job'],
        currentIndex: 0,
        answer: '',
        checked: false,
        correct: null,
        revealedHint: false,
        finished: false,
      }),
    )

    render(<TrainerScreen />)

    expect(screen.getByText('neutralnie')).toBeInTheDocument()
  })
})
