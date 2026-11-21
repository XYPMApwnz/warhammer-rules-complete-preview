# Static load inventory — 21 November 2026

Source: `8579a7a77c7f5e8dad291afc11b27aab3cd9d73a`. This is read-only source tracing and artifact sizing, not a browser timing result or an implementation. All final inventory paths/sizes use the actual runtime package at `E:/Warhammer/qa-tmp/load-audit/package`. Its aggregate content SHA-256 is `0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909`, cache revision `d08e23b961b6f507`.

The package has **456 runtime files, 282,837,773 bytes**; including PAGES_RUNTIME_MANIFEST.json, **282,982,284 bytes**. The source checkout's committed cache-revision.js is an old seed and must not be served as the published site: it still lists 219 URLs / 11.64 MB including the full source catalog. The normal packager stamps the correct current list. The actual packaged URL list was checked exactly against the current pure packaging calculation. No source, data or test was changed and no test/build/browser job was run by this inventory subtask.

## Mandatory precache

**221 URL keys / 219 unique file paths; 5,139,186 raw bytes summed by URL keys / 5,113,769 raw bytes by unique files.** Gzip level-6 estimate for unique files: **2,148,305 bytes**. This gzip estimate is offline zlib output, not measured Pages transfer bytes or headers.

| Group | URL keys | Unique files | Unique raw bytes | Unique gzip estimate |
| --- | --- | --- | --- | --- |
| HTML / manifest / other | 4 | 3 | 2684 | 1381 |
| Images | 18 | 18 | 1291845 | 1282170 |
| Book passport JSON | 9 | 9 | 118461 | 23370 |
| JS | 137 | 136 | 1452742 | 428387 |
| CSS | 20 | 20 | 153663 | 40199 |
| Core reader | 31 | 31 | 2044828 | 359012 |
| Small source metadata JSON | 1 | 1 | 1003 | 405 |
| Glossary runtime helper JS | 1 | 1 | 48543 | 13381 |


There are **no large generated Army Book JSON payloads, no full glossary corpus, and no full source-catalog.json in this mandatory list**. The one 1,003-byte generated JSON is shared source-date/MFM/battle-size metadata. The nine small book.config.json passports total 118,461 raw bytes. The glossary helper is 48,543-byte classic runtime code, not either 23–31 MB corpus. Core's 31 mandatory URLs include reader HTML, code, CSS and search metadata; the full Core diagram set is not all mandatory.

Two duplicate-path pairs explain 221 versus 219: `./` and `./index.html`; and `offline-status.js?v=4` versus `offline-status.js?wh-pwa=d08e23b961b6f507`. They are different cache keys and network requests, not two identical list entries. URL-count and byte totals must state which convention is used.

The service-worker script and its imported 74,765-byte cache-revision.js are additional install/version-oracle requests outside the 221 list. Installation explicitly fetches cache-revision.js again to confirm freshness. They are not represented by simply summing precache rows.

Full per-URL classification: [precache.csv](precache.csv). All 456 runtime file sizes: [package-files.csv](package-files.csv). Group categorization is exclusive, so Core assets are in Core, not counted again as generic JS/images.

## What currently blocks first Home

1. `index.html:2` redirects to v2/app.html. `v2/app.html:5–6` loads the offline client, then awaits WHOfflineStatus.ready **before** importing v2/boot.mjs. The initial Loading text can paint earlier than the useful Home screen.
2. On a fresh profile, `books/shared/offline-status.js:294–309` registers the first worker. The initial install must finish before activation/controller claim can cause syncInstalled and releaseBootstrap (lines 167–184,318). There is no unconditional fresh-first-visit release before this install completes.
3. `service-worker.js:4,19–33,82–88` awaits revision freshness and the mandatory cache, fetching at most **four URLs in parallel per batch** and waiting for the whole batch before starting the next. 221 URLs require 56 batches. A pure RTT floor for those batches alone is approximately **9.52 s at 170 ms / 8.40 s at 150 ms**, before transfer/verification/cache-write effects. These are model components, not additive measured wall times.
4. The parsed static-import closure of v2/boot.mjs has **54 modules / 729,534 raw bytes**. It reaches the complete shared Army Book presentation module through application runtime's static imports (application-v2/runtime.mjs:1–8). This code is fetched/evaluated even if no book is opened. It does not mean every exported book function executes on Home. [Static module graph](HOME_STATIC_GRAPH.json).
5. `books/shared/roster-v2/keywords.mjs:6–16` has top-level await of all nine book.config.json reads; these are also Home startup dependencies through the eager shared import graph. `source-catalog.mjs:8–21` caches each runtime JSON URL in memory for a document; a page reload creates a new module realm.
6. `application-v2/runtime.mjs:80–87` inserts the Home DOM before awaiting the small source metadata for its source line. v2/boot.mjs:6–11 clears the initial bootstrap marker only after application.ready. Browser timing must distinguish FCP of Loading, first useful Home DOM, and completed bootstrap/source-line readiness. Header/Home links are installed while this async render is in progress.
7. `application-v2/shell.css:1` imports home.css. These styles are appended after the application JS has loaded (runtime.mjs:24); the CSS import adds a dependent stylesheet request. No critical Home stylesheet preload exists in the HTML.

