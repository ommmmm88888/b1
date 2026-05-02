import type { GrammarProgressState } from '../types/grammar'
import { dispatchProgressChanged } from './progressEvents'

const STORAGE_KEY = 'b1_grammar_progress_v0'

export function createInitialGrammarProgress(): GrammarProgressState {
  return {
    totalAttempts: 0,
    correctAnswers: 0,
    mistakesByTaskId: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeMistakes(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  )
}

export function loadGrammarProgress(): GrammarProgressState {
  if (typeof window === 'undefined') {
    return createInitialGrammarProgress()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialGrammarProgress()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialGrammarProgress()
    }

    return {
      totalAttempts: typeof parsed.totalAttempts === 'number' ? parsed.totalAttempts : 0,
      correctAnswers: typeof parsed.correctAnswers === 'number' ? parsed.correctAnswers : 0,
      mistakesByTaskId: normalizeMistakes(parsed.mistakesByTaskId),
    }
  } catch {
    return createInitialGrammarProgress()
  }
}

export function saveGrammarProgress(progress: GrammarProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  dispatchProgressChanged('grammar')
}

export function recordGrammarAttempt(
  progress: GrammarProgressState,
  taskId: string,
  isCorrect: boolean,
): GrammarProgressState {
  return {
    ...progress,
    totalAttempts: progress.totalAttempts + 1,
    correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
    mistakesByTaskId: {
      ...progress.mistakesByTaskId,
      [taskId]: isCorrect
        ? progress.mistakesByTaskId[taskId] ?? 0
        : (progress.mistakesByTaskId[taskId] ?? 0) + 1,
    },
  }
}
