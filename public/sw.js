const CACHE_NAME = 'darullfonon-pwa-v2'
const PUBLIC_CONTENT = /^\/api\/v1\/(courses(?:\/[a-z0-9-]+)?|chapters\/[a-zA-Z0-9_-]+|lessons\/[a-z0-9-]+|glossary(?:\/[a-z0-9-]+)?|library(?:\/[a-z0-9-]+)?)(?:\?.*)?$/

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/icon.svg'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))))
  self.clients.claim()
})

async function cachePublicContent(request) {
  const cached = await caches.match(request)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || new Response(JSON.stringify({ error: { code: 'OFFLINE', message: 'این محتوای آموزشی هنوز برای مطالعه آفلاین دریافت نشده است.' } }), {
      status: cached ? 200 : 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
}

async function cacheStaticAsset(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached || Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('Authorization')) return
  if (PUBLIC_CONTENT.test(url.pathname + url.search)) {
    event.respondWith(cachePublicContent(request))
    return
  }
  if (request.destination === 'document' || ['script', 'style', 'font', 'image'].includes(request.destination)) {
    event.respondWith(cacheStaticAsset(request))
  }
})
