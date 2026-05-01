import { describe, expect, it } from 'vitest'
import { buildAnswerDiff } from './answerFeedback'

describe('buildAnswerDiff', () => {
  it('marks a single replacement as removed + added', () => {
    const diff = buildAnswerDiff('gdy to będzie gotowo', 'kiedy to będzie gotowe')

    expect(diff.map((chunk) => ({ text: chunk.text, type: chunk.type }))).toEqual([
      { text: 'gdy', type: 'removed' },
      { text: 'kiedy', type: 'added' },
      { text: 'to', type: 'same' },
      { text: 'będzie', type: 'same' },
      { text: 'gotowo', type: 'removed' },
      { text: 'gotowe', type: 'added' },
    ])
  })

  it('marks missing expected word as added', () => {
    const diff = buildAnswerDiff('to będzie gotowe', 'to już będzie gotowe')

    expect(diff).toEqual([
      { text: 'to', type: 'same' },
      { text: 'już', type: 'added' },
      { text: 'będzie', type: 'same' },
      { text: 'gotowe', type: 'same' },
    ])
  })

  it('marks extra user word as removed', () => {
    const diff = buildAnswerDiff('to naprawdę będzie gotowe', 'to będzie gotowe')

    expect(diff).toEqual([
      { text: 'to', type: 'same' },
      { text: 'naprawdę', type: 'removed' },
      { text: 'będzie', type: 'same' },
      { text: 'gotowe', type: 'same' },
    ])
  })

  it('returns all same tokens for identical answers', () => {
    const diff = buildAnswerDiff('to będzie gotowe', 'to będzie gotowe')

    expect(diff).toEqual([
      { text: 'to', type: 'same' },
      { text: 'będzie', type: 'same' },
      { text: 'gotowe', type: 'same' },
    ])
  })

  it('handles shifted token with stable lcs alignment', () => {
    const diff = buildAnswerDiff('to będzie jutro gotowe', 'jutro to będzie gotowe')

    expect(diff).toEqual([
      { text: 'jutro', type: 'added' },
      { text: 'to', type: 'same' },
      { text: 'będzie', type: 'same' },
      { text: 'jutro', type: 'removed' },
      { text: 'gotowe', type: 'same' },
    ])
  })

  it('adds char-level parts for similar replacement tokens', () => {
    const diff = buildAnswerDiff('prosze', 'proszę')
    expect(diff).toHaveLength(2)
    expect(diff[0].parts).toEqual([
      { text: 'prosz', changed: false },
      { text: 'e', changed: true },
    ])
    expect(diff[1].parts).toEqual([
      { text: 'prosz', changed: false },
      { text: 'ę', changed: true },
    ])
  })

  it('adds char-level parts for diacritic change inside token', () => {
    const diff = buildAnswerDiff('bedzie', 'będzie')
    expect(diff).toHaveLength(2)
    expect(diff[0].parts?.some((part) => part.changed)).toBe(true)
    expect(diff[1].parts?.some((part) => part.changed)).toBe(true)
  })

  it('does not add char-level parts for unrelated words', () => {
    const diff = buildAnswerDiff('kot', 'pies')
    expect(diff).toEqual([
      { text: 'kot', type: 'removed' },
      { text: 'pies', type: 'added' },
    ])
  })
})
