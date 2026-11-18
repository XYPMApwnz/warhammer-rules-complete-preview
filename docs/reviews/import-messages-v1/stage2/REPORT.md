# Import messages — stage 2 implementation review

**Status: FINAL FULL QA PENDING.** The owner has authorized one additional full pre-FF on the exact candidate below and requested publication before that run so independent review can begin. This is not READY_FOR_REVIEW acceptance yet. The preview stays on the accepted base until final PASS.

- Candidate: `4060074ae0c7888571367f99f7cb9cc375c167ba`, `codex/import-messages-v1`.
- Base / unchanged GitHub source: `5bc1b038437fcac86966f87371760da94d7e9b38`.
- Approved stage-1 inventory: `7a7100203c8f65501f06df8ae22c7829304fc13f`; its original files and archive hashes are preserved in this evidence branch.
- [Approved 334-row table with owner overrides](messages-approved.csv). These are producer/template/review rows, not 334 unique visible paragraphs.
- [17-file old-test before/after table](OLD_TEST_TABLE.md) and [complete old-test diff](APPROVED_OLD_TESTS.patch).
- [Offline screenshot gallery](browser/GALLERY.html): 38 screenshots, 390 and 1440 pixels.

## What changed

### 1. Copy and clarification controls

Changed player copy is centralized in the existing `books/shared/army-book-app-v2/cosmetics.mjs`. Returned native codes are translated at the view boundary; the importer, its admission decisions, native diagnostics, candidates, quantities and confirmation handlers are unchanged. Field labels, legends, native option captions, placeholders and accessible names use human text. Details contains curated explanations and retained facts, not a dump of IDs, paths or diagnostic JSON.

Exact short confirmations: `Roster imported.`, `Warlord saved.`, `Character or Support attached.`, `Character or Support detached.`, `Roster backup restored.`, `Saved roster reloaded.`, `Current roster kept.`, `Backup downloaded.` The same requested no-Review-tail convention gives `Choice saved.`.

The export-header explanation is short; the accepted complete three-line and five-line examples are unchanged inside collapsed Details. No additional export grammar, Detachment Point warning or legality check was introduced. Refused imports, replacement cancellation, backup reload and restoration retain exact native snapshots and saved bytes.

### 2. Relevant limitations

Blanket caveats no longer precede the export field. Obsolete player claims that no real BA/DA export was checked are removed, based on the qualified fixtures recorded in stage 1. Authored source/certification metadata is not repinned or rewritten, and no whole-book certification is claimed.

| Notice | Existing evidence selecting its placement | Player placement |
|---|---|---|
| BA unresolved Chainsword / Bolt Rifle correspondence | Exact native reason and source issue IDs | Beside that unresolved entry; asks for the original export, without guessing a weapon |
| Black Rage | Existing rule card belongs to the imported physical unit | Beside that unit; battlefield conditions remain uncomputed |
| Legacy of the Angel | Exact rule belongs to a selected Detachment and the native physical component is a Character | Beside the affected Character; BLOOD ANGELS is not granted |
| Stormlance | Exact selected Detachment and existing authored conflict notice | Roster note: `Stormlance: sources disagree on Detachment Points. Check the current Munitorum Field Manual.` |
| DA membership | Native `armyApplicability` remains unproven | Beside each affected unit; no inferred Chapter or keyword |
| Unverified costs | Existing computed unresolved reasons and exact option/unit ownership | Existing scoped points-warning view with approved human explanations |
| General unsupported automation | Existing authored general limitation | Bottom, collapsed `Known limitations of this Army Book`; empty sections omitted |

### 3. Review-C presentation polish

| Area | Result | Preserved boundary |
|---|---|---|
| Open Stratagems | Existing themed link/card styling | Same guide destination and source records |
| Empty physical-card Stratagems | No initial heading/tab for exactly zero eligible native rows | Metadata queried once per snapshot/component; full text/cards still built only on first opening; exact selected-Detachment MATCH/CONDITIONAL rows, no foreign/Core inference |
| Empty Enhancements | Omitted only when none was imported | Inactive imported Enhancements still say not applied; Core 25.04, invalid-list and retained exported-points facts remain in Details |
| Prices | Points / Exported points; unresolved stays Not calculated | Same existing prices and ownership; no guessed totals |
| Counts | 1 unit / 3 units; model plurals | Same native counts |
| Warlord | Save button absent with zero eligible native candidates | Same eligibility, selected identity and snapshot schema |
| Identical one-model copies | `Tyrannofex #1` | Same physical identities/order; meaningful model composition and ordinals retained |
| `captionName()` | Validation call retained | It throws on missing/ID-as-name captions. Its unused return does not make the call dead; negative control retained |

The exact metadata-only Stratagem precheck measured serial Node medians of 1.56 ms for DG and 0.69 ms for SM on existing saved snapshots. This measures the query, not mobile render/startup time. No extra payload fetch or second applicability implementation was added.

## Native choice captions and the Prototype regression

| Books / path | Result |
|---|---|
| Tau Student recipient choices | Exact serialized recipient sets become composition-aware unit names and ordinals; same values, count, order, maximum and independent sources |
| Tau Prototype choices | Exact weapon reference becomes a human weapon/model/occurrence caption; one of two imported weapons remains one choice from the original aggregate |
| Tyranids Trygon | Existing human caption retained; same source option and value |
| AM, BA, CSM, DA, DG, SM | No native sourceChoices provider; shared import clarification captions inspected and exercised through existing fixtures |

