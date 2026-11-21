# Load audit v1 — 21 November 2026

Read-only audit of source **8579a7a77c7f5e8dad291afc11b27aab3cd9d73a** and the live Pages runtime. No application code, book data, tests, cache policy, branch used for production, or running owner preview was changed. No QA/pre-FF suite was run.

## Findings that matter first

On live GitHub Pages, cold Home is interactive in **26.36 s on Fast 4G** and **34.72 s on Slow 4G**; the corresponding already-installed warm visits are **0.87 / 1.00 s**. Each figure is the median of three sequential observations. FCP is mostly the Loading shell, not a usable library.

Home still waits for the **whole mandatory offline package** before importing application boot. Reducing raw precache megabytes alone has not removed this gate or its 56 sequential four-request batches. Large glossary and book payloads are not downloaded by Home. A separate book-opening issue is that direct DG creates all unit-image nodes; many PNG bodies compete on the first visit even though there is no explicit image-load await.

Use [WATERFALL.html](WATERFALL.html) offline to inspect top 20 actual HTTP requests by bytes and by duration for **every one of the 144 observations**. The complete chronological ledger is [requests.csv](tables/requests.csv); [medians.csv](tables/medians.csv) has all 48 groups; [observations.csv](tables/observations.csv) preserves individual samples.

## Integrity, scope and measurement method

| Item | Result |
| --- | --- |
| Source | 8579a7a77c7f5e8dad291afc11b27aab3cd9d73a |
| Live release | e3db1b345eca989436eea7af758900eee7795203 |
| Runtime content SHA-256 | 0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909 |
| Runtime revision | d08e23b961b6f507 |
| Fresh clean source package | 456 manifest runtime files; 457 physical files including manifest; 282,982,284 bytes |
| Package verification | Normal runtime packager and --check PASS; no production file edited |
| Live verification | Manifest content SHA agrees; 20 largest actual GET responses decoded and SHA-checked against the clean package |
| Browser | Playwright 1.61.1 controlling installed Chromium-based Chrome 154.0.8037.58; mobile Pixel 7 context, viewport 390 × 844 |
| Matrix | 2 origins × 3 networks × 4 scenarios × 3 repetitions × cold/warm = 144 observations; 72 independent fresh profiles |
| Scheduling | One browser trial at a time; no concurrent test/build/browser timing workload; no CPU throttling |
| Local origin | Dedicated loopback HTTPS + HTTP/2, gzip level 6 text, unchanged runtime bytes; owner preview and TLS configuration untouched |
| Live origin | https://xypmapwnz.github.io/warhammer-rules-complete-preview/; real TLS, HTTP/2, Pages compression/cache headers |

Each cold observation uses a new Chrome process/profile and an empty browser/context cache: **browser-cold, not necessarily CDN-cold**. Its paired warm observation is an immediate reload in the **same Chrome process and profile after the cold visit settles**, with the SW active and memory cache retained; it is not a next-day visit or browser restart. DG roster cold includes opening the native roster route and importing the SHA-pinned real owner DG v37.25 fixture. Warm roster is reloading that saved roster, not importing twice. Direct book entries are cold deep links, not clicking a book after a paid-for Home load. The audit does not emulate CPU speed or prove physical-phone/Safari timing.

One shared CONNECT proxy limits **all page, service-worker and browser-owned origin traffic together**, without intercepting TLS. Fast 4G is 9,000,000 bit/s, added modeled RTT 170 ms; Slow 4G is 1,600,000 bit/s, added modeled RTT 150 ms. Unlimited uses the same relay without artificial pacing/delay. Live results include the real PC-to-Pages connection in addition to the added cellular model. CDN cache was not purged; normal HIT/MISS/Age headers were retained. This is not an assertion that every player's radio/CDN path has these timings.

### Accepted transport calibration

| Profile | Median short-fetch ms | Shared page + SW TLS bytes | Elapsed ms | Wire-only lower bound ms |
| --- | --- | --- | --- | --- |
| fast4g | 170.4 | 1,441,167 | 1477 | 1281.0 |
| slow4g | 155.1 | 1,441,167 | 7391 | 7205.8 |

The simultaneous large page/SW requests returned the expected 6,530,013 decoded bytes each. Their combined traffic stayed under one cap. Windows timer compensation is explicit in the recipe; achieved short-request RTT is measured rather than assumed from timer arguments. Calibration is in [CALIBRATION.json](CALIBRATION.json). Earlier incomplete/prototype runs are listed in [EXCLUDED_RUNS.json](EXCLUDED_RUNS.json) and are excluded from all main medians.

During final accounting, the original local DG slice exposed an **audit-origin defect**: Node's default HTTP/2 queued-session memory budget rejected some PNG streams with RST_STREAM 11 (ENHANCE_YOUR_CALM), unlike real Pages. Only the dedicated observation server setting maxSessionMemory was raised from 10 to 128; runtime bytes, network shaper, app and owner's preview were unchanged. All **18 local DG-book observations** were rerun/replaced, including unlimited controls; the other 126 original rows were retained. See [ACCEPTED_MATRIX_PROVENANCE.json](ACCEPTED_MATRIX_PROVENANCE.json), [H2_LIMIT_DIAGNOSIS.json](H2_LIMIT_DIAGNOSIS.json) and the [official Node HTTP/2 option description](https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler). This is an instrumentation correction, not an application optimization. No live sample was dropped, including the 18.595-second unlimited Home and 55.278-second Slow Home outliers.

