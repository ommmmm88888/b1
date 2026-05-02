export const PROGRESS_CHANGED_EVENT = 'b1-progress-changed'
export const PROGRESS_SYNCED_EVENT = 'b1-progress-synced'

let silentLocalWriteDepth = 0

export function runWithoutProgressChangeEvent(callback: () => void): void {
  silentLocalWriteDepth += 1

  try {
    callback()
  } finally {
    silentLocalWriteDepth -= 1
  }
}

export function dispatchProgressChanged(domain: string): void {
  if (typeof window === 'undefined' || silentLocalWriteDepth > 0) {
    return
  }

  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT, { detail: { domain } }))
}

export function dispatchProgressSynced(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(PROGRESS_SYNCED_EVENT))
}
