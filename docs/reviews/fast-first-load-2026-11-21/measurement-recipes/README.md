# Matched first-load measurement recipes

These are the executable recipes used for the completed matched measurements and queue experiments. Importing this directory does not launch a measurement. No old load-audit recipe or production source was edited. Run one browser/measurement/build job at a time. The completed series are measurements-base, measurements-after and queue6/queue8 Fast/Slow Home; raw timing receipts and calibrations are retained in their INDEX.json files locally, with reduced CSV in this review evidence.

## Inputs and output

- Source/fixture owner: pass `--source=<clean source or feature worktree>`.
- Served input: pass `--package=<already built runtime package>`; the runner never rebuilds or changes it.
- `--side=base` requires the accepted base runtime content SHA `0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909`.
- `--side=after` permits the feature manifest; use `--expected-content-sha=<SHA>` to freeze the exact feature package.
- Profiles/NetLogs: `E:/Warhammer/qa-tmp/fast-first-load/profile-*` (private; do not publish).
- Results: sibling evidence directories selected by `--folder=<unique name>`. Existing `INDEX.json` is never overwritten.
- Each full side is one local Pages-like HTTPS/H2/gzip6 origin, maxSessionMemory128, three networks, four scenarios, three repetitions and paired cold/warm: **72 rows / 36 fresh profiles / 24 median groups**.
- Warm means immediate reload in the same Chrome process after the cold trial's full offline preparation and network settlement. DG roster warm reloads the saved roster, not another import.

## Calibrate, smoke, then run each side sequentially

Commands below show the inputs and mode of the completed runs. Choose a fresh output folder when reproducing; existing observations must not be overwritten.

```powershell
node measurement-recipes/measure.mjs --side=base --package=E:/Warhammer/qa-tmp/fast-first-load/package-base --source=E:/Warhammer/qa-tmp/fast-first-load/base --folder=calibration-base --calibration-only
node measurement-recipes/measure.mjs --side=base --package=E:/Warhammer/qa-tmp/fast-first-load/package-base --source=E:/Warhammer/qa-tmp/fast-first-load/base --folder=pilot-base --pilot --fail-fast
node measurement-recipes/measure.mjs --side=base --package=E:/Warhammer/qa-tmp/fast-first-load/package-base --source=E:/Warhammer/qa-tmp/fast-first-load/base --folder=measurements-base --fail-fast
node measurement-recipes/measure.mjs --side=after --package=E:/Warhammer/qa-tmp/fast-first-load/package-final-c4 --source=E:/Warhammer/worktrees/fast-first-load-v1 --baseline-package=E:/Warhammer/qa-tmp/fast-first-load/package-base --expected-concurrency=4 --folder=measurements-after --fail-fast
```

Run from the evidence directory containing `measurement-recipes`. `--pilot` defaults to one unlimited Home cold/warm pair; `--network=fast4g|slow4g|unlimited`, `--scenario=home|dg-book|sm-book|dg-roster` and `--repetitions=1|2|3` explicitly select a smaller pilot/experiment. They are not a substitute for the full72-row matrix. `--calibrate` runs the two calibrated-link controls before a selected series; `--calibration-only` runs no application scenario.

## Offline timing is distinct from first interactive screen

1. Record FCP, useful DOM and app/native roster interactive readiness first, without waiting for full precache.
2. A page init listener records the exact-revision worker `WH_OFFLINE_PACKAGE_STATUS` broadcasts with their receive timestamp before application code starts.
3. Only after interactive readiness, poll `WHOfflineStatus.query()` for `ready`, completed221/total221. Verify the active worker's `GET_VERSION` cacheName, expected revision **and cacheBytes namespace**, then all221 exact cache keys in that actual cache.
4. `offlineReadyMs` is the first full-ready broadcast for that revision, **not worker activation**. `workerActivatedMs` is recorded separately. If a cold ready broadcast was not observed, the query timestamp is explicitly labelled an upper bound; do not silently treat it as an exact completion.
5. Warm offline readiness is0 because the immediately preceding cold trial already verified full preparation. Background/download settlement remains separate from interactive readiness.

### Passive application-ready markers and legacy driver timing

The init-script observes DOM changes and, once the existing `WarhammerAppV2` API appears, reads its `ready` promise and attaches a completion observer. It does not replace, wrap or assign application fields. `applicationReadyMs` records that observed promise completion; `applicationReadyWatchAttachedMs` shows when observation attached. `bootstrapReadyDomMs` records an existing app with the Loading node removed. Native cold-roster import has separate actual-click and populated-ready-DOM marks, using the same native units/busy condition as the legacy driver. No production DOM is changed.

The legacy `readyMs` remains unchanged: it includes the driver's navigation/DCL, existing default-RAF waits and IPC round trips. Added driver phase fields locate those waits. Browser `PerformanceNavigationTiming` records final-document DCL/load times separately; the driver's root-navigation DCL can concern an intermediate redirect document. `visibilityState` is recorded at the browser marks and final navigation snapshot.

