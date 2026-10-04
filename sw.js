const CACHE_NAME = 'vyakarana-cache-v3';

// Core assets to cache for offline access
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline-data.js',
  './manifest.json'
];

// Install Event: Caches essential files locally in the browser
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clears old caches when you update the website
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Serve cached files when offline; fallback to network
self.addEventListener('fetch', (event) => {
  // Do not intercept external API/backend calls to Cloudflare
  if (event.request.url.includes('workers.dev') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback to cached index.html if navigating while offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});