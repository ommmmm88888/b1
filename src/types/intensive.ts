export type SuperIntensiveTaskType =
  | 'повторение'
  | 'грамматика'
  | 'письмо'
  | 'говорение'
  | 'аудирование'
  | 'пробный экзамен'
  | 'исправление ошибок'

export interface SuperIntensiveTask {
  id: string
  title: string
  durationMinutes: number
  type: SuperIntensiveTaskType
}

export interface SuperIntensiveDayProgress {
  completedTaskIds: string[]
  note: string
  updatedAt: string
}

export interface SuperIntensiveProgressState {
  selectedDay: number
  days: Record<string, SuperIntensiveDayProgress>
  updatedAt: string
}
