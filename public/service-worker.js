// // service-worker.js - Simplified version
// const CACHE_NAME = 'rights-app-static-v1';
// const STATIC_ASSETS = [
//   '/',
//   '/static/js/bundle.js',
//   '/static/css/main.css',
//   '/manifest.json'
// ];

// // Install - Cache static assets
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => cache.addAll(STATIC_ASSETS))
//       .catch((error) => console.log('Cache failed:', error))
//   );
// });

// // Fetch - Serve from cache if available
// self.addEventListener('fetch', (event) => {
//   // Only handle HTTP requests
//   if (!event.request.url.startsWith('http')) return;
  
//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => response || fetch(event.request))
//   );
// });