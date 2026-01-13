const CACHE_NAME = 'budgetpro-v1';
const urlsToCache = [
  './',
  './index.html',
  './budget.html',
  './expenses.html',
  './reports.html',
  './settings.html'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});