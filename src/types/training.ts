export type TrainingCategory =
  | 'экзаменационные фразы'
  | 'бытовые ситуации'
  | 'ложные друзья'
  | 'грамматические модели'
  | 'глаголы и аспект'

export interface VocabularyItem {
  id: string
  ruPrompt: string
  acceptedAnswers: string[]
  hintRu: string
  explanationRu: string
  category: TrainingCategory
}

export interface ProgressState {
  totalAttempts: number
  correctAnswers: number
  mistakesByItem: Record<string, number>
  lastSessionDate: string | null
  dailyCompletedCount: number
  streak: number
}

