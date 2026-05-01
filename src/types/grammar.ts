export type GrammarTopicId =
  | 'past-tense-agreement'
  | 'cases-b1'
  | 'verb-aspect'
  | 'prepositions-cases'
  | 'adjective-noun-agreement'

export type GrammarAnswerMode = 'input' | 'choice'

export interface GrammarTopic {
  id: GrammarTopicId
  titleRu: string
  focusRu: string
}

export interface GrammarTask {
  id: string
  topicId: GrammarTopicId
  promptRu: string
  answerMode: GrammarAnswerMode
  choices?: string[]
  acceptedAnswers: string[]
  explanationRu: string
  commonMistakeRu: string
  examplePl: string
  difficulty: 'B1'
}

export interface GrammarProgressState {
  totalAttempts: number
  correctAnswers: number
  mistakesByTaskId: Record<string, number>
}
