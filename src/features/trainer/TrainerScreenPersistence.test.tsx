import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TrainerScreen } from './TrainerScreen'

describe('TrainerScreen persistence', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('restores trainer progress and session progress after reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TrainerScreen />)

    const input = screen.getByLabelText('Введите перевод на польский')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)
    await user.click(nextButton)

    await user.clear(input)
    await user.type(input, 'еще один неверный ответ')
    await user.click(checkButton)
    await user.click(nextButton)

    expect(screen.getByText('Прогресс:').parentElement?.textContent).toContain('2/10')

    const promptBefore = document.querySelector('.card-stage__prompt')?.textContent ?? ''

    unmount()
    render(<TrainerScreen />)

    await waitFor(() => {
      expect(screen.getByText('Прогресс:').parentElement?.textContent).toContain('2/10')
    })

    const promptAfter = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    expect(promptAfter).toBe(promptBefore)
    expect(screen.getByText('Ошибок:').parentElement?.textContent).toContain('2')
  })
})
