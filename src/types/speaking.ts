export type SpeakingPromptType =
  | 'picture'
  | 'past-story'
  | 'future-plans'
  | 'opinion'
  | 'dialogue'
  | 'comparison'
  | 'work-exam'

export interface SpeakingPrompt {
  id: string
  type: SpeakingPromptType
  titleRu: string
  situationRu: string
  promptPl: string
  answerPlanRu: string[]
  usefulPhrasesPl: string[]
  minimumAnswerGoal: string
  selfCheckCriteria: string[]
  commonMistakesRu: string[]
}

export interface SpeakingProgressState {
  completedPromptIds: string[]
}
