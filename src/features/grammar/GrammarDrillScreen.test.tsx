import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { GrammarDrillScreen } from './GrammarDrillScreen'

describe('GrammarDrillScreen retry-after-error UX', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('allows correcting a wrong answer and checking again in the same exercise', async () => {
    const user = userEvent.setup()
    render(<GrammarDrillScreen />)

    const input = screen.getByLabelText('Введите польскую форму')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
    expect(screen.getByText('новая ошибка')).toBeInTheDocument()
    expect(screen.getByText('Ваш ответ:')).toBeInTheDocument()
    expect(screen.getByLabelText('Разбор различий в ответе')).toBeInTheDocument()
    expect(checkButton).toBeDisabled()

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
    expect(screen.getByText('Грамматические микродриллы')).toBeInTheDocument()
  })

  it('allows correcting a wrong choice and checking again in the same exercise', async () => {
    const user = userEvent.setup()
    render(<GrammarDrillScreen />)

    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })
    const input = screen.getByLabelText('Введите польскую форму')

    await user.type(input, 'x')
    await user.click(checkButton)
    await user.click(nextButton)

    const secondInput = screen.getByLabelText('Введите польскую форму')
    await user.type(secondInput, 'x')
    await user.click(checkButton)
    await user.click(nextButton)

    expect(screen.getByRole('radiogroup', { name: 'Варианты ответа' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'były' }))

    expect(screen.getByRole('radio', { name: 'były' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'były' }).closest('label')).toHaveClass('choice-item--selected')
    expect(screen.getByRole('radio', { name: 'były' }).closest('label')).toHaveTextContent('Выбрано')

    await user.click(checkButton)

    expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
    expect(screen.getByText('новая ошибка')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'były' }).closest('label')).toHaveClass('choice-item--wrong')
    expect(screen.getByRole('radio', { name: 'były' }).closest('label')).toHaveTextContent('Ваш выбор')
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveClass('choice-item--correct')
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveTextContent('Правильный ответ')
    expect(checkButton).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'byli' }))

    expect(checkButton).toBeEnabled()
    expect(screen.queryByText('Ответ неверный')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveClass('choice-item--selected')
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveTextContent('Выбрано')

    await user.click(checkButton)

    expect(screen.getByText('Ответ верный')).toBeInTheDocument()
    expect(screen.queryByText('Ответ неверный')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveClass('choice-item--correct')
    expect(screen.getByRole('radio', { name: 'byli' }).closest('label')).toHaveTextContent('Правильный ответ')
  })
})
