import type { SuperIntensiveDayPlan } from '../data/superIntensivePlan'
import type { SuperIntensiveProgressState, SuperIntensiveTaskType } from '../types/intensive'
import { getDayProgress } from './superIntensiveProgressStorage'

export interface SuperIntensiveDayStatus {
  dayNumber: number
  completedTasks: number
  totalTasks: number
  status: 'not-started' | 'in-progress' | 'completed'
}

export interface SuperIntensiveStats {
  totalDays: number
  daysStarted: number
  daysCompleted: number
  totalTasksCompleted: number
  totalTasksAvailable: number
  overallCompletionPercent: number
  unfinishedTasksByType: Record<SuperIntensiveTaskType, number>
  topUnfinishedTaskTypes: SuperIntensiveTaskType[]
  dayStatuses: SuperIntensiveDayStatus[]
}

const TASK_TYPES: SuperIntensiveTaskType[] = [
  'повторение',
  'грамматика',
  'письмо',
  'говорение',
  'аудирование',
  'пробный экзамен',
  'исправление ошибок',
]

function createEmptyUnfinishedMap(): Record<SuperIntensiveTaskType, number> {
  return TASK_TYPES.reduce(
    (accumulator, taskType) => ({
      ...accumulator,
      [taskType]: 0,
    }),
    {} as Record<SuperIntensiveTaskType, number>,
  )
}

export function getWeakZoneInsight(stats: SuperIntensiveStats): string {
  if (stats.totalTasksAvailable > 0 && stats.totalTasksCompleted === stats.totalTasksAvailable) {
    return 'Все задачи закрыты. Переходите к финальному повтору.'
  }

  if (stats.daysStarted === 0) {
    return 'Начните с первого дня: диагностика покажет слабые зоны.'
  }

  if (stats.topUnfinishedTaskTypes.length > 0) {
    return `Чаще всего остается: ${stats.topUnfinishedTaskTypes.join(', ')}.`
  }

  return 'Слабые зоны пока не видны - продолжайте отмечать задачи.'
}

export function calculateSuperIntensiveStats(
  plan: SuperIntensiveDayPlan[],
  progress: SuperIntensiveProgressState,
): SuperIntensiveStats {
  const unfinishedTasksByType = createEmptyUnfinishedMap()
  let daysStarted = 0
  let daysCompleted = 0
  let totalTasksCompleted = 0
  let totalTasksAvailable = 0

  const dayStatuses = plan.map((day) => {
    const dayProgress = getDayProgress(progress, day.dayNumber)
    const completedTasks = day.tasks.filter((task) =>
      dayProgress.completedTaskIds.includes(task.id),
    ).length
    const hasNote = dayProgress.note.trim().length > 0
    const totalTasks = day.tasks.length
    const isStarted = completedTasks > 0 || hasNote
    const isCompleted = totalTasks > 0 && completedTasks === totalTasks

    if (isStarted) {
      daysStarted += 1
    }

    if (isCompleted) {
      daysCompleted += 1
    }

    totalTasksCompleted += completedTasks
    totalTasksAvailable += totalTasks

    for (const task of day.tasks) {
      if (!dayProgress.completedTaskIds.includes(task.id)) {
        unfinishedTasksByType[task.type] += 1
      }
    }

    const status: SuperIntensiveDayStatus['status'] = isCompleted
      ? 'completed'
      : isStarted
        ? 'in-progress'
        : 'not-started'

    return {
      dayNumber: day.dayNumber,
      completedTasks,
      totalTasks,
      status,
    }
  })

  const highestUnfinishedCount = Math.max(...Object.values(unfinishedTasksByType))
  const topUnfinishedTaskTypes =
    highestUnfinishedCount > 0
      ? TASK_TYPES.filter((taskType) => unfinishedTasksByType[taskType] === highestUnfinishedCount).slice(
          0,
          2,
        )
      : []

  return {
    totalDays: plan.length,
    daysStarted,
    daysCompleted,
    totalTasksCompleted,
    totalTasksAvailable,
    overallCompletionPercent:
      totalTasksAvailable > 0 ? Math.round((totalTasksCompleted / totalTasksAvailable) * 100) : 0,
    unfinishedTasksByType,
    topUnfinishedTaskTypes,
    dayStatuses,
  }
}
