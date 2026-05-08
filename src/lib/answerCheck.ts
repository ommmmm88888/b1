import type { AcceptedTranslationAnswer, Register, VocabularyItem } from '../types/training'

const punctuationPattern = /[.,!?;:(){}"'`“”„’‘…/\\-]/g
const whitespacePattern = /\s+/g

export function normalizePolishAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(punctuationPattern, ' ')
    .replaceAll('[', ' ')
    .replaceAll(']', ' ')
    .replace(whitespacePattern, ' ')
    .trim()
}

type AcceptedAnswerInput = string | AcceptedTranslationAnswer

function getAnswerText(answer: AcceptedAnswerInput): string {
  return typeof answer === 'string' ? answer : answer.text
}

export function getAcceptedAnswerTexts(acceptedAnswers: AcceptedAnswerInput[]): string[] {
  return acceptedAnswers.map(getAnswerText)
}

export function isAnswerCorrect(candidate: string, acceptedAnswers: AcceptedAnswerInput[]): boolean {
  const normalizedCandidate = normalizePolishAnswer(candidate)

  return acceptedAnswers.some(
    (answer) => normalizePolishAnswer(getAnswerText(answer)) === normalizedCandidate,
  )
}

export function findMatchingAnswerRegister(
  candidate: string,
  acceptedAnswers: AcceptedTranslationAnswer[],
): Register | null {
  const normalizedCandidate = normalizePolishAnswer(candidate)
  const match = acceptedAnswers.find(
    (answer) => normalizePolishAnswer(answer.text) === normalizedCandidate,
  )

  return match?.register ?? null
}

export function validateVocabularyRegisters(items: VocabularyItem[]): string[] {
  return items.flatMap((item) => {
    const primaryAnswer = item.acceptedAnswers[0]
    const answerErrors = item.acceptedAnswers.flatMap((answer, index) => {
      const answerNumber = index + 1

      if (!answer.text.trim()) {
        return [`${item.id}: accepted answer ${answerNumber} is empty`]
      }

      if (!['informal', 'neutral', 'formal'].includes(answer.register)) {
        return [`${item.id}: accepted answer ${answerNumber} has invalid register "${answer.register}"`]
      }

      return []
    })

    if (!primaryAnswer) {
      return [`${item.id}: missing accepted answer`]
    }

    if (primaryAnswer.register !== item.register) {
      return [
        ...answerErrors,
        `${item.id}: source register "${item.register}" does not match primary answer register "${primaryAnswer.register}"`,
      ]
    }

    return answerErrors
  })
}