**Accounting:** actual HTTP sends and HTTP/2 DATA payloads come from Chromium NetLog, including browser-owned SW update checks absent from page CDP. Encoded bytes exclude HTTP headers, framing and TLS; decoded bytes are only the representations actually received over the network. 304/204/HEAD have zero body. Outer page responses delivered through SW/cache are not added again. Proxy TLS counters are separate in the CSV. NetLog byte events also count partial responses before readiness. All export paths/query keys/headers are allowlisted; no imported roster text, cookies, credentials or raw browser profiles/NetLogs are published.

FCP is the browser paint mark; useful DOM is the first expected library/book/roster DOM; interactive readiness waits for native application/roster readiness and the Loading marker to disappear. Offline time is SW activated with all **221 expected mandatory cache keys verified**. Warm offline time 0 means it was already installed before reload. Background is observed until 750 ms with no tracked request or queued proxy bytes, with a five-minute safety ceiling. Interactive and network-settled times are separate. Metric medians are independent and must not be summed as though they describe one trial.

## Cold Home: complete median table

| Origin / network | FCP s | Useful DOM s | Interactive s (min–max) | Offline s | HTTP requests | Encoded / decoded MB | Before / after ready MB |
| --- | --- | --- | --- | --- | --- | --- | --- |
| local / unlimited | 0.13 | 0.49 | 0.55 (0.52–0.61) | 0.42 | 296 | 2.737 / 6.452 | 2.737 / 0.000 |
| local / fast4g | 0.37 | 22.38 | 22.82 (22.81–22.84) | 21.24 | 296 | 2.737 / 6.452 | 2.735 / 0.002 |
| local / slow4g | 0.34 | 29.95 | 31.53 (31.47–31.88) | 27.79 | 296 | 2.737 / 6.452 | 2.735 / 0.002 |
| live / unlimited | 0.29 | 6.30 | 6.37 (6.01–18.59) | 5.79 | 296 | 2.756 / 6.461 | 2.558 / 0.198 |
| live / fast4g | 0.50 | 26.13 | 26.36 (26.20–26.47) | 24.80 | 296 | 2.756 / 6.461 | 2.542 / 0.214 |
| live / slow4g | 0.61 | 34.48 | 34.72 (33.80–55.28) | 32.35 | 296 | 2.756 / 6.461 | 2.477 / 0.279 |

## Warm Home: complete median table

| Origin / network | FCP s | Useful DOM s | Interactive s (min–max) | Offline s | HTTP requests | Encoded / decoded MB | Before / after ready MB |
| --- | --- | --- | --- | --- | --- | --- | --- |
| local / unlimited | 0.03 | 0.04 | 0.09 (0.08–0.09) | 0.00 | 14 | 0.033 / 0.150 | 0.033 / 0.000 |
| local / fast4g | 0.20 | 0.56 | 0.74 (0.72–0.74) | 0.00 | 16 | 0.033 / 0.150 | 0.033 / 0.000 |
| local / slow4g | 0.19 | 0.64 | 0.80 (0.80–0.81) | 0.00 | 16 | 0.033 / 0.150 | 0.033 / 0.000 |
| live / unlimited | 0.06 | 0.15 | 0.19 (0.19–0.23) | 0.00 | 15 | 0.034 / 0.150 | 0.034 / 0.000 |
| live / fast4g | 0.23 | 0.66 | 0.87 (0.86–0.88) | 0.00 | 15 | 0.034 / 0.150 | 0.034 / 0.000 |
| live / slow4g | 0.23 | 0.78 | 1.00 (1.00–1.01) | 0.00 | 15 | 0.034 / 0.150 | 0.034 / 0.000 |

## Direct books and roster: complete median table

