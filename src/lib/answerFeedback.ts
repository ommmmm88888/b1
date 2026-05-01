export type MistakeLevel = 'new' | 'occasional' | 'frequent'

export interface AnswerDiffChunk {
  text: string
  type: 'same' | 'removed' | 'added'
  parts?: Array<{
    text: string
    changed: boolean
  }>
}

export function getMistakeLevel(mistakes: number): { level: MistakeLevel; label: string } {
  if (mistakes <= 1) {
    return { level: 'new', label: 'новая ошибка' }
  }

  if (mistakes >= 3) {
    return { level: 'frequent', label: 'частая ошибка' }
  }

  return { level: 'occasional', label: 'редкая ошибка' }
}

function tokenize(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function buildLcsTable(userTokens: string[], expectedTokens: string[]): number[][] {
  const rows = userTokens.length + 1
  const cols = expectedTokens.length + 1
  const table = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let userIndex = userTokens.length - 1; userIndex >= 0; userIndex -= 1) {
    for (let expectedIndex = expectedTokens.length - 1; expectedIndex >= 0; expectedIndex -= 1) {
      if (userTokens[userIndex].toLowerCase() === expectedTokens[expectedIndex].toLowerCase()) {
        table[userIndex][expectedIndex] = table[userIndex + 1][expectedIndex + 1] + 1
      } else {
        table[userIndex][expectedIndex] = Math.max(
          table[userIndex + 1][expectedIndex],
          table[userIndex][expectedIndex + 1],
        )
      }
    }
  }

  return table
}

export function buildAnswerDiff(userAnswer: string, expectedAnswer: string): AnswerDiffChunk[] {
  const userTokens = tokenize(userAnswer)
  const expectedTokens = tokenize(expectedAnswer)
  const lcsTable = buildLcsTable(userTokens, expectedTokens)
  const chunks: AnswerDiffChunk[] = []

  let userIndex = 0
  let expectedIndex = 0

  while (userIndex < userTokens.length && expectedIndex < expectedTokens.length) {
    const userToken = userTokens[userIndex]
    const expectedToken = expectedTokens[expectedIndex]

    if (userToken.toLowerCase() === expectedToken.toLowerCase()) {
      chunks.push({ text: expectedToken, type: 'same' })
      userIndex += 1
      expectedIndex += 1
      continue
    }

    if (lcsTable[userIndex + 1][expectedIndex] >= lcsTable[userIndex][expectedIndex + 1]) {
      chunks.push({ text: userToken, type: 'removed' })
      userIndex += 1
    } else {
      chunks.push({ text: expectedToken, type: 'added' })
      expectedIndex += 1
    }
  }

  while (userIndex < userTokens.length) {
    chunks.push({ text: userTokens[userIndex], type: 'removed' })
    userIndex += 1
  }

  while (expectedIndex < expectedTokens.length) {
    chunks.push({ text: expectedTokens[expectedIndex], type: 'added' })
    expectedIndex += 1
  }

  return attachCharLevelParts(chunks)
}

function attachCharLevelParts(chunks: AnswerDiffChunk[]): AnswerDiffChunk[] {
  const result = chunks.map((chunk) => ({ ...chunk }))

  for (let index = 0; index < result.length - 1; index += 1) {
    const current = result[index]
    const next = result[index + 1]

    if (current.type !== 'removed' || next.type !== 'added') {
      continue
    }

    if (!isSimilarReplacementPair(current.text, next.text)) {
      continue
    }

    current.parts = buildTokenCharParts(current.text, next.text)
    next.parts = buildTokenCharParts(next.text, current.text)
  }

  return result
}

function isSimilarReplacementPair(removed: string, added: string): boolean {
  const left = removed.toLowerCase()
  const right = added.toLowerCase()
  const maxLen = Math.max(left.length, right.length)

  if (maxLen < 3) {
    return false
  }

  let prefix = 0
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
    prefix += 1
  }

  let suffix = 0
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    left[left.length - 1 - suffix] === right[right.length - 1 - suffix]
  ) {
    suffix += 1
  }

  const common = prefix + suffix
  return common / maxLen >= 0.5
}

function buildTokenCharParts(source: string, target: string): Array<{ text: string; changed: boolean }> {
  const left = source.toLowerCase()
  const right = target.toLowerCase()

  let prefix = 0
  while (prefix < left.length && prefix < right.length && left[prefix] === right[prefix]) {
    prefix += 1
  }

  let suffix = 0
  while (
    suffix < left.length - prefix &&
    suffix < right.length - prefix &&
    left[left.length - 1 - suffix] === right[right.length - 1 - suffix]
  ) {
    suffix += 1
  }

  const unchangedPrefix = source.slice(0, prefix)
  const changedMiddle = source.slice(prefix, source.length - suffix)
  const unchangedSuffix = source.slice(source.length - suffix)
  const parts: Array<{ text: string; changed: boolean }> = []

  if (unchangedPrefix) {
    parts.push({ text: unchangedPrefix, changed: false })
  }

  if (changedMiddle) {
    parts.push({ text: changedMiddle, changed: true })
  }

  if (unchangedSuffix) {
    parts.push({ text: unchangedSuffix, changed: false })
  }

  return parts.length > 0 ? parts : [{ text: source, changed: false }]
}
