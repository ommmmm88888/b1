export async function registerServiceWorker(): Promise<void> {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  const scriptUrl = new URL('sw.js', import.meta.env.BASE_URL).toString()

  const register = () =>
    navigator.serviceWorker.register(scriptUrl, {
      scope: import.meta.env.BASE_URL,
    })

  if (document.readyState === 'complete') {
    const registration = await register()
    void registration.update()
    return
  }

  await new Promise<void>((resolve, reject) => {
    window.addEventListener(
      'load',
      () => {
        register()
          .then((registration) => {
            void registration.update()
            resolve()
          }, reject)
      },
      { once: true },
    )
  })
}
