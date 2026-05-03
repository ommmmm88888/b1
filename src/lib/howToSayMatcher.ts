import { howToSayEntries } from '../data/howToSay'
import type {
  HowToSayCorrectionResult,
  HowToSayEntry,
  HowToSayHelperCategory,
  HowToSayLikelyCorrectResult,
  HowToSayMatchOptions,
  HowToSayPhraseCard,
  HowToSayResult,
  HowToSaySuggestionResult,
  HowToSayUnknownResult,
} from '../types/howToSay'

const cyrillicPattern = /[А-Яа-яЁёІіЇїЄєҐґ]/
const latinPattern = /[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]/
const punctuationPattern = /[.,!?;:(){}"'`“”„’‘…/\\[\]–—-]/g
const diacriticPattern = /[\u0300-\u036f]/g
const whitespacePattern = /\s+/g

export const howToSayHelperCategories: Array<{ key: HowToSayHelperCategory; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'writing', label: 'Письмо' },
  { key: 'speaking', label: 'Говорение' },
  { key: 'work', label: 'Работа' },
  { key: 'exam', label: 'Экзамен' },
  { key: 'request', label: 'Просьбы' },
  { key: 'complaint', label: 'Жалобы' },
  { key: 'mistake', label: 'Ошибки' },
]

const howToSayCategoryRules: Record<Exclude<HowToSayHelperCategory, 'all'>, string[]> = {
  writing: [
    'письмо',
    'email',
    'odpowiedz',
    'odpowiedz',
    'z powazaniem',
    'z gory dziekuje za odpowiedz',
    'prosz o odpowiedz',
    'reklamacja',
    'list',
    'wyjasnic sytuacje',
    'prosze napisac',
    'kontakt',
    'ответить',
  ],
  speaking: [
    'говорение',
    'mniemanie',
    'mnie zdaniem',
    'moim zdaniem',
    'uwazam',
    'zgadzam sie',
    'nie zgadzam sie',
    'z jednej strony',
    'z drugiej strony',
    'na przyklad',
    'porownanie',
    'comparison',
  ],
  work: [
    'работа',
    'praca',
    'szukam pracy',
    'pracuje',
    'budowie',
    'budowa',
    'urzad',
    'urzędzie',
    'mieszkanie',
    'telefon',
    'konsultacja',
    'kurs',
    'doswiadczenie',
  ],
  exam: [
    'экзамен',
    'egzamin',
    'b1',
    'na egzaminie',
    'pytanie',
    'odpowiedz',
    'odpowiedz',
    'ustnie',
    'pisemnie',
    'zadanie',
    'struktura odpowiedzi',
  ],
  request: [
    'prosze',
    'poprosic',
    'pomoc',
    'potrzebuje',
    'umowic',
    'zapytac',
    'pytac',
    'prośba',
    'запрос',
    'просьба',
  ],
  complaint: [
    'reklamacja',
    'жалоба',
    'problem',
    'problemu',
    'nie dziala',
    'nie działa',
    'zepsuty',
    'za drogo',
    'nie jestem zadowolony',
    'nie dziala',
  ],
  mistake: ['blad', 'błąd', 'niepopraw', 'zle', 'ошибка', 'wrong'],
}

const allCategories: Exclude<HowToSayHelperCategory, 'all'>[] = [
  'writing',
  'speaking',
  'work',
  'exam',
  'request',
  'complaint',
  'mistake',
]

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

