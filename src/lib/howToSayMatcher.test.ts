import { describe, expect, it } from 'vitest'
import { howToSayEntries } from '../data/howToSay'
import {
  checkPolishPhrase,
  detectInputLanguage,
  findPolishSuggestion,
  getHowToSayPopularTemplates,
  getHowToSayRelatedSuggestions,
  normalizePhrase,
} from './howToSayMatcher'

describe('howToSayMatcher', () => {
  it('normalizes phrase text for matching', () => {
    expect(normalizePhrase('  Szukam, pracy!  ')).toBe('szukam pracy')
  })

  it('detects the input language', () => {
    expect(detectInputLanguage('Я ищу работу.')).toBe('ru')
    expect(detectInputLanguage('Szukam pracy.')).toBe('pl')
    expect(detectInputLanguage('12345')).toBe('unknown')
  })

  it('resolves gender-aware suggestions for Russian input', () => {
    const maleQuestion = findPolishSuggestion('Я хотел бы спросить.', { genderPreference: 'male' })
    expect(maleQuestion.status).toBe('suggestion')
    if (maleQuestion.status === 'suggestion') {
      expect(maleQuestion.suggestedPl).toBe('Chciałbym zapytać.')
    }

    const femaleQuestion = findPolishSuggestion('Я хотел бы спросить.', { genderPreference: 'female' })
    expect(femaleQuestion.status).toBe('suggestion')
    if (femaleQuestion.status === 'suggestion') {
      expect(femaleQuestion.suggestedPl).toBe('Chciałabym zapytać.')
    }

    const bothQuestion = findPolishSuggestion('Я хотел бы спросить.', { genderPreference: 'both' })
    expect(bothQuestion.status).toBe('suggestion')
    if (bothQuestion.status === 'suggestion') {
      expect(bothQuestion.displayPhrases.map((item) => item.phrase)).toEqual([
        'Chciałbym zapytać.',
        'Chciałabym zapytać.',
      ])
    }

    const maleOffice = findPolishSuggestion('Я был в ужонде.', { genderPreference: 'male' })
    expect(maleOffice.status).toBe('suggestion')
    if (maleOffice.status === 'suggestion') {
      expect(maleOffice.suggestedPl).toBe('Byłem w urzędzie.')
    }

    const femaleOffice = findPolishSuggestion('Я была в ужонде.', { genderPreference: 'female' })
    expect(femaleOffice.status).toBe('suggestion')
    if (femaleOffice.status === 'suggestion') {
      expect(femaleOffice.suggestedPl).toBe('Byłam w urzędzie.')
    }

    const maleTask = findPolishSuggestion('Я сделал задание.', { genderPreference: 'male' })
    expect(maleTask.status).toBe('suggestion')
    if (maleTask.status === 'suggestion') {
      expect(maleTask.suggestedPl).toBe('Zrobiłem zadanie.')
    }

    const femaleTask = findPolishSuggestion('Я сделала задание.', { genderPreference: 'female' })
    expect(femaleTask.status).toBe('suggestion')
    if (femaleTask.status === 'suggestion') {
      expect(femaleTask.suggestedPl).toBe('Zrobiłam zadanie.')
    }
  })

  it('returns related suggestions when there is no exact match', () => {
    const unknown = findPolishSuggestion('Я хочу что-то странное про работу и письмо.')
    expect(unknown.status).toBe('unknown')
    if (unknown.status === 'unknown') {
      expect(unknown.suggestions.length).toBe(23)
      expect(unknown.suggestions.every((suggestion) => suggestion.inputText.trim().length > 0)).toBe(true)
    }
  })

  it('keeps work and writing suggestions close to the query', () => {
    const workSuggestions = getHowToSayRelatedSuggestions('Мне нужна фраза про работу и офис.', 'work')
    expect(workSuggestions.length).toBeGreaterThan(0)
    expect(workSuggestions.some((suggestion) => suggestion.phrase.includes('Szukam pracy'))).toBe(true)

    const writingSuggestions = getHowToSayRelatedSuggestions('Мне нужна фраза для письма.', 'writing')
    expect(writingSuggestions.length).toBeGreaterThan(0)
    expect(writingSuggestions.some((suggestion) => suggestion.phrase.includes('Piszę, ponieważ'))).toBe(true)
  })

  it('preserves variant information in related suggestions', () => {
    const related = getHowToSayRelatedSuggestions('Я хотел бы сказать что это важно.', 'speaking', 5, 'both')
    expect(related.length).toBeGreaterThan(0)
    expect(related[0].displayPhrases.some((item) => item.phrase === 'Chciałbym powiedzieć, że...')).toBe(true)
    expect(related[0].displayPhrases.some((item) => item.phrase === 'Chciałabym powiedzieć, że...')).toBe(true)
  })

  it('respects the selected category for direct suggestions', () => {
    const requestSuggestion = findPolishSuggestion('Я хотел бы попросить о помощи.', { category: 'request' })
    expect(requestSuggestion.status).toBe('suggestion')
    if (requestSuggestion.status === 'suggestion') {
      expect(requestSuggestion.suggestedPl).toContain('Chciałbym poprosić o')
    }
  })

  it('checks Polish phrases against known patterns', () => {
    const wrongPisze = checkPolishPhrase('Piszę bo chcę zapytać.')
    expect(wrongPisze.status).toBe('correction')
    if (wrongPisze.status === 'correction') {
      expect(wrongPisze.correctedPl).toBe('Piszę, ponieważ...')
    }

    const wrongAgreement = checkPolishPhrase('Nie zgadzam się tym.')
    expect(wrongAgreement.status).toBe('correction')
    if (wrongAgreement.status === 'correction') {
      expect(wrongAgreement.correctedPl).toBe('Nie zgadzam się z tym.')
    }

    const wrongSituation = checkPolishPhrase('To zależy od sytuacja.')
    expect(wrongSituation.status).toBe('correction')
    if (wrongSituation.status === 'correction') {
      expect(wrongSituation.correctedPl).toBe('To zależy od sytuacji.')
    }

    const wrongVisit = checkPolishPhrase('Muszę umówić na wizytę.')
    expect(wrongVisit.status).toBe('correction')
    if (wrongVisit.status === 'correction') {
      expect(wrongVisit.correctedPl).toBe('Muszę umówić się na wizytę.')
    }

    const correctOpinion = checkPolishPhrase('Moim zdaniem')
    expect(correctOpinion.status).toBe('likely-correct')

    const unknown = checkPolishPhrase('To jest bardzo dziwne zdanie.')
    expect(unknown.status).toBe('unknown')
  })

  it('keeps popular template cards complete', () => {
    const templates = getHowToSayPopularTemplates('writing', 10, 'female')
    expect(templates.length).toBeGreaterThan(0)
    for (const template of templates) {
      expect(template.inputText.trim().length).toBeGreaterThan(0)
      expect(template.phrase.trim().length).toBeGreaterThan(0)
      expect(template.explanationRu.trim().length).toBeGreaterThan(0)
      expect(template.category).toBeTruthy()
      expect(template.displayPhrases.length).toBeGreaterThan(0)
    }
  })

  it('keeps the helper data actionable and complete', () => {
    expect(howToSayEntries.length).toBeGreaterThanOrEqual(90)
    for (const entry of howToSayEntries) {
      expect(entry.tags.length).toBeGreaterThan(0)
      expect(entry.explanationRu.trim().length).toBeGreaterThan(0)
      if (entry.suggestedPlVariants) {
        expect(entry.suggestedPlVariants.male ?? entry.suggestedPlVariants.female ?? entry.suggestedPlVariants.neutral).toBeTruthy()
      }
      if (entry.correctedPlVariants) {
        expect(entry.correctedPlVariants.male ?? entry.correctedPlVariants.female ?? entry.correctedPlVariants.neutral).toBeTruthy()
      }
      if (entry.incorrectPatterns?.length) {
        expect(entry.correctedPl?.trim().length ?? 0).toBeGreaterThan(0)
      }
    }
  })
})
