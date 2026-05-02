import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('AccountSyncControl', () => {
  beforeEach(() => {
    cleanup()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('shows unavailable Google entry when Firebase config is missing', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '')
    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(screen.getByRole('button', { name: 'Google вход' })).toBeInTheDocument()
    expect(screen.getByText('не настроено')).toBeInTheDocument()
  })

  it('explains missing Firebase setup from the unavailable Google entry', async () => {
    const user = userEvent.setup()
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '')
    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    expect(
      screen.queryByText('Синхронизация между устройствами появится после настройки Firebase.'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Google вход' }))

    expect(
      screen.getByText(/Синхронизация между устройствами появится после настройки Firebase\./),
    ).toBeInTheDocument()
  })

  it('renders signed-out Google login state when Firebase is configured', async () => {
    vi.doMock('../../lib/auth', () => ({
      firebaseConfigState: { configured: true, options: {} },
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

    expect(screen.getByRole('button', { name: 'Google вход' })).toBeInTheDocument()
  })

  it('shows a concise auth error without crashing', async () => {
    const user = userEvent.setup()
    vi.doMock('../../lib/auth', () => ({
      firebaseConfigState: { configured: true, options: {} },
      isFirebaseConfigured: true,
      signInWithGoogle: vi.fn().mockRejectedValue(new Error('Google вход не включен в Firebase Console.')),
      signOut: vi.fn(),
      subscribeAuthState: (listener: (user: null) => void) => {
        listener(null)
        return () => undefined
      },
    }))

    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    await user.click(screen.getByRole('button', { name: 'Google вход' }))

    expect(screen.getByText('Google вход не включен в Firebase Console.')).toBeInTheDocument()
  })
})
