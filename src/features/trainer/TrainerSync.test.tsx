import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('TrainerScreen sync', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.resetModules()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('refreshes trainer progress after mount even if sync landed before the listener', async () => {
    const emptyProgress = {
      totalAttempts: 0,
      correctAnswers: 0,
      mistakesByItem: {},
      lastSessionDate: null,
      dailyCompletedCount: 0,
      streak: 0,
    }
    const syncedProgress = {
      totalAttempts: 6,
      correctAnswers: 4,
      mistakesByItem: { greeting: 3, thanks: 1 },
      lastSessionDate: '2026-05-02',
      dailyCompletedCount: 1,
      streak: 1,
    }
    let loadCalls = 0

    vi.doMock('../../lib/progressStorage', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressStorage')>('../../lib/progressStorage')

      return {
        ...actual,
        loadProgress: vi.fn(() => {
          loadCalls += 1
          return loadCalls <= 2 ? emptyProgress : syncedProgress
        }),
        saveProgress: vi.fn(),
      }
    })

    const { TrainerScreen } = await import('./TrainerScreen')

    render(<TrainerScreen />)

    const promptBefore = document.querySelector('.card-stage__prompt')?.textContent ?? ''

    await waitFor(() => {
      expect(screen.getByText('Ошибок:').parentElement?.textContent).toContain('4')
    })

    const promptAfter = document.querySelector('.card-stage__prompt')?.textContent ?? ''
    expect(promptAfter).toBe(promptBefore)
  })

})
