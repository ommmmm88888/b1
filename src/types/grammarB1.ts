export type GrammarB1Status = 'ready' | 'soon'

export interface GrammarB1HeroStat {
  label: string
  value: string
}

export interface GrammarB1QuickRepeatCard {
  title: string
  description: string
  targetTopicId: string
}

export interface GrammarB1CorrectExample {
  pl: string
  ru: string
}

export interface GrammarB1ExamUsefulPhrase {
  pl: string
  ru?: string
  note?: string
}

export interface GrammarB1MiniTestItem {
  prompt: string
  answer: string
  explanation?: string
}

export interface GrammarB1ReadyTopic {
  id: string
  title: string
  shortTitle?: string
  status: 'ready'
  tags: string[]
  quickUseCase: string[]
  mainRule: string
  memoryHint: string
  typicalMistake: string
  correctExamples: GrammarB1CorrectExample[]
  examUsefulPhrases: GrammarB1ExamUsefulPhrase[]
  miniTest: GrammarB1MiniTestItem[]
}

export interface GrammarB1SoonTopic {
  id: string
  title: string
  status: 'soon'
  tags: string[]
  whyItMatters: string
  helpsWith: string
  examplePhrase: GrammarB1CorrectExample
}

export interface GrammarB1HandbookHero {
  eyebrow: string
  title: string
  description: string
  stats: GrammarB1HeroStat[]
}

export interface GrammarB1HandbookSection {
  label: string
  title: string
  description: string
}

export interface GrammarB1HandbookData {
  hero: GrammarB1HandbookHero
  quickRepeatCards: GrammarB1QuickRepeatCard[]
  readySection: GrammarB1HandbookSection
  soonSection: GrammarB1HandbookSection
  readyTopics: GrammarB1ReadyTopic[]
  soonTopics: GrammarB1SoonTopic[]
}
