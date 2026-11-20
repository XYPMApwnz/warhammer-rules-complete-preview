# Runtime package and cold-screen measurements

Compared the verified accepted9876164d package against b0aa1273b907020776dec41ca0466d646e5435e2. PERFORMANCE.json records full publication manifest hashes, content/cache revisions, all18 unchanged measured samples, request bodies and screen/storage hashes. No performance rejection threshold was invented; small increases are reported honestly.

Each of three lanes (Home, saved DG roster, saved SM roster) has three alternating repetitions per revision. Every measured sample uses a new Chromium process/profile/context, HTTP cache disabled, service workers blocked,390×844 viewport, unthrottled CPU and loopback HTTP. Responses are raw/uncompressed and no-store for both versions; gzip figures below are separately computed file sizes, not measured wire compression. Browser launch and save preparation are outside the timer. OS file cache was not flushed. This is not physical old-Safari/browser certification.

The fixed Home endpoint includes nine unique book cards, bootstrap/application.ready, recursively ready active styles including imports, fonts, decoded Home/header images, Sources caption and two animation frames. The direct saved-ROSTER endpoint includes the correct native book/service, restored complete snapshot, all unit articles, application/roster readiness, styles/fonts and two frames.

| Lane | Base median ms | Head median ms | Delta ms | Delta |
| --- | ---: | ---: | ---: | ---: |
| home | 502.111 | 505.149 | 3.039 | 0.61% |
| roster-dg | 860.012 | 896.393 | 36.381 | 4.23% |
| roster-sm | 1379.450 | 1413.846 | 34.395 | 2.49% |

Home requests the full catalog once on baseline and zero times on head; saved DG/SM roster requests it exactly once on each revision. Home response bodies drop from8202346 to1674951 bytes. Both real native roster saves were prepared once through the accepted baseline public import UI, then reused byte-identically by both revisions: DG ownerv37.25 (eight units) and the existing SMv37.3 export (three units). No roster/prices were fabricated. Native snapshots and both saved strings remain exact at every measured roster endpoint. Full seed JSON is temporary only; PERFORMANCE.json stores fixture/saved-value hashes.

## Package and mandatory precache sizes

All456 runtime bodies per revision were read/gzipped once at level9, with exact bytes checked against the publication manifest. Package totals also include PAGES_RUNTIME_MANIFEST.json; this is457 physical files versus456 runtime inventory files.

| Measure | Base | Head |
| --- | ---: | ---: |
| Package raw bytes | 282979450 | 282982284 |
| Package gzip bytes | 60920600 | 60921554 |
| Mandatory URLs | 222 | 221 |
| Mandatory URL-body raw bytes | 11666371 | 5139186 |
| Mandatory URL-body gzip bytes | 2847258 | 2153544 |
| Unique mandatory bodies raw | 11640954 | 5113769 |
| Unique mandatory bodies gzip | 2840173 | 2146459 |

The deployed worker consumes self.WH40K_PRECACHE from the published cache-revision file. The first diagnostic mistakenly read the legacy six-entry APP_SHELL fallback constant. Corrected totals use the actual published222/221-entry lists, asserting agreement with each package manifest. The already-computed per-body gzip table was reused; no large-file recompression or browser-sample replacement was needed for this statistics correction.

## Untimed cache probe and explicit method recovery

All18 measured samples finished and passed their noErrors() assertion **before** the first optional cache probe failed. The final head context then navigated DG/SM/Tau. The recipe incorrectly called snapshot() for empty Tau, which has no saved roster; the unchanged API correctly throws TypeError No roster. The initial pageerror is retained, including its stack through the test's waitForFunction predicate, in PERFORMANCE_INITIAL_PROBE_FAILURE.json/log and PERFORMANCE.json.initialProbeFailure.postMeasurementErrors. It was not silently ignored or reclassified as a successful measured sample.

The follow-up control in EMPTY_ROSTER_PROBE_CONTROL.json uses the accepted baseline package and an empty real Tau page. Initial navigation has state=null, no save, zero unit articles, one import input and zero pageerrors. Calling snapshot() inside an explicit catch returns the expected No roster with zero pageerrors. Deliberately calling the same invalid waitForFunction snapshot predicate reproduces the original exception **and the pageerror event**. The corrected empty-screen predicate does not create another error. Generic runtime.mjs and Tau roster-import.mjs are byte-identical between compared packages, and their exact hashes are recorded. Thus the event came from the invalid test probe, not new application navigation.

A fresh, corrected untimed head probe navigated DG (eight saved units), SM (three saved units) and Tau (empty import screen) with zero new pageerrors or failed requests. Full-catalog GET count remains1 before and after every transition. The18 original measured rows were retained byte-identically; their SHA256 is recorded, and no performance sample was rerun or selected to obtain a better median. The first correction attempt also mistakenly retained the original error array when checking the new probe; its log is preserved as PERFORMANCE_PROBE_INHERITED_ERROR.log. Final corrected probe output is PERFORMANCE_PROBE_CORRECTION.log.

All Chromium processes created by these recipes were closed. Production code and old tests were not modified by the measurements.

## Exact gzip settings and frozen input hashes

Every performance size row uses Node gzipSync(bytes,{level:9}); these are independent gzip bodies, not a tar/zip total or measured HTTP wire bytes. The source catalog is6530013 raw bytes, SHA256599f5bf8f9f08d53a7396d5b1bcd23a945262b3acc0b54d018dae5dfc274ffbe, unchanged in both packages. Its level9 gzip is694638 bytes. A single catalog-only level6 diagnostic reproduces the earlier inventory719107 bytes; no package recompression was performed. See CATALOG_GZIP_LEVELS.json.

Mandatory totals count each actual precache URL response body, including two duplicate-path URLs per revision (222URLs/220unique baseline,221/219head). Unique-body totals are separately reported. The gzip reduction693714 equals removed catalog694638 minus924 bytes net growth in other mandatory bodies. The raw reduction6527185 equals removed catalog6530013 minus2828 bytes net growth in other mandatory bodies. Whole-package size includes all456 runtime bodies plus the published manifest; lazily excluding the catalog from startup does not remove it from the package.

| Frozen input | Base | Head |
| --- | --- | --- |
| Feature SHA | 9876164de85f1e35aa2cf070a3eb9de662093980 | b0aa1273b907020776dec41ca0466d646e5435e2 |
| Manifest SHA256 | c55e488be85f5a45f9c82b86dd3a4fdec00ea83ccbbb65825afa7b8f50f7913a | 615a0834ea9032a19ae163acc4dd4454dc847fb574110849a0eb5a6ec4f1805c |
| Runtime content SHA256 | b1d38129d5e6b12ab5ce9a3b47525da33002e0117c6dd24a1f31e0d993bdf1ed | 0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909 |
| Allowlist SHA256 | e90ac7a73a43819a3886bc025c6f993f17e0995d1dfe955084c3e09601355354 | e90ac7a73a43819a3886bc025c6f993f17e0995d1dfe955084c3e09601355354 |
| Cache revision | d3117be5ab05b043 | d08e23b961b6f507 |

PERFORMANCE.json.sizes.base.files and .head.files contain all456 exact per-file runtime SHA256/byte/gzip records for each frozen publication, verified during the one-pass size scan. Seed source/saved hashes and screen storage hashes are in .seeds and every measured .rows entry. EMPTY_ROSTER_PROBE_CONTROL.json is the accepted-baseline contract proof for the post-measurement probe recovery; no measured row was modified.
