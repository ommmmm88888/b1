import { describe, expect, it } from 'vitest'

import {
  collectLocalProgressSnapshot,
  mergeProgressSnapshots,
  PROGRESS_STORAGE_KEYS,
  type ProgressSnapshot,
} from './progressSync'

describe('progressSync', () => {
  it('collects the known local progress keys', () => {
    window.localStorage.clear()
    window.localStorage.setItem(PROGRESS_STORAGE_KEYS.trainer, JSON.stringify({ totalAttempts: 2 }))
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEYS.intensive,
      JSON.stringify({ selectedDay: 2, days: {}, updatedAt: '2026-05-01T10:00:00.000Z' }),
    )

    const snapshot = collectLocalProgressSnapshot()

    expect(Object.keys(snapshot.sections)).toEqual([
      'trainer',
      'grammar',
      'intensive',
      'writing',
      'speaking',
      'reading',
      'listening',
      'mock',
    ])
    expect(snapshot.sections.trainer.key).toBe(PROGRESS_STORAGE_KEYS.trainer)
    expect(snapshot.sections.trainer.value).toEqual({ totalAttempts: 2 })
    expect(snapshot.sections.intensive.updatedAt).toBe('2026-05-01T10:00:00.000Z')
  })

  it('merges without erasing local-only progress', () => {
    const local: ProgressSnapshot = {
      schemaVersion: 1,
      capturedAt: '2026-05-01T10:00:00.000Z',
      sections: {
        trainer: {
          key: PROGRESS_STORAGE_KEYS.trainer,
          value: { totalAttempts: 4 },
          updatedAt: null,
        },
        grammar: {
          key: PROGRESS_STORAGE_KEYS.grammar,
          value: { totalAttempts: 1 },
          updatedAt: null,
        },
        intensive: {
          key: PROGRESS_STORAGE_KEYS.intensive,
          value: { selectedDay: 3, updatedAt: '2026-05-01T10:00:00.000Z' },
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
        writing: { key: PROGRESS_STORAGE_KEYS.writing, value: null, updatedAt: null },
        speaking: { key: PROGRESS_STORAGE_KEYS.speaking, value: null, updatedAt: null },
        reading: { key: PROGRESS_STORAGE_KEYS.reading, value: null, updatedAt: null },
        listening: { key: PROGRESS_STORAGE_KEYS.listening, value: null, updatedAt: null },
        mock: { key: PROGRESS_STORAGE_KEYS.mock, value: null, updatedAt: null },
      },
    }
    const remote: ProgressSnapshot = {
      schemaVersion: 1,
      capturedAt: '2026-05-01T09:00:00.000Z',
      sections: {
        ...local.sections,
        trainer: { key: PROGRESS_STORAGE_KEYS.trainer, value: null, updatedAt: null },
        intensive: {
          key: PROGRESS_STORAGE_KEYS.intensive,
          value: { selectedDay: 5, updatedAt: '2026-05-01T09:00:00.000Z' },
          updatedAt: '2026-05-01T09:00:00.000Z',
        },
        reading: {
          key: PROGRESS_STORAGE_KEYS.reading,
          value: { completedTaskIds: ['library'], bestScoresByTaskId: { library: 80 } },
          updatedAt: null,
        },
      },
    }

    const merged = mergeProgressSnapshots(local, remote)

    expect(merged.sections.trainer.value).toEqual({ totalAttempts: 4 })
    expect(merged.sections.grammar.value).toEqual({
      totalAttempts: 1,
      correctAnswers: 0,
      mistakesByTaskId: {},
    })
    expect(merged.sections.intensive.value).toEqual({
      selectedDay: 3,
      days: {},
      updatedAt: '2026-05-01T10:00:00.000Z',
    })
    expect(merged.sections.reading.value).toEqual({
      completedTaskIds: ['library'],
      bestScoresByTaskId: { library: 80 },
    })
  })

  it('keeps the more advanced trainer counters when both devices have progress', () => {
    const local = {
      schemaVersion: 1,
      capturedAt: '2026-05-02T10:00:00.000Z',
      sections: Object.fromEntries(
        Object.entries(PROGRESS_STORAGE_KEYS).map(([section, key]) => [
          section,
          { key, value: null, updatedAt: null },
        ]),
      ),
    } as ProgressSnapshot
    const remote = structuredClone(local)

    local.sections.trainer.value = {
      totalAttempts: 2,
      correctAnswers: 1,
      mistakesByItem: { a: 1 },
      lastSessionDate: null,
      dailyCompletedCount: 0,
      streak: 0,
    }
    remote.sections.trainer.value = {
      totalAttempts: 5,
      correctAnswers: 4,
      mistakesByItem: { a: 0, b: 2 },
      lastSessionDate: '2026-05-02',
      dailyCompletedCount: 1,
      streak: 1,
    }

    const merged = mergeProgressSnapshots(local, remote)

    expect(merged.sections.trainer.value).toEqual({
      totalAttempts: 5,
      correctAnswers: 4,
      mistakesByItem: { a: 1, b: 2 },
      lastSessionDate: '2026-05-02',
      dailyCompletedCount: 1,
      streak: 1,
    })
  })

  it('unions super intensive completed tasks without dropping notes', () => {
    const local = {
      schemaVersion: 1,
      capturedAt: '2026-05-02T10:00:00.000Z',
      sections: Object.fromEntries(
        Object.entries(PROGRESS_STORAGE_KEYS).map(([section, key]) => [
          section,
          { key, value: null, updatedAt: null },
        ]),
      ),
    } as ProgressSnapshot
    const remote = structuredClone(local)

    local.sections.intensive.value = {
      selectedDay: 1,
      days: {
        '1': {
          completedTaskIds: ['a'],
          note: 'local note',
          updatedAt: '2026-05-02T10:00:00.000Z',
        },
      },
      updatedAt: '2026-05-02T10:00:00.000Z',
    }
    remote.sections.intensive.value = {
      selectedDay: 1,
      days: {
        '1': {
          completedTaskIds: ['b'],
          note: 'older remote note',
          updatedAt: '2026-05-02T09:00:00.000Z',
        },
      },
      updatedAt: '2026-05-02T09:00:00.000Z',
    }

    const merged = mergeProgressSnapshots(local, remote)

    expect(merged.sections.intensive.value).toMatchObject({
      days: {
        '1': {
          completedTaskIds: ['b', 'a'],
          note: 'local note',
        },
      },
    })
  })
})