Every mandatory item currently blocks the fresh Home through step 3, regardless of whether Home uses it. The CSV distinguishes functionally Home-related items from book/Core/later-view candidates. **137 mandatory URL rows / 3,371,973 raw bytes** are outside the eager Home code, source/passport metadata, Home shell and its listed image assets. They are candidates for an explicit policy redesign, not a safe deletion list. Other Home shelf images are also not inherently necessary to show the first text/navigation screen.

## Why warm online does not mean zero downloads

`service-worker.js:103–105,169–188,211–219` classifies every **.mjs/.css/.json extension**, literal **/v2/** path, Core reader path and the exact offline-status.js suffix as mutable. The folder names application-v2, army-book-app-v2 and roster-v2 do not themselves contain the literal /v2/ path component; their .mjs files nevertheless qualify by extension. Ordinary .js files outside those paths, such as books/shared/rule-facts.js, use the cache-first branch. Do not describe all JavaScript files with one policy.

When a fetch reaches the mutable branch it uses network first with `new Request(request,{cache:'no-store'})`; prepared Cache Storage is the compatible offline fallback. The install loop also uses no-store. This policy is **not a prediction that every warm module request reaches the worker or downloads again**. Chromium can fulfill script/style resource loads from its renderer memory/resource cache before another worker network fetch. In the excluded calibration pilot, all 53 eager .mjs resource requests were explicitly marked servedFromCache=true and had no inner worker network request; an example completed in 0.029 ms while retaining older response timing metadata. The additional shared rule-facts.js makes the 54-module static graph. Fresh module execution still fetched the nine passport JSON inputs. Final timing/traffic medians must use the calibrated main measurements, not this pilot.

The pilot's 14 CDP network rows were the app document, offline-status.js, offline CSS, nine passport JSON files, source-metadata JSON and the browser favicon request. Its raw server array additionally included browser-owned service-worker.js/update-import cache-revision.js traffic, which does not belong to the already active worker's target session. This is a calibration coverage caveat, not a finalized request count. [Policy/pilot trace classification](WARM_POLICY_AUDIT.json).

First cold Home can fetch a module during precache and again for its initial document load, while a warm reload may avoid that module's wire transfer via the browser cache. Ordinary fetch() JSON calls are different: their observed warm requests still reached the worker network-first path. Observe actual page versus service-worker/browser targets, servedFromCache flags and HTTP server requests; distinguish outer SW-served logical responses from inner wire requests. Do not double-count the same network body from both CDP targets, and do not infer current network activity from copied cached-response timing alone. The version oracle intentionally remains uncached.

Changing this is a cache/update design change, not just a request hint. A proposal must retain expected-publication checks, byte integrity, old-to-new bootstrap update behavior, working-screen confirmation and compatible offline fallback.

## First book and roster data path

`application-v2/runtime.mjs:182–191` waits for loadSourceCatalog before starting registration.loadPayload and createRoster. Source-catalog.mjs:43–57 fetches/parses/installs the full catalog once per document. The catalog is **6,530,013 raw / 719,107 gzip-estimate bytes** and does not load for Home, Core or global Glossary.

After that boundary, the selected book's presentation and native roster input start together. DG registration.mjs:11–15 fetches app-presentation.json; DG roster-boot.mjs:44–47 fetches rule-contract-effective.json. SM registration.mjs:11–17 fetches app-presentation.json; SM roster-boot.mjs:6–9 fetches roster-import.json. Import receives the already loaded presentation through options; no second app-presentation fetch is needed by the native application path. Version checks surround the view preparation. The audit's actual waterfall must confirm no accidental repeated read.

The app-presentation payload contains more than first-screen content: cards, fields, source navigation, source tables and roster presentation data. Splitting requires preserving exact native IDs, physical ownership, conditions, source refs, lazy popups and import dependencies, not just moving arbitrary JSON properties.

## Two glossary encodings

They are **the same semantic corpus in two active encodings**, not an unused accidental copy. `glossary/v2/tools/build-glossary-v2.mjs:18–19` writes pretty JSON and then a compact `window.WH40K_GLOSSARY_V2_INDEX=<same JSON>` wrapper.

- Global Mega Glossary fetches the JSON lazily: application-v2/runtime.mjs:150–163.
- Core chapter HTML loads the classic JS wrapper and classic glossary runtime: core-rules/reader/build.mjs:290; glossary-v2-runtime.js:4 reads the global. Core uses an iframe, so its JS realm/cache behavior differs from the parent application's fetched JSON.
- Neither large payload is mandatory precache or a Home dependency. Unifying them therefore saves **zero Home wire bytes**; it benefits users opening both Core and Mega Glossary, disk/cache space and potentially Core parse work. The current network-first policy can make repeated Core chapter navigations significant; measure that separately before asserting reuse.

| File | Raw bytes | Gzip-6 estimate | Body-only seconds Fast 9 Mbps | Body-only seconds Slow 1.6 Mbps |
| --- | --- | --- | --- | --- |
| glossary/v2/generated/index.en.json | 31169662 | 1941463 | 1.73 | 9.71 |
| glossary/v2/generated/index.en.js | 23201709 | 1672023 | 1.49 | 8.36 |
| books/shared/source-refs-v2/source-catalog.json | 6530013 | 719107 | 0.64 | 3.60 |


## Largest payloads: raw is not wire size

| Path | Raw MB (decimal) | Gzip-6 MB (decimal) | Body-only Fast seconds | Body-only Slow seconds |
| --- | --- | --- | --- | --- |
| glossary/v2/generated/index.en.json | 31.170 | 1.941 | 1.73 | 9.71 |
| books/space-marines/v2/generated/app-presentation.json | 23.277 | 1.227 | 1.09 | 6.14 |
| glossary/v2/generated/index.en.js | 23.202 | 1.672 | 1.49 | 8.36 |
| books/dark-angels/v2/generated/app-presentation.json | 19.763 | 1.079 | 0.96 | 5.39 |
| books/chaos-space-marines/v2/generated/app-presentation.json | 19.601 | 0.887 | 0.79 | 4.43 |
| books/blood-angels/v2/generated/app-presentation.json | 19.418 | 1.061 | 0.94 | 5.30 |
| books/tyranids/v2/generated/app-presentation.json | 8.748 | 0.440 | 0.39 | 2.20 |
| books/chaos-space-marines/v2/generated/roster-runtime.json | 7.827 | 0.578 | 0.51 | 2.89 |
| books/adeptus-mechanicus/v2/generated/app-presentation.json | 7.645 | 0.398 | 0.35 | 1.99 |
| books/tau-empire/v2/generated/app-presentation.json | 7.092 | 0.406 | 0.36 | 2.03 |
| books/space-marines/v2/generated/roster-import.json | 6.799 | 0.482 | 0.43 | 2.41 |
| books/shared/source-refs-v2/source-catalog.json | 6.530 | 0.719 | 0.64 | 3.60 |
| books/death-guard/v2/generated/app-presentation.json | 6.112 | 0.336 | 0.30 | 1.68 |
| books/dark-angels/v2/generated/roster-import.json | 6.104 | 0.452 | 0.40 | 2.26 |
| books/blood-angels/v2/generated/roster-import.json | 5.901 | 0.436 | 0.39 | 2.18 |
| books/emperors-children/v2/generated/app-presentation.json | 5.437 | 0.331 | 0.29 | 1.66 |
| books/adeptus-mechanicus/v2/generated/roster-runtime.json | 4.669 | 0.250 | 0.22 | 1.25 |
| books/tau-empire/v2/generated/roster-import.json | 3.544 | 0.251 | 0.22 | 1.26 |
| books/emperors-children/v2/generated/roster-attachments.json | 3.507 | 0.213 | 0.19 | 1.06 |
| books/tyranids/v2/generated/roster-runtime.json | 3.064 | 0.222 | 0.20 | 1.11 |
| books/chaos-space-marines/v2/generated/roster-import.json | 3.063 | 0.303 | 0.27 | 1.52 |
| books/death-guard/v2/generated/rule-contract-effective.json | 2.295 | 0.162 | 0.14 | 0.81 |
| books/emperors-children/v2/generated/roster-import.json | 2.166 | 0.136 | 0.12 | 0.68 |
| books/core-rules/sources/waha-core-2026-11-11/waha-core-corpus.v1.json | 2.132 | 0.243 | 0.22 | 1.22 |
| books/adeptus-mechanicus/v2/generated/effective.json | 2.072 | 0.117 | 0.10 | 0.58 |
| books/core-rules/sources/waha-core-2026-09-25/waha-core-corpus.v1.json | 1.468 | 0.165 | 0.15 | 0.82 |
| books/death-guard/assets/unit-images/plague-marines.png | 1.147 | 1.147 | 1.02 | 5.73 |
| books/death-guard/assets/unit-images/great-unclean-one.png | 0.972 | 0.971 | 0.86 | 4.85 |
| books/death-guard/assets/unit-images/blightlord-terminators.png | 0.960 | 0.957 | 0.85 | 4.78 |
| books/death-guard/assets/unit-images/rotigus.png | 0.897 | 0.896 | 0.80 | 4.48 |


These body-only rates exclude RTT, request serialization, headers, cache hits, CPU and congestion, and must not be summed blindly with critical-path times. Gzip/br must be measured from Pages headers. Pretty-JSON whitespace removal does not save all of the raw-byte reduction on an already-compressed connection. Parallel catalog/payload requests do not remove their summed transfer time on one aggregate bandwidth-limited pipe; plausible gains are RTT and CPU overlap, not the whole catalog download.

## Images and fonts

Nine selected-book hero backgrounds total **1,652,004 raw bytes**, not 23 MB. DG's hero uses a 473,320-byte JPG; other books mostly use existing 800px WebP images. `army-book-app-v2/runtime.mjs:591–598` assigns the selected book's CSS cover; book-v1.css:297 consumes it. They load when that library hero is rendered. [Actual hero paths](INVENTORY.json) are kept separately from Home covers and unit art.

The large approximately-23-MB group is **DG unit art: 32 PNGs / 22,245,156 raw bytes**; AM has 34 WebPs / 4,451,462 bytes. Home does not request the DG unit-art group. However, the actual first direct DG book opening requests **all 32**, not only the first visible datasheet. See [DG_IMAGE_EAGER_AUDIT.json](DG_IMAGE_EAGER_AUDIT.json) and [the main measurement row](../measurements/local-unlimited-dg-book-1-cold.json): image wire bodies total **22,245,156 bytes**, requests start at 1001.2–1042.7 ms, last page image response finishes at 1533.6 ms; app readiness is 1922 ms. This is one unlimited-network repetition, not a median.

The exact path is default route → renderContentsBook() (army-book-app-v2/runtime.mjs:735), all datasheet categories → appendCard() (runtime.mjs:676,651), renderCard() → datasheet presenter (runtime.mjs:345), then the IMG src setter (datasheet-v1.mjs:960). The initial book is a continuous full-book DOM, so every unit art node is constructed. On line 960, src is assigned **before** loading=lazy and decoding=async. The measured initiator is that src setter; the lazy declaration did not prevent these first-book requests. Whether assignment order, initial disconnected-node/layout state, or another browser heuristic is decisive needs a controlled browser experiment; no such experiment or fix is part of this inventory.

This is **ordinary page image fetching, not a bulk offline preloader**. Unit PNGs are absent from mandatory precache. Service worker final cache-first handling forwards cache misses (service-worker.js:220–221; fetchAndCache at 172) and caches the responses. There is **no explicit await of image load/decode** in the mount path. Application runtime awaits native payloads and rosterPanel.ready (application-v2/runtime.mjs:182–198); that ready initializes/restores the saved roster (army-book-app-v2/roster.mjs:851–856), not the unit images. The datasheet layout helper schedules layout/awaits fonts, without awaiting art. Thus do not equate eventual network settlement with interactive readiness. On a constrained link, image traffic can still contend with critical resources and full-book render work. The 22,245,156-byte transfer floor alone is 19.77 s at 9 Mbit/s or 111.23 s at 1.6 Mbit/s (before RTT/competition); those are body-transfer estimates, **not a claim that app readiness explicitly waits that long**. Reducing/deferring these requests is a book-opening opportunity, with zero direct Home benefit.

Home cover images are already mostly 480px WebP; Tau explicitly uses an 800px WebP. `application-v2/home.mjs:44–56` builds every shelf's IMG with decoding=async and no loading=lazy. Below-fold / horizontally off-screen covers may download before being viewed. The Core Home tile has a responsive WebP source and JPG fallback. Two PNG header logos total 117,078 raw bytes (home.mjs:19–27). Home's background itself consists of CSS gradients, not a bitmap. Native image laziness alone will not save bytes already forced into mandatory precache.

Mandatory images include inactive Tyranids fallback JPEG (197,170 bytes; current Home uses WebP), AM logo (132,575 bytes), two Core/Tyranid JPG fallbacks, 480px covers and PWA icons. Whether each can leave mandatory precache depends on the promised offline view/install behavior; do not remove them solely by filename. In particular, a 480px Tau cover is precached while Home requests 800px.

There is **no downloadable Home webfont**: no @font-face, woff/ttf or external font service in Home/shell styles or runtime package. home.css:11 names Inter but falls back to system sans; headings use Georgia and small labels use system monospace. A font preload currently has no actual font URL to accelerate. CSS preloading may avoid a dependent stylesheet round trip, but it is not a solution to the mandatory install gate.

## Proposal-only priorities and risk

1. Stop placing all non-Home preparation before first useful Home, or shrink the initial mandatory core and prepare the rest after display. Highest structural potential: 56 mandatory four-request batches currently precede all app code. **M/L**, high update/offline test surface. Preserve the first-install offline contract or ask the owner to define that Home can be usable while offline preparation continues; show an explicit accurate pending state. Do not silently weaken old-to-new version coherence or working-screen update confirmation.
2. Avoid redownloading already verified current-publication code/JSON online when traces show an actual repeated network body. **M**, update/integrity sensitive; retain uncached version oracle and reject mixed/stale bodies, cover old-to-new update and offline controls. Cold post-precache duplicate module loads and repeated book/native JSON fetches are candidates. Do not credit a warm Home code-download saving when Chromium already reports module resource-cache hits; that saving is zero in the calibration pilot. The remaining Home bootstrap/JSON requests are much smaller. Exact seconds must come from counted wire bodies and critical paths in the main measured waterfall.
3. Make actual Home code smaller by deferring Army Book mounting/personal and global-glossary presentation imports until their destination. **M**, navigation/startup/offline dependency tests. Current eager closure is 54 modules plus all nine passport JSON inputs. This can improve warm/post-install Home; if mandatory precache remains unchanged it does not remove that earlier install gate.
4. Defer noncritical precache images and lazily request off-screen shelf covers together, keeping necessary offline/installation images or explicit owner approval. **S/M**, low gameplay risk but offline visual/install-quality risk. First direct DG book opening currently requests all 32 PNG unit images (22.245 MB bodies); defer unviewed card art or convert it to measured equivalent-quality WebP/AVIF as a separate book-opening proposal. Home benefit is zero. Full-book search/navigation/offline visual behavior must be preserved. Body-transfer floor is 19.77 s Fast / 111.23 s Slow for the existing PNG group; savings require a real conversion/defer control and cannot be credited in full to interactive readiness.
5. Use one lazy glossary corpus with an adapter for Core's classic iframe consumer. **M/L**, exact article/source parity, Core popup/route and offline migration tests. Home gain zero; a user opening both existing representations can avoid about 1.67–1.94 MB gzip-estimate transfer and one large parse/cache body. Existing corpus scripts cannot simply be removed while Core still reads the global.
6. Split large book payloads by view and preserve one source of truth. **L**, broad projection/import/source binding/offline tests and A/B required; potentially valuable on cold first-book opens, but the raw 23 MB SM payload is only about 1.23 MB in gzip6 and some roster inputs still need global facts. Do not invent a numeric speed promise without real headers and parsed/render timings.
7. Preload critical Home CSS or inline a small reviewed above-fold slice. **S/M**, style/currentness and CSP/cache tests; likely sub-second RTT-scale benefit. No font preload is indicated by the current asset inventory. Reordering the existing four-request install batches can improve perceived progress only after the startup gate policy changes.

All are proposals only. Required constraints remain: Safari 15.4+, preserved old-site update path, no mixed publication, saved-roster retention, and no loss of promised offline behavior without an explicit owner decision. The parent report should replace model estimates with actual median timings and avoid adding overlapping benefits.
