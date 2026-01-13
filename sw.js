// Service Worker for Shankar Group Tools
const CACHE_NAME = 'sg-tools-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            // Don't cache external resources excessively
            if (event.request.url.startsWith('http') && 
                !event.request.url.includes('cdnjs.cloudflare.com')) {
              cache.put(event.request, responseToCache);
            }
          });
          
          return response;
        }).catch(() => {
          // If fetch fails and it's a page request, return offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          
          // For other requests, return error
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Handle push notifications (optional)
self.addEventListener('push', event => {
  console.log('📲 Push notification received');
  
  let data = {
    title: 'Shankar Group Tools',
    body: 'Check out our latest tools!',
    icon: '/icons/icon-192x192.png'
  };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('📱 Notification click received');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});