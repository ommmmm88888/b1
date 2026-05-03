export async function copyPhraseToClipboard(
  phrase: string,
  clipboard?: {
    writeText?: (value: string) => Promise<void> | void
  },
): Promise<string> {
  if (!clipboard?.writeText) {
    return 'Не удалось скопировать. Можно выделить текст вручную.'
  }

  try {
    await clipboard.writeText(phrase)
    return 'Скопировано'
  } catch {
    return 'Не удалось скопировать. Можно выделить текст вручную.'
  }
}
