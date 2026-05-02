import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GrammarDrillScreen } from './GrammarDrillScreen'
import { PROGRESS_STORAGE_KEYS } from '../../lib/progressSync'

describe('GrammarDrillScreen persistence', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('restores grammar progress and session after reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<GrammarDrillScreen />)

    const input = screen.getByLabelText('Введите польскую форму')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)
    await user.click(nextButton)

    await user.clear(input)
    await user.type(input, 'ещё один неверный ответ')
    await user.click(checkButton)
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Прогресс темы').parentElement?.textContent).toContain('3/')
    })

    const promptBefore = document.querySelector('.card-stage__prompt')?.textContent ?? ''

    unmount()
    render(<GrammarDrillScreen />)

    await waitFor(() => {
      expect(screen.getByText('Прогресс темы').parentElement?.textContent).toContain('3/')
    })

    const promptAfter = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    expect(promptAfter).toBe(promptBefore)

    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEYS.grammar) ?? 'null')).toMatchObject({
      totalAttempts: 2,
      correctAnswers: 0,
    })
    expect(JSON.parse(window.localStorage.getItem('b1-grammar-session-v0') ?? 'null')).toMatchObject({
      taskIndex: 2,
      checked: false,
    })
  })
})
