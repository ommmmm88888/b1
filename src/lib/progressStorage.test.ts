import { describe, expect, it, vi } from 'vitest'

import { PROGRESS_CHANGED_EVENT } from './progressEvents'
import { saveProgress } from './progressStorage'

describe('progressStorage', () => {
  it('dispatches b1-progress-changed when trainer progress is saved', () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
    const progress = {
      totalAttempts: 1,
      correctAnswers: 1,
      mistakesByItem: {},
      lastSessionDate: null,
      dailyCompletedCount: 0,
      streak: 0,
    }

    saveProgress(progress)

    const event = dispatchEventSpy.mock.calls.at(-1)?.[0]
    expect(event).toBeInstanceOf(CustomEvent)
    expect((event as CustomEvent).type).toBe(PROGRESS_CHANGED_EVENT)
    expect((event as CustomEvent).detail).toEqual({ domain: 'trainer' })
  })
})
