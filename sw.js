/* Service worker de la app del encargado (solo en la versión publicada con https).
   Red primero: si hay internet se usa siempre la versión nueva y se guarda una copia;
   sin internet se abre la copia guardada. build.js pone en CACHE un hash del index.html, así cada versión nueva usa su propia copia. */
const CACHE = 'ovocenter-rendir-0da5260293';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono-180.png', 'icono-192.png', 'icono-512.png'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith('ovocenter-rendir-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
