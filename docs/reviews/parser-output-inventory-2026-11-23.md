# Parser-output inventory and portable node fingerprints

Base: `f657befb10f59001d806bdac82eae520d08230d9`. Locations in the table refer to that base. The inventory follows the native factual producers used by the nine Army Books and glossary; it does not treat generated artifacts as factual inputs.

| Owner | File / base line | Dependency | Expectations |
| --- | --- | --- | --- |
| space-marines | `books/space-marines/v2/build.py:106;348` | Fresh lxml HTML serialization SHA | 1722 |
| blood-angels | `books/blood-angels/v2/build.py:127;359; books/blood-angels/v2/foundation-qa.py:118` | Fresh lxml HTML serialization SHA | 301 |
| dark-angels | `books/dark-angels/v2/build.py:106;333; books/dark-angels/v2/foundation-qa.py:82` | Fresh lxml HTML serialization SHA | 320 |
| blood-angels | `books/blood-angels/v2/reference-qa.py:90;130;157` | Fresh lxml HTML serialization SHA | 131 |
| space-marines | `books/space-marines/v2/roster-source-review-qa.mjs:42;51` | Fresh lxml HTML serialization SHA | 15 |
| space-marines | `books/space-marines/v2/roster-named-recipient-qa.mjs:55;61;69` | Fresh lxml HTML serialization SHA | 14 |
| space-marines | `books/space-marines/v2/static-gameplay-qa.mjs:58` | Fresh lxml HTML serialization SHA | 16 |
| chaos-space-marines | `books/chaos-space-marines/v2/build.py:328 at base` | Fresh weapon-row lxml serialization SHA | 70 |
| chaos-space-marines | `books/chaos-space-marines/v2/model_sources.py:48` | Exact type comparison rejects lxml string subclasses | 54 |
| chaos-space-marines | `books/chaos-space-marines/v2/content-presentation-qa.py:39` | Serialize paragraphs, replace br, reparse and compare display text | 2 |
| adeptus-mechanicus | `books/adeptus-mechanicus/tools/extract-bsdata.py:95` | etree serialization as fallback dedup identity for profile without id | n/a |
| shared Core upstream | `books/core-rules/tools/build_waha_core_corpus.py:389; books/core-rules/tools/build_core_candidate.py:148` | Persisted ownedHtml generated from DOM; candidate reparses accepted strings | 296 |
| glossary | `glossary/v2/content/army-v2-projection.mjs:46-54;115` | Inherits producer dependencies above; no separate lxml DOM hash or exact Python type check found. | n/a |
| death-guard;tyranids;adeptus-mechanicus-v2;tau-empire;emperors-children | `Native passport producer graphs and imported Python modules` | No additional DOM-serialization hash or exact type guard found; source SHA and semantic/cardinality expectations retained. | n/a |

## Changed verification contract

The 70 CSM weapon occurrences are authenticated by a new `presentation-row-text-fingerprints.json` sidecar. For each existing stable source entity ID, hash UTF-8 JSON `{"schema":"html-row-cell-text/v1","cells":[...]}` with compact separators and unescaped Unicode. Cells are direct `th`/`td` children in source order; each value is `" ".join(str(cell.text_content()).split())`. Non-rows, empty rows, duplicate IDs, incomplete inventories and malformed digests fail closed.

[All 2,591 changed fingerprint declarations, before and after](parser-node-fingerprint-changes-2026-11-23.csv), including the [70 CSM rows](parser-row-fingerprint-changes-2026-11-23.csv). No rule text is copied into these tables. The total includes 2,343 native SM-family bindings and 178 authored QA fields (176 distinct QA guards; two static-gameplay fields share a guard).

The original presentation binding is also published as provenance. It remains byte-identical: its historical `expectedRowSha256` values describe the former serializer and are no longer the active row-validation input. This avoids rewriting accepted generated provenance merely to change the validation representation. There is one active row verification path. Canonical IDs, exact selectors, selector cardinality, numeric profile equality, instruction text hashes and the SHA-256 of every complete enrolled source file remain enforced.

At CSM parser string boundaries, `text_content()` is converted to native `str`; strict type equality for booleans, quantities and containers remains unchanged. The dependency requirement stays `lxml==6.1.1`; no old libxml2 version is pinned.

## Controls and compatibility proof

Run `python -B tests/parser-independent-source-qa.py` with each QA interpreter. It builds CSM through its real producer, compares the three published factual outputs byte-for-byte and tests changed cells/order, missing/duplicate rows, invalid digests, a wrong real-build fingerprint, a changed byte in a copied HTML source, and retained strict type checks. It also invokes each real SM/BA/DA producer with `--check` in a fresh Python subprocess, retaining all source, semantic and exact-output assertions. The test prints only counts and parser versions.

