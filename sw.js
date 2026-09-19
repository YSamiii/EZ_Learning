const RELEASE_VERSION = '0.3.1-rc1';
const CACHE = 'xixi-explore-v0.3.1-rc1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './profile.js', './recommendations.js', './progression.js', './data/courses.json', './manifest.webmanifest', './release.json', './icons/icon-192.svg', './icons/icon-512.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('xixi-explore-') && key !== CACHE).map(key => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
