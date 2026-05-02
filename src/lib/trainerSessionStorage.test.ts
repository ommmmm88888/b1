import { describe, expect, it } from 'vitest'

import {
  createTrainerSessionSnapshot,
  getTrainerSessionStorageKey,
  loadTrainerSessionSnapshot,
  saveTrainerSessionSnapshot,
} from './trainerSessionStorage'

describe('trainerSessionStorage', () => {
  it('saves and loads the trainer session snapshot', () => {
    window.localStorage.clear()

    const snapshot = createTrainerSessionSnapshot({
      mode: 'daily',
      itemIds: ['a', 'b', 'c'],
      currentIndex: 2,
      answer: 'test answer',
      checked: true,
      correct: false,
      revealedHint: true,
      finished: false,
    })

    saveTrainerSessionSnapshot(snapshot)

    expect(window.localStorage.getItem(getTrainerSessionStorageKey())).toBeTruthy()
    expect(loadTrainerSessionSnapshot()).toEqual(snapshot)
  })
})
