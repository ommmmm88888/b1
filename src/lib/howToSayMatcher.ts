import { howToSayEntries } from '../data/howToSay'
import type {
  HowToSayCorrectionResult,
  HowToSayEntry,
  HowToSayLikelyCorrectResult,
  HowToSayResult,
  HowToSaySuggestionResult,
  HowToSayUnknownResult,
} from '../types/howToSay'

const cyrillicPattern = /[А-Яа-яЁёІіЇїЄєҐґ]/
const latinPattern = /[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]/
const punctuationPattern = /[.,!?;:(){}"'`“”„’‘…/\\[\]–—-]/g
const diacriticPattern = /[\u0300-\u036f]/g
const whitespacePattern = /\s+/g

export function normalizePhrase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(diacriticPattern, '')
    .replace(punctuationPattern, ' ')
    .replace(whitespacePattern, ' ')
    .trim()
}

export function detectInputLanguage(text: string): 'ru' | 'pl' | 'unknown' {
  const value = text.trim()

  if (!value) {
    return 'unknown'
  }

  if (cyrillicPattern.test(value)) {
    return 'ru'
  }

  if (latinPattern.test(value)) {
    return 'pl'
  }

  return 'unknown'
}

function includesNormalized(haystack: string, needle: string): boolean {
  if (!needle) {
    return false
  }

  return haystack.includes(needle) || needle.includes(haystack)
}

function tokenize(value: string): string[] {
  return normalizePhrase(value)
    .split(' ')
    .filter(Boolean)
}

function scoreEntry(query: string, entry: HowToSayEntry): number {
  const tokens = tokenize(query)
  const patternBlob = normalizePhrase(
    [
      entry.suggestedPl,
      entry.correctedPl,
      entry.contextRu,
      entry.explanationRu,
      entry.commonMistakeRu,
      entry.ruleRef,
      ...(entry.examples?.flatMap((example) => [example.pl, example.ru]) ?? []),
      ...(entry.tags ?? []),
      ...(entry.ruInputPatterns ?? []),
      ...(entry.incorrectPatterns ?? []),
      ...(entry.correctPatterns ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  )

  return tokens.reduce((score, token) => (patternBlob.includes(token) ? score + 1 : score), 0)
}

function buildUnknownResult(
  input: string,
  language: 'ru' | 'pl' | 'unknown',
  message: string,
): HowToSayUnknownResult {
  const suggestions = [...howToSayEntries]
    .map((entry) => ({ entry, score: scoreEntry(input, entry) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.entry.suggestedPl ?? item.entry.correctedPl ?? item.entry.contextRu ?? item.entry.explanationRu)
    .filter(Boolean) as string[]

  return {
    status: 'unknown',
    input,
    language,
    message,
    suggestions,
  }
}

function buildSuggestionResult(input: string, entry: HowToSayEntry): HowToSaySuggestionResult {
  return {
    status: 'suggestion',
    input,
    language: 'ru',
    suggestedPl: entry.suggestedPl ?? '',
    contextRu: entry.contextRu ?? '',
    explanationRu: entry.explanationRu,
    commonMistakeRu: entry.commonMistakeRu,
    examples: entry.examples ?? [],
  }
}

function buildCorrectionResult(input: string, entry: HowToSayEntry): HowToSayCorrectionResult | HowToSayLikelyCorrectResult {
  const normalizedInput = normalizePhrase(input)
  const normalizedCorrect = (entry.correctPatterns ?? []).map((pattern) => normalizePhrase(pattern))
  const normalizedIncorrect = (entry.incorrectPatterns ?? []).map((pattern) => normalizePhrase(pattern))

  const isIncorrect = normalizedIncorrect.some((pattern) => normalizedInput === pattern || normalizedInput.includes(pattern))
  if (isIncorrect) {
    return {
      status: 'correction',
      input,
      language: 'pl',
      correctedPl: entry.correctedPl ?? entry.suggestedPl ?? '',
      explanationRu: entry.explanationRu,
      ruleRef: entry.ruleRef,
    }
  }

  const isCorrect = normalizedCorrect.some(
    (pattern) => normalizedInput === pattern || normalizedInput.includes(pattern) || pattern.includes(normalizedInput),
  )

  if (isCorrect) {
    return {
      status: 'likely-correct',
      input,
      language: 'pl',
      phrase: entry.correctedPl ?? entry.suggestedPl ?? input,
      explanationRu: entry.explanationRu,
    }
  }

  return {
    status: 'correction',
    input,
    language: 'pl',
    correctedPl: entry.correctedPl ?? entry.suggestedPl ?? '',
    explanationRu: entry.explanationRu,
    ruleRef: entry.ruleRef,
  }
}

export function findPolishSuggestion(text: string): HowToSayResult {
  const input = text.trim()
  if (!input) {
    return buildUnknownResult(input, 'ru', 'Введите фразу, чтобы получить польский вариант.')
  }

  const normalizedInput = normalizePhrase(input)
  const entry =
    howToSayEntries.find((candidate) =>
      (candidate.ruInputPatterns ?? []).some((pattern) => {
        const normalizedPattern = normalizePhrase(pattern)
        return (
          normalizedInput === normalizedPattern ||
          includesNormalized(normalizedInput, normalizedPattern) ||
          includesNormalized(normalizedPattern, normalizedInput)
        )
      }),
    ) ??
    howToSayEntries
      .map((candidate) => ({ candidate, score: scoreEntry(input, candidate) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.candidate

  if (!entry || !entry.suggestedPl) {
    return buildUnknownResult(
      input,
      'ru',
      'Пока нет точного варианта. Попробуйте короче: работа, квартира, экзамен, помощь.',
    )
  }

  return buildSuggestionResult(input, entry)
}

export function checkPolishPhrase(text: string): HowToSayResult {
  const input = text.trim()
  if (!input) {
    return buildUnknownResult(input, 'pl', 'Введите польскую фразу, чтобы я проверил частые шаблоны.')
  }

  const normalizedInput = normalizePhrase(input)

  const directCorrection = howToSayEntries.find((entry) =>
    (entry.incorrectPatterns ?? []).some((pattern) => {
      const normalizedPattern = normalizePhrase(pattern)
      return (
        normalizedInput === normalizedPattern ||
        includesNormalized(normalizedInput, normalizedPattern) ||
        includesNormalized(normalizedPattern, normalizedInput)
      )
    }),
  )

  if (directCorrection) {
    const result = buildCorrectionResult(input, directCorrection)
    if (result.status === 'correction') {
      return result
    }
  }

  const directCorrect = howToSayEntries.find((entry) =>
    (entry.correctPatterns ?? []).some((pattern) => {
      const normalizedPattern = normalizePhrase(pattern)
      return (
        normalizedInput === normalizedPattern ||
        includesNormalized(normalizedInput, normalizedPattern) ||
        includesNormalized(normalizedPattern, normalizedInput)
      )
    }),
  )

  if (directCorrect) {
    const result = buildCorrectionResult(input, directCorrect)
    if (result.status === 'likely-correct') {
      return result
    }
  }

  return buildUnknownResult(
    input,
    detectInputLanguage(input),
    'Я пока проверяю только частые B1-шаблоны. Попробуйте фразу из справочника или короче.',
  )
}