| Origin / network | Scenario / cache | FCP s | Interactive s (min–max) | Offline s | HTTP requests | Encoded / decoded MB | Settled observation s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| local / unlimited | dg-book / cold | 0.19 | 1.85 (1.76–1.87) | 0.41 | 367 | 26.769 / 46.859 | 2.63 |
| local / unlimited | dg-book / warm | 0.07 | 1.31 (1.26–1.35) | 0.00 | 23 | 1.486 / 17.608 | 2.08 |
| local / unlimited | sm-book / cold | 0.18 | 4.24 (4.22–4.36) | 0.40 | 338 | 5.751 / 50.492 | 5.00 |
| local / unlimited | sm-book / warm | 0.12 | 3.93 (3.73–3.95) | 0.00 | 25 | 3.018 / 43.780 | 4.70 |
| local / unlimited | dg-roster / cold | 0.18 | 1.72 (1.71–1.76) | 0.40 | 335 | 4.051 / 24.140 | 2.48 |
| local / unlimited | dg-roster / warm | 0.03 | 1.12 (1.10–1.16) | 0.00 | 22 | 1.486 / 17.608 | 1.89 |
| local / fast4g | dg-book / cold | 0.37 | 26.50 (26.44–26.54) | 21.05 | 367 | 26.769 / 46.859 | 47.37 |
| local / fast4g | dg-book / warm | 0.23 | 3.97 (3.96–4.01) | 0.00 | 25 | 1.486 / 17.608 | 4.74 |
| local / fast4g | sm-book / cold | 0.37 | 30.40 (30.38–30.41) | 21.05 | 338 | 5.751 / 50.492 | 31.28 |
| local / fast4g | sm-book / warm | 0.21 | 7.74 (7.69–7.87) | 0.00 | 25 | 3.018 / 43.780 | 8.51 |
| local / fast4g | dg-roster / cold | 0.37 | 26.41 (26.40–26.43) | 21.03 | 335 | 4.051 / 24.140 | 27.18 |
| local / fast4g | dg-roster / warm | 0.20 | 3.81 (3.75–3.81) | 0.00 | 24 | 1.486 / 17.608 | 4.58 |
| local / slow4g | dg-book / cold | 0.35 | 40.73 (40.69–40.73) | 28.03 | 367 | 26.769 / 46.859 | 155.19 |
| local / slow4g | dg-book / warm | 0.24 | 9.95 (9.93–10.01) | 0.00 | 25 | 1.486 / 17.608 | 10.71 |
| local / slow4g | sm-book / cold | 0.35 | 50.92 (50.74–51.04) | 27.88 | 338 | 5.751 / 50.492 | 52.45 |
| local / slow4g | sm-book / warm | 0.20 | 20.20 (20.07–20.21) | 0.00 | 25 | 3.018 / 43.780 | 20.97 |
| local / slow4g | dg-roster / cold | 0.34 | 40.60 (40.57–40.70) | 27.91 | 335 | 4.051 / 24.140 | 41.37 |
| local / slow4g | dg-roster / warm | 0.18 | 9.82 (9.77–9.83) | 0.00 | 24 | 1.486 / 17.608 | 10.59 |
| live / unlimited | dg-book / cold | 0.17 | 7.48 (7.11–7.77) | 4.99 | 367 | 26.885 / 46.868 | 9.55 |
| live / unlimited | dg-book / warm | 0.07 | 1.61 (1.57–1.63) | 0.00 | 22 | 1.583 / 17.608 | 2.37 |
| live / unlimited | sm-book / cold | 0.17 | 11.96 (9.97–12.27) | 6.44 | 338 | 5.978 / 50.501 | 12.73 |
| live / unlimited | sm-book / warm | 0.08 | 4.44 (4.27–5.02) | 0.00 | 24 | 3.225 / 43.780 | 5.21 |
| live / unlimited | dg-roster / cold | 0.16 | 8.56 (7.40–9.90) | 5.92 | 334 | 4.167 / 24.149 | 9.33 |
| live / unlimited | dg-roster / warm | 0.06 | 1.62 (1.52–1.63) | 0.00 | 22 | 1.583 / 17.608 | 2.39 |
| live / fast4g | dg-book / cold | 0.52 | 30.67 (30.19–30.86) | 24.84 | 367 | 26.885 / 46.868 | 51.50 |
| live / fast4g | dg-book / warm | 0.27 | 4.29 (4.24–4.31) | 0.00 | 24 | 1.583 / 17.608 | 5.06 |
| live / fast4g | sm-book / cold | 0.52 | 34.35 (34.31–35.15) | 24.43 | 338 | 5.978 / 50.501 | 35.23 |
| live / fast4g | sm-book / warm | 0.24 | 8.22 (8.18–10.82) | 0.00 | 24 | 3.225 / 43.780 | 8.98 |
| live / fast4g | dg-roster / cold | 0.52 | 30.31 (29.97–35.81) | 24.44 | 334 | 4.167 / 24.149 | 31.07 |
| live / fast4g | dg-roster / warm | 0.23 | 4.17 (4.14–4.26) | 0.00 | 24 | 1.583 / 17.608 | 4.93 |
| live / slow4g | dg-book / cold | 0.51 | 44.39 (44.36–45.48) | 31.13 | 367 | 26.885 / 46.868 | 158.88 |
| live / slow4g | dg-book / warm | 0.28 | 12.18 (11.72–13.24) | 0.00 | 32 | 1.640 / 17.819 | 12.96 |
| live / slow4g | sm-book / cold | 0.50 | 56.37 (56.24–59.31) | 32.02 | 338 | 5.978 / 50.501 | 58.01 |
| live / slow4g | sm-book / warm | 0.25 | 21.85 (21.66–24.01) | 0.00 | 25 | 3.226 / 43.783 | 22.73 |
| live / slow4g | dg-roster / cold | 0.50 | 45.16 (44.54–46.06) | 31.83 | 334 | 4.167 / 24.149 | 45.93 |
| live / slow4g | dg-roster / warm | 0.24 | 10.76 (10.75–10.76) | 0.00 | 24 | 1.583 / 17.608 | 11.52 |

| Origin / network | DG cold roster import click → ready s | Cold route + import s | Warm saved-roster reload s |
| --- | --- | --- | --- |
| local / unlimited | 0.08 | 1.72 | 1.12 |
| local / fast4g | 0.07 | 26.41 | 3.81 |
| local / slow4g | 0.08 | 40.60 | 9.82 |
| live / unlimited | 0.08 | 8.56 | 1.62 |
| live / fast4g | 0.08 | 30.31 | 4.17 |
| live / slow4g | 0.08 | 45.16 | 10.76 |

### Bytes before useful readiness versus background

| Live Slow 4G scenario / cache | Encoded before ready MB | Encoded after ready MB | Total encoded MB | Interactive / settlement s |
| --- | --- | --- | --- | --- |
| home / cold | 2.477 | 0.279 | 2.756 | 34.72 / 37.02 |
| home / warm | 0.034 | 0.000 | 0.034 | 1.00 / 1.77 |
| dg-book / cold | 4.210 | 22.675 | 26.885 | 44.39 / 158.88 |
| dg-book / warm | 1.640 | 0.000 | 1.640 | 12.18 / 12.96 |
| sm-book / cold | 5.818 | 0.160 | 5.978 | 56.37 / 58.01 |
| sm-book / warm | 3.226 | 0.000 | 3.226 | 21.85 / 22.73 |
| dg-roster / cold | 4.167 | 0.000 | 4.167 | 45.16 / 45.93 |
| dg-roster / warm | 1.583 | 0.000 | 1.583 | 10.76 / 11.52 |

