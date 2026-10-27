# Adeptus Mechanicus scope

- `book.config.json` declares the accepted `content/` and `sources/` owners.
- `tools/canonical-source-adapter.mjs` normalizes those owners before effective-model validation.
- Native `v2/` producers and shared V2 presenters consume accepted effective facts; AM-specific bindings may adapt runtime inputs but may not become factual owners.
- `sources/adeptus-mechanicus-effect-contracts.v1.json` owns structured local effect facts.
- `mobile/related-rules.inc` is an accepted authoritative runtime source, not generated output.
- Native `v2/generated/` and retained downstream projections are generated; removed V1 readers and mobile HTML are not compatibility targets.
- Glossary facts must come from the canonical/effective projection, not a second AM semantic assembly.
- Run `npm run qa:am` for local changes.
- Add `npm run qa:effects` for composition/effect-runtime changes and `npm run qa:glossary` for glossary projection changes.
- Use `npm run qa:sources` only for provenance, manifest, or accepted-input changes.
- Do not refactor other books or shared rendering unless the AM reproduction proves a shared root cause.
