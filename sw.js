/* Cache the whole game so a later visit works offline. */
const CACHE = 'hudson-drive-v1';
const FILES = [
  './index.html',
  './manifest.json',
  './sw.js',
  './css/game.css',
  './js/art.js',
  './js/audio.js',
  './js/game.js',
  './audio/credits.json',
  './audio/voice/manifest.json',
  './audio/animals/moo.mp3',
  './audio/animals/bark.mp3',
  './audio/animals/meow.mp3',
  './audio/animals/quack.mp3',
  './audio/animals/neigh.mp3',
  './audio/sfx/engine.mp3',
  './audio/sfx/tap.mp3',
  './audio/sfx/chime.mp3',
  './audio/voice/cow.mp3',
  './audio/voice/dog.mp3',
  './audio/voice/cat.mp3',
  './audio/voice/duck.mp3',
  './audio/voice/horse.mp3',
  './audio/voice/lets_go.mp3',
  './audio/voice/all_done.mp3',
  './audio/voice/sounds_good.mp3',
  './audio/voice/try_again.mp3',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function rangeResponse(cached, rangeHeader) {
  return cached.arrayBuffer().then(function (buf) {
    const match = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
    if (!match) return cached;
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : buf.byteLength - 1;
    const slice = buf.slice(start, end + 1);
    const headers = new Headers(cached.headers);
    headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + buf.byteLength);
    headers.set('Content-Length', String(slice.byteLength));
    headers.set('Accept-Ranges', 'bytes');
    const type = cached.headers.get('Content-Type') || 'application/octet-stream';
    headers.set('Content-Type', type);
    return new Response(slice, { status: 206, statusText: 'Partial Content', headers: headers });
  });
}

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith((async function () {
    const cache = await caches.open(CACHE);
    const range = event.request.headers.get('range');
    if (event.request.mode === 'navigate') {
      const page = await cache.match('./index.html') || await cache.match('index.html');
      if (page) return page;
    }
    const cached = await cache.match(event.request);
    if (range && cached) return rangeResponse(cached, range);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      if (fresh.ok && !range) cache.put(event.request, fresh.clone());
      return fresh;
    } catch (err) {
      return cached || Response.error();
    }
  })());
});
