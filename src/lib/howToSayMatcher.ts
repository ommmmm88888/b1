import { howToSayEntries } from '../data/howToSay'
import type {
  HowToSayCorrectionResult,
  HowToSayDisplayPhrase,
  HowToSayEntry,
  HowToSayGenderPreference,
  HowToSayHelperCategory,
  HowToSayLikelyCorrectResult,
  HowToSayMatchOptions,
  HowToSayPhraseCard,
  HowToSayPhraseVariants,
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
    'moim zdaniem',
    'uwazam',
    'zgadzam sie',
    'nie zgadzam sie',
    'z jednej strony',
    'z drugiej strony',
    'na przyklad',
    'porownanie',
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
    'ustnie',
    'pisemnie',
    'zadanie',
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
    'nie dziala',
    'nie działa',
    'zepsuty',
    'za drogo',
    'nie jestem zadowolony',
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
      entry.suggestedPlVariants?.male,
      entry.suggestedPlVariants?.female,
      entry.suggestedPlVariants?.neutral,
      entry.correctedPl,
      entry.correctedPlVariants?.male,
      entry.correctedPlVariants?.female,
      entry.correctedPlVariants?.neutral,
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

  if (category === 'writing' && (entry.suggestedPl ?? entry.correctedPl ?? '').includes('...')) {
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

function scoreEntry(query: string, entry: HowToSayEntry, category: HowToSayHelperCategory = 'all'): number {
  const tokens = tokenize(query)
  const patternBlob = buildSearchableBlob(entry)
  const categoryScore = category === 'all' ? 0 : scoreCategory(entry, category)

  return tokens.reduce((score, token) => (patternBlob.includes(token) ? score + 1 : score), categoryScore)
}

function getVariantLabel(variant: 'male' | 'female' | 'neutral' | 'fallback'): string {
  if (variant === 'male') {
    return 'Мужской вариант'
  }

  if (variant === 'female') {
    return 'Женский вариант'
  }

  return 'Вариант'
}

function addDisplayPhrase(target: HowToSayDisplayPhrase[], label: string, phrase?: string): void {
  const cleaned = phrase?.trim()
  if (!cleaned) {
    return
  }

  if (target.some((item) => item.phrase === cleaned)) {
    return
  }

  target.push({ label, phrase: cleaned })
}

function resolveDisplayPhrases(
  variants: HowToSayPhraseVariants | undefined,
  fallbackPhrase: string | undefined,
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSayDisplayPhrase[] {
  const male = variants?.male?.trim()
  const female = variants?.female?.trim()
  const neutral = variants?.neutral?.trim()
  const displayPhrases: HowToSayDisplayPhrase[] = []

  if (genderPreference === 'male') {
    if (male) {
      addDisplayPhrase(displayPhrases, getVariantLabel('male'), male)
    } else if (neutral) {
      addDisplayPhrase(displayPhrases, getVariantLabel('neutral'), neutral)
    } else if (female) {
      addDisplayPhrase(displayPhrases, getVariantLabel('female'), female)
    } else {
      addDisplayPhrase(displayPhrases, getVariantLabel('fallback'), fallbackPhrase)
    }
    return displayPhrases
  }

  if (genderPreference === 'female') {
    if (female) {
      addDisplayPhrase(displayPhrases, getVariantLabel('female'), female)
    } else if (neutral) {
      addDisplayPhrase(displayPhrases, getVariantLabel('neutral'), neutral)
    } else if (male) {
      addDisplayPhrase(displayPhrases, getVariantLabel('male'), male)
    } else {
      addDisplayPhrase(displayPhrases, getVariantLabel('fallback'), fallbackPhrase)
    }
    return displayPhrases
  }

  addDisplayPhrase(displayPhrases, getVariantLabel('male'), male)
  addDisplayPhrase(displayPhrases, getVariantLabel('female'), female)

  if (displayPhrases.length === 0) {
    addDisplayPhrase(displayPhrases, neutral ? getVariantLabel('neutral') : getVariantLabel('fallback'), neutral ?? fallbackPhrase)
  } else if (neutral && !displayPhrases.some((item) => item.phrase === neutral)) {
    addDisplayPhrase(displayPhrases, getVariantLabel('neutral'), neutral)
  }

  if (displayPhrases.length === 0) {
    addDisplayPhrase(displayPhrases, getVariantLabel('fallback'), fallbackPhrase)
  }

  return displayPhrases
}

function resolvePrimaryPhrase(
  variants: HowToSayPhraseVariants | undefined,
  fallbackPhrase: string | undefined,
  genderPreference: HowToSayGenderPreference = 'both',
): string {
  return resolveDisplayPhrases(variants, fallbackPhrase, genderPreference)[0]?.phrase ?? fallbackPhrase ?? ''
}

function buildPhraseCard(
  entry: HowToSayEntry,
  kind: 'suggestion' | 'correction',
  inputText: string,
  category?: HowToSayHelperCategory,
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSayPhraseCard | null {
  const variants = kind === 'correction' ? entry.correctedPlVariants : entry.suggestedPlVariants
  const fallbackPhrase = kind === 'correction' ? entry.correctedPl ?? entry.suggestedPl : entry.suggestedPl ?? entry.correctedPl
  const phrase = resolvePrimaryPhrase(variants, fallbackPhrase, genderPreference)

  if (!phrase) {
    return null
  }

  return {
    id: entry.id,
    inputText,
    phrase,
    displayPhrases: resolveDisplayPhrases(variants, fallbackPhrase, genderPreference),
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
  genderPreference: HowToSayGenderPreference = 'both',
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
    const card = buildPhraseCard(entry, kind, inputText, category === 'all' ? buildEntryCategory(entry) : category, genderPreference)
    if (card && !seen.has(card.id)) {
      seen.add(card.id)
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
  genderPreference: HowToSayGenderPreference = 'both',
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

  return buildCardsFromEntries(candidates, category, limit, genderPreference)
}

export function getHowToSayRelatedSuggestions(
  input: string,
  category: HowToSayHelperCategory = 'all',
  limit = 23,
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSayPhraseCard[] {
  const directEntries = getDirectMatchEntries(input, category)
  const directCards = buildCardsFromEntries(directEntries, category, limit, genderPreference)
  if (directCards.length >= limit) {
    return directCards.slice(0, limit)
  }

  const rankedEntries = getRankedEntries(input, category, limit)
  const rankedCards = buildCardsFromEntries(rankedEntries, category, limit, genderPreference)
  const popularCards = getHowToSayPopularTemplates(category, limit, genderPreference)
  const mergedCards = mergeCards([...directCards, ...rankedCards, ...popularCards], limit)

  return mergedCards.slice(0, limit)
}

function buildUnknownResult(
  input: string,
  language: 'ru' | 'pl' | 'unknown',
  message: string,
  category: HowToSayHelperCategory = 'all',
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSayUnknownResult {
  return {
    status: 'unknown',
    input,
    language,
    message,
    suggestions: getHowToSayRelatedSuggestions(input, category, 23, genderPreference),
  }
}

function buildSuggestionResult(
  input: string,
  entry: HowToSayEntry,
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSaySuggestionResult {
  const fallbackPhrase = entry.suggestedPl ?? entry.correctedPl ?? ''
  return {
    status: 'suggestion',
    input,
    language: 'ru',
    suggestedPl: resolvePrimaryPhrase(entry.suggestedPlVariants, fallbackPhrase, genderPreference),
    displayPhrases: resolveDisplayPhrases(entry.suggestedPlVariants, fallbackPhrase, genderPreference),
    contextRu: entry.contextRu ?? '',
    explanationRu: entry.explanationRu,
    commonMistakeRu: entry.commonMistakeRu,
    examples: entry.examples ?? [],
  }
}

function buildCorrectionResult(
  input: string,
  entry: HowToSayEntry,
  genderPreference: HowToSayGenderPreference = 'both',
): HowToSayCorrectionResult | HowToSayLikelyCorrectResult {
  const normalizedInput = normalizePhrase(input)
  const normalizedCorrect = (entry.correctPatterns ?? []).map((pattern) => normalizePhrase(pattern))
  const normalizedIncorrect = (entry.incorrectPatterns ?? []).map((pattern) => normalizePhrase(pattern))

  const isIncorrect = normalizedIncorrect.some((pattern) => normalizedInput === pattern || normalizedInput.includes(pattern))
  if (isIncorrect) {
    const correctedFallback = entry.correctedPl ?? entry.suggestedPl ?? ''
    return {
      status: 'correction',
      input,
      language: 'pl',
      correctedPl: resolvePrimaryPhrase(entry.correctedPlVariants, correctedFallback, genderPreference),
      displayPhrases: resolveDisplayPhrases(entry.correctedPlVariants, correctedFallback, genderPreference),
      explanationRu: entry.explanationRu,
      ruleRef: entry.ruleRef,
    }
  }

  const isCorrect = normalizedCorrect.some(
    (pattern) => normalizedInput === pattern || normalizedInput.includes(pattern) || pattern.includes(normalizedInput),
  )

  if (isCorrect) {
    const fallbackPhrase = entry.correctedPl ?? entry.suggestedPl ?? input
    return {
      status: 'likely-correct',
      input,
      language: 'pl',
      phrase: resolvePrimaryPhrase(entry.correctedPlVariants, fallbackPhrase, genderPreference),
      displayPhrases: resolveDisplayPhrases(entry.correctedPlVariants, fallbackPhrase, genderPreference),
      explanationRu: entry.explanationRu,
    }
  }

  const correctedFallback = entry.correctedPl ?? entry.suggestedPl ?? ''
  return {
    status: 'correction',
    input,
    language: 'pl',
    correctedPl: resolvePrimaryPhrase(entry.correctedPlVariants, correctedFallback, genderPreference),
    displayPhrases: resolveDisplayPhrases(entry.correctedPlVariants, correctedFallback, genderPreference),
    explanationRu: entry.explanationRu,
    ruleRef: entry.ruleRef,
  }
}

function findBestSuggestionEntry(text: string, category: HowToSayHelperCategory): HowToSayEntry | undefined {
  return getDirectMatchEntries(text, category)[0]
}

export function findPolishSuggestion(text: string, options: HowToSayMatchOptions = {}): HowToSayResult {
  const input = text.trim()
  const category = options.category ?? 'all'
  const genderPreference = options.genderPreference ?? 'both'

  if (!input) {
    return buildUnknownResult(input, 'ru', 'Введите фразу, чтобы получить польский вариант.', category, genderPreference)
  }

  const entry = findBestSuggestionEntry(input, category)

  if (!entry) {
    return buildUnknownResult(
      input,
      'ru',
      'Пока нет точного варианта. Попробуйте короче: работа, квартира, экзамен, помощь.',
      category,
      genderPreference,
    )
  }

  return buildSuggestionResult(input, entry, genderPreference)
}

export function checkPolishPhrase(text: string, options: HowToSayMatchOptions = {}): HowToSayResult {
  const input = text.trim()
  const category = options.category ?? 'all'
  const genderPreference = options.genderPreference ?? 'both'

  if (!input) {
    return buildUnknownResult(input, 'pl', 'Введите польскую фразу, чтобы я проверил частые шаблоны.', category, genderPreference)
  }

  const normalizedInput = normalizePhrase(input)

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
    const result = buildCorrectionResult(input, directCorrection, genderPreference)
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
    const result = buildCorrectionResult(input, directCorrect, genderPreference)
    if (result.status === 'likely-correct') {
      return result
    }
  }

  return buildUnknownResult(
    input,
    detectInputLanguage(input),
    'Я пока проверяю только частые B1-шаблоны. Попробуйте фразу из справочника или короче.',
    category,
    genderPreference,
  )
}
