import { describe, expect, it } from 'vitest'
import { howToSayEntries } from '../data/howToSay'
import { checkPolishPhrase, detectInputLanguage, findPolishSuggestion, normalizePhrase } from './howToSayMatcher'

describe('howToSayMatcher', () => {
  it('normalizes phrase text for matching', () => {
    expect(normalizePhrase('  Szukam, pracy!  ')).toBe('szukam pracy')
  })

  it('detects the input language', () => {
    expect(detectInputLanguage('Я ищу работу.')).toBe('ru')
    expect(detectInputLanguage('Szukam pracy.')).toBe('pl')
    expect(detectInputLanguage('12345')).toBe('unknown')
  })

  it('suggests Polish phrases for Russian input', () => {
    const writingBecause = findPolishSuggestion('Я пишу, потому что хочу спросить.')
    expect(writingBecause.status).toBe('suggestion')
    if (writingBecause.status === 'suggestion') {
      expect(writingBecause.suggestedPl).toBe('Piszę, ponieważ...')
    }

    const requestHelp = findPolishSuggestion('Я хотел бы попросить о помощи.')
    expect(requestHelp.status).toBe('suggestion')
    if (requestHelp.status === 'suggestion') {
      expect(requestHelp.suggestedPl).toContain('Chciałbym poprosić o')
    }

    const complaint = findPolishSuggestion('Я хотел бы пожаловаться на этот продукт.')
    expect(complaint.status).toBe('suggestion')
    if (complaint.status === 'suggestion') {
      expect(complaint.suggestedPl).toContain('Chciałbym złożyć reklamację na')
    }

    const oneSide = findPolishSuggestion('С одной стороны, это удобно.')
    expect(oneSide.status).toBe('suggestion')
    if (oneSide.status === 'suggestion') {
      expect(oneSide.suggestedPl).toBe('Z jednej strony...')
    }

    const future = findPolishSuggestion('В будущем я хочу жить в Польше.')
    expect(future.status).toBe('suggestion')
    if (future.status === 'suggestion') {
      expect(future.suggestedPl).toBe('W przyszłości chcę...')
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

  it('keeps the helper data actionable and complete', () => {
    expect(howToSayEntries.length).toBeGreaterThanOrEqual(65)
    for (const entry of howToSayEntries) {
      expect(entry.tags.length).toBeGreaterThan(0)
      expect(entry.explanationRu.trim().length).toBeGreaterThan(0)
      if (entry.suggestedPl) {
        expect(entry.explanationRu.trim().length).toBeGreaterThan(0)
      }
      if (entry.incorrectPatterns?.length) {
        expect(entry.correctedPl?.trim().length ?? 0).toBeGreaterThan(0)
      }
    }
  })
})