The median columns are independent. Use an individual observation for an exact before+after=total equation. Encoded payload already in progress is split at the readiness boundary using actual H2 DATA timestamps; counting only completed responses would understate the first-screen cost.

## First-show critical path and repeated work

1. Root redirect/document, offline helper and SW registration start. The visible initial Loading paint is not the library.
2. The worker imports/checks the revision and downloads the entire 221-key mandatory inventory. service-worker.js:4,19–33 uses four parallel requests **within a sequential batch loop**; every response is hash-checked and stored. Activation follows that successful preparation.
3. v2/app.html:6 awaits WHOfflineStatus.ready before dynamic boot. offline-status.js:167–184,294–318 releases that promise only for the accepted active/current package. This is a real boot dependency, not just concurrent background precaching.
4. Home boot's eager module closure contains 54 modules (729,534 raw bytes), and keywords.mjs:6–16 eagerly fetches nine passport JSONs. Home then awaits small generated source metadata. Some modules verified during install are actually fetched again when boot imports them; warm Chromium resource-cache hits must not be counted as additional network bodies.
5. Direct books additionally await the lazy full source catalog, app-presentation/native roster inputs, then build the initial continuous book DOM. DG constructs unit image nodes as part of that rendering; they contend for bandwidth but the code does not explicitly await all images.

Selected exact transactions from the median-ready live Slow 4G Home observation **live-slow4g-home-3-cold**:

| Path | Actor | Start / finish ms | Encoded bytes |
| --- | --- | --- | --- |
| v2/app.html | page | 595 / 800 | 834 |
| service-worker.js | service-worker | 1054 / 1262 | 4,420 |
| glossary/generated/cache-revision.js | service-worker | 1264 / 1591 | 25,944 |
| glossary/generated/cache-revision.js | service-worker | 1594 / 1916 | 25,944 |
| books/shared/application-v2/generated/source-metadata.v1.json | service-worker | 18676 / 18889 | 404 |
| v2/app.html | service-worker | 31728 / 31941 | 834 |
| v2/boot.mjs | service-worker | 32144 / 32344 | 353 |
| v2/boot.mjs?wh-pwa=d08e23b961b6f507 | service-worker | 32348 / 32561 | 353 |
| books/shared/application-v2/generated/source-metadata.v1.json | service-worker | 34476 / 34685 | 404 |

The full source/dependency trace is [INVENTORY.md](inventory/INVENTORY.md) and [HOME_STATIC_GRAPH.json](inventory/HOME_STATIC_GRAPH.json). Early timestamp alone does not prove a blocking dependency: mandatory non-Home files block collectively by install policy; images have no explicit load await. The four-request schedule, TLS/H2/origin response behavior, hashing/storage and module dependencies overlap, so an exact one-number causal split is not claimed.

Actual repeated HTTP URLs within that cold Home observation, largest byte totals first:

| Path | HTTP requests | Positive-body transfers | Total encoded bytes | Start times ms |
| --- | --- | --- | --- | --- |
| books/shared/army-book-app-v2/datasheet-v1.mjs | 2 | 2 | 68,410 | 20349;33126 |
| glossary/generated/cache-revision.js | 2 | 2 | 51,888 | 1264;1594 |
| books/shared/army-book-app-v2/runtime.mjs | 2 | 2 | 38,028 | 23588;32791 |
| books/shared/army-book-app-v2/roster.mjs | 2 | 2 | 28,418 | 23185;33126 |
| books/shared/army-book-app-v2/global-glossary-content.mjs | 2 | 2 | 27,594 | 20814;33881 |
| books/shared/army-book-app-v2/personal.mjs | 2 | 2 | 27,236 | 22302;32793 |
| books/shared/army-book-app-v2/cosmetics.mjs | 2 | 2 | 21,790 | 19930;33128 |
| books/shared/source-refs-v2/source-refs.mjs | 2 | 2 | 20,820 | 28116;33125 |
| books/shared/roster-v2/context.mjs | 2 | 2 | 17,672 | 25138;33232 |
| books/shared/offline-status.js?wh-pwa=d08e23b961b6f507 | 2 | 2 | 13,728 | 806;24116 |
| books/shared/army-book-app-v2/navigation-v1.mjs | 2 | 2 | 11,834 | 21775;33126 |
| books/shared/army-book-app-v2/navigation-v1-controller.mjs | 2 | 2 | 11,560 | 21557;33853 |

See [repeated-requests.csv](tables/repeated-requests.csv) for exact repeated URLs and [same-file-requests.csv](tables/same-file-requests.csv) for physical files across different query keys. Root/index and versioned helper query URLs remain separate cache keys. The generated version-check nonce is preserved rather than collapsing distinct oracle URLs. The intentionally uncached revision oracle must not simply be removed. Browser-owned 304 update checks are counted as requests but zero body; cached module delivery is not a wire download.

Largest verified **warm re-downloads of a path already transferred in its cold pair**, median-ready live Slow 4G samples:

