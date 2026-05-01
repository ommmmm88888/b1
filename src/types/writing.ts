export type WritingTaskType = 'email' | 'invitation' | 'announcement' | 'complaint' | 'request' | 'opinion'

export interface WritingTask {
  id: string
  type: WritingTaskType
  titleRu: string
  promptRu: string
  requiredElements: string[]
  usefulPhrasesPl: string[]
  sampleStructureRu: string[]
  sampleAnswerPl: string
  selfCheckCriteria: string[]
  typicalMistakesRu: string[]
}

export interface WritingTaskProgress {
  draft: string
  checkedCriteria: string[]
  updatedAt: string
}

export interface WritingProgressState {
  selectedTaskId: string
  tasks: Record<string, WritingTaskProgress>
}
