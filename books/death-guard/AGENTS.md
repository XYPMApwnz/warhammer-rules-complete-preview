# Death Guard scope

- Accepted facts live in configured `content/` and `sources/` records; inspect `book.config.json` for exact ownership.
- `tools/canonical-source-adapter.mjs` supplies the effective-model input.
- `tools/presentation-hook.mjs` is the validated special presentation path. It may arrange canonical facts but must not own competing gameplay values.
- `sources/death-guard-effect-contracts.v1.json` owns structured local effect facts.
- `mobile/related-rules.inc` is an accepted authoritative runtime source, not generated output.
- Native `v2/generated/` and retained downstream projections are generated; removed V1 readers and mobile HTML are not compatibility targets.
- Begin with the reproduced unit/rule and its named owner; avoid scanning other books.
- Popup/navigation changes preserve the native physical, canonical-reference and rule-presentation contracts linked from README.
- Run `npm run qa:dg` for local changes.
- Add `npm run qa:effects` for shared effect/runtime changes and `npm run qa:glossary` for popup/glossary fact changes.
- Run browser QA only when the presentation hook or actual popup/runtime consumer changed.
- Do not replace the presentation hook or reopen effective-model architecture during an ordinary DG fix.
