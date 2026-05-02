import type { SpeakingProgressState } from '../types/speaking'
import { dispatchProgressChanged } from './progressEvents'

const STORAGE_KEY = 'b1_speaking_progress_v0'

export function createInitialSpeakingProgress(): SpeakingProgressState {
  return {
    completedPromptIds: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function loadSpeakingProgress(): SpeakingProgressState {
  if (typeof window === 'undefined') {
    return createInitialSpeakingProgress()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createInitialSpeakingProgress()
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed)) {
      return createInitialSpeakingProgress()
    }

    return {
      completedPromptIds: Array.isArray(parsed.completedPromptIds)
        ? parsed.completedPromptIds.filter((item): item is string => typeof item === 'string')
        : [],
    }
  } catch {
    return createInitialSpeakingProgress()
  }
}

export function saveSpeakingProgress(progress: SpeakingProgressState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  dispatchProgressChanged('speaking')
}

export function setSpeakingPromptCompleted(
  progress: SpeakingProgressState,
  promptId: string,
  completed: boolean,
): SpeakingProgressState {
  const completedSet = new Set(progress.completedPromptIds)

  if (completed) {
    completedSet.add(promptId)
  } else {
    completedSet.delete(promptId)
  }

  return {
    completedPromptIds: [...completedSet],
  }
}
