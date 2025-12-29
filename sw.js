const CACHE_NAME = 'rehans-app-v3';
const ASSETS = [
  './',
  './index.html',
  './admin-panel.html',
  './rehans.jpeg',
  './manifest.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ASSETS);
    })
  );
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
        return response || fetch(e.request);
    })
  );
});
