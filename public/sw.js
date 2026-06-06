const CACHE_NAME = 'family-hub-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/manifest.json'])
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Network-first for API requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/backend/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
    return
  }

  // Cache-first for other requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse
        }
        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return networkResponse
      })
    }),
  )
})
