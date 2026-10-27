# Space Marines scope

- `book.config.json`, `sources/`, `content/`, and the configured source manifests own accepted Space Marines facts.
- Native `v2/` factual, contract, app and roster producers consume accepted sources through explicit bindings. Retained source/config producers remain upstream where imported.
- Dark Angels and Blood Angels inherit approved Space Marines units, relations, Detachments, Enhancements, effects, and points through explicit dependency contracts.
- Start local work in the exact accepted source, adapter, or config named by the reproduction.
- Treat native `v2/generated/` and other generated catalogs as derivatives. Retired V1 readers/mobile routes are not compatibility targets.
- Do not fetch newer BSData or replace the pinned/authenticated input during ordinary work.
- Run `npm run qa:sm` for local semantic changes.
- Add `npm run qa:da` and `npm run qa:ba` only when inherited semantics, exclusions, precedence, points, relations, or shared publication can change.
- Run `npm run qa:sources` for source binding/provenance changes.
- Do not touch DA/BA local overlays for a Space Marines-only correction unless dependency evidence requires it.
- Prefer identity/set comparisons over raw counts in source conformance QA.
