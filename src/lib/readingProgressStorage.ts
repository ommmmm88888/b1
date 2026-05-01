import type { ReadingProgressState } from '../types/reading'

const STORAGE_KEY = 'b1_reading_progress_v0'

export function createInitialReadingProgress(): ReadingProgressState {
  return {
    completedTaskIds: [],
    bestScoresByTaskId: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function loadReadingProgress(): ReadingProgressState {
  if (typeof window === 'undefined') {
    return createInitialReadingProgress()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialReadingProgress()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialReadingProgress()
    }

    return {
      completedTaskIds: Array.isArray(parsed.completedTaskIds)
        ? parsed.completedTaskIds.filter((item): item is string => typeof item === 'string')
        : [],
      bestScoresByTaskId: isRecord(parsed.bestScoresByTaskId)
        ? Object.fromEntries(
            Object.entries(parsed.bestScoresByTaskId).filter(
              (entry): entry is [string, number] => typeof entry[1] === 'number',
            ),
          )
        : {},
    }
  } catch {
    return createInitialReadingProgress()
  }
}

export function saveReadingProgress(progress: ReadingProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function recordReadingResult(
  progress: ReadingProgressState,
  taskId: string,
  scorePercent: number,
): ReadingProgressState {
  const completedSet = new Set(progress.completedTaskIds)
  completedSet.add(taskId)

  return {
    completedTaskIds: [...completedSet],
    bestScoresByTaskId: {
      ...progress.bestScoresByTaskId,
      [taskId]: Math.max(progress.bestScoresByTaskId[taskId] ?? 0, scorePercent),
    },
  }
}
