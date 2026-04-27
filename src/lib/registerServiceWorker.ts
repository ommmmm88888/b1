export async function registerServiceWorker(): Promise<void> {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  const scriptUrl = new URL('sw.js', import.meta.env.BASE_URL).toString()

  await navigator.serviceWorker.register(scriptUrl, {
    scope: import.meta.env.BASE_URL,
  })
}
