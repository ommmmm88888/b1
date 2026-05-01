import type { ListeningProgressState } from '../types/listening'

const STORAGE_KEY = 'b1_listening_progress_v0'

export function createInitialListeningProgress(): ListeningProgressState {
  return {
    completedTaskIds: [],
    bestScoresByTaskId: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function loadListeningProgress(): ListeningProgressState {
  if (typeof window === 'undefined') {
    return createInitialListeningProgress()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialListeningProgress()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialListeningProgress()
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
    return createInitialListeningProgress()
  }
}

export function saveListeningProgress(progress: ListeningProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function recordListeningResult(
  progress: ListeningProgressState,
  taskId: string,
  scorePercent: number,
): ListeningProgressState {
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
