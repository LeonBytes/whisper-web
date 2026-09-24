// sw.js — 离线缓存。
// 页面自己的文件（index.html、worker.js）用"网络优先"：有网时总是取最新版本，
// 断网时才用缓存，这样更新网页后不会一直看到旧版本。
// CDN 上的运行库带版本号，用"缓存优先"即可。模型文件由 transformers.js 自己缓存，这里不处理。
const CACHE = "whisper-web-v2";
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

  if (sameOrigin) {
    // 网络优先：no-cache 表示每次都向服务器确认是否有新版本（没变化时很快）
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then(
            (hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
          )
        )
    );
    return;
  }

  // CDN 运行库：缓存优先
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
