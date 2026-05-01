import { describe, expect, it } from 'vitest'
import { miniMockExam } from '../data/miniMockExam'
import { calculateMockExamResult, type MockExamAnswers } from './mockExamScoring'

function createEmptyAnswers(): MockExamAnswers {
  return {
    reading: {},
    grammar: {},
    listening: {},
    writingCriteria: [],
    speakingCriteria: [],
  }
}

describe('mockExamScoring', () => {
  it('scores objective answers correctly', () => {
    const answers = createEmptyAnswers()

    for (const question of miniMockExam.reading.questions) {
      answers.reading[question.id] = question.correctAnswer
    }

    for (const task of miniMockExam.grammar) {
      answers.grammar[task.id] = task.acceptedAnswers[0]
    }

    for (const question of miniMockExam.listening.questions) {
      answers.listening[question.id] = question.correctAnswer
    }

    const result = calculateMockExamResult(answers)

    expect(result.zoneScores.reading).toBe(100)
    expect(result.zoneScores.grammar).toBe(100)
    expect(result.zoneScores.listening).toBe(100)
  })

  it('adds self-check zones predictably', () => {
    const answers = createEmptyAnswers()
    answers.writingCriteria = miniMockExam.writing.selfCheckCriteria.slice(0, 3)
    answers.speakingCriteria = miniMockExam.speaking.selfCheckCriteria

    const result = calculateMockExamResult(answers)

    expect(result.zoneScores.writing).toBe(50)
    expect(result.zoneScores.speaking).toBe(100)
    expect(result.weakestZones).toContain('чтение')
  })
})
