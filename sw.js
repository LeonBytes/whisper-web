// sw.js — 缓存页面和运行库，让网页第二次打开时可以离线使用。
// 模型文件由 transformers.js 自己缓存，这里不处理 huggingface.co 的请求。
const CACHE = "whisper-web-v1";
const SHELL = ["./", "./index.html", "./worker.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === "cdn.jsdelivr.net";
  if (!sameOrigin && !isCDN) return; // 其他请求（含模型下载）不拦截

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