Run the existing generated-rebuild gate with the selected `QA_PYTHON` to compare all 148 outputs. Record both `LXML_VERSION` and `LIBXML_VERSION`: the previous PC has lxml 6.1.1 linked to libxml2 2.11.9, while different platform wheels can use a different libxml2. Source captures must never be rewritten to match a serializer.

Before the full hosted queue, the secretless parser-census job runs `tools/parser-dom-census.py` against the exact target checkout. It independently authenticates whole source files and measures all 2,343 native SM-family serializer hashes. The accepted native hashes are used as the PC reference only after the local census confirms every one matches the measured PC value. The job exports only `RESULTS.json` and `INVENTORY.csv` containing versions, identifiers, relative locations and hashes. It freezes its checkout SHA as an output; the full verification job uses that SHA, so a moving branch cannot change the tested input between jobs.

A nonzero active fingerprint difference blocks the full queue. Retired serializer hashes remain diagnostic metadata, not an alternative acceptance path. Under the owner decision, only a book with measured cross-parser differences may migrate all its DOM fingerprints. For rows, the portable fingerprint hashes ordered normalized cell text. For other nodes, it hashes ordered opening tags, sorted class memberships, normalized text/tails and closing tags; it does not reduce a subtree to plain text. If the measured count is zero, the existing pins remain unchanged and real native build checks on each parser configuration detect future drift.

The preliminary Linux run `45082393509` measured the following before any SM-family migration. Its full pre-FF job was skipped; it was a diagnostic census, not a completed full verification run.

| Book | Native bindings | Serialized hashes differing from PC | Changed node kinds | Portable fingerprints differing |
| --- | ---: | ---: | --- | ---: |
| SM | 1,722 | 107 | 76 tr, 31 div | 0 |
| BA | 301 | 18 | 14 tr, 4 div | 0 |
| DA | 320 | 34 | 26 tr, 8 div | 0 |
| Total | 2,343 | 159 | 116 tr, 43 div | 0 |

PC: lxml 6.1.1.0 / libxml2 2.11.9; Linux: lxml 6.1.1.0 / libxml2 2.14.6. Because each book has measured differences, all three books migrate their native and inventoried QA DOM guards. Whole-file hashes and legacy bindings remain unchanged; new sidecars join exactly by the existing source identities, documents, selectors and legacy hashes. QA pins preserve their original bytes-versus-Unicode parser input; there is no try-both fallback. Core owned-HTML fragments remain unchanged. A difference in semantic facts, canonical fingerprints, source snapshots, formatting expectations or any generated byte remains a failure; it is not accepted by refreshing an expected value.

## Safe hosted failure diagnostics

`tools/qa-pre-ff-ci.mjs` reads only bounded expected job logs. A failed job publishes a fixed allowlisted error class, a redacted first-line template of at most 200 characters, a fixed cause tag and, when available, a repository-relative location restricted to validated tracked code files and public job entrypoints. `messageRedacted: true` distinguishes the template from a verbatim private message. Comparison values, source bodies, runner paths, arbitrary class names, credentials and email addresses are excluded. The full pre-FF artifact remains exactly `REPORT.md`, `RESULTS.json` and `JOB_PLAN.json`. The separate preliminary census artifact is restricted to its two metadata files; neither artifact contains source bodies.

The mirror secret remains confined to the existing dedicated preparation step. `pages-runtime.yml`, runtime files, source/main/release/Pages/default references and all 213 pre-FF leaf commands are unchanged.

## Existing test assertions retained

CI contract and explicitly inventoried source-fingerprint tests are edited. All 19 original CI controls and all existing factual assertions are retained. The owner separately authorized exactly four sourceRefs read adapters; no additional test assertion change is authorized.

Generated bytes already use the accepted sourceRefs format, while four tests still read them as expanded legacy provenance; therefore their input adapters need decoding although generated files did not change.

| Authorized read adapter / base line | Before | After | Preserved assertions |
| --- | --- | --- | --- |
| BA `foundation-qa.py:423` | Compare published sourceRefs JSON directly to legacy producer objects | Existing `generated_source_outputs(result, ROOT)` before the same strict equality | Complete generated-object equality and every original semantic/mutation check |
| DA `foundation-qa.py:387` | Same representation mismatch | Same existing normalization before the same strict equality | Complete generated-object equality and every original semantic/mutation check |
| BA `reference-qa.py:42-43` | Plain JSON read for two published models | Thin Node bridge to existing `parseProducerJSON`; authored metadata reads unchanged | Exact provenance, identity, membership, text, values and refusal controls |
| SM `roster-named-recipient-qa.mjs:36` | Plain `JSON.parse` for published facts | Existing `parseProducerJSON`; authored review read unchanged | Exact source, recipients, scope, canonical text, identities and refusal controls |

