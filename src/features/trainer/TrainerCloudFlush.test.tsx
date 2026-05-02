import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('TrainerScreen cloud flush', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.resetModules()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('flushes trainer session to cloud immediately after check and next actions', async () => {
    const user = userEvent.setup()
    const requestActiveCloudProgressSave = vi.fn()
    const saveTrainerSessionSnapshot = vi.fn()
    const subscribeCloudSyncState = vi.fn(() => () => {})

    vi.doMock('../../lib/progressSync', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressSync')>('../../lib/progressSync')

      return {
        ...actual,
        requestActiveCloudProgressSave,
        subscribeCloudSyncState,
      }
    })

    vi.doMock('../../lib/trainerSessionStorage', async () => {
      const actual = await vi.importActual<typeof import('../../lib/trainerSessionStorage')>(
        '../../lib/trainerSessionStorage',
      )

      return {
        ...actual,
        saveTrainerSessionSnapshot,
      }
    })

    const { TrainerScreen } = await import('./TrainerScreen')

    render(<TrainerScreen />)

    requestActiveCloudProgressSave.mockClear()
    saveTrainerSessionSnapshot.mockClear()

    const input = screen.getByLabelText('Введите перевод на польский')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    await waitFor(() => {
      expect(saveTrainerSessionSnapshot).toHaveBeenCalled()
      expect(requestActiveCloudProgressSave).toHaveBeenCalled()
      expect(nextButton).toHaveFocus()
    })

    const saveCallsAfterCheck = saveTrainerSessionSnapshot.mock.calls.length
    const syncCallsAfterCheck = requestActiveCloudProgressSave.mock.calls.length

    await user.click(nextButton)

    await waitFor(() => {
      expect(saveTrainerSessionSnapshot.mock.calls.length).toBeGreaterThan(saveCallsAfterCheck)
      expect(requestActiveCloudProgressSave.mock.calls.length).toBeGreaterThan(syncCallsAfterCheck)
      expect(input).toHaveFocus()
    })
  })
})
