# Candidate v4 historical update recipe — prepared only

No browser scenario, test suite, build, cleanup, push or source edit was run by this preparation subtask. The parent coordinates the two historical sides sequentially.

Run the commands in RUN_HISTORICAL_SEQUENTIALLY.txt after the candidate checkout and immutable candidate package exist. Do not overlap them with the candidate cold/offline browser acceptance or each other.

Inputs:
- Actual current release package: E:/Warhammer/qa-tmp/release-candidate/runtime-e3db1b34, aggregate 0fab482c0fa7f4132c9bbb60646e880afca25f2b5823ab7fc1bd62322e67b909. Its manifest SHA matches the v3 accepted package receipt exactly; the recorded checkout is still clean at e3db1b345eca989436eea7af758900eee7795203 / tree 74a8064e67dafa06b20120ef5563da176db6d793.
- Old release package: E:/Warhammer/qa-tmp/preview-v1/package-old, aggregate d389549067279096e9a645bab8dbaa6be682967190155ce1f8ec37db8eaf35d3, corresponding to 1fd0b279051d76f1a262f7c8f117e35551b7de39.
- New package: E:/Warhammer/qa-tmp/release-candidate-v4/package.
- Clean candidate source/dependencies: E:/Warhammer/qa-tmp/release-candidate-v4/candidate.

The previous diagnostic recipe's 21 exact assertions remain an ordered source-identical subsequence. All native saved-roster counts, exact serialized all-key localStorage SHA proofs, working-screen draft/banner/manual-consent isolation, Loading auto-update revision coherence, warmed DG/SM offline reopening and 390/1440 scenarios remain. go/ready calls, their order and their timeouts remain; an observer-only WeakSet marks explicit navigations to identify ERR_ABORTED without an arbitrary timing window.

Three additional guards reject uncaught page exceptions, unclassified console errors and unclassified request failures. Exact cache-revision.js network-first failures during intentional candidate-offline are retained and classified as expected. ERR_ABORTED is retained separately only while the recipe is actually in its explicit go/ready operation for that page. Closing-profile events retain their own phase; no failed response or private storage content is hidden.

The historical 1fd runtime cannot import the later authentic DG v37.25/v37.15 exports. Both are attempted and their rejection remains recorded. Only if both fail does the recipe use the exact unchanged prior-preview DERIVED_NOT_REAL_EXPORT dg-short-derived-labelled record, with its fixed SHA and recorded provenance; no roster is transformed or invented. Current-live e3 uses the authentic stored DG export. Both sides use the authentic SM v37.3 fixture.

The server helper is copied unchanged and serves only the selected existing package on a separate loopback origin with gzip. Historical packages and the running preview are never edited. Profiles belong only to qa-tmp/release-candidate-v4/historical-updates and remain there pending parent cleanup policy. No storage, raw roster, browser profile or TLS material is published.

Receipts: ../HISTORICAL_PREPARATION.json and ../HISTORICAL_RECIPE_AUDIT.json. Full adaptation diff: HISTORICAL_RECIPE_CHANGES.patch.

Parent execution completed after preparation: both current-live and old-site reports are PASS at 390/1440. See update-path/live-e3/REPORT.json and update-path/old-1fd/REPORT.json in the report root. The source/candidate checkouts and private profiles were removed after verification; recreate the exact candidate checkout and dependencies before reproducing these commands.
