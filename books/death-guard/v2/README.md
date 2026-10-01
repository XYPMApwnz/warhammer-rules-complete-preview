# Parallel Death Guard factual pipeline

This directory owns the isolated V2 experiment. Production readers, routes,
roster/effect runtime, Core, Missions, Glossary and offline delivery remain V1.

`sources/source-enrollment.json` records official source identity, integrity,
authority, lifecycle, applicability and reconciliation. The accepted Waha corpus
and its recovered raw pages form the base. Separately captured referenced images
retain their actual capture date; historical image byte identity is not asserted.
Local Git attributes preserve external HTML captures and PDF extracts byte for
byte across platforms; source whitespace is not reformatted.

`normalize.mjs` preserves source identities and provenance, with one canonical
owner for each profile, weapon, section, rule and option. Datasheets reference
those records. Display titles do not resolve factual joins. Source capture gaps
remain explicit until evidence closes them.

`MODEL_BASE` records preserve the exact decoded physical Base notation from
integrity-checked accepted datasheet header spans. Each record's `parentId`
identifies the model `PROFILE`, and `data.scope` is `MODEL`. `data.text` retains
source notation, including diameter marks and "Use model"; it is not a numeric
combat characteristic. Raw-page hash, locator and source identity remain in
provenance. Multiple ambiguous Base spans fail closed rather than flattening
profile ownership. A source with no Base span produces no Base record.

`overlay-engine.mjs` applies declared ADD, REPLACE, REMOVE and QUALIFY operations
to a copy of the base. Targets and field paths are explicit. Source precedence,
conflicting writes, duplicate ownership and unresolved identities fail closed.
The historical base is never overwritten.

`mfm-boundary.mjs` consumes the existing centralized MFM projection directly.
The effective model stores central record references and provenance rather than
DG-local price values. `resolveOwnedFact(recordId)` reads the central owner.
Army-owned Support exceptions retain separate accepted-source evidence.
`mfm.eligibilityEvidenceBindings` marks the 11 retained LEADER sections as base
evidence for eligibility. Future readers must obtain current eligible targets
from `mfm.relations`; Army-owned second-Leader and separation clauses remain
source evidence with their separate exception references.

`buildFactualV2()` returns the canonical base and one effective factual model.
It does not read V1 facts or generated catalogs. `buildV2()` adds a separate,
read-only comparison against V1. Comparison results cannot feed normalization.
Neither build writes production output or performs network access.

Run from the repository root:

```
node books/death-guard/v2/build.mjs
node books/death-guard/v2/build.mjs --check
node books/death-guard/v2/overlay-qa.mjs
node books/death-guard/v2/mfm-boundary-qa.mjs
node books/death-guard/v2/qa.mjs
node books/death-guard/v2/comparison-qa.mjs
node books/death-guard/v2/model-base-qa.mjs
```

Generated snapshots live only under `v2/generated/`. The source registry can
mark the model STALE when a newly enrolled applicable official source has not
been reconciled, or BLOCKED when source evidence is unresolved. This metadata
does not implement an internet polling service.

The current update workflow is demonstrated by the Plague Marines Boltgun
(`datasheet-plague-marines:weapon:2`): its pinned base Strength is 4 and AP is 0.
Faction Pack v1.3, page 7, explicitly REPLACEs those fields with Strength 5 and
AP -1. The effective record retains the overlay operation and PDF provenance;
the base record remains unchanged. The Poxwalkers profile
(`datasheet-poxwalkers:profile:default`) passes through unchanged, without a
characteristic overlay.
