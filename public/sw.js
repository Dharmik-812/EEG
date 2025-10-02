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

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {
      title: 'New Notification',
      body: 'You have a new notification',
      icon: '/vite.svg'
    };
  }

  const {
    title = 'EEG App',
    body = 'You have a new notification',
    icon = '/vite.svg',
    badge = '/vite.svg',
    tag = 'default',
    data = {},
    actions = [],
    requireInteraction = false,
    silent = false
  } = notificationData;

  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    data,
    actions,
    requireInteraction,
    silent,
    timestamp: Date.now(),
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const { notification } = event;
  const { data = {} } = notification;
  
  notification.close();

  // Handle notification actions
  if (event.action) {
    console.log('Notification action clicked:', event.action);
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          // Send message to client about the action
          if (clients.length > 0) {
            clients[0].postMessage({
              type: 'notification-action',
              data: {
                action: event.action,
                notificationData: data
              }
            });
            return clients[0].focus();
          }
          
          // Open new window if no clients available
          return self.clients.openWindow(getActionUrl(event.action, data));
        })
    );
    return;
  }

  // Handle notification click (no specific action)
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window/tab open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            // Send message to existing client
            client.postMessage({
              type: 'notification-click',
              data: { notificationData: data }
            });
            return client.focus();
          }
        }
        
        // Open new window if no suitable client found
        return self.clients.openWindow(getClickUrl(data));
      })
  );
});

// Helper functions for notification URLs
function getClickUrl(data) {
  const { type, threadId, groupId, isGroup } = data;
  
  switch (type) {
    case 'message':
      if (isGroup) {
        return `${self.location.origin}/messages?group=${threadId}`;
      } else {
        return `${self.location.origin}/messages?dm=${threadId}`;
      }
    case 'friend-request':
      return `${self.location.origin}/messages?tab=friends`;
    case 'group-invite':
      return `${self.location.origin}/groups?invite=${groupId}`;
    case 'system':
      return `${self.location.origin}/dashboard`;
    default:
      return `${self.location.origin}/dashboard`;
  }
}

function getActionUrl(action, data) {
  const { type, threadId, groupId, isGroup } = data;
  
  switch (action) {
    case 'reply':
      if (isGroup) {
        return `${self.location.origin}/messages?group=${threadId}&reply=true`;
      } else {
        return `${self.location.origin}/messages?dm=${threadId}&reply=true`;
      }
    case 'view':
      return getClickUrl(data);
    case 'join':
      return `${self.location.origin}/groups?join=${groupId}`;
    default:
      return getClickUrl(data);
  }
}

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
