/* ============================================================
   SERVICE WORKER — Denúncia Digital
   Projeto extensionista UNIG EAD · 5º Período · ODS 16
   ============================================================ */

const CACHE_NAME = 'denuncia-digital-v1';

/* Arquivos que ficam disponíveis offline */
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

/* ---- INSTALL: salva os assets no cache ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ---- ACTIVATE: limpa caches antigos ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ---- FETCH: network first, cache fallback ---- */
self.addEventListener('fetch', event => {
  /* Requisições ao Supabase sempre vão para a rede */
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        /* Atualiza o cache com a resposta mais recente */
        if (res && res.status === 200 && event.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
