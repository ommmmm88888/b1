import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AccountSyncControl', () => {
  beforeEach(() => {
    cleanup()
    vi.resetModules()
  })

  it('shows unavailable Google entry when Firebase config is missing', async () => {
    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(screen.getByRole('button', { name: 'Google вход' })).toBeInTheDocument()
    expect(screen.getByText('не настроено')).toBeInTheDocument()
  })

  it('explains missing Firebase setup from the unavailable Google entry', async () => {
    const user = userEvent.setup()
    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(
      screen.queryByText('Синхронизация между устройствами появится после настройки Firebase.'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Google вход' }))

    expect(
      screen.getByText('Синхронизация между устройствами появится после настройки Firebase.'),
    ).toBeInTheDocument()
  })

  it('renders signed-out Google login state when Firebase is configured', async () => {
    vi.doMock('../../lib/auth', () => ({
      isFirebaseConfigured: true,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      subscribeAuthState: (listener: (user: null) => void) => {
        listener(null)
        return () => undefined
      },
    }))
    vi.doMock('../../lib/progressSync', () => ({
      syncLocalProgressToCloud: vi.fn(),
    }))

    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(screen.getByRole('button', { name: 'Войти через Google' })).toBeInTheDocument()
  })
})
