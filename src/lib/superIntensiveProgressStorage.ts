import type { SuperIntensiveDayProgress, SuperIntensiveProgressState } from '../types/intensive'
import { dispatchProgressChanged } from './progressEvents'

const STORAGE_KEY = 'b1_super_intensive_progress'
const LEGACY_SELECTED_DAY_KEY = 'b1_super_intensive_selected_day'

function nowIso(): string {
  return new Date().toISOString()
}

function createDayProgress(): SuperIntensiveDayProgress {
  return {
    completedTaskIds: [],
    note: '',
    updatedAt: nowIso(),
  }
}

function createDefaultProgress(selectedDay = 1): SuperIntensiveProgressState {
  return {
    selectedDay,
    days: {},
    updatedAt: nowIso(),
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveLegacySelectedDay(): number {
  const raw = globalThis.localStorage?.getItem(LEGACY_SELECTED_DAY_KEY)
  const parsed = Number(raw)

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 1
}

function normalizeDayProgress(value: unknown): SuperIntensiveDayProgress {
  if (!isObject(value)) {
    return createDayProgress()
  }

  const completedTaskIds = Array.isArray(value.completedTaskIds)
    ? value.completedTaskIds.filter((item): item is string => typeof item === 'string')
    : []

  return {
    completedTaskIds,
    note: typeof value.note === 'string' ? value.note : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : nowIso(),
  }
}

function normalizeProgress(value: unknown): SuperIntensiveProgressState {
  if (!isObject(value)) {
    return createDefaultProgress(resolveLegacySelectedDay())
  }

  const selectedDay = Number(value.selectedDay)
  const normalizedSelectedDay =
    Number.isInteger(selectedDay) && selectedDay >= 1 && selectedDay <= 12
      ? selectedDay
      : resolveLegacySelectedDay()

  const days: Record<string, SuperIntensiveDayProgress> = {}

  if (isObject(value.days)) {
    for (const [dayKey, dayValue] of Object.entries(value.days)) {
      days[dayKey] = normalizeDayProgress(dayValue)
    }
  }

  return {
    selectedDay: normalizedSelectedDay,
    days,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : nowIso(),
  }
}

export function loadSuperIntensiveProgress(): SuperIntensiveProgressState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    return raw ? normalizeProgress(JSON.parse(raw)) : createDefaultProgress(resolveLegacySelectedDay())
  } catch {
    return createDefaultProgress(resolveLegacySelectedDay())
  }
}

export function saveSuperIntensiveProgress(progress: SuperIntensiveProgressState): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(progress))
  dispatchProgressChanged('intensive')
}

export function getDayProgress(
  progress: SuperIntensiveProgressState,
  dayNumber: number,
): SuperIntensiveDayProgress {
  return progress.days[String(dayNumber)] ?? createDayProgress()
}

export function setSelectedSuperIntensiveDay(
  progress: SuperIntensiveProgressState,
  selectedDay: number,
): SuperIntensiveProgressState {
  return {
    ...progress,
    selectedDay,
    updatedAt: nowIso(),
  }
}

export function setSuperIntensiveTaskCompleted(
  progress: SuperIntensiveProgressState,
  dayNumber: number,
  taskId: string,
  completed: boolean,
): SuperIntensiveProgressState {
  const dayKey = String(dayNumber)
  const dayProgress = getDayProgress(progress, dayNumber)
  const completedSet = new Set(dayProgress.completedTaskIds)

  if (completed) {
    completedSet.add(taskId)
  } else {
    completedSet.delete(taskId)
  }

  return {
    ...progress,
    days: {
      ...progress.days,
      [dayKey]: {
        ...dayProgress,
        completedTaskIds: [...completedSet],
        updatedAt: nowIso(),
      },
    },
    updatedAt: nowIso(),
  }
}

export function setSuperIntensiveDayNote(
  progress: SuperIntensiveProgressState,
  dayNumber: number,
  note: string,
): SuperIntensiveProgressState {
  const dayKey = String(dayNumber)
  const dayProgress = getDayProgress(progress, dayNumber)

  return {
    ...progress,
    days: {
      ...progress.days,
      [dayKey]: {
        ...dayProgress,
        note,
        updatedAt: nowIso(),
      },
    },
    updatedAt: nowIso(),
  }
}

export function resetSuperIntensiveDay(
  progress: SuperIntensiveProgressState,
  dayNumber: number,
): SuperIntensiveProgressState {
  const dayKey = String(dayNumber)

  return {
    ...progress,
    days: {
      ...progress.days,
      [dayKey]: createDayProgress(),
    },
    updatedAt: nowIso(),
  }
}
