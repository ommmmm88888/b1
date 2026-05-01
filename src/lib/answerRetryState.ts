export interface RetryableAnswerState {
  answer: string
  checked: boolean
  correct: boolean | null
}

export function applyAnswerEditForRetry<T extends RetryableAnswerState>(
  state: T,
  nextAnswer: string,
): T {
  if (state.answer === nextAnswer) {
    return state
  }

  if (state.checked && state.correct === false) {
    return {
      ...state,
      answer: nextAnswer,
      checked: false,
      correct: null,
    }
  }

  return {
    ...state,
    answer: nextAnswer,
  }
}
