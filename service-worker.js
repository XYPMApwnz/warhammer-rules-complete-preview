importScripts("./glossary/generated/cache-revision.js");
const CACHE_PREFIX = "warhammer-rules-complete-preview-";
const CACHE_NAME = `${CACHE_PREFIX}${self.WH40K_CACHE_REVISION || "fallback"}`;
const LIBRARY_FALLBACK = "./index.html";
const DEATH_GUARD_FALLBACK = "./books/death-guard/index.html";
const CORE_RULES_FALLBACK = "./books/core-rules/index.html";
const ADEPTUS_MECHANICUS_FALLBACK = "./books/adeptus-mechanicus/index.html";
const APP_SHELL = [
  "./",
  LIBRARY_FALLBACK,
  "./manifest.webmanifest",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/warhammer-40000-logo-optimized.png",
  "./assets/games-workshop-logo.png",
  "./assets/core-rules-cover-480.webp",
  "./assets/core-rules-cover-800.webp",
  "./assets/core-rules-cover-fallback.jpg",
  "./assets/core-rules-cover-thumb.jpg",
  "./assets/death-guard-cover-480.webp",
  "./assets/death-guard-cover-800.webp",
  "./assets/death-guard-cover-fallback.jpg",
  "./assets/death-guard-cover-thumb.jpg",
  "./assets/adeptus-mechanicus-cover-480.webp",
  "./assets/adeptus-mechanicus-cover-800.webp",
  "./assets/adeptus-mechanicus-cover-fallback.jpg",
  "./assets/adeptus-mechanicus-cover-thumb.jpg",
  "./glossary/generated/cache-revision.js",
  "./glossary/generated/glossary.en.js?v=2",
  "./glossary/",
  "./glossary/index.html",
  "./glossary/viewer.css?v=2",
  "./glossary/viewer-profiles.css?v=2",
  "./glossary/viewer.js?v=3",
  "./books/death-guard/",
  DEATH_GUARD_FALLBACK,
  "./books/shared/navigation-targets.js?v=1",
  "./books/shared/datasheet-layout.js?v=2",
  "./books/shared/datasheet-system.css?v=4",
  "./books/shared/popup-content.js?v=1",
  "./books/shared/glossary-autolink.js?v=8",
  "./books/death-guard/assets/icon-v4.svg",
  "./books/death-guard/styles/tokens.css?v=9",
  "./books/death-guard/styles/layout.css?v=9",
  "./books/death-guard/styles/navigation.css?v=10",
  "./books/death-guard/styles/content.css?v=17",
  "./books/death-guard/styles/popups.css?v=15",
  "./books/death-guard/scripts/tap-diagnostics.js?v=2",
  "./books/death-guard/scripts/navigation-controller.js?v=14",
  "./books/death-guard/scripts/popup-controller.js?v=20",
  "./books/death-guard/scripts/full-entry-controller.js?v=5",
  "./books/death-guard/scripts/journey-controller.js?v=11",
  "./books/death-guard/scripts/ui-controllers.js?v=11",
  "./books/death-guard/scripts/app.js?v=17",
  "./books/core-rules/",
  CORE_RULES_FALLBACK,
  "./books/core-rules/styles.css",
  "./books/core-rules/config.js",
  "./books/core-rules/basic-content.js",
  "./books/core-rules/app.js?v=1",
  "./books/core-rules/content/core-rules.source.en.js",
  "./books/core-rules/content/core-rules.en.js",
  "./books/adeptus-mechanicus/",
  ADEPTUS_MECHANICUS_FALLBACK,
  "./books/adeptus-mechanicus/assets/mechanicus-logo.png",
  "./books/adeptus-mechanicus/sources/adeptus-mechanicus-faction-pack-v1.0.pdf",
  "./books/adeptus-mechanicus/content/adeptus-mechanicus-rules.en.json",
  "./books/adeptus-mechanicus/content/adeptus-mechanicus-codex-detachments.en.json",
  "./books/adeptus-mechanicus/content/adeptus-mechanicus-codex-datasheets.en.json",
  "./books/adeptus-mechanicus/styles/tokens.css?v=13",
  "./books/adeptus-mechanicus/styles/layout.css?v=13",
  "./books/adeptus-mechanicus/styles/navigation.css?v=13",
  "./books/adeptus-mechanicus/styles/content.css?v=14",
  "./books/adeptus-mechanicus/styles/popups.css?v=15",
  "./books/adeptus-mechanicus/styles/mechanicus.css?v=13",
  "./books/adeptus-mechanicus/scripts/data.js?v=13",
  "./books/adeptus-mechanicus/scripts/navigation-controller.js?v=13",
  "./books/adeptus-mechanicus/scripts/popup-controller.js?v=18",
  "./books/adeptus-mechanicus/scripts/journey-controller.js?v=13",
  "./books/adeptus-mechanicus/scripts/ui-controllers.js?v=13",
  "./books/adeptus-mechanicus/scripts/app.js?v=17"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function fetchAndCache(request, cacheKey = request) {
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    let fallback = LIBRARY_FALLBACK;
    if (url.pathname.includes("/books/death-guard/")) fallback = DEATH_GUARD_FALLBACK;
    else if (url.pathname.includes("/books/core-rules/")) fallback = CORE_RULES_FALLBACK;
    else if (url.pathname.includes("/books/adeptus-mechanicus/")) fallback = ADEPTUS_MECHANICUS_FALLBACK;
    const networkUpdate = fetchAndCache(request);
    event.waitUntil(networkUpdate.then(() => undefined).catch(() => undefined));
    event.respondWith(
      networkUpdate.catch(async () => (await caches.match(request)) || caches.match(fallback))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetchAndCache(request))
  );
});
