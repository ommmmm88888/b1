export interface HowToSayExample {
  pl: string
  ru: string
}

export type HowToSayGenderPreference = 'male' | 'female' | 'both'

export type HowToSayHelperCategory =
  | 'all'
  | 'writing'
  | 'speaking'
  | 'work'
  | 'exam'
  | 'request'
  | 'complaint'
  | 'mistake'

export interface HowToSayEntry {
  id: string
  tags: string[]
  explanationRu: string
  ruInputPatterns?: string[]
  suggestedPl?: string
  suggestedPlVariants?: HowToSayPhraseVariants
  contextRu?: string
  commonMistakeRu?: string
  examples?: HowToSayExample[]
  incorrectPatterns?: string[]
  correctPatterns?: string[]
  correctedPl?: string
  correctedPlVariants?: HowToSayPhraseVariants
  ruleRef?: string
}

export interface HowToSayMatchOptions {
  category?: HowToSayHelperCategory
  genderPreference?: HowToSayGenderPreference
}

export interface HowToSayPhraseVariants {
  male?: string
  female?: string
  neutral?: string
}

export interface HowToSayDisplayPhrase {
  label: string
  phrase: string
}

export interface HowToSayPhraseCard {
  id: string
  inputText: string
  phrase: string
  displayPhrases: HowToSayDisplayPhrase[]
  contextRu: string
  explanationRu: string
  category: HowToSayHelperCategory
  kind: 'suggestion' | 'correction'
}

export interface HowToSaySuggestionResult {
  status: 'suggestion'
  input: string
  language: 'ru'
  suggestedPl: string
  displayPhrases: HowToSayDisplayPhrase[]
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
  displayPhrases: HowToSayDisplayPhrase[]
  explanationRu: string
  ruleRef?: string
}

export interface HowToSayLikelyCorrectResult {
  status: 'likely-correct'
  input: string
  language: 'pl'
  phrase: string
  displayPhrases: HowToSayDisplayPhrase[]
  explanationRu: string
}

export interface HowToSayUnknownResult {
  status: 'unknown'
  input: string
  language: 'ru' | 'pl' | 'unknown'
  message: string
  suggestions: HowToSayPhraseCard[]
}

export type HowToSayResult =
  | HowToSaySuggestionResult
  | HowToSayCorrectionResult
  | HowToSayLikelyCorrectResult
  | HowToSayUnknownResult
