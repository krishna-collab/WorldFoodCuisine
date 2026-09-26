/*
 * WorldFoodCuisine service worker.
 *
 * - Pages: network first, so an online visitor always gets the latest page;
 *   offline, the last copy of a page they opened, or /offline.html.
 * - /assets/ (hashed JS and CSS): cache first; the file names change on
 *   every deploy, so a cached copy is never stale.
 * - Dish photos, fonts and icons: served from cache, refreshed in the background.
 * - Saved dishes: the page, cook mode, image and the scripts and styles those
 *   pages need are kept in their own cache that is never trimmed, until the
 *   dish is unsaved. So a saved recipe opens and works offline even if its
 *   cook mode was never opened online.
 * - Checkout, orders and server calls are never cached. Ordering is
 *   online-only; offline, those pages fall back to /offline.html.
 *
 * Changing this file makes browsers install the new worker; the page then
 * offers a reload (src/components/pwa/service-worker.tsx) and sends
 * SKIP_WAITING. Bump VERSION to drop every old cache on activation.
 */
const VERSION = "v2";
const PAGES = `wfc-pages-${VERSION}`;
const ASSETS = `wfc-assets-${VERSION}`;
const IMAGES = `wfc-images-${VERSION}`;
// Not versioned: saved dishes should survive app updates.
const SAVED = "wfc-saved";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/favicon.svg", "/__grok/icon-192.png"];
const LIMITS = { [PAGES]: 40, [ASSETS]: 120, [IMAGES]: 80 };

const NEVER_CACHE = [
  /^\/checkout/,
  /^\/order\//,
  /^\/api\//,
  /^\/_serverFn/,
  /^\/__grok\/manifest/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, ASSETS, IMAGES, SAVED]);
      for (const key of await caches.keys()) {
        if (key.startsWith("wfc-") && !keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(warm(data.urls));
  }
  if (data.type === "SAVE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(keepSaved(data.urls));
  }
  if (data.type === "UNSAVE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(dropSaved(data.urls));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const neverCache = NEVER_CACHE.some((re) => re.test(url.pathname));

  if (request.mode === "navigate") {
    event.respondWith(page(request, !neverCache));
    return;
  }
  if (neverCache) return;
  const bucket = bucketFor(url);
  if (bucket === ASSETS) event.respondWith(cacheFirst(request));
  else if (bucket === IMAGES) event.respondWith(staleWhileRevalidate(event, request));
});

function bucketFor(url) {
  if (url.pathname.startsWith("/assets/")) return ASSETS;
  if (
    url.pathname.startsWith("/food/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/_vercel/image") ||
    url.pathname.startsWith("/__grok/icon")
  ) {
    return IMAGES;
  }
  return null;
}

async function page(request, cacheable) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (cacheable && response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
      trim(PAGES);
    }
    return response;
  } catch {
    const cached = cacheable
      ? (await cache.match(request, { ignoreVary: true })) ||
        (await cache.match(request, { ignoreVary: true, ignoreSearch: true }))
      : undefined;
    const saved = cacheable
      ? await (await caches.open(SAVED)).match(request, { ignoreVary: true, ignoreSearch: true })
      : undefined;
    return cached || saved || (await cache.match(OFFLINE_URL)) || offlineText();
  }
}

// Hashed files never change, so a cached copy fits any request for that URL.
// ignoreVary: servers may send "Vary: Origin", and a module script's request
// carries an Origin header that the worker's own fetch didn't.
const ANY = { ignoreVary: true };

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached =
    (await cache.match(request, ANY)) || (await (await caches.open(SAVED)).match(request, ANY));
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      trim(ASSETS);
    }
    return response;
  } catch {
    return offlineText();
  }
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(IMAGES);
  const cached =
    (await cache.match(request, ANY)) || (await (await caches.open(SAVED)).match(request, ANY));
  const refresh = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        trim(IMAGES);
      }
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) || (await anySizeOf(request)) || offlineText();
}

/**
 * Offline, and this exact size of an optimized image isn't cached: use any
 * cached size of the same image, or the saved original.
 */
