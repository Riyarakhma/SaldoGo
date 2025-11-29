const CACHE_NAME = 'saldogo-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', ev => ev.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', ev => ev.respondWith(caches.match(ev.request).then(r => r || fetch(ev.request))));