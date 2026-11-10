// Adashopy – service worker : permet l'installation et l'ouverture même avec une connexion faible
const CACHE = "adashopy-v1";
const FICHIERS = ["boutique-personnelle.html", "icon-192.png", "icon-512.png", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Firebase, images externes : jamais mis en cache ici
  if (req.mode === "navigate") {                          // page : toujours la version la plus récente, sinon copie
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("boutique-personnelle.html", c)); return r; }).catch(() => caches.match("boutique-personnelle.html")));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(CACHE).then(x => x.put(req, c)); return n; })));
});
