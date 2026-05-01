import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { ReadingPracticeScreen } from './ReadingPracticeScreen'

describe('ReadingPracticeScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('shows compact wrong and correct answer feedback after checking', async () => {
    const user = userEvent.setup()

    render(<ReadingPracticeScreen />)

    const wrongAnswer = screen.getByRole('radio', { name: 'od 8.00 do 16.00' })
    const correctAnswer = screen.getByRole('radio', { name: 'od 9.00 do 19.00' })

    await user.click(wrongAnswer)

    expect(wrongAnswer).toHaveAttribute('aria-checked', 'true')
    expect(wrongAnswer.closest('label')).toHaveClass('choice-item--selected')
    expect(wrongAnswer.closest('label')).toHaveTextContent('Выбрано')

    await user.click(screen.getByRole('radio', { name: 'fałsz' }))
    await user.click(screen.getByRole('radio', { name: 'zostawić książki w skrzynce' }))
    await user.click(screen.getByRole('radio', { name: 'сообщить об изменениях в библиотеке' }))

    await user.click(screen.getByRole('button', { name: 'Проверить' }))

    expect(wrongAnswer.closest('label')).toHaveClass('choice-item--wrong')
    expect(wrongAnswer.closest('label')).toHaveTextContent('Ваш выбор')
    expect(correctAnswer.closest('label')).toHaveClass('choice-item--correct')
    expect(correctAnswer.closest('label')).toHaveTextContent('Правильный ответ')
    expect(screen.getAllByText('Ответ неверный')).toHaveLength(1)
    expect(screen.getAllByText('Ваш ответ:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Правильный ответ:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Пояснение:').length).toBeGreaterThan(0)
  })
})