| Scenario | Path | Warm encoded bytes | HTTP | Cache-Control |
| --- | --- | --- | --- | --- |
| home | books/shared/offline-status.js?wh-pwa=d08e23b961b6f507 | 6,864 | 200 | max-age=600 |
| home | service-worker.js | 4,420 | 200 | max-age=600 |
| home | books/dark-angels/book.config.json | 3,860 | 200 | max-age=600 |
| home | books/blood-angels/book.config.json | 3,215 | 200 | max-age=600 |
| dg-book | books/shared/source-refs-v2/source-catalog.json | 765,720 | 200 | max-age=600 |
| dg-book | books/death-guard/v2/generated/app-presentation.json | 354,370 | 200 | max-age=600 |
| dg-book | books/death-guard/v2/generated/rule-contract-effective.json | 175,765 | 200 | max-age=600 |
| dg-book | books/death-guard/v2/generated/rule-contract-effective.json | 175,765 | 200 | max-age=600 |
| sm-book | books/space-marines/v2/generated/app-presentation.json | 1,290,287 | 200 | max-age=600 |
| sm-book | books/shared/source-refs-v2/source-catalog.json | 765,720 | 200 | max-age=600 |
| sm-book | books/space-marines/v2/generated/roster-import.json | 528,919 | 200 | max-age=600 |
| sm-book | books/space-marines/v2/generated/roster-import.json | 528,919 | 200 | max-age=600 |
| dg-roster | books/shared/source-refs-v2/source-catalog.json | 765,720 | 200 | max-age=600 |
| dg-roster | books/death-guard/v2/generated/app-presentation.json | 354,370 | 200 | max-age=600 |
| dg-roster | books/death-guard/v2/generated/rule-contract-effective.json | 175,765 | 200 | max-age=600 |
| dg-roster | books/death-guard/v2/generated/rule-contract-effective.json | 175,765 | 200 | max-age=600 |

The full list is [warm-redownloads.csv](tables/warm-redownloads.csv). service-worker.js:103–105 treats .mjs/.css/.json as mutable when a request reaches it, with network-first publication verification; online fetches can therefore download large JSON again despite a cached offline copy. Chromium can satisfy some module requests from its own resource cache before SW dispatch, so a claim that all warm JS is always downloaded would be false.

## Mandatory precache inventory

The **packaged/stamped** inventory is 221 URLs / 219 unique paths, **5,139,186 URL-summed raw bytes**, **5,113,769 unique raw bytes**, and **2,148,305 unique gzip6 estimate bytes**. These are not all the same denominator. Two pairs share paths but have different URL keys: root/index; and two offline helper queries. The source checkout's seed cache-revision.js is not the shipped inventory: the normal Pages packager stamps the package, and that package was measured.

| Group | URL keys | Unique files | Unique raw MB | Unique gzip6 estimate MB |
| --- | --- | --- | --- | --- |
| HTML / manifest / other | 4 | 3 | 0.003 | 0.001 |
| Images | 18 | 18 | 1.292 | 1.282 |
| Book passport JSON | 9 | 9 | 0.118 | 0.023 |
| JS | 137 | 136 | 1.453 | 0.428 |
| CSS | 20 | 20 | 0.154 | 0.040 |
| Core reader | 31 | 31 | 2.045 | 0.359 |
| Small source metadata JSON | 1 | 1 | 0.001 | 0.000 |
| Glossary runtime helper JS | 1 | 1 | 0.049 | 0.013 |

No full book app-presentation, full glossary corpus, or full source catalog is mandatory. Core reader code/HTML/search support and fallback/cover images are included although Home does not need all of them for its first viewport. The inventory identifies **137 URL keys / 3,371,973 raw URL-summed bytes** outside its conservative eager-Home/support/asset subset. That is a candidate set for review, **not a safe deletion list**: e.g. Core offline functionality and PWA install artwork still have contracts.

[precache.csv](inventory/precache.csv) classifies every URL by consumer, Home use/defer candidate and worker policy. Group names are operational, not a claim that the entire group can leave offline preparation. Moving data out of the initial gate must retain an accurate pending/offline-ready indication and require owner approval if the first-visit offline promise changes.

## Largest payloads and actual Pages compression

All 20 sampled large text resources were served by Pages over HTTP/2 with **gzip**, not Brotli. Pages typically sent Cache-Control: max-age=600 and weak ETags; exact safe headers/Age/HIT-MISS are in [PAGES_COMPRESSION.json](PAGES_COMPRESSION.json). Local gzip6 values are estimates and differ from real Pages output; use measured live encoded bytes for cellular transfer estimates.

