importScripts('/dots/cache-polyfill.js');

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('dots').then(function(cache) {
      return cache.addAll([
        '/dots/',
        'index.html',
        'css/styles.min.css',
        'js/build.min.js',
        'js/worlds.min.json',
        'sounds/notas.mp3',
        'img/anchor32_32.png',
        'img/icon.png',
        'img/forkme.png'
      ]).then(function() {
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  //console.log(event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
