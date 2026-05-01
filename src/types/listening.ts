export interface ListeningQuestion {
  id: string
  promptRu: string
  options: string[]
  correctAnswer: string
}

export interface ListeningTask {
  id: string
  titleRu: string
  textPl: string
  speedSuggestion: string
  focus: string
  comprehensionQuestions: ListeningQuestion[]
  shadowingInstruction: string
  usefulVocabulary: string[]
  explanationRu: string
}

export interface ListeningProgressState {
  completedTaskIds: string[]
  bestScoresByTaskId: Record<string, number>
}