| Runtime file | Decoded raw MB | Live encoded MB | Encoding |
| --- | --- | --- | --- |
| glossary/v2/generated/index.en.json | 31.170 | 2.146 | gzip |
| books/space-marines/v2/generated/app-presentation.json | 23.277 | 1.290 | gzip |
| glossary/v2/generated/index.en.js | 23.202 | 1.758 | gzip |
| books/dark-angels/v2/generated/app-presentation.json | 19.763 | 1.140 | gzip |
| books/chaos-space-marines/v2/generated/app-presentation.json | 19.601 | 0.954 | gzip |
| books/blood-angels/v2/generated/app-presentation.json | 19.418 | 1.122 | gzip |
| books/tyranids/v2/generated/app-presentation.json | 8.748 | 0.468 | gzip |
| books/chaos-space-marines/v2/generated/roster-runtime.json | 7.827 | 0.643 | gzip |
| books/adeptus-mechanicus/v2/generated/app-presentation.json | 7.645 | 0.426 | gzip |
| books/tau-empire/v2/generated/app-presentation.json | 7.092 | 0.429 | gzip |
| books/space-marines/v2/generated/roster-import.json | 6.799 | 0.529 | gzip |
| books/shared/source-refs-v2/source-catalog.json | 6.530 | 0.766 | gzip |
| books/death-guard/v2/generated/app-presentation.json | 6.112 | 0.354 | gzip |
| books/dark-angels/v2/generated/roster-import.json | 6.104 | 0.494 | gzip |
| books/blood-angels/v2/generated/roster-import.json | 5.901 | 0.476 | gzip |
| books/emperors-children/v2/generated/app-presentation.json | 5.437 | 0.349 | gzip |
| books/adeptus-mechanicus/v2/generated/roster-runtime.json | 4.669 | 0.276 | gzip |
| books/tau-empire/v2/generated/roster-import.json | 3.544 | 0.273 | gzip |
| books/emperors-children/v2/generated/roster-attachments.json | 3.507 | 0.225 | gzip |
| books/tyranids/v2/generated/roster-runtime.json | 3.064 | 0.239 | gzip |

The 31.17 MB glossary JSON and 23.20 MB classic JS are the **same semantic corpus in two currently active encodings**, produced together at glossary/v2/tools/build-glossary-v2.mjs:18–19. The global glossary fetches JSON lazily; Core chapter HTML loads the classic global wrapper in its iframe. Neither is downloaded on Home. Unifying them has **zero direct Home gain**, and needs a reviewed adapter/source/article parity for both consumers; deleting one would break a real path.

The 6.53 MB source catalog is now lazy, first awaited for a book, not Home. A 23 MB raw SM app payload is about 1.29 MB over Pages gzip, not a 23 MB mobile transfer. Book JSON splitting helps only if it removes bytes/parse work from the required view; gzip already captures much repeated text. Simply fetching two large inputs concurrently does not double the single cellular bandwidth budget.

### Images and fonts

Nine book cover images total **1,652,004 raw bytes**, not 23 MB of Home backgrounds. Home uses mostly 480-pixel WebP, with an 800-pixel Tau WebP (119,340 bytes). Two Home header logos total 117,078 raw bytes. The Home background is CSS gradients. Home image nodes are decoding=async but lack loading=lazy; below-fold covers can download, and some fallback art is also mandatory. Changing an image to lazy does not avoid a mandatory precache transfer of the same resource.

The large ~23 MB group is **32 DG unit PNGs (22,245,156 bytes)**. Direct full-book rendering requests their bodies; the accepted local groups use the corrected observation origin described above. Unit images are not mandatory. The current presenter assigns src before loading=lazy; which browser/layout mechanism is decisive was not isolated, so no speculative code fix was applied. There is no explicit await of image completion. Details: [DG_IMAGE_EAGER_AUDIT.json](inventory/DG_IMAGE_EAGER_AUDIT.json). The rejected local streams in the excluded original slice must not be misdiagnosed as ordinary lazy cancellation or as a live-site defect.

Actual median-ready live Slow 4G cold-book image traffic:

| Scenario | Actual image HTTP requests | Image encoded MB | Image bytes received before ready MB |
| --- | --- | --- | --- |
| dg-book | 51 | 24.010 | 1.340 |
| sm-book | 19 | 1.452 | 1.292 |

All 22.245 MB would take at least **19.77 s Fast / 111.23 s Slow** for body transfer alone. These are transfer floors for the whole group, **not predicted interactive-time savings**. Deferring off-screen art or converting it after quality review can reduce contention/background cost. It does not speed Home.

There is **no downloadable Home font** or @font-face in the runtime package. Inter is a CSS family name with system fallback; headings use Georgia/system fonts. A font preload has no existing critical font URL to accelerate. Responsive WebP already exists for most Home covers; a blanket “convert all JPEGs” proposal would overstate benefit.

## Why a screen exceeds five seconds

| Cause | Evidence and limit |
| --- | --- |
| Whole offline install gates first usable UI | Live cold Home ready 26.36 / 34.72 s Fast/Slow; activated/offline 24.80 / 32.35 s. This dominates, not FCP. |
| Sequential batches and non-Home mandatory resources | 56 batches of four with hash/store before the next batch; Core/support/fallback images included. RTT/wire/origin costs overlap; 56 × RTT is not a full prediction. |
| Post-install module graph and duplicate network work | 54 eager modules, nine passports; actual duplicate body transfers recorded above, while warm module resource-cache hits remain distinct. |
| Large book/native JSON and online revalidation policy | SM/DG cold and warm timings/bytes above; source catalog plus app/native inputs. Warm offline availability does not mean online reload is network-free. |
| Full-book render and image traffic | DG all-card construction starts unit-art downloads; bandwidth contention and CPU compete. CPU task/script deltas and long-task counts are in observations.csv; desktop emulation is not mobile CPU proof. |

## Comparison with the earlier ~22.75-second result

The 14 November preview report's **single** new-runtime Fast 4G Home observation was 22.75 s. Its actual packaged inventory was **203 URLs / 4,710,833 raw / 1,952,666 gzip-estimate bytes** (preview-v1-2026-11-14/REPORT.md:19–22,80,111). The later “11.7 → 5.1 MB” statement refers to a different intermediate inventory; it is not the old denominator of that timed 22.75-second sample. The current stamped package has 221 URL keys and ~2.15 MB gzip-estimated mandatory payload; it has not lost the install gate.

