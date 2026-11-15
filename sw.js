/* Service Worker de Vela
 * - App shell: red primero, con respaldo en caché (funciona sin conexión).
 * - Librerías CDN (URLs con versión fija): caché primero.
 * - Datos de Binance (REST y WebSocket): siempre red, nunca se cachean.
 * Cambia VERSION al publicar una nueva versión para renovar la caché.
 */
const VERSION = 'vela-v5';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.5/dist/index.global.js',
  'https://cdn.jsdelivr.net/npm/lightweight-charts@5.3.0/dist/lightweight-charts.standalone.production.js',
  'https://cdn.jsdelivr.net/npm/technicalindicators@3.1.0/dist/browser.es6.js',
];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await Promise.all(CDN.map(async u => {
      try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await cache.put(u, r); } catch (e) { /* se cacheará en el primer uso */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;
  if (/binance/i.test(url.hostname)) return;               // datos en vivo: solo red

  // Navegación: red primero para recibir actualizaciones; sin conexión, la copia en caché
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put('./index.html', res.clone());
        return res;
      } catch (e) {
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Librerías CDN versionadas: caché primero
  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req.url);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req.url, res.clone());
      return res;
    })());
    return;
  }

  // Resto de archivos propios: caché y actualización en segundo plano
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
  }
});
