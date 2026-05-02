import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('GrammarDrillScreen cloud flush', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.resetModules()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('flushes grammar progress to cloud immediately after check and next actions', async () => {
    const user = userEvent.setup()
    const requestActiveCloudProgressSave = vi.fn()
    const subscribeCloudSyncState = vi.fn(() => () => {})

    vi.doMock('../../lib/progressSync', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressSync')>('../../lib/progressSync')

      return {
        ...actual,
        requestActiveCloudProgressSave,
        subscribeCloudSyncState,
      }
    })

    const { GrammarDrillScreen } = await import('./GrammarDrillScreen')

    render(<GrammarDrillScreen />)

    requestActiveCloudProgressSave.mockClear()

    const input = screen.getByLabelText('Введите польскую форму')
    const checkButton = screen.getByRole('button', { name: 'Проверить' })
    const nextButton = screen.getByRole('button', { name: 'Следующее' })

    await user.type(input, 'неверный ответ')
    await user.click(checkButton)

    await waitFor(() => {
      expect(requestActiveCloudProgressSave).toHaveBeenCalled()
      expect(nextButton).toHaveFocus()
    })

    const saveCallsAfterCheck = requestActiveCloudProgressSave.mock.calls.length

    await user.click(nextButton)

    await waitFor(() => {
      expect(requestActiveCloudProgressSave.mock.calls.length).toBeGreaterThan(saveCallsAfterCheck)
      expect(input).toHaveFocus()
    })
  })
})