The reducer retains both timing definitions and partial-network-byte boundaries for application-ready, bootstrap-ready and native-import-ready. It does not silently substitute one for the other. The parent chooses and labels the published metric consistently on both sides. An already fulfilled promise can only be observed at attachment time, so the watch timestamp remains available. Old pilots without these markers are not median inputs; the reducer reports missing passive marks explicitly.

The worker may broadcast package-ready just before its initial activation. Interpret offline-ready broadcast and activated proof together rather than claiming those instants are identical. Initial page responsiveness must not be held behind the timing probe.

## Queue4/6/8 experiments

Prepare each variant from the same4-slot candidate package, into a new task-owned temporary path. The helper copies declared files to a new `<out>-input` source, changes only the exact `APP_SHELL_BATCH_SIZE` declaration, then invokes the feature's normal `buildPagesRuntimePackage` and its `check:true` path to produce a fresh `<out>` package, URL stamps and normal `PAGES_RUNTIME_MANIFEST.json`. It rejects any factual JSON change and any mandatory URL-composition change. These are measurement artifacts, never release packages. First run concurrency4 into a separate output to prove restamping is idempotent. Provenance is written beside the package as `<out>.experiment.json`.

```powershell
node measurement-recipes/prepare-concurrency-variant.mjs --package=E:/Warhammer/qa-tmp/fast-first-load/package-final-c4 --out=E:/Warhammer/qa-tmp/fast-first-load/package-final-c4-c6 --source=E:/Warhammer/worktrees/fast-first-load-v1 --concurrency=6
node measurement-recipes/measure.mjs --side=after --package=E:/Warhammer/qa-tmp/fast-first-load/package-final-c4-c6 --source=E:/Warhammer/worktrees/fast-first-load-v1 --baseline-package=E:/Warhammer/qa-tmp/fast-first-load/package-base --expected-concurrency=6 --network=fast4g --scenario=home --repetitions=3 --folder=queue6-fast4g-home --fail-fast
```

Repeat with8, and with Slow4G. Use the same scope/repetitions for4 as the comparison. The producer's dependency installation must already be prepared by the parent. Neither package creation nor measurements are performed automatically by the runner.

## Accounting and privacy

CDP rows are detailed diagnostics, **not authoritative total counts**: page/SW wrapper responses and duplicate target events must not be added as extra network downloads. Postprocess the private closed Chrome `netlog.json` using the copied `parse-netlog-requests.mjs`: actual HTTP sends and H2 DATA payloads, zero body for304/204/HEAD; encoded bodies exclude headers/TLS. The proxy separately records shared TLS totals.

For each trial pass `startEpoch=trial.startedEpoch`, `endEpoch=trial.finishedEpoch`, origin from its first request. H2 DATA byte events before `startedEpoch+readyMs` give exact partial encoded bodies before readiness. Compare authoritative request counts with `serverTotals.networkRequests`; all complete Content-Length bodies should match. Report exceptions instead of discarding them.

After both sides have completed and all browsers are closed, the prepared reducer and comparison commands are:

```powershell
node measurement-recipes/reduce.mjs --results=measurements-base --require-full
node measurement-recipes/reduce.mjs --results=measurements-after --require-full
node measurement-recipes/compare.mjs
```

Each reduction writes `reduced/SUMMARY.json`, `observations.csv`, `medians.csv`, `requests.csv` and `same-file-requests.csv` under that result folder. It validates cold/warm pairing, repetitions, exact worker/cache readiness and before-ready partial-byte bounds. NetLog HTTP bodies are authoritative. Validation arrays expose incomplete responses, runtime failures, decoder fallbacks, server-count differences, page exceptions and upper-bound offline timestamps; do not report a clean result unless these have been reviewed. Ancillary origin-root favicon requests remain in the ledger but are distinguished from runtime failures. `compare.mjs` requires two full72-row matrices, same browser/network settings and three repetitions per group, then writes `BEFORE_AFTER.csv` with24 matched groups. For an explicit smaller experiment use `reduce.mjs` without `--require-full`; its `n` remains honest, but it cannot pass the full comparison command.

Do not publish raw profiles, raw NetLogs, roster text or TLS key/certificate files. Only aggregate timing/byte/request tables and a filtered relative-path ledger belong in evidence. The owner fixture is SHA-verified and filled locally; no form payload or DOM text is captured.

The proxy/source server are copied from the accepted audit: Fast4G9Mbit/s with calibrated170ms added RTT; Slow4G1.6Mbit/s150ms; one shared downstream cap covers both page and SW, no CPU throttle. Unlimited does not pace relay chunks. Existing owner preview/TLS material is read only and never changed.

`offlineUsableMs` is a derived value: max(exact-revision package-ready timestamp, worker activation timestamp). It implements the combined offline requirement without changing either raw observation. It is null if either timestamp is missing; upper-bound status labels remain visible. Primary before/after readiness also retains the original audit driver metric; passive application-promise completion is a separate diagnostic, not silently substituted for browser interactivity.
