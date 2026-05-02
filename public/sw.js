const CACHE_VERSION = 'v1-2026-05-02b'
const PRECACHE = `b1-precache-${CACHE_VERSION}`
const RUNTIME = `b1-runtime-${CACHE_VERSION}`

function scopeUrl(path) {
  return new URL(path, self.registration.scope).toString()
}

const PRECACHE_URLS = [
  scopeUrl('index.html'),
  scopeUrl('offline.html'),
  scopeUrl('manifest.webmanifest'),
  scopeUrl('favicon.svg'),
  scopeUrl('icons.svg'),
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME)
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }

    return caches.match(scopeUrl('offline.html'))
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request))
    return
  }

  if (['style', 'script', 'image', 'font'].includes(event.request.destination)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(networkFirst(event.request))
})
