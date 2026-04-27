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
}

export function isAnswerCorrect(candidate: string, acceptedAnswers: string[]): boolean {
  const normalizedCandidate = normalizePolishAnswer(candidate)

  return acceptedAnswers.some(
    (answer) => normalizePolishAnswer(answer) === normalizedCandidate,
  )
}
