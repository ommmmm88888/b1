export interface HowToSayExample {
  pl: string
  ru: string
}

export interface HowToSayEntry {
  id: string
  tags: string[]
  explanationRu: string
  ruInputPatterns?: string[]
  suggestedPl?: string
  contextRu?: string
  commonMistakeRu?: string
  examples?: HowToSayExample[]
  incorrectPatterns?: string[]
  correctPatterns?: string[]
  correctedPl?: string
  ruleRef?: string
}

export interface HowToSaySuggestionResult {
  status: 'suggestion'
  input: string
  language: 'ru'
  suggestedPl: string
  contextRu: string
  explanationRu: string
  commonMistakeRu?: string
  examples: HowToSayExample[]
}

export interface HowToSayCorrectionResult {
  status: 'correction'
  input: string
  language: 'pl'
  correctedPl: string
  explanationRu: string
  ruleRef?: string
}

export interface HowToSayLikelyCorrectResult {
  status: 'likely-correct'
  input: string
  language: 'pl'
  phrase: string
  explanationRu: string
}

export interface HowToSayUnknownResult {
  status: 'unknown'
  input: string
  language: 'ru' | 'pl' | 'unknown'
  message: string
  suggestions: string[]
}

export type HowToSayResult =
  | HowToSaySuggestionResult
  | HowToSayCorrectionResult
  | HowToSayLikelyCorrectResult
  | HowToSayUnknownResult
