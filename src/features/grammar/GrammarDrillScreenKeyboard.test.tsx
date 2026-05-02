import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GrammarDrillScreen } from './GrammarDrillScreen'

describe('GrammarDrillScreen keyboard flow', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('checks with Enter, focuses next, and advances with Enter again', async () => {
    const user = userEvent.setup()
    render(<GrammarDrillScreen />)

    const input = screen.getByLabelText('Введите польскую форму')
    const nextButton = screen.getByRole('button', { name: 'Следующее' })
    const progressBefore = screen.getByText('Прогресс темы').parentElement?.textContent ?? ''

    await user.type(input, 'неверный ответ')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
      expect(nextButton).toBeEnabled()
      expect(nextButton).toHaveFocus()
    })

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(input).toHaveFocus()
      expect(screen.getByText('Прогресс темы').parentElement?.textContent).not.toBe(progressBefore)
    })
  })

  it('moves focus to next after mouse check and restores input focus after next', async () => {
    const user = userEvent.setup()
    render(<GrammarDrillScreen />)

    const input = screen.getByLabelText('Введите польскую форму')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
      expect(nextButton).toBeEnabled()
      expect(nextButton).toHaveFocus()
    })

    await user.click(nextButton)

    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })
})
