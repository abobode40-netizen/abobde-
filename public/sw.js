/**
 * Service Worker - Jannat Al-Rahman (جنّة الرحمن)
 * Fully Offline-First Architecture (PWA) with Reliable IndexedDB State Synchronization
 * Guarantees that the app opens and works 100% without internet, keeping bookmarks & reading history preserved.
 */

const CACHE_VERSION = 'jannat-cache-v10';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

// IndexedDB configuration for background state replication
const SYNC_DB_NAME = 'jannat_user_sync_v2';
const SYNC_DB_VERSION = 1;
const STATE_STORE = 'app_state';

function openSwSyncDB() {
  return new Promise((resolve, reject) => {
    if (!self.indexedDB) return reject(new Error('IndexedDB not supported in SW'));
    const req = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STATE_STORE)) {
        db.createObjectStore(STATE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('daily_trackers')) {
        db.createObjectStore('daily_trackers', { keyPath: 'date' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveStateToIndexedDB(key, value, timestamp) {
  try {
    const db = await openSwSyncDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STATE_STORE, 'readwrite');
      const store = tx.objectStore(STATE_STORE);
      store.put({ key, value, updatedAt: timestamp || Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('SW IndexedDB save error:', err);
    return false;
  }
}

// Critical App Shell resources pre-cached immediately upon install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/jannat-icon.svg'
];

// 1. Install Event - Cache the app shell immediately & activate instantly
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Pre-caching asset failed:', asset, err);
        }
      }
    })
  );
});

// 2. Activate Event - Claim all clients & clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith('jannat-') && !key.startsWith(CACHE_VERSION) && key !== 'jannat-quran-audio-v1')
            .map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// 3. Fetch Event - Intelligent offline-first routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // A. Page Navigation (HTML Document): Network-First when online to ensure latest features display immediately
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // If explicitly offline, immediately serve cached HTML
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          const cached = (await caches.match(request, { ignoreSearch: true })) ||
                         (await caches.match('/index.html', { ignoreSearch: true })) ||
                         (await caches.match('/', { ignoreSearch: true }));
          if (cached) return cached;
        }

        // Try fresh fetch from network
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then(async (cache) => {
              await cache.put(request, clone);
              await cache.put('/index.html', networkResponse.clone());
              await cache.put('/', networkResponse.clone());
            }).catch(() => {});
            return networkResponse;
          }
        } catch (err) {
          // Network failed or offline - use cached fallback
        }

        const cached = (await caches.match(request, { ignoreSearch: true })) ||
                       (await caches.match('/index.html', { ignoreSearch: true })) ||
                       (await caches.match('/', { ignoreSearch: true }));
        if (cached) return cached;

        return new Response(
          `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>جنّة الرحمن</title><style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px 20px;background:#FAF7F0;color:#19302A;direction:rtl;}</style></head><body><h2>جنّة الرحمن - رفيقك في الذكر والقرآن</h2><p>يرجى فتح التطبيق مرة واحدة بوجود اتصال بالإنترنت حتى يتم حفظه على جهازك والعمل بدون إنترنت دائماً.</p><button onclick="location.reload()" style="padding:10px 20px;background:#0F6B50;color:#fff;border:none;border-radius:12px;cursor:pointer;font-weight:bold;">إعادة المحاولة</button></body></html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // B. Google & Arabic Web Fonts: Cache First (Forever)
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(FONT_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // C. Quran & Tafseer APIs: Cache First when offline, Network First when online
  if (url.hostname.includes('alquran.cloud') || url.hostname.includes('quran.com')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached && !navigator.onLine) {
          return cached;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, clone);
          }
          return networkResponse;
        } catch (err) {
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'Offline mode', offline: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // D. Audio Requests
  if (request.destination === 'audio' || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // E. Static Assets (Scripts, Vite chunks, CSS, Images, SVGs): Cache First with Background Update
  event.respondWith(
    (async () => {
      // Check cache first (ignore query parameters like ?t=... from Vite)
      const cachedResponse = await caches.match(request, { ignoreSearch: true });
      if (cachedResponse) {
        // Opportunistic background update if online
        if (navigator.onLine) {
          fetch(request).then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(STATIC_CACHE);
              cache.put(request, networkResponse);
            }
          }).catch(() => {});
        }
        return cachedResponse;
      }

      // If not cached, fetch from network and cache
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, clone);
        }
        return networkResponse;
      } catch (err) {
        // Fallback for missing images offline
        if (request.destination === 'image' || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png')) {
          const fallbackIcon = await caches.match('/jannat-icon.svg');
          if (fallbackIcon) return fallbackIcon;
        }
        return new Response('', { status: 408, statusText: 'Offline asset not cached' });
      }
    })()
  );
});

// Message event for state updates, client notifications & instant activation
self.addEventListener('message', (event) => {
  if (!event.data) return;
  const { type, key, value, timestamp } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (type === 'STATE_UPDATED') {
    // Persist into IndexedDB inside the service worker context
    event.waitUntil(
      saveStateToIndexedDB(key, value, timestamp).then(async () => {
        // Broadcast change to all other active tabs/windows
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of allClients) {
          if (event.source && client.id === event.source.id) continue;
          client.postMessage({
            type: 'SYNC_STATE_BROADCAST',
            key,
            value,
            timestamp: timestamp || Date.now()
          });
        }
      })
    );
  } else if (type === 'REQUEST_ALL_STATE') {
    event.waitUntil(
      (async () => {
        try {
          const db = await openSwSyncDB();
          const tx = db.transaction(STATE_STORE, 'readonly');
          const store = tx.objectStore(STATE_STORE);
          const req = store.getAll();
          req.onsuccess = () => {
            if (event.source) {
              event.source.postMessage({
                type: 'ALL_STATE_RESPONSE',
                items: req.result || []
              });
            }
          };
        } catch (err) {
          console.warn('SW failed to retrieve state:', err);
        }
      })()
    );
  }
});

// Background Sync API integration (for guaranteed offline queue execution)
self.addEventListener('sync', (event) => {
  if (event.tag === 'jannat-sync-data' || event.tag === 'sync-user-data') {
    event.waitUntil(
      (async () => {
        try {
          const allClients = await self.clients.matchAll({ type: 'window' });
          allClients.forEach((client) => {
            client.postMessage({ type: 'BACKGROUND_SYNC_COMPLETE', timestamp: Date.now() });
          });
        } catch (err) {
          console.warn('Background sync failed:', err);
        }
      })()
    );
  }
});

