export type GrammarB1BlockStatus = 'ready' | 'soon'

export interface GrammarB1Table {
  title: string
  columns: string[]
  rows: string[][]
  note?: string
}

export interface GrammarB1Example {
  pl: string
  ru: string
}

export interface GrammarB1QuizItem {
  prompt: string
  acceptedAnswers: string[]
  note?: string
}

export interface GrammarB1Block {
  id: string
  title: string
  subtitle: string
  status: GrammarB1BlockStatus
  intro: string[]
  tables: GrammarB1Table[]
  mnemonic: string[]
  examples: GrammarB1Example[]
  quiz: GrammarB1QuizItem[]
  preview?: string[]
}
