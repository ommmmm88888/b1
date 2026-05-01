import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { ListeningPracticeScreen } from './ListeningPracticeScreen'

describe('ListeningPracticeScreen', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('shows compact wrong and correct answer feedback after checking', async () => {
    const user = userEvent.setup()

    render(<ListeningPracticeScreen />)

    const wrongAnswer = screen.getByRole('radio', { name: 'do dentysty' })
    const correctAnswer = screen.getByRole('radio', { name: 'do lekarza rodzinnego' })

    await user.click(wrongAnswer)
    await user.click(screen.getByRole('radio', { name: 'po godzinie szesnastej' }))
    await user.click(screen.getByRole('radio', { name: 'gorączka i kaszel' }))

    await user.click(screen.getByRole('button', { name: 'Проверить' }))

    expect(wrongAnswer.closest('label')).toHaveClass('choice-item--wrong')
    expect(correctAnswer.closest('label')).toHaveClass('choice-item--correct')
    expect(screen.getAllByText('Ответ неверный')).toHaveLength(1)
    expect(screen.getAllByText('Ваш ответ:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Правильный ответ:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Пояснение:').length).toBeGreaterThan(0)
  })
})