The old origin server capped compressed HTTP bodies at 9 Mbps and delayed each response by 170 ms; the primary audit now also shapes TLS/header traffic and bidirectional latency. To avoid attributing a transport-model change to application speed, a separate three-run current-package control replayed that earlier server-body/delay model:

| Series | Cold Home ready s | Warm Home ready s | Interpretation |
| --- | --- | --- | --- |
| 14 Nov old-model historical new package | 22.75 | not comparable | One observation; old runtime and old model |
| Current package / legacy-model control | 23.68 | 0.77 | Median of 3; separate from main matrix |
| Current package / shared CONNECT local model | 22.82 | 0.74 | Median of 3; calibrated transport |

This is not a controlled rerun of both historical and current packages under identical present-day host/CDN conditions. It supports the narrower conclusion that the startup gate remains; it does not establish a statistically isolated percentage regression/improvement since 14 November. Full control observations are in [legacy-tables](legacy-tables/medians.csv).

## Proposal-only schedule sensitivity

The following read-only model reuses each mandatory file's **observed four-way-load request duration**, changes only its hypothetical scheduling and enforces a total body-transfer floor. “Rolling four” starts the next file as soon as a slot is free rather than waiting for the other three in its batch. This keeps the concurrency ceiling at four. It is **not an implemented A/B**, nor a full simulation of new contention, hashing, Cache.put or progress signaling. A modeled saving is an experiment hypothesis, not a confidence interval or guarantee.

| Origin / network | Observed install span s | Model current batches4 s | Model rolling4 s | Model batches8 / 12 s |
| --- | --- | --- | --- | --- |
| local / unlimited | 0.34 | 0.31 | 0.25 | 0.17 / 0.11 |
| local / fast4g | 20.01 | 19.95 | 12.77 | 10.31 / 7.15 |
| local / slow4g | 26.36 | 26.32 | 18.54 | 15.09 / 11.22 |
| live / unlimited | 5.28 | 5.25 | 3.24 | 2.98 / 2.09 |
| live / fast4g | 23.20 | 23.16 | 14.81 | 11.92 / 8.20 |
| live / slow4g | 30.43 | 30.39 | 19.86 | 16.85 / 12.03 |

All 18 cold-Home inputs and the exact model are in [install-schedule-model.csv](tables/install-schedule-model.csv) and [INSTALL_MODEL.json](tables/INSTALL_MODEL.json). Between-batch stragglers are a scheduling opportunity; changing request order/concurrency can also change the durations, so retain the same offline inventory and verify any implementation separately.

## Proposal-only plan, ranked

All savings below are **model estimates, not implemented A/B wins**. Wire floors use the specified shared link; RTT/CPU/contention can overlap. Rows are not additive, especially the two install-gate proposals. No changes were made.

| Order / measure | Estimated Fast / Slow benefit | Size | Offline/update/test risk and decision |
| --- | --- | --- | --- |
| 1. Keep all 221 verified mandatory entries; first pilot a rolling four-slot queue, then consider batches8/12 | Fixed-duration model hypothesis for rolling4: **8.34 / 10.53 s** on live Fast/Slow. Plan for **0 to that modeled value**, not a guaranteed gain. The batch12 RTT-only illustration 37 × RTT = 6.29 / 5.55 s is neither a prediction nor an upper bound. Wire/CPU/contention can change the result. | S/M | Lowest policy-change surface: rolling4 keeps the current concurrency ceiling and all hashes/offline inventory/activation boundary. Preserve monotonic progress and fail-closed cancellation; test failure/retry, low-memory phone, old→new update and offline. Increasing to8/12 adds memory/network-pressure risk. |
| 2. First useful Home before full offline preparation, with a small coherent startup core and explicit “Preparing offline access…” state | Working hypothesis **~15–20 s / ~20–27 s** of current cold-Home wait. The measured activated/offline interval (24.80 / 32.35 s on live Fast/Slow) is a theoretical ceiling for bypassing that wait, not an achievable saving: a coherent startup subset still needs transfer/validation. Requires actual split/boot A/B. | M/L | Highest update/offline risk. Fresh-install fast path must never mix versions under an old controller. Preserve auto-update-at-Loading/working-screen confirmation and saved data. If offline is not immediately guaranteed at first usable Home, **explicit owner decision required**; complete the full offline preparation afterward. |
| 3. Stop fetching unviewed DG unit art during initial continuous-book mount; review equivalent-quality WebP/AVIF separately | **0 s Home.** Initial book ready target **0–3 s / 0–10 s**, uncertain without isolation; background/body saving can approach existing group's **19.77 / 111.23 s** wire floor if almost all 22.245 MB is deferred. These are different metrics. | S/M | Presentation/lazy layout and offline image availability; preserve book search/navigation/cards and verify before/after screenshots/actual requests. Do not change game facts. AVIF optional only with Safari-compatible WebP fallback. |
| 4. Reuse already verified bytes for one accepted publication; remove observed duplicate JSON/module body fetches while keeping a fresh version oracle | Home target **0.3–1.2 s / 0.5–2 s**. Book warm saving bounded by actual repeated bytes: 1 MB avoided = **0.89 / 5.00 s** body-only. Do not credit browser-cache hits as savings. | M | Version/currentness sensitive: no mixed catalog/runtime, retain hashes/oracle, old-site migration and offline. Do not change network-first blindly across revisions. |
| 5. Defer book-only module/factory/passport work on Home | Warm/post-install Home target **0.1–0.6 s / 0.2–1.5 s**; little cold gain if unchanged mandatory gate dominates. | M | Native registrations, import/context sharing, startup graph/precache/Safari tests. New startup files need manifest coverage. |
| 6. Split app-presentation/native inputs by required view, reuse shared decoded data | E.g. half a 1.29 MB SM payload avoided is **0.57 / 3.23 s** wire-only, plus unmeasured parse/render savings; shared source catalog is 0.766 MB live and cannot be discarded without its provenance consumers. | L | High projection/source-binding/roster correctness scope. Exact field parity, generated gate, native A/B and offline route controls. Minifying already-gzipped JSON alone offers much less. |
| 7. One glossary corpus plus adapter for Core iframe | **0 s Home.** User opening both consumers can avoid ~1.76–2.15 MB compressed = **1.56–1.91 / 8.79–10.73 s** wire-only, if the shared representation/cache is actually reused. | M/L | Exact articles/source refs/navigation/Core iframe/offline parity. Both current formats have real consumers; no deletion without adapter. |
| 8. Remove demonstrably unnecessary initial fallback/cover transfers, lazy off-screen Home artwork together | Rough Home transfer target **0.1–0.4 / 0.5–2 s**, depending on which measured visible/mandatory paths leave the critical set; overlaps gate work above. | S/M | Review offline/PWA icon/fallback promise; no automatic removal by extension. Home art is already mostly WebP, not the 23 MB DG PNG group. |
| 9. Preload a proven critical stylesheet; no font preload | RTT-scale discovery illustration: approximately **0–0.17 / 0–0.15 s** before origin scheduling/other delays; not a strict upper bound. **Font gain 0** without a downloadable font. | S | Verify no duplicate fetch/CSS flash and cache-revision handling; not a substitute for install-gate work. |

