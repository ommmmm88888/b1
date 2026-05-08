import { describe, expect, it } from 'vitest'
import { b1Vocabulary } from '../data/b1Vocabulary'
import {
  findMatchingAnswerRegister,
  isAnswerCorrect,
  normalizePolishAnswer,
  validateVocabularyRegisters,
} from './answerCheck'

describe('answerCheck', () => {
  it('normalizes trim, lowercase, repeated spaces, and punctuation', () => {
    expect(normalizePolishAnswer('  Muszę,   WZIĄĆ pod uwagę cenę!  ')).toBe(
      'muszę wziąć pod uwagę cenę',
    )
  })

  it('keeps Polish diacritics intact', () => {
    expect(normalizePolishAnswer('Łódź, żółć, święto')).toBe('łódź żółć święto')
  })

  it('checks accepted answers after normalization', () => {
    expect(isAnswerCorrect(' czy mogę prosić o rachunek? ', ['Czy mogę prosić o rachunek'])).toBe(
      true,
    )
  })

  it('accepts registered alternative answers', () => {
    const item = b1Vocabulary.find((entry) => entry.id === 'write-if-questions')

    expect(item).toBeTruthy()
    expect(isAnswerCorrect('Jeśli masz pytania, napisz do mnie.', item?.acceptedAnswers ?? [])).toBe(
      true,
    )
  })

  it('validates primary expected answer register against the source phrase', () => {
    expect(validateVocabularyRegisters(b1Vocabulary)).toEqual([])
  })

  it('keeps accepted alternatives structured and non-empty', () => {
    for (const item of b1Vocabulary) {
      expect(item.acceptedAnswers.length).toBeGreaterThan(0)
      for (const acceptedAnswer of item.acceptedAnswers) {
        expect(acceptedAnswer.text.trim().length).toBeGreaterThan(0)
        expect(['informal', 'neutral', 'formal']).toContain(acceptedAnswer.register)
      }
    }
  })

  it('detects answer register for explanation clarity', () => {
    const item = b1Vocabulary.find((entry) => entry.id === 'write-if-questions')

    expect(findMatchingAnswerRegister('Jeśli masz pytania, napisz do mnie.', item?.acceptedAnswers ?? [])).toBe(
      'informal',
    )
  })
})
