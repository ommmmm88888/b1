import { describe, expect, it } from 'vitest'
import type { SuperIntensiveDayPlan } from '../data/superIntensivePlan'
import type { SuperIntensiveProgressState, SuperIntensiveTaskType } from '../types/intensive'
import { calculateSuperIntensiveStats, getWeakZoneInsight } from './superIntensiveStats'

function createTask(id: string, type: SuperIntensiveTaskType) {
  return {
    id,
    title: id,
    durationMinutes: 10,
    type,
  }
}

const plan: SuperIntensiveDayPlan[] = [
  {
    dayNumber: 1,
    title: 'День 1',
    mainGoal: 'Проверка',
    estimatedHours: '1',
    focusArea: 'Фокус',
    tasks: [createTask('repeat', 'повторение'), createTask('writing', 'письмо')],
    examSkillTargets: [],
    commonMistakesForUkrainianLearner: [],
    speakingPrompt: 'Prompt',
    writingPrompt: null,
    successCriteria: 'Критерий',
  },
  {
    dayNumber: 2,
    title: 'День 2',
    mainGoal: 'Проверка',
    estimatedHours: '1',
    focusArea: 'Фокус',
    tasks: [
      createTask('grammar-1', 'грамматика'),
      createTask('grammar-2', 'грамматика'),
      createTask('speaking', 'говорение'),
    ],
    examSkillTargets: [],
    commonMistakesForUkrainianLearner: [],
    speakingPrompt: 'Prompt',
    writingPrompt: null,
    successCriteria: 'Критерий',
  },
]

function createProgress(days: SuperIntensiveProgressState['days']): SuperIntensiveProgressState {
  return {
    selectedDay: 1,
    days,
    updatedAt: '2026-05-01T00:00:00.000Z',
  }
}

describe('superIntensiveStats', () => {
  it('handles no progress', () => {
    const stats = calculateSuperIntensiveStats(plan, createProgress({}))

    expect(stats.daysStarted).toBe(0)
    expect(stats.totalTasksCompleted).toBe(0)
    expect(stats.overallCompletionPercent).toBe(0)
    expect(getWeakZoneInsight(stats)).toBe('Начните с первого дня: диагностика покажет слабые зоны.')
  })

  it('handles partial progress and top unfinished task types', () => {
    const stats = calculateSuperIntensiveStats(
      plan,
      createProgress({
        '1': {
          completedTaskIds: ['repeat'],
          note: '',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      }),
    )

    expect(stats.daysStarted).toBe(1)
    expect(stats.daysCompleted).toBe(0)
    expect(stats.totalTasksCompleted).toBe(1)
    expect(stats.topUnfinishedTaskTypes).toEqual(['грамматика'])
  })

  it('counts a completed day', () => {
    const stats = calculateSuperIntensiveStats(
      plan,
      createProgress({
        '1': {
          completedTaskIds: ['repeat', 'writing'],
          note: '',
          updatedAt: '2026-05-01T00:00:00.000Z',
        },
      }),
    )

    expect(stats.daysCompleted).toBe(1)
    expect(stats.dayStatuses[0].status).toBe('completed')
  })
})
