export function canUseSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function speakPolish(text: string, rate: number): void {
  if (!canUseSpeechSynthesis()) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pl-PL'
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function stopSpeech(): void {
  if (!canUseSpeechSynthesis()) {
    return
  }

  window.speechSynthesis.cancel()
}
