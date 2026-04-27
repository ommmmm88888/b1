import type { ProgressState } from '../types/training'

const STORAGE_KEY = 'b1-polish-trainer-progress-v0'

const initialProgress: ProgressState = {
  totalAttempts: 0,
  correctAnswers: 0,
  mistakesByItem: {},
  lastSessionDate: null,
  dailyCompletedCount: 0,
  streak: 0,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createInitialProgress(): ProgressState {
  return {
    totalAttempts: 0,
    correctAnswers: 0,
    mistakesByItem: {},
    lastSessionDate: null,
    dailyCompletedCount: 0,
    streak: 0,
  }
}

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return createInitialProgress()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialProgress()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialProgress()
    }

    return {
      totalAttempts: typeof parsed.totalAttempts === 'number' ? parsed.totalAttempts : 0,
      correctAnswers: typeof parsed.correctAnswers === 'number' ? parsed.correctAnswers : 0,
      mistakesByItem: isRecord(parsed.mistakesByItem) ? (parsed.mistakesByItem as Record<string, number>) : {},
      lastSessionDate:
        typeof parsed.lastSessionDate === 'string' || parsed.lastSessionDate === null
          ? (parsed.lastSessionDate as string | null)
          : null,
      dailyCompletedCount:
        typeof parsed.dailyCompletedCount === 'number' ? parsed.dailyCompletedCount : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
    }
  } catch {
    return createInitialProgress()
  }
}

export function saveProgress(progress: ProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function recordAttempt(
  progress: ProgressState,
  itemId: string,
  isCorrect: boolean,
): ProgressState {
  return {
    ...progress,
    totalAttempts: progress.totalAttempts + 1,
    correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
    mistakesByItem: {
      ...progress.mistakesByItem,
      [itemId]: isCorrect ? progress.mistakesByItem[itemId] ?? 0 : (progress.mistakesByItem[itemId] ?? 0) + 1,
    },
  }
}

function isYesterday(previousDate: string | null, currentDate: string): boolean {
  if (!previousDate) {
    return false
  }

  const previous = new Date(`${previousDate}T00:00:00`)
  const current = new Date(`${currentDate}T00:00:00`)
  const deltaDays = Math.round((current.getTime() - previous.getTime()) / 86_400_000)

  return deltaDays === 1
}

export function markDailySessionCompleted(progress: ProgressState, currentDate: string): ProgressState {
  if (progress.lastSessionDate === currentDate) {
    return progress
  }

  return {
    ...progress,
    lastSessionDate: currentDate,
    dailyCompletedCount: progress.dailyCompletedCount + 1,
    streak: isYesterday(progress.lastSessionDate, currentDate) ? progress.streak + 1 : 1,
  }
}

export function getInitialProgressSnapshot(): ProgressState {
  return initialProgress
}
