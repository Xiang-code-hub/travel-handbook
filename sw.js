// 離線快取：網頁本身優先取最新版，沒網路時用上次的；Firebase 程式庫與字體直接快取
const CACHE='hb-v2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['index.html','manifest.webmanifest','icon-192.png'])).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url),same=url.origin===location.origin;
  const lib=url.hostname==='www.gstatic.com'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(same&&(req.mode==='navigate'||/(^|\/)(index\.html)?$/.test(url.pathname))){
    const key=url.origin+url.pathname.replace(/index\.html$/,'').replace(/\/?$/,'/')+'index.html';
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(key,cp))}return r}).catch(()=>caches.match(key).then(x=>x||caches.match('index.html'))));
    return;
  }
  if(same||lib){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})));
  }
});
