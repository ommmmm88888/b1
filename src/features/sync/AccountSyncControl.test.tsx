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
    vi.doMock('../../lib/progressSync', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressSync')>('../../lib/progressSync')

      return {
        ...actual,
        startCloudProgressSync: vi.fn(),
        stopCloudProgressSync: vi.fn(),
        subscribeCloudSyncState: (listener: (state: { status: string; message: string; lastSyncedAt: null }) => void) => {
          listener({ status: 'idle', message: '', lastSyncedAt: null })
          return () => undefined
        },
        subscribeSyncDiagnostics: (listener: (state: {
          firebaseConfigured: boolean
          firestoreStatus: string
          listenerStatus: string
          activeUidSuffix: string | null
          lastCloudReadAt: string | null
          lastCloudWriteAt: string | null
          lastSyncError: string | null
          cloudTrainer: null
          localTrainerSession: null
          cloudTrainerSession: null
          cacheVersion: string
        }) => void) => {
          listener({
            firebaseConfigured: true,
            firestoreStatus: 'unknown',
            listenerStatus: 'inactive',
            activeUidSuffix: null,
            lastCloudReadAt: null,
            lastCloudWriteAt: null,
            lastSyncError: null,
            cloudTrainer: null,
            localTrainerSession: null,
            cloudTrainerSession: null,
            cacheVersion: 'v1-2026-05-02',
          })
          return () => undefined
        },
        getSyncDiagnostics: () => ({
          firebaseConfigured: true,
          firestoreStatus: 'unknown',
          listenerStatus: 'inactive',
          activeUidSuffix: null,
          lastCloudReadAt: null,
          lastCloudWriteAt: null,
          lastSyncError: null,
          cloudTrainer: null,
          localTrainerSession: null,
          cloudTrainerSession: null,
          cacheVersion: 'v1-2026-05-02',
        }),
      }
    })

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
    vi.doMock('../../lib/progressSync', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressSync')>('../../lib/progressSync')

      return {
        ...actual,
        startCloudProgressSync: vi.fn(),
        stopCloudProgressSync: vi.fn(),
        subscribeCloudSyncState: (listener: (state: { status: string; message: string; lastSyncedAt: null }) => void) => {
          listener({ status: 'idle', message: '', lastSyncedAt: null })
          return () => undefined
        },
        subscribeSyncDiagnostics: (listener: (state: {
          firebaseConfigured: boolean
          firestoreStatus: string
          listenerStatus: string
          activeUidSuffix: string | null
          lastCloudReadAt: string | null
          lastCloudWriteAt: string | null
          lastSyncError: string | null
          cloudTrainer: null
          localTrainerSession: null
          cloudTrainerSession: null
          cacheVersion: string
        }) => void) => {
          listener({
            firebaseConfigured: true,
            firestoreStatus: 'unknown',
            listenerStatus: 'inactive',
            activeUidSuffix: null,
            lastCloudReadAt: null,
            lastCloudWriteAt: null,
            lastSyncError: null,
            cloudTrainer: null,
            localTrainerSession: null,
            cloudTrainerSession: null,
            cacheVersion: 'v1-2026-05-02',
          })
          return () => undefined
        },
        getSyncDiagnostics: () => ({
          firebaseConfigured: true,
          firestoreStatus: 'unknown',
          listenerStatus: 'inactive',
          activeUidSuffix: null,
          lastCloudReadAt: null,
          lastCloudWriteAt: null,
          lastSyncError: null,
          cloudTrainer: null,
          localTrainerSession: null,
          cloudTrainerSession: null,
          cacheVersion: 'v1-2026-05-02',
        }),
      }
    })

    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    await user.click(screen.getByRole('button', { name: 'Google вход' }))

    expect(screen.getByText('Google вход не включен в Firebase Console.')).toBeInTheDocument()
  })

  it('shows diagnostics and manual sync controls for a signed-in account', async () => {
    const user = userEvent.setup()
    const loadCloudProgressToLocal = vi.fn().mockResolvedValue({
      ok: true,
      status: 'synced',
      snapshot: {
        schemaVersion: 1,
        capturedAt: '2026-05-02T10:00:00.000Z',
        sections: {},
      },
    })
    const saveLocalProgressToCloud = vi.fn().mockResolvedValue({
      ok: true,
      status: 'synced',
      snapshot: {
        schemaVersion: 1,
        capturedAt: '2026-05-02T10:00:00.000Z',
        sections: {},
      },
    })
    const compareCloudProgress = vi.fn().mockResolvedValue({
      matches: true,
      local: {
        attempts: 2,
        correctAnswers: 1,
        mistakeTotal: 1,
        mistakeCards: 1,
        dailyCompletedCount: 0,
        streak: 0,
        updatedAt: null,
      },
      cloud: {
        attempts: 2,
        correctAnswers: 1,
        mistakeTotal: 1,
        mistakeCards: 1,
        dailyCompletedCount: 0,
        streak: 0,
        updatedAt: null,
      },
    })

    window.localStorage.setItem(
      'b1-polish-trainer-progress-v0',
      JSON.stringify({
        totalAttempts: 2,
        correctAnswers: 1,
        mistakesByItem: { one: 1 },
        lastSessionDate: null,
        dailyCompletedCount: 0,
        streak: 0,
      }),
    )

    vi.doMock('../../lib/auth', () => ({
      firebaseConfigState: { configured: true, options: {} },
      isFirebaseConfigured: true,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      subscribeAuthState: (listener: (user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null) => void) => {
        listener({
          uid: 'abc123xyz456',
          displayName: 'Anna',
          email: 'anna@example.com',
          photoURL: null,
        })
        return () => undefined
      },
    }))
    vi.doMock('../../lib/progressSync', async () => {
      const actual = await vi.importActual<typeof import('../../lib/progressSync')>('../../lib/progressSync')

      return {
        ...actual,
        startCloudProgressSync: vi.fn(),
        stopCloudProgressSync: vi.fn(),
        subscribeCloudSyncState: (listener: (state: { status: string; message: string; lastSyncedAt: string | null }) => void) => {
          listener({ status: 'active', message: 'синхронизация включена', lastSyncedAt: '2026-05-02T10:00:00.000Z' })
          return () => undefined
        },
        subscribeSyncDiagnostics: (listener: (state: { firebaseConfigured: boolean; firestoreStatus: string; listenerStatus: string; activeUidSuffix: string | null; lastCloudReadAt: string | null; lastCloudWriteAt: string | null; lastSyncError: string | null; cloudTrainer: null; localTrainerSession: null; cloudTrainerSession: null; cacheVersion: string }) => void) => {
          listener({
            firebaseConfigured: true,
            firestoreStatus: 'available',
            listenerStatus: 'active',
            activeUidSuffix: 'xyz456',
            lastCloudReadAt: '2026-05-02T10:00:00.000Z',
            lastCloudWriteAt: '2026-05-02T10:00:00.000Z',
            lastSyncError: null,
            cloudTrainer: null,
            localTrainerSession: null,
            cloudTrainerSession: null,
            cacheVersion: 'v1-2026-05-02',
          })
          return () => undefined
        },
        getSyncDiagnostics: () => ({
          firebaseConfigured: true,
          firestoreStatus: 'available',
          listenerStatus: 'active',
          activeUidSuffix: 'xyz456',
          lastCloudReadAt: '2026-05-02T10:00:00.000Z',
          lastCloudWriteAt: '2026-05-02T10:00:00.000Z',
          lastSyncError: null,
          cloudTrainer: null,
          localTrainerSession: null,
          cloudTrainerSession: null,
          cacheVersion: 'v1-2026-05-02',
        }),
        loadCloudProgressToLocal,
        saveLocalProgressToCloud,
        compareCloudProgress,
      }
    })

    const { AccountSyncControl } = await import('./AccountSyncControl')

    render(<AccountSyncControl />)

    await user.click(screen.getByText('Диагностика синхронизации'))

    expect(screen.getByRole('button', { name: 'Сохранить в облако' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Загрузить из облака' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Проверить синхронизацию' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Проверить синхронизацию' }))
    await user.click(screen.getByRole('button', { name: 'Сохранить в облако' }))
    await user.click(screen.getByRole('button', { name: 'Загрузить из облака' }))

    expect(compareCloudProgress).toHaveBeenCalled()
    expect(saveLocalProgressToCloud).toHaveBeenCalled()
    expect(loadCloudProgressToLocal).toHaveBeenCalled()
  })
})
