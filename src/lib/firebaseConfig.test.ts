import { afterEach, describe, expect, it, vi } from 'vitest'

describe('firebaseConfig', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('keeps Firebase disabled when required Vite env variables are missing', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    vi.stubEnv('VITE_FIREBASE_APP_ID', '')

    const { firebaseConfigState } = await import('./firebaseConfig')

    expect(firebaseConfigState.configured).toBe(false)

    if (!firebaseConfigState.configured) {
      expect(firebaseConfigState.missing).toContain('VITE_FIREBASE_API_KEY')
      expect(firebaseConfigState.reason).toBe('Firebase не настроен')
    }
  })

  it('marks Firebase configured when required Vite env variables are present', async () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'public-key')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'example')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id')

    const { firebaseConfigState } = await import('./firebaseConfig')

    expect(firebaseConfigState.configured).toBe(true)
  })
})
