import { cleanup, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AccountSyncControl', () => {
  beforeEach(() => {
    cleanup()
    vi.resetModules()
  })

  it('shows unavailable state when Firebase config is missing', async () => {
    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(screen.getByText('Синхронизация не настроена')).toBeInTheDocument()
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
