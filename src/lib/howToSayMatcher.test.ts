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
    const searchWork = findPolishSuggestion('Я ищу работу.')
    expect(searchWork.status).toBe('suggestion')
    if (searchWork.status === 'suggestion') {
      expect(searchWork.suggestedPl).toBe('Szukam pracy.')
    }

    const flatProblem = findPolishSuggestion('У меня проблема с квартирой.')
    expect(flatProblem.status).toBe('suggestion')
    if (flatProblem.status === 'suggestion') {
      expect(flatProblem.suggestedPl).toBe('Mam problem z mieszkaniem.')
    }
  })

  it('checks Polish phrases against known patterns', () => {
    const wrong = checkPolishPhrase('Szukam pracę.')
    expect(wrong.status).toBe('correction')
    if (wrong.status === 'correction') {
      expect(wrong.correctedPl).toBe('Szukam pracy.')
    }

    const czekam = checkPolishPhrase('Czekam autobus.')
    expect(czekam.status).toBe('correction')
    if (czekam.status === 'correction') {
      expect(czekam.correctedPl).toBe('Czekam na autobus.')
    }

    const correct = checkPolishPhrase('Szukam pracy.')
    expect(correct.status).toBe('likely-correct')

    const unknown = checkPolishPhrase('To jest bardzo dziwne zdanie.')
    expect(unknown.status).toBe('unknown')
  })

  it('keeps the helper data actionable and complete', () => {
    expect(howToSayEntries.length).toBeGreaterThanOrEqual(25)
    for (const entry of howToSayEntries) {
      expect(Boolean(entry.suggestedPl ?? entry.correctedPl)).toBe(true)
      expect(entry.explanationRu.trim().length).toBeGreaterThan(0)
      if (entry.correctedPl) {
        expect(entry.explanationRu.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
