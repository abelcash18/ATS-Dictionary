const CACHE_VERSION = 'v3';
const CACHE_NAME = `dictionary-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './dictionary.css',
  './dictionary.js',
  './manifest.json',
  './icon.jpg',
  './about.html',
  './privacy.html',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL.filter((u) => u));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
          return undefined;
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API requests: network-first (so definitions stay fresh)
  if (request.url.includes('api.dictionaryapi.dev') || request.url.includes('random-word-api.herokuapp.com')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Don’t cache API responses by default
          return res;
        })
        .catch(() => {
          // If offline, fall back to cached app shell
          return caches.match('./index.html');
        })
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => caches.match('./index.html'));
    })
  );
});

  