export interface MockChoiceQuestion {
  id: string
  promptRu: string
  options: string[]
  correctAnswer: string
}

export interface MockGrammarTask {
  id: string
  promptRu: string
  acceptedAnswers: string[]
  choices?: string[]
}

export interface MockWritingTask {
  promptRu: string
  requiredElements: string[]
  selfCheckCriteria: string[]
}

export interface MockSpeakingTask {
  id: string
  promptPl: string
  planRu: string[]
}

export interface MockListeningTask {
  titleRu: string
  textPl: string
  questions: MockChoiceQuestion[]
}

export interface MiniMockExam {
  reading: {
    titleRu: string
    textPl: string
    questions: MockChoiceQuestion[]
  }
  grammar: MockGrammarTask[]
  writing: MockWritingTask
  speaking: {
    prompts: MockSpeakingTask[]
    selfCheckCriteria: string[]
  }
  listening: MockListeningTask
}

export interface MockZoneScores {
  reading: number
  grammar: number
  writing: number
  speaking: number
  listening: number
}

export interface MockExamResult {
  completedAt: string
  overallReadinessPercent: number
  zoneScores: MockZoneScores
  weakestZones: string[]
  recommendedNextActions: string[]
}
