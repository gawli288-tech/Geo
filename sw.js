self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through strategy. 
  // In a production app, you would implement caching strategies here.
  event.respondWith(fetch(event.request));
});