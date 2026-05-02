import type { MockExamResult } from '../types/mockExam'
import { dispatchProgressChanged } from './progressEvents'

const STORAGE_KEY = 'b1_mock_exam_latest_result_v0'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'number')
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function loadLatestMockExamResult(): MockExamResult | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!isRecord(parsed) || !isRecord(parsed.zoneScores)) {
      return null
    }

    if (
      typeof parsed.completedAt !== 'string' ||
      typeof parsed.overallReadinessPercent !== 'number' ||
      !isNumberRecord(parsed.zoneScores) ||
      !isStringArray(parsed.weakestZones) ||
      !isStringArray(parsed.recommendedNextActions)
    ) {
      return null
    }

    return {
      completedAt: parsed.completedAt,
      overallReadinessPercent: parsed.overallReadinessPercent,
      zoneScores: {
        reading: parsed.zoneScores.reading ?? 0,
        grammar: parsed.zoneScores.grammar ?? 0,
        writing: parsed.zoneScores.writing ?? 0,
        speaking: parsed.zoneScores.speaking ?? 0,
        listening: parsed.zoneScores.listening ?? 0,
      },
      weakestZones: parsed.weakestZones,
      recommendedNextActions: parsed.recommendedNextActions,
    }
  } catch {
    return null
  }
}

export function saveLatestMockExamResult(result: MockExamResult): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  dispatchProgressChanged('mock')
}

export function clearLatestMockExamResult(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
  dispatchProgressChanged('mock')
}
