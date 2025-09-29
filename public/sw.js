const CACHE_NAME = 'aversoltix-cache-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/offline.html',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable navigation preload for faster navigations
    try { await self.registration?.navigationPreload?.enable?.() } catch {}

    // Clean up old caches
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)));

    await self.clients.claim();
  })());
});

// Support immediate activation from the page
self.addEventListener('message', (event) => {
  if (event?.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Bypass API requests and cross-origin navigations
  try {
    const u = new URL(request.url);
    if (u.origin !== location.origin && request.mode === 'navigate') return; // let browser handle it
    if (u.pathname.startsWith('/api/')) {
      event.respondWith(fetch(request));
      return;
    }
  } catch {}

  // Network-first for same-origin navigation and HTML
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        // Use preload response if available
        const preload = await event.preloadResponse;
        if (preload) return preload;

        const response = await fetch(request, { cache: 'no-store' });
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch (err) {
        // Try a cached copy of this route, then offline fallback
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        return cached || (await caches.match('/offline.html')) || (await caches.match('/index.html'));
      }
    })());
    return;
  }

  // Cache-first for static assets
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  })());
});
