import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TrainerScreen } from './TrainerScreen'

describe('TrainerScreen retry-after-error UX', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    window.localStorage.clear()
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
})
