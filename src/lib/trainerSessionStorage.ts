export type TrainerSessionMode = 'daily' | 'mistakes'

export type TrainerSessionSnapshot = {
  schemaVersion: 1
  capturedAt: string
  mode: TrainerSessionMode
  itemIds: string[]
  currentIndex: number
  answer: string
  checked: boolean
  correct: boolean | null
  revealedHint: boolean
  finished: boolean
}

const STORAGE_KEY = 'b1-polish-trainer-session-v0'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTrainerSessionMode(value: unknown): value is TrainerSessionMode {
  return value === 'daily' || value === 'mistakes'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function getTrainerSessionStorageKey(): string {
  return STORAGE_KEY
}

export function createTrainerSessionSnapshot(snapshot: Omit<TrainerSessionSnapshot, 'schemaVersion' | 'capturedAt'>): TrainerSessionSnapshot {
  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    ...snapshot,
  }
}

export function loadTrainerSessionSnapshot(storage?: Storage): TrainerSessionSnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  const resolvedStorage = storage ?? window.localStorage
  const raw = resolvedStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      !isTrainerSessionMode(parsed.mode) ||
      !isStringArray(parsed.itemIds) ||
      typeof parsed.currentIndex !== 'number' ||
      typeof parsed.answer !== 'string' ||
      typeof parsed.checked !== 'boolean' ||
      !(typeof parsed.correct === 'boolean' || parsed.correct === null) ||
      typeof parsed.revealedHint !== 'boolean' ||
      typeof parsed.finished !== 'boolean' ||
      typeof parsed.capturedAt !== 'string'
    ) {
      return null
    }

    return {
      schemaVersion: 1,
      capturedAt: parsed.capturedAt,
      mode: parsed.mode,
      itemIds: parsed.itemIds,
      currentIndex: parsed.currentIndex,
      answer: parsed.answer,
      checked: parsed.checked,
      correct: parsed.correct,
      revealedHint: parsed.revealedHint,
      finished: parsed.finished,
    }
  } catch {
    return null
  }
}

export function saveTrainerSessionSnapshot(snapshot: TrainerSessionSnapshot, storage: Storage = window.localStorage): void {
  if (typeof window === 'undefined') {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}
