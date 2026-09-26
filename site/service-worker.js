const CACHE_NAME = "__CACHE_NAME__";
const BASE_PATH = "__BASE_PATH__";
const APP_SHELL = __APP_SHELL__;
const MAX_RUNTIME_ENTRIES = 80;
const APP_SHELL_URLS = new Set(APP_SHELL.map((entry) => new URL(entry, self.location.origin).href));

const isScopedUrl = (url) => url.origin === self.location.origin && url.pathname.startsWith(BASE_PATH);
const canCache = (response) => response.ok && response.type !== "opaque";

async function putInCache(request, response) {
  if (!canCache(response)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
    const runtimeRequests = (await cache.keys()).filter((entry) => !APP_SHELL_URLS.has(entry.url));
    await Promise.all(runtimeRequests.slice(0, -MAX_RUNTIME_ENTRIES).map((entry) => cache.delete(entry)));
  } catch {
    // Cache Storage is a browser boundary and remains best effort.
  }
}

async function matchCache(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(request);
  } catch {
    return undefined;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await putInCache(request, response.clone());
    return response;
  } catch {
    const cached = await matchCache(request);
    if (cached) return cached;
    if (request.mode === "navigate") return (await matchCache(`${BASE_PATH}index.html`)) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await matchCache(request);
  if (cached) return cached;
  const response = await fetch(request);
  await putInCache(request, response.clone());
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith("mazey-ui-site-") && key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
    } catch {
      // Cache cleanup is best effort and must not block worker activation.
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || !isScopedUrl(url) || url.pathname.endsWith(".map")) return;
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate" || [ "script", "style" ].includes(request.destination)) {
    event.respondWith(networkFirst(request));
  }
});
