importScripts("./glossary/generated/cache-revision.js");
const CACHE_PREFIX = "warhammer-rules-fe1d435-";
const CACHE_NAME = `${CACHE_PREFIX}${self.WH40K_CACHE_REVISION || "fallback"}`;
const LIBRARY_FALLBACK = "./index.html";
const ROSTER_GUIDES_FALLBACK = "./roster-guides/index.html";
const DEATH_GUARD_FALLBACK = "./books/death-guard/index.html";
const CORE_RULES_FALLBACK = "./books/core-rules/reader/index.html";
const ADEPTUS_MECHANICUS_FALLBACK = "./books/adeptus-mechanicus/index.html";
const APP_SHELL = [
  "./",
  LIBRARY_FALLBACK,
  "./roster-guides/",
  ROSTER_GUIDES_FALLBACK,
  "./roster-guides/points-data.js?v=3",
  "./roster-guides/points-validator.js?v=2",
  "./roster-guides/app.js?v=6",
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
  "./glossary-return.js?v=1",
  "./glossary/",
  "./glossary/index.html",
  "./glossary/viewer.css?v=2",
  "./glossary/viewer-profiles.css?v=2",
  "./glossary/viewer-progressive.css?v=2",
  "./glossary/viewer-popup.css?v=1",
  "./glossary/viewer.js?v=8",
  "./books/death-guard/",
  DEATH_GUARD_FALLBACK,
  "./books/death-guard/reader.html",
  "./books/death-guard/styles/entry.css?v=2",
  "./books/death-guard/scripts/view-router.js?v=2",
  "./books/death-guard/mobile/index.html",
  "./books/death-guard/mobile/mobile.css?v=8",
  "./books/death-guard/mobile/mobile.js?v=12",
  "./books/shared/navigation-targets.js?v=1",
  "./books/shared/datasheet-layout.js?v=2",
  "./books/shared/datasheet-system.css?v=6",
  "./books/shared/popup-content.js?v=2",
  "./books/shared/glossary-autolink.js?v=8",
  "./books/shared/roster-entities.js?v=1",
  "./books/shared/roster-parser.js?v=2",
  "./books/shared/roster-enhancements.js?v=3",
  "./books/death-guard/assets/icon-v4.svg",
  "./books/death-guard/styles/tokens.css?v=10",
  "./books/death-guard/styles/layout.css?v=9",
  "./books/death-guard/styles/navigation.css?v=11",
  "./books/death-guard/styles/content.css?v=28",
  "./books/death-guard/styles/popups.css?v=17",
  "./books/death-guard/scripts/navigation-controller.js?v=15",
  "./books/death-guard/scripts/roster-filter.js?v=14",
  "./books/death-guard/scripts/popup-controller.js?v=23",
  "./books/death-guard/scripts/full-entry-controller.js?v=8",
  "./books/death-guard/scripts/journey-controller.js?v=11",
  "./books/death-guard/scripts/ui-controllers.js?v=11",
  "./books/death-guard/scripts/related-rules.js?v=6",
  "./books/death-guard/scripts/app.js?v=28",
  "./books/core-rules/",
  CORE_RULES_FALLBACK,
  "./books/core-rules/reader/styles.css?v=8",
  "./books/core-rules/reader/app.js?v=10",
  "./books/core-rules/reader/search-index.json",
  "./books/core-rules/reader/introduction.html",
  "./books/core-rules/reader/core-concepts.html",
  "./books/core-rules/reader/datasheets.html",
  "./books/core-rules/reader/moving.html",
  "./books/core-rules/reader/making-attacks.html",
  "./books/core-rules/reader/attack-sequence.html",
  "./books/core-rules/reader/other-concepts.html",
  "./books/core-rules/reader/battle-round-overview.html",
  "./books/core-rules/reader/command-phase.html",
  "./books/core-rules/reader/movement-phase.html",
  "./books/core-rules/reader/shooting-phase.html",
  "./books/core-rules/reader/charge-phase.html",
  "./books/core-rules/reader/fight-phase.html",
  "./books/core-rules/reader/terrain.html",
  "./books/core-rules/reader/objectives.html",
  "./books/core-rules/reader/stratagems.html",
  "./books/core-rules/reader/actions.html",
  "./books/core-rules/reader/monsters-vehicles.html",
  "./books/core-rules/reader/transports.html",
  "./books/core-rules/reader/attached-units.html",
  "./books/core-rules/reader/strategic-reserves.html",
  "./books/core-rules/reader/flying-surging.html",
  "./books/core-rules/reader/other-rules-abilities.html",
  "./books/core-rules/reader/aircraft.html",
  "./books/core-rules/reader/core-abilities.html",
  "./books/core-rules/reader/muster-armies.html",
  "./books/core-rules/styles.css",
  "./books/core-rules/config.js",
  "./books/core-rules/basic-content.js",
  "./books/core-rules/app.js?v=2",
  "./books/core-rules/content/core-rules.source.en.js",
  "./books/core-rules/content/core-rules.en.js",
  "./books/adeptus-mechanicus/",
  ADEPTUS_MECHANICUS_FALLBACK,
  "./books/adeptus-mechanicus/assets/mechanicus-logo.png",
  "./books/adeptus-mechanicus/styles/tokens.css?v=13",
  "./books/adeptus-mechanicus/styles/layout.css?v=13",
  "./books/adeptus-mechanicus/styles/navigation.css?v=13",
  "./books/adeptus-mechanicus/styles/content.css?v=14",
  "./books/adeptus-mechanicus/styles/popups.css?v=16",
  "./books/adeptus-mechanicus/styles/mechanicus.css?v=13",
  "./books/adeptus-mechanicus/scripts/data.js?v=13",
  "./books/adeptus-mechanicus/scripts/navigation-controller.js?v=13",
  "./books/adeptus-mechanicus/scripts/popup-controller.js?v=20",
  "./books/adeptus-mechanicus/scripts/journey-controller.js?v=13",
  "./books/adeptus-mechanicus/scripts/ui-controllers.js?v=14",
  "./books/adeptus-mechanicus/scripts/app.js?v=19"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(APP_SHELL.map((url) => cache.add(url))))
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

async function fetchAndCache(request, event, cacheKey = request) {
  const response = await fetch(request);
  if (response.ok) {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, response.clone())));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    let fallback = LIBRARY_FALLBACK;
    if (url.pathname.includes("/roster-guides/")) fallback = ROSTER_GUIDES_FALLBACK;
    else if (url.pathname.includes("/books/death-guard/")) fallback = DEATH_GUARD_FALLBACK;
    else if (url.pathname.includes("/books/core-rules/")) fallback = CORE_RULES_FALLBACK;
    else if (url.pathname.includes("/books/adeptus-mechanicus/")) fallback = ADEPTUS_MECHANICUS_FALLBACK;
    const networkUpdate = fetchAndCache(request, event);
    event.respondWith(
      networkUpdate.catch(async () => (await caches.match(request)) || caches.match(fallback))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetchAndCache(request, event))
  );
});
