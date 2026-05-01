import { describe, expect, it } from 'vitest'
import { isAnswerCorrect, normalizePolishAnswer } from './answerCheck'

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
})