Each adapter requires a passing unmodified-input run and a failing deliberately corrupted fingerprint/sourceRef run in an isolated temporary copy. [The exact four approved read-place diffs](parser-codec-read-adapters-2026-11-23.patch) preserve the former assertions. Record mutation outcomes with the final report; do not count an unrelated setup failure as a successful negative control.

## Separately approved implementation-review pins

The fingerprint migration changes `books/space-marines/v2/build.py`; the strict source-completeness review also authenticates that producer's implementation bytes. The owner separately approved exactly three implementation SHA fields, in the shared review's SM entry and the local review's SM/Deathwatch entries. Only those three values change from `f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e` to `09fc3f8ea1317111df0575f9d5fa0d0b86d20cf2de4c79094ee36735b9f872d1`. This does not refresh any source HTML hash, canonical block, classification or semantic expectation.

Command, from the checkout root:

```powershell
(Get-FileHash -Algorithm SHA256 -LiteralPath 'books/space-marines/v2/build.py').Hash
```

Output:

```text
09FC3F8EA1317111DF0575F9D5FA0D0B86D20CF2DE4C79094EE36735B9F872D1
```

[Implementation pin inventory](parser-implementation-pin-inventory-2026-11-23.json): all 18 changed/new implementation files were searched by exact old/current byte SHA across tracked text, complemented by independent review of 57 metadata registries and their active pin mechanisms. No further active stale pins were found for CSM, BA, DA or the other changed code. Three historical audit documents retain the old SM producer hash as historical evidence; their accepted migration records are unchanged. The existing SM foundation-QA pins remain valid because that file is unchanged. The ordered full queue remains exactly the accepted 213 jobs.

| Test / check | Before | After | Reason / preservation |
| --- | --- | --- | --- |
| `tests/qa-pre-ff-ci-qa.mjs`, ordered setup in `workflowContract` | Search the single workflow job for the required install/control/queue order | Search the full `pre-ff` job for that same order; require the preliminary census dependency separately | A second secretless job must not let its Python install mask a missing install in the full job. The full job retains every old requirement. |
| Same test, target checkout contract | Manual target ref is checked out once | Census freezes a validated commit SHA; the dependent full checkout must use that output | Preserve branch/SHA input support while preventing a branch advance between jobs from changing tested data. |
| Same test, public artifact contract | Full report contains exactly three safe files | Those same three files remain; a separate census artifact contains exactly two fixed metadata files | Keep all RAW/email/source-body controls and add exact census-file and failure-blocking negative controls. |
| Safe failed-result projection controls | Failed status/exit code published, arbitrary private error details omitted | Same status/exit/plan assertions plus allowlisted class, redacted first-line template and tracked relative code location | Owner-authorized diagnostic metadata; arbitrary error text, credentials, comparison values and private paths remain forbidden. |

All changed fingerprint declarations are listed in the linked CSV, with the book, guard, node kind, source locator and exact old/new digest. The `type()` equality implementation is unchanged; only six parser-return string boundaries are normalized. All whole-source-file byte/hash checks and semantic assertions remain unchanged.

## Current expectation-change summary

| Book | Node kind | Changed fingerprint expectations | Parser string boundaries |
| --- | --- | ---: | ---: |
| CSM | Weapon table `tr` | 70 | 6 |
| SM native | 386 table rows + 1,336 other nodes | 1,722 | 0 |
| SM QA | a 3; div 28; li 3; span 2; td 11 | 47 fields / 45 guards | 0 |
| BA native | 71 table rows + 230 other nodes | 301 | 0 |
| BA QA | div 108; h2 7; li 8; td 8 | 131 | 0 |
| DA native | 68 table rows + 252 other nodes | 320 | 0 |
| DG / AM / Tyranids / Tau / EC / glossary / Core | No changed expectation | 0 | 0 |

Native non-row totals by kind: SM div 824 / h2 22 / li 201 / span 232 / td 57; BA div 134 / h2 3 / li 40 / span 45 / td 8; DA div 165 / h2 3 / li 33 / span 43 / td 8.

Checkpoint verification: shared fingerprint controls 17/17, census controls 25/25, real CSM plus SM/BA/DA build and integrity controls 14/14 PASS. The PC working-copy census has 2,343 native plus 176 unique QA guards, zero active differences. This is not a frozen-commit certification. Full 148-file rebuild equality and final local/hosted pre-FF on the migrated commit are pending; the earlier 148-file lxml 5.4 result predates this migration and must not be substituted for that proof.
