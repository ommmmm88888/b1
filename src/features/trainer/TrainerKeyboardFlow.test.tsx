import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TrainerScreen } from './TrainerScreen'

describe('TrainerScreen keyboard flow', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('checks with Enter, focuses next, and advances with Enter again', async () => {
    const user = userEvent.setup()
    render(<TrainerScreen />)

    const input = screen.getByLabelText('Введите перевод на польский')
    const nextButton = screen.getByRole('button', { name: 'Следующее' })
    const progressBefore = screen.getByText('Прогресс:').parentElement?.textContent ?? ''

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
      expect(screen.getByText('Прогресс:').parentElement?.textContent).not.toBe(progressBefore)
    })
  })

  it('moves focus to next after mouse check and returns to input after next', async () => {
    const user = userEvent.setup()
    render(<TrainerScreen />)

    const input = screen.getByLabelText('Введите перевод на польский')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Ответ неверный')).toBeInTheDocument()
      expect(nextButton).toBeEnabled()
      expect(nextButton).toHaveFocus()
    })

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  it('keeps keyboard-driven progress after reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TrainerScreen />)

    const input = screen.getByLabelText('Введите перевод на польский')
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(nextButton).toBeEnabled()
      expect(nextButton).toHaveFocus()
    })

    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(input).toHaveFocus()
      expect(screen.getByText('Прогресс:').parentElement?.textContent).toContain('1/10')
    })

    const promptBefore = document.querySelector('.card-stage__prompt')?.textContent ?? ''

    unmount()
    render(<TrainerScreen />)

    await waitFor(() => {
      expect(screen.getByText('Прогресс:').parentElement?.textContent).toContain('1/10')
    })

    const promptAfter = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    expect(promptAfter).toBe(promptBefore)
  })
})
