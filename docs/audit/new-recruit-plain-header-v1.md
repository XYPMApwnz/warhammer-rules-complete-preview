# Unlabelled New Recruit v37.15 header

Baseline: `70be7d9d37a71b7ab91d79d3effd7019bb3b619a`.
Feature: `codex/new-recruit-plain-header-v1`.

## Bounded shared change

| File | Change |
| --- | --- |
| `books/shared/roster-v2/parser.mjs` | Recognize the unlabelled three-line preamble before the first UNIT: list name and Points limit; faction; Detachment caption with singular/plural DP suffix. Labelled headers, with or without `+`, retain precedence. UNIT/equipment/Enhancement/Warlord decoding is unchanged. |
| `books/shared/roster-v2/import.mjs` | Give `lexicalDraft` optional book context. Resolve a plain caption only through existing canonical Detachment names/aliases: whole-name match first, otherwise one complete comma/and cover. Unknown or ambiguous captions stay intact for normal NEEDS_BINDINGS. |
| `books/shared/roster-v2/import-service.mjs` | Use book context for draft preview. Reuse `export-faction.mjs` for plain-only foreign rejection before load, including when foreign UNIT names cannot resolve. Only existing `factionIdentityLabels` configuration opts in. |
| `books/shared/roster-v2/runtime.mjs` | Give draft preview the same book context; this also covers DG, which calls the shared importer directly. No execution or condition computation changes. |

No book-specific name branch, new executor, canonical ID, source record,
recipient, effect, condition, rule, points calculation or presentation change is
introduced. All required short faction names already exist in accepted import
configuration; no book data or generated artifacts need alteration. AM, DG and
CSM keep their existing absence of a faction-header gate. The declared DP count
is lexical information only; the native check also accepts a declared count of
99 with the same two actual Detachments and unchanged calculated prices/effects.

The fallback requires the complete unambiguous three-line preamble, not an
arbitrary line containing a faction-like word. A colon is allowed in the list
name. No Leading/Attached-to relationship parser or Attached Units format is
added. Existing UNIT bodies, `N with` groups, indentation handling, inline
Warlord and Created-with footer behavior are preserved.

## Independent owner fixture

`v2/fixtures/new-recruit-v37.15-owner-death-guard.txt` contains the owner's text
verbatim: UTF-8 without BOM, LF, final newline. SHA-256:
`2db0c83b5c2f0e422719a14261a1470ceb2e974e91ff6aff791f974cfe518940`.

| Expectation supplied before implementation | Native/browser evidence |
| --- | --- |
| Exact owner export imports READY | READY; nine physical UNIT instances |
| Two Detachments | `detachment-contagion-engines`, `detachment-paragons-of-putrescence` |
| Physical units | Biologus Putrifier; Lord of Contagion; Malignant Plaguecaster; 10 Plague Marines; Chaos Rhino; 3 Deathshroud Terminators; Foetid Bloat-drone; Foetid Bloat-drone with Heavy Blight Launcher; Myphitic Blight-hauler |
| Warlord | `parsed-unit-2`, canonical `unit-lord-of-contagion` |
| Attachments | Zero; attachment decisions remain manual |
| Singular DP variant | READY with only `detachment-contagion-engines` |
| Same owner body with original labelled header | Complete import, state, projection and points bytes match the unchanged baseline |
| Owner DG export in Tau | INVALID / FOREIGN_FACTION_EXPORT; previous active roster preserved |
| Eight other books | An existing READY single-Detachment fixture in each book has an explicitly marked DERIVED_NOT_REAL_EXPORT plain spelling. Physical/gameplay observations match baseline after only audited header/namespace differences. |
| Browser player path | Desktop and mobile paste/import save nine roster articles and two visible Detachment links; reopening restores the same physical state |

The exact per-book derived inputs, original fixture IDs, independent baseline
hashes, original import metadata and expected canonical Detachment IDs are in
`v2/fixtures/new-recruit-plain-header.json`. They are diagnostic conversions, not
claimed authentic captures. A synthetic 20,000-point list limit is explicitly
test metadata; no MFM price is inferred from it.

## Comparison boundaries

The existing namespace function hashes the entire source text. Replacing a
header therefore necessarily changes `rosterId` and its prefix in physical
`modelInstanceId` / `targetModelInstanceId` values. The cross-format oracle
rebases only that exact namespace prefix and preserves every physical suffix.
An intentionally changed physical suffix must still fail the frozen comparison.
Canonical IDs, scope IDs, effect/trace identities, selected equipment, sources,
values and conditional rows are not discarded or normalized.

For native families that preserve import metadata, the complete metadata object
is checked against the baseline plus the exact new faction spelling, list limit
and `plainHeader` information. It is then restored to its independently frozen
baseline value for comparison; unknown metadata differences cannot be hidden.

Same-input baseline/feature A/B uses exact serialized projections and snapshots,
with no namespace rebasing, source decoding or paragraph/layout normalization.
The 199 existing nine-book fixtures match: 507 lifecycle-state comparisons plus
22 identical non-READY outcomes. The same labelled owner control also matches
byte-for-byte. All 97 tracked book-generated JSON artifacts are byte-identical.
Raw cross-format difference paths are retained for review; no expected value is
derived from the new implementation's output.

## QA enrollment and existing tests

| Queue | New mandatory check |
| --- | --- |
| Each of the nine `qa:<book>` commands | `v2/new-recruit-plain-header-qa.mjs --book=<book>` |
| `qa:roster` | `books/shared/roster-v2/plain-header-qa.mjs` |
| `test:browser` | `v2/new-recruit-plain-header-browser-qa.mjs` |

Shared controls include known names containing and/comma, full-name precedence,
unique and ambiguous covers, unknown tails, Oxford comma, duplicate occurrences,
informational DP, malformed numbers, labelled precedence, an unambiguous faction
line, unchanged body decoding and absence of Attached Units enrollment.

| Existing test file | Before | After | Reason |
| --- | --- | --- | --- |
| None | Existing assertions and fixtures | Unchanged | New expectations are isolated in the newly enrolled QA files. |

Primary evidence is retained outside Git at
`E:/Warhammer/qa-evidence/new-recruit-plain-header-v1-20261106`.
The final external REPORT.md and CLASSIFIED_RESULTS.json record actual queue
results, exact delivery SHA and any limitations. The complete pre-FF is run once
after quick/native/browser checks. Source transfer requires separate independent
review and owner authorization; this feature does not publish Pages.
