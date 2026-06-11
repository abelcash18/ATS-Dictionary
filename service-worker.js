self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v2').then(cache => {  // Update cache version if necessary
        return cache.addAll([
          './',
          './index.html',
          './dictionary.css',
          './dictionary.js',
          './icon.png'
        ]);
      })
    );
  });
  
  self.addEventListener('activate', event => {
    const cacheWhitelist = ['v2'];  // Update with the latest cache version
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);  // Clean up outdated caches
            }
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          return caches.match('/offline.html');  // Fallback page when offline
        });
      })
    );
  });
  