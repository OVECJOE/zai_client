const CACHE_NAME = 'zai-game-v2';
const RUNTIME_CACHE = 'zai-runtime-v2';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/favicon.ico'
];

// Install event - precache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - network only (no cache)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // WebSocket - don't intercept
  if (request.url.includes('ws://') || request.url.includes('wss://')) {
    return;
  }

  // Network first, fallback to cache strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If requesting a page, return offline page
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// Background sync for offline moves
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-moves') {
    event.waitUntil(syncGameMoves());
  }
});

async function syncGameMoves() {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const pendingMoves = await store.getAll();
    
    for (const move of pendingMoves) {
      try {
        await fetch(move.url, {
          method: move.method,
          headers: move.headers,
          body: JSON.stringify(move.data)
        });
        
        // Remove from queue on success
        const deleteTx = db.transaction('sync_queue', 'readwrite');
        await deleteTx.objectStore('sync_queue').delete(move.id);
      } catch (error) {
        console.error('Failed to sync move:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('zai-game-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Push notification handler (future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Your turn!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'game-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Zai Game', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
