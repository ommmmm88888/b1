import { describe, expect, it } from 'vitest'
import { applyAnswerEditForRetry } from './answerRetryState'

describe('applyAnswerEditForRetry', () => {
  it('reopens checking when user edits answer after incorrect check', () => {
    const next = applyAnswerEditForRetry(
      {
        answer: 'zly',
        checked: true,
        correct: false,
      },
      'dobry',
    )

    expect(next).toEqual({
      answer: 'dobry',
      checked: false,
      correct: null,
    })
  })

  it('keeps checked state when answer did not change', () => {
    const state = {
      answer: 'zly',
      checked: true,
      correct: false as boolean | null,
    }

    const next = applyAnswerEditForRetry(state, 'zly')

    expect(next).toBe(state)
  })
})
