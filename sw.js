// Guarda la app en el celular para que abra rápido y funcione sin internet (excepto el video).
const CACHE='adn-explore-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || /youtube|googlevideo|ytimg/.test(u.hostname)) return;
  // Página: primero red (para recibir cambios), si no hay conexión usa la copia guardada.
  if(e.request.mode==='navigate'){ e.respondWith(fetch(e.request).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return r; }).catch(()=>caches.match('./index.html'))); return; }
  // Fuentes e íconos: copia guardada primero.
  e.respondWith(caches.match(e.request).then(hit=>hit || fetch(e.request).then(r=>{ if(r.ok && (u.origin===location.origin || /fonts\.(googleapis|gstatic)\.com/.test(u.hostname))){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return r; })));
});
