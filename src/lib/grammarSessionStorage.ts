import { dispatchProgressChanged } from './progressEvents'

export type GrammarSessionSnapshot = {
  schemaVersion: 1
  capturedAt: string
  topicId: string
  taskIndex: number
  answer: string
  checked: boolean
  correct: boolean | null
}

const STORAGE_KEY = 'b1-grammar-session-v0'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createGrammarSessionSnapshot(
  snapshot: Omit<GrammarSessionSnapshot, 'schemaVersion' | 'capturedAt'>,
): GrammarSessionSnapshot {
  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    ...snapshot,
  }
}

export function loadGrammarSessionSnapshot(storage: Storage = window.localStorage): GrammarSessionSnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      typeof parsed.topicId !== 'string' ||
      typeof parsed.taskIndex !== 'number' ||
      typeof parsed.answer !== 'string' ||
      typeof parsed.checked !== 'boolean' ||
      !(typeof parsed.correct === 'boolean' || parsed.correct === null) ||
      typeof parsed.capturedAt !== 'string'
    ) {
      return null
    }

    return {
      schemaVersion: 1,
      capturedAt: parsed.capturedAt,
      topicId: parsed.topicId,
      taskIndex: parsed.taskIndex,
      answer: parsed.answer,
      checked: parsed.checked,
      correct: parsed.correct,
    }
  } catch {
    return null
  }
}

export function saveGrammarSessionSnapshot(
  snapshot: GrammarSessionSnapshot,
  storage: Storage = window.localStorage,
  options: { notify?: boolean } = {},
): void {
  if (typeof window === 'undefined') {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot))

  if (options.notify !== false) {
    dispatchProgressChanged('grammar')
  }
}