All 44 Tau PROFILE cards have human titles. Existing non-null scope references resolve the exact model title; same-name weapon occurrences retain Selection 1/2 distinctions. No option value or recipient is invented from a label.

The first full pre-FF's new Save check found a real display defect: native execution partitions an original quantity-two weapon into selected/remainder effective rows, replacing their selection keys. The caption formatter had searched those effective rows using the original key and then thrown during rerender. The fix reads the native trace's exact original key, source rule, nullable scope, selected/remainder roles, original quantity and source-selection evidence. It does not recompute effects or alter the native decision. The original Save assertion remains; it now passes on both widths. Foreign/missing/extra/malformed partition traces fail closed.

## Verification completed on the repaired candidate

| Check | Result |
|---|---|
| New browser suite | 126 PASS; all nine books / 390 and 1440; exact short statuses, original chooser IDs/order, foreign refusal and unchanged saves, backup roundtrip, Prototype Save; 0 page errors / missing requests |
| Partition unit regression | 6 cases / 48 refusal controls; null UNIT and non-null MODEL scopes; unchanged IDs/source/effective objects |
| Complete BA roster QA | PASS, including the corrected complete warning sentence and all original game values/refusals |
| Complete DA lifecycle QA | PASS, including Cyclone and original snapshot corruption/price controls |
| Complete navigation | PASS, all nine books / both widths; exact formed-component metadata queries, complete source fields, cached expansion and independent prices |
| Missing price-origin mutation | Intended precise refusal on Tau; deleting the marker cannot skip the source-proven comparison |
| Foreign-Detachment mutation | Intended exact native-row refusal on DG |
| Native A/B | Fresh repaired-head capture versus immutable accepted base: 199 rosters / 507 states / 9 books; 177 READY / 22 intentional NEEDS_BINDINGS on both; 0 differences, full decoded observations without semantic filtering |
| Factual generated versus base | 147/147 byte-identical |
| Startup paths | 160 nodes and 219 mandatory URLs, same paths/order; only the derived publication-revision query changes; no new runtime file |
| Cache producer check | PASS, revision `10f19d471e77a76e` |

The missing-marker mutation must target a book/path using the base fallback. An initial SM attempt did not reach that branch because native priced rows own those units; its generic mutation-exit refusal was deliberately not accepted as proof. The Tau run reaches and fails the exact assertion.

Machine evidence: [targeted acceptance](repair-targeted-acceptance.json), [native A/B](native-ab.json), [exact capture comparison](native-comparison.json), [147-file byte inventory](generated-bytes.json), [startup paths](STARTUP_PATHS_AB.json), [Tau caption trace](TAU_PROFILE_CAPTION_TRACE.json).

## First full pre-FF and pending final run

The single initial run on `9e00487a956b1f00416b4ad9fb743d948eb2d68a` completed **179 PASS / 2 FAIL**, **6,433,676 ms / 107.23 minutes**. Generated rebuild passed **67 steps / 147 outputs**; all other jobs except the two below passed, including PWA, cold offline, source enrollment and ingestion.

| Failed job | Reason | Resolution |
|---|---|---|
| BA roster QA | Old approved points-warning sentence still asserted | Exact approved new sentence + old absence; entire test rerun PASS |
| New import-messages browser QA | Prototype Save rerender defect at 390/1440 | Display-only original-reference trace fix; same full 126-check suite rerun PASS |

The owner explicitly authorized **one additional full pre-FF on `4060074ae0c7888571367f99f7cb9cc375c167ba`** and requested these branches pushed first. That run has not started at the time of this evidence commit. Final results and acceptance will be appended after it ends. The preview will not switch before PASS.

[Diff from the first full-run SHA](REPAIR_FROM_PREFLIGHT.patch), [stat](REPAIR_FROM_PREFLIGHT.stat.txt): seven files—one display module, four QA files, and two normal runtime integrity/stamp outputs. No game data or operation changed. [First full-run summary](FIRST_FULL_PREFLIGHT.json).

## Generated and publication boundary

| File set | Change | Reason |
|---|---|---|
| 147 factual generated files | None, byte-for-byte | Rules, prices, effects, recipients, execution conditions, source identities and book publications retained |
| `glossary/generated/cache-revision.js` | Derived revision, byte/integrity metadata | Existing cache producer accounts for changed display code |
| `v2/app.html` | Derived version stamps | Same existing producer; no startup/precache policy change |

The first tested package had 453 files. The repaired final package and full producer gate will be checked in the newly authorized run. No RAW Wahapedia, release candidate, new runtime file, book binding or catalog definition is added to publication.

## Diagnostic limits kept separate

Early intermediate browser results collected while runtime revision files were still changing were not accepted as final verification; the tree was frozen for the full run and repaired-candidate runs. An old off-queue DG auto-import harness fails before import at boot on both unchanged base and feature; its restrictive worker server is not repaired in this task. An off-queue synthetic route harness also failed on a 404 before reaching copy checks; that run is not claimed PASS. Neither replaces the mandatory gate results.

All 17 changed old tests retain exact game values, IDs, scope, recipients, source text, limits, mutations and saved-state comparisons. Only approved copy/location observations and the explicitly approved equivalent navigation checks are migrated. Full diffs are attached.

No FF, force push, source/main/release/Pages change or preview switch is authorized by this report. Temporary task files remain while the approved final gate is pending. The evidence branch is for review only and must not be merged.
