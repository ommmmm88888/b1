export type ReadingQuestionType = 'single-choice' | 'true-false' | 'detail-search' | 'main-idea'

export interface ReadingQuestion {
  id: string
  type: ReadingQuestionType
  promptRu: string
  options: string[]
  correctAnswer: string
  explanationRu: string
}

export interface ReadingTask {
  id: string
  titleRu: string
  topic: string
  textPl: string
  questions: ReadingQuestion[]
}

export interface ReadingProgressState {
  completedTaskIds: string[]
  bestScoresByTaskId: Record<string, number>
}
