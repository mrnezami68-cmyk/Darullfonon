const CACHE_NAME = 'darullfonon-shell-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Offline content is intentionally not cached in this MVP. The worker only
// enables installability and is ready for a future cache strategy.