function buildSearchableBlob(entry: HowToSayEntry): string {
  return normalizePhrase(
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
}

function buildEntryCategory(entry: HowToSayEntry): Exclude<HowToSayHelperCategory, 'all'> {
  const searchableBlob = buildSearchableBlob(entry)
  let bestCategory: Exclude<HowToSayHelperCategory, 'all'> = 'speaking'
  let bestScore = -1

  for (const category of allCategories) {
    const score = scoreCategory(entry, category, searchableBlob)
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  if (bestScore > 0) {
    return bestCategory
  }

  const normalizedTags = (entry.tags ?? []).map((tag) => normalizePhrase(tag))
  const blob = searchableBlob

  if ((entry.incorrectPatterns?.length ?? 0) > 0) {
    return 'mistake'
  }

  if (normalizedTags.some((tag) => ['письмо', 'email', 'благодарность', 'вежливость', 'структура ответа'].includes(tag)) || blob.includes('reklamac')) {
    return 'writing'
  }

  if (normalizedTags.some((tag) => ['говорение', 'мнение', 'сравнение', 'вежливость'].includes(tag))) {
    return 'speaking'
  }

  if (normalizedTags.some((tag) => ['просьба', 'помощь', 'вежливость'].includes(tag)) || blob.includes('prosz') || blob.includes('pomoc')) {
    return 'request'
  }

  if (normalizedTags.some((tag) => ['жалоба', 'ошибка'].includes(tag)) || blob.includes('reklamac') || blob.includes('problem')) {
    return 'complaint'
  }

  if (normalizedTags.some((tag) => ['работа', 'уряд', 'квартира', 'транспорт', 'техника', 'опыт', 'курс', 'обязанность'].includes(tag)) || blob.includes('praca') || blob.includes('budow') || blob.includes('urzad')) {
    return 'work'
  }

  if (normalizedTags.some((tag) => ['экзамен', 'учёба', 'структура ответа', 'информация'].includes(tag)) || blob.includes('egzamin') || blob.includes('b1')) {
    return 'exam'
  }

  return bestCategory
}

function scoreCategory(
  entry: HowToSayEntry,
  category: Exclude<HowToSayHelperCategory, 'all'>,
  searchableBlob = buildSearchableBlob(entry),
): number {
  const normalizedTags = (entry.tags ?? []).map((tag) => normalizePhrase(tag))
  const normalizedRules = howToSayCategoryRules[category].map((item) => normalizePhrase(item))
  let score = 0

  if (category === 'mistake' && (entry.incorrectPatterns?.length ?? 0) > 0) {
    score += 4
  }

  if (category === 'writing' && entry.suggestedPl?.includes('...')) {
    score += 1
  }

  if (category === 'request' && (entry.suggestedPl ?? entry.correctedPl ?? '').toLowerCase().includes('pro')) {
    score += 1
  }

  for (const tag of normalizedTags) {
    if (normalizedRules.some((rule) => rule === tag || rule.includes(tag) || tag.includes(rule))) {
      score += 3
    }
  }

  for (const rule of normalizedRules) {
    if (searchableBlob.includes(rule)) {
      score += 2
    }
  }

  return score
}

function scorePopularity(entry: HowToSayEntry): number {
  let score = 0

  if ((entry.ruInputPatterns?.length ?? 0) > 0) {
    score += 4
  }

  if ((entry.incorrectPatterns?.length ?? 0) > 0) {
    score += 3
  }

  if ((entry.correctPatterns?.length ?? 0) > 0) {
    score += 2
  }

  if ((entry.examples?.length ?? 0) > 0) {
    score += 2
  }

  if (entry.suggestedPl || entry.correctedPl) {
    score += 2
  }

  if (entry.contextRu) {
    score += 1
  }

  return score
}

function scoreEntry(query: string, entry: HowToSayEntry, category: HowToSayHelperCategory = 'all'): number {
  const tokens = tokenize(query)
  const patternBlob = buildSearchableBlob(entry)
  const categoryScore = category === 'all' ? 0 : scoreCategory(entry, category)

  return tokens.reduce((score, token) => (patternBlob.includes(token) ? score + 1 : score), categoryScore)
}

function buildPhraseCard(
  entry: HowToSayEntry,
  kind: 'suggestion' | 'correction',
  inputText: string,
  category?: HowToSayHelperCategory,
): HowToSayPhraseCard | null {
  const phrase = kind === 'correction' ? entry.correctedPl ?? entry.suggestedPl : entry.suggestedPl ?? entry.correctedPl

  if (!phrase) {
    return null
  }

  return {
    id: entry.id,
    inputText,
    phrase,
    contextRu: entry.contextRu ?? '',
    explanationRu: entry.explanationRu,
    category: category ?? buildEntryCategory(entry),
    kind,
  }
}

function buildCardsFromEntries(
  entries: HowToSayEntry[],
  category: HowToSayHelperCategory,
  limit: number,
): HowToSayPhraseCard[] {
  const cards: HowToSayPhraseCard[] = []
  const seen = new Set<string>()

  for (const entry of entries) {
    const kind = entry.correctedPl && entry.incorrectPatterns?.length ? 'correction' : 'suggestion'
    const inputText =
      entry.ruInputPatterns?.[0] ??
      entry.incorrectPatterns?.[0] ??
      entry.correctPatterns?.[0] ??
      entry.contextRu ??
      entry.suggestedPl ??
      entry.correctedPl ??
      ''
    const card = buildPhraseCard(entry, kind, inputText, category === 'all' ? buildEntryCategory(entry) : category)
    if (card && !seen.has(card.phrase)) {
      seen.add(card.phrase)
      cards.push(card)
    }
    if (cards.length >= limit) {
      break
    }
  }

  return cards
}

function mergeCards(cards: HowToSayPhraseCard[], limit: number): HowToSayPhraseCard[] {
  const merged: HowToSayPhraseCard[] = []
  const seen = new Set<string>()

  for (const card of cards) {
    if (seen.has(card.id)) {
      continue
    }

    seen.add(card.id)
    merged.push(card)

    if (merged.length >= limit) {
      break
    }
  }

  return merged
}

function getDirectMatchEntries(input: string, category: HowToSayHelperCategory): HowToSayEntry[] {
  const normalizedInput = normalizePhrase(input)

  return howToSayEntries.filter((candidate) => {
    const matchesCategory = category === 'all' || scoreCategory(candidate, category) > 0
    if (!matchesCategory) {
      return false
    }

    const directPatterns = [
      ...(candidate.ruInputPatterns ?? []),
      ...(candidate.incorrectPatterns ?? []),
      ...(candidate.correctPatterns ?? []),
    ]

    return directPatterns.some((pattern) => {
      const normalizedPattern = normalizePhrase(pattern)
      return (
        normalizedInput === normalizedPattern ||
        includesNormalized(normalizedInput, normalizedPattern) ||
        includesNormalized(normalizedPattern, normalizedInput)
      )
    })
  })
}

function getRankedEntries(input: string, category: HowToSayHelperCategory, limit: number): HowToSayEntry[] {
  const ranked = howToSayEntries
    .map((candidate, index) => ({ candidate, index, score: scoreEntry(input, candidate, category) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      const leftCategoryScore = category === 'all' ? scoreCategory(left.candidate, buildEntryCategory(left.candidate)) : scoreCategory(left.candidate, category)
      const rightCategoryScore = category === 'all' ? scoreCategory(right.candidate, buildEntryCategory(right.candidate)) : scoreCategory(right.candidate, category)
      if (rightCategoryScore !== leftCategoryScore) {
        return rightCategoryScore - leftCategoryScore
      }

      return left.index - right.index
    })
    .map((item) => item.candidate)

  return ranked.slice(0, limit)
}

export function getHowToSayPopularTemplates(
  category: HowToSayHelperCategory = 'all',
  limit = 35,
): HowToSayPhraseCard[] {
  const candidates = [...howToSayEntries]
    .map((entry, index) => ({
      entry,
      index,
      score: category === 'all' ? scorePopularity(entry) : scoreCategory(entry, category),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.index - right.index
    })
    .map((item) => item.entry)

  return buildCardsFromEntries(candidates, category, limit)
}

export function getHowToSayRelatedSuggestions(
  input: string,
  category: HowToSayHelperCategory = 'all',
  limit = 23,
): HowToSayPhraseCard[] {
  const directEntries = getDirectMatchEntries(input, category)
  const directCards = buildCardsFromEntries(directEntries, category, limit)
  if (directCards.length >= limit) {
    return directCards.slice(0, limit)
  }

  const rankedEntries = getRankedEntries(input, category, limit)
  const rankedCards = buildCardsFromEntries(rankedEntries, category, limit)
  const popularCards = getHowToSayPopularTemplates(category, limit)
  const mergedCards = mergeCards([...directCards, ...rankedCards, ...popularCards], limit)

  return mergedCards.slice(0, limit)
}

function buildUnknownResult(
  input: string,
  language: 'ru' | 'pl' | 'unknown',
  message: string,
  category: HowToSayHelperCategory = 'all',
): HowToSayUnknownResult {
  return {
    status: 'unknown',
    input,
    language,
    message,
    suggestions: getHowToSayRelatedSuggestions(input, category),
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

function findBestSuggestionEntry(text: string, category: HowToSayHelperCategory): HowToSayEntry | undefined {
  const directEntries = getDirectMatchEntries(text, category)
  if (directEntries.length > 0) {
    return directEntries[0]
  }

  return undefined
}

export function findPolishSuggestion(text: string, options: HowToSayMatchOptions = {}): HowToSayResult {
  const input = text.trim()
  if (!input) {
    return buildUnknownResult(input, 'ru', 'Введите фразу, чтобы получить польский вариант.', options.category ?? 'all')
  }

  const category = options.category ?? 'all'
  const entry = findBestSuggestionEntry(input, category)

  if (!entry || !entry.suggestedPl) {
    return buildUnknownResult(
      input,
      'ru',
      'Пока нет точного варианта. Попробуйте короче: работа, квартира, экзамен, помощь.',
      category,
    )
  }

  return buildSuggestionResult(input, entry)
}

export function checkPolishPhrase(text: string, options: HowToSayMatchOptions = {}): HowToSayResult {
  const input = text.trim()
  if (!input) {
    return buildUnknownResult(
      input,
      'pl',
      'Введите польскую фразу, чтобы я проверил частые шаблоны.',
      options.category ?? 'all',
    )
  }

  const normalizedInput = normalizePhrase(input)
  const category = options.category ?? 'all'

  const directCorrection = howToSayEntries.find((entry) =>
    (category === 'all' || scoreCategory(entry, category) > 0) &&
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
    (category === 'all' || scoreCategory(entry, category) > 0) &&
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
    category,
  )
}
