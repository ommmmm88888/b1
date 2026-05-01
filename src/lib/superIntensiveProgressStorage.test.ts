import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSuperIntensiveProgress } from './superIntensiveProgressStorage'

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  })
}

describe('superIntensiveProgressStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back when storage is missing', () => {
    const progress = loadSuperIntensiveProgress()

    expect(progress.selectedDay).toBe(1)
    expect(progress.days).toEqual({})
  })

  it('falls back on invalid JSON', () => {
    stubStorage({
      b1_super_intensive_progress: '{invalid',
    })

    const progress = loadSuperIntensiveProgress()

    expect(progress.selectedDay).toBe(1)
    expect(progress.days).toEqual({})
  })

  it('safely parses valid stored progress', () => {
    stubStorage({
      b1_super_intensive_progress: JSON.stringify({
        selectedDay: 3,
        days: {
          '3': {
            completedTaskIds: ['task'],
            note: 'ok',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        },
      }),
    })

    const progress = loadSuperIntensiveProgress()

    expect(progress.selectedDay).toBe(3)
    expect(progress.days['3'].completedTaskIds).toEqual(['task'])
  })
})