Do not use a service-worker policy change as an unreviewed “speed fix.” For every implementation candidate: repeat the same 3-run matrix, offline fresh/update startup, old→new publication path, saved DG/SM roster retention, startup graph/precache and normal game-state A/B. Safari **15.4+** remains required; no JSON import attributes or unsupported-only image/code path.

## Validation, publication and limits

- 144 accepted observations / 72 paired profiles / 48 median groups. Exactly repetitions 1,2,3 per group; all cold/warm pairs dimension-matched. The explicit 18-row local-origin replacement is documented above; no sample silently discarded.
- Not-settled observations: **0**. Incomplete Content-Length bodies: **0**. Uncaught page-exception observations: **0**. Application runtime-resource HTTP/failure rows: **0**. Ancillary implicit favicon findings: **72**. Transactions with byte events after the observation window: **0**. Inspect [SUMMARY.json](tables/SUMMARY.json) and request ledger for all records.
- The browser also attempts the origin-root /favicon.ico, outside the published project subpath. Pages returns 404; the local observation server returns 204, which Chromium can mark ERR_ABORTED. These ancillary attempts are included in request totals, have no application readiness dependency, and must not be confused with the valid explicit PWA icons or a failed book resource. No favicon fix was made.
- NetLog actual network requests supplement page/SW CDP rather than treating CDP cache delivery as network. Body/partial boundary checks are asserted; browser-owned update checks are counted. Local server counts are retained alongside measured counts for independent accounting.
- No physical mobile CPU/device benchmark, Safari run, optimization experiment, long-term aging/eviction study or production configuration change was performed. Three local repetitions describe this host/time, not population confidence intervals. CPU task/script counters cover the main renderer over the whole observation, including post-ready work; worker CPU is not separately attributed. Uncaught page exceptions were captured; console messages were not exhaustively recorded.
- Runtime packager verification was performed on a clean temporary checkout; no qa:pre-ff or application test suite was run. Read-only inventories and measurement/report recipes are evidence tooling only.
- Only the evidence branch codex/load-audit-evidence is to be published as one commit from the specified base. No merge or release. GitHub ref verification is recorded with the published evidence.
- Task-owned temporary browser profiles, runtime package and clean worktree are under **E:/Warhammer/qa-tmp/load-audit**. Cleanup is attempted after publishing; if automatic policy blocks it, that exact path is left for the owner and reported in chat. The owner's existing preview, TLS material, saved work and other task directories are outside this cleanup scope.

### Evidence map

- [All observations](tables/observations.csv), [all median groups](tables/medians.csv), [chronological actual HTTP requests](tables/requests.csv).
- [Offline waterfall viewer](WATERFALL.html), [top-20 source data for all observations](tables/WATERFALLS.json).
- [Repeated same-visit URLs](tables/repeated-requests.csv), [same physical files across URL keys](tables/same-file-requests.csv), [warm re-downloads](tables/warm-redownloads.csv), [traffic groups](tables/traffic-groups.csv).
- [Static inventory and producer/consumer references](inventory/INVENTORY.md), [every precache URL](inventory/precache.csv), [largest files](inventory/largest-files.csv), [all package files](inventory/package-files.csv).
- [Actual Pages compression and safe response headers](PAGES_COMPRESSION.json), [accepted calibration](CALIBRATION.json), [separate old-model control](legacy-tables/medians.csv).
- [Measurement design review](methodology/MEASUREMENT_REVIEW.md), [NetLog accounting pilot proof](methodology/NETLOG_PILOT_VALIDATION.json), [audit recipes](RECIPES/measure.mjs). Recommendations in the design review are distinguished from actual implemented calibration in this report.

STOP. No optimization implemented; only the evidence branch is authorized.
