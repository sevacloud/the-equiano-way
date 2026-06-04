const CACHE_NAME = 'equiano-v2';
const TILE_CACHE = 'osm-tiles';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/map.html',
  '/offline.html',
  '/css/base.css',
  '/css/nav.css',
  '/css/components.css',
  '/js/session.js',
  '/js/start-prompt.js',
  '/manifest.json',
  '/data/sections.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== TILE_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-only for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Stale-while-revalidate for OSM tiles
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetched = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);

          return cached || fetched;
        })
      )
    );
    return;
  }

  // Cache-first for app files, offline fallback for navigation requests
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
