import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TrainerScreen } from './TrainerScreen'

describe('TrainerScreen progress sync event', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('refreshes trainer progress from b1-progress-synced without recreating the question', async () => {
    render(<TrainerScreen />)

    const promptBefore = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    const mistakesBefore = screen.getByText('Ошибок:').parentElement?.textContent ?? ''

    window.localStorage.setItem(
      'b1-polish-trainer-progress-v0',
      JSON.stringify({
        totalAttempts: 5,
        correctAnswers: 3,
        mistakesByItem: { one: 2, two: 1 },
        lastSessionDate: '2026-05-02',
        dailyCompletedCount: 1,
        streak: 2,
      }),
    )

    window.dispatchEvent(new CustomEvent('b1-progress-synced'))

    await waitFor(() => {
      expect(screen.getByText('Ошибок:').parentElement?.textContent).toContain('3')
    })

    const promptAfter = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    const mistakesAfter = screen.getByText('Ошибок:').parentElement?.textContent ?? ''

    expect(promptAfter).toBe(promptBefore)
    expect(mistakesAfter).not.toBe(mistakesBefore)
  })
})
