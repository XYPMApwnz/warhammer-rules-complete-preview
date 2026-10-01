# Death Guard Army Book App V2

Base: `f26c3c82e6b5db36b7caa24bc0f2cf7466b310dd`.
Branch: `working/army-book-app-v2`.
Development route: `books/death-guard/v2/app.html`.

The adapter reads exactly one effective factual snapshot,
`generated/rule-contract-effective.json`. It includes the Effective Book V2
and typed contracts on the same canonical rule identities. Central MFM records
are obtained through the existing `mfm-boundary.mjs` owner. The adapter does
not rebuild facts from V1 HTML, reader bundles, old compatibility matrices,
effect contracts or Glossary. Central MFM's existing source verification
remains intact; reading its accepted captures is not a V1 Army Book read.

`app-build.mjs` generates only `app.html` and
`generated/app-presentation.json`. Shared projection/runtime code lives under
`books/shared/army-book-app-v2`. No production V1 route, cache, source,
canonical fact, Rule Contract, MFM price or other book is changed.

## Rebuild and checks

```
node books/death-guard/v2/app-build.mjs
node books/death-guard/v2/app-build.mjs --check
node books/death-guard/v2/app-qa.mjs
node books/death-guard/v2/app-browser-qa.mjs
```

Browser QA requires Playwright and its Chromium headless shell. Optional
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` selects an installed browser;
`ARMY_APP_V2_SCREENSHOTS` selects an external screenshot directory.
The test starts and closes its own local HTTP server. No deployment occurs.

The independent oracle enumerates canonical gameplay fields, effective
gameplay qualifications, central MFM fields and resolved relation facts. It
does not import the presentation producer. Explicit metadata exclusions and
unknown-field rejection prevent silent denominator shrinkage. Browser QA
opens every normal top-level book entry and checks the complete visible DOM
against that oracle on desktop 1440×1000 and phone 390×844. QA-only mounting
is not the reachability proof.

Projection mutations detect missing fields, wrong values/display, wrong owner,
wrong context, a poisoned manifest, duplicated owners and unreachable cards.
A changed V2 Plague Marines weapon strength is reflected in actual UI. Fresh
processes intercept forbidden legacy factual reads, including poisoned values;
normal and poisoned rebuilds are identical with zero such reads. Browser QA
serves poisoned legacy paths if requested and checks that none are requested.

## Legacy UX boundary

V1 is a UX reference only (`app-ux-reference.json`). The V2 reader supports
grouped navigation, local entry navigation, search, responsive drawer, desktop
collapse, canonical history, dialogs, statistics, keyword chips and source
tables. It does not yet provide an explicit phone/full view switch,
scroll-following TOC, V1's specialized combined weapon/points tables, main
Library exit, unit artwork, offline/PWA integration or external Core
Stratagems (the latter have no DG V2 factual input). Nested dialog history is
supported; V1's complete nested triggering-element journey restoration is not
claimed. Compatible Rules, Glossary and Roster remain intentionally deferred.

## Existing integration limitation

The unchanged `tests/integration-qa.mjs` fails the CSM entry verification-status
and artwork assertion at line 100 both here and on the exact base worktree.
This is pre-existing V1 integration debt, outside this DG V2 Reader task.
Focused Rule Contract, MFM boundary, projection and desktop/phone browser
checks are reported separately; a full legacy integration PASS is not claimed.

## Verified application result

The source/effective census contains 538 canonical entities and 88 central
MFM records, rendered as 626 cards. It accounts for 3,654 visible atomic facts:
3,005 canonical data fields, five gameplay qualification fields, 588 central
MFM fields, 51 MFM relation fields and 28 Army Support exception fields.
Normal navigation exposes all 36 Datasheets, nine Detachments, 30 Enhancements
and 45 Stratagems. Desktop and phone each have zero missing, wrong-value,
wrong-identity or wrong-context facts. Base/invulnerable saves, all four Defiler
selection bindings, the GW qualifications and Plague Marines Boltgun S5/AP-1
are included. Fourteen projection/oracle mutation controls pass; five legacy
poison classes yield zero factual reads; a V2 strength poison reaches UI as 77.
Rule Contract source QA, its deterministic snapshot check, MFM boundary QA,
app output check and exhaustive desktop/phone DOM QA pass.
