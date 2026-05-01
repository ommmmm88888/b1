import { miniMockExam } from '../data/miniMockExam'
import { isAnswerCorrect } from './answerCheck'
import type { MockExamResult, MockZoneScores } from '../types/mockExam'

export interface MockExamAnswers {
  reading: Record<string, string>
  grammar: Record<string, string>
  listening: Record<string, string>
  writingCriteria: string[]
  speakingCriteria: string[]
}

const zoneLabels: Record<keyof MockZoneScores, string> = {
  reading: 'чтение',
  grammar: 'лексика/грамматика',
  writing: 'письмо',
  speaking: 'говорение',
  listening: 'аудирование',
}

function percent(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

function scoreChoiceQuestions(
  questions: { id: string; correctAnswer: string }[],
  answers: Record<string, string>,
): number {
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer).length
  return percent(correct, questions.length)
}

function getRecommendations(scores: MockZoneScores): string[] {
  const recommendations: string[] = []

  if (scores.reading < 70) {
    recommendations.push('Вернитесь к режиму чтения и тренируйте поиск деталей.')
  }

  if (scores.grammar < 70) {
    recommendations.push('Сделайте микродриллы по падежам, прошедшему времени и предлогам.')
  }

  if (scores.writing < 70) {
    recommendations.push('Перепишите e-mail по чеклисту: пункты задания, структура, вежливые формулы.')
  }

  if (scores.speaking < 70) {
    recommendations.push('Повторите устные ответы с таймером: 30 секунд план, 90 секунд ответ.')
  }

  if (scores.listening < 70) {
    recommendations.push('Повторите аудирование медленно, затем сделайте shadowing без текста.')
  }

  return recommendations.length > 0 ? recommendations : ['Поддерживайте темп и переходите к финальному повтору.']
}

export function calculateMockExamResult(answers: MockExamAnswers): MockExamResult {
  const grammarCorrect = miniMockExam.grammar.filter((task) =>
    isAnswerCorrect(answers.grammar[task.id] ?? '', task.acceptedAnswers),
  ).length
  const zoneScores: MockZoneScores = {
    reading: scoreChoiceQuestions(miniMockExam.reading.questions, answers.reading),
    grammar: percent(grammarCorrect, miniMockExam.grammar.length),
    writing: percent(answers.writingCriteria.length, miniMockExam.writing.selfCheckCriteria.length),
    speaking: percent(answers.speakingCriteria.length, miniMockExam.speaking.selfCheckCriteria.length),
    listening: scoreChoiceQuestions(miniMockExam.listening.questions, answers.listening),
  }
  const scoreEntries = Object.entries(zoneScores) as [keyof MockZoneScores, number][]
  const overallReadinessPercent = Math.round(
    scoreEntries.reduce((sum, [, score]) => sum + score, 0) / scoreEntries.length,
  )
  const lowestScore = Math.min(...scoreEntries.map(([, score]) => score))

  return {
    completedAt: new Date().toISOString(),
    overallReadinessPercent,
    zoneScores,
    weakestZones: scoreEntries
      .filter(([, score]) => score === lowestScore)
      .map(([zone]) => zoneLabels[zone]),
    recommendedNextActions: getRecommendations(zoneScores),
  }
}