async function anySizeOf(request) {
  const url = new URL(request.url);
  const original = url.pathname === "/_vercel/image" ? url.searchParams.get("url") : null;
  if (!original) return undefined;
  for (const name of [SAVED, IMAGES]) {
    const cache = await caches.open(name);
    const direct = await cache.match(new URL(original, self.location.origin).href, ANY);
    if (direct) return direct;
    for (const key of await cache.keys()) {
      const k = new URL(key.url);
      if (k.pathname === "/_vercel/image" && k.searchParams.get("url") === original) {
        return cache.match(key, ANY);
      }
    }
  }
  return undefined;
}

/** Cache what the page already loaded, so it works offline next time. */
async function warm(urls) {
  for (const href of urls.slice(0, 60)) {
    let url;
    try {
      url = new URL(href, self.location.origin);
    } catch {
      continue;
    }
    if (url.origin !== self.location.origin) continue;
    if (NEVER_CACHE.some((re) => re.test(url.pathname))) continue;
    const bucket = bucketFor(url) || PAGES;
    const cache = await caches.open(bucket);
    if (await cache.match(url.href)) continue;
    try {
      const response = await fetch(url.href, { credentials: "same-origin" });
      if (response.ok && response.type === "basic") await cache.put(url.href, response);
    } catch {
      // Offline or blocked; try again next visit.
    }
  }
  await Promise.all(Object.keys(LIMITS).map(trim));
}

/**
 * Keep a saved dish's page, cook mode and image for offline use, with the
 * scripts and styles each page loads, so the pages work, not just show.
 */
async function keepSaved(urls) {
  const cache = await caches.open(SAVED);
  for (const href of urls.slice(0, 30)) {
    let url;
    try {
      url = new URL(href, self.location.origin);
    } catch {
      continue;
    }
    if (url.origin !== self.location.origin) continue;
    try {
      const response = await fetch(url.href, { credentials: "same-origin" });
      if (!response.ok || response.type !== "basic") continue;
      const isPage = (response.headers.get("content-type") || "").includes("text/html");
      const html = isPage ? await response.clone().text() : "";
      await cache.put(url.href, response);
      for (const asset of assetUrls(html)) {
        if (await cache.match(asset)) continue;
        const file = await fetch(asset).catch(() => undefined);
        if (file && file.ok) await cache.put(asset, file);
      }
    } catch {
      // Offline now; the page registers saved dishes again on the next visit.
    }
  }
  await pruneSavedAssets();
}

async function dropSaved(urls) {
  const cache = await caches.open(SAVED);
  for (const href of urls) {
    try {
      await cache.delete(new URL(href, self.location.origin).href);
    } catch {
      // Nothing to drop.
    }
  }
  await pruneSavedAssets();
}

/** Hashed scripts and styles a page loads, from its HTML. */
function assetUrls(html) {
  const found = new Set();
  for (const match of html.matchAll(/["'(](\/assets\/[\w.-]+\.(?:js|css))["')]/g)) {
    found.add(new URL(match[1], self.location.origin).href);
  }
  return [...found];
}

/** Drop saved scripts and styles no saved page uses any more (after a deploy or an unsave). */
async function pruneSavedAssets() {
  const cache = await caches.open(SAVED);
  const keys = await cache.keys();
  const needed = new Set();
  for (const request of keys) {
    if (new URL(request.url).pathname.startsWith("/assets/")) continue;
    const response = await cache.match(request);
    const type = (response && response.headers.get("content-type")) || "";
    if (type.includes("text/html")) {
      for (const asset of assetUrls(await response.text())) needed.add(asset);
    }
  }
  for (const request of keys) {
    if (new URL(request.url).pathname.startsWith("/assets/") && !needed.has(request.url)) {
      await cache.delete(request);
    }
  }
}

/** Keep each cache under its limit by dropping the oldest entries. */
async function trim(name) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const extra = keys.length - LIMITS[name];
  for (let i = 0; i < extra; i++) {
    if (keys[i].url.endsWith(OFFLINE_URL)) continue;
    await cache.delete(keys[i]);
  }
}

function offlineText() {
  return new Response("You're offline.", {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
