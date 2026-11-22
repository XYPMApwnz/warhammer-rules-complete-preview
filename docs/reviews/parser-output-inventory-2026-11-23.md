# Parser-output inventory and CSM row fingerprints

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

[Every changed expectation, before and after](parser-row-fingerprint-changes-2026-11-23.csv). No rule text is copied into this table.

The original presentation binding is also published as provenance. It remains byte-identical: its historical `expectedRowSha256` values describe the former serializer and are no longer the active row-validation input. This avoids rewriting accepted generated provenance merely to change the validation representation. There is one active row verification path. Canonical IDs, exact selectors, selector cardinality, numeric profile equality, instruction text hashes and the SHA-256 of every complete enrolled source file remain enforced.

At CSM parser string boundaries, `text_content()` is converted to native `str`; strict type equality for booleans, quantities and containers remains unchanged. The dependency requirement stays `lxml==6.1.1`; no old libxml2 version is pinned.

## Controls and compatibility proof

Run `python -B tests/parser-independent-source-qa.py` with each QA interpreter. It builds CSM through its real producer, compares the three published factual outputs byte-for-byte and tests changed cells/order, missing/duplicate rows, invalid digests, a wrong real-build fingerprint, a changed byte in a copied HTML source, and retained strict type checks. It also invokes each real SM/BA/DA producer with `--check` in a fresh Python subprocess, retaining all source, semantic and exact-output assertions. The test prints only counts and parser versions.

Run the existing generated-rebuild gate with the selected `QA_PYTHON` to compare all 148 outputs. Record both `LXML_VERSION` and `LIBXML_VERSION`: the previous PC has lxml 6.1.1 linked to libxml2 2.11.9, while different platform wheels can use a different libxml2. Source captures must never be rewritten to match a serializer.

Before the full hosted queue, the secretless parser-census job runs `tools/parser-dom-census.py` against the exact target checkout. It independently authenticates whole source files and measures all 2,343 native SM-family serializer hashes. The accepted native hashes are used as the PC reference only after the local census confirms every one matches the measured PC value. The job exports only `RESULTS.json` and `INVENTORY.csv` containing versions, identifiers, relative locations and hashes. It freezes its checkout SHA as an output; the full verification job uses that SHA, so a moving branch cannot change the tested input between jobs.

A nonzero difference blocks the full queue. Under the owner decision, only a book with measured cross-parser differences may migrate all its DOM fingerprints. For rows, the candidate hashes ordered normalized cell text. For other nodes, it hashes ordered opening tags, sorted class memberships, normalized text/tails and closing tags; it does not reduce a subtree to plain text. If the measured count is zero, the existing pins remain unchanged and real native build checks on each parser configuration detect future drift.

Other inventoried SM/BA/DA DOM guards and Core owned-HTML fragments are unchanged by the CSM repair. A difference in semantic facts, canonical fingerprints, source snapshots, formatting expectations or any generated byte remains a failure; it is not accepted by refreshing an expected value.

## Safe hosted failure diagnostics

`tools/qa-pre-ff-ci.mjs` reads only bounded expected job logs. A failed job publishes a fixed allowlisted error class, a redacted first-line template of at most 200 characters, a fixed cause tag and, when available, a repository-relative location restricted to validated tracked code files and public job entrypoints. `messageRedacted: true` distinguishes the template from a verbatim private message. Comparison values, source bodies, runner paths, arbitrary class names, credentials and email addresses are excluded. The full pre-FF artifact remains exactly `REPORT.md`, `RESULTS.json` and `JOB_PLAN.json`. The separate preliminary census artifact is restricted to its two metadata files; neither artifact contains source bodies.

The mirror secret remains confined to the existing dedicated preparation step. `pages-runtime.yml`, runtime files, source/main/release/Pages/default references and all 213 pre-FF leaf commands are unchanged.

## Existing test assertions retained

Only the CI contract test is edited; no existing Army Book/gameplay test expectation changes. All 19 controls from the base are retained.

| Test / check | Before | After | Reason / preservation |
| --- | --- | --- | --- |
| `tests/qa-pre-ff-ci-qa.mjs`, ordered setup in `workflowContract` | Search the single workflow job for the required install/control/queue order | Search the full `pre-ff` job for that same order; require the preliminary census dependency separately | A second secretless job must not let its Python install mask a missing install in the full job. The full job retains every old requirement. |
| Same test, target checkout contract | Manual target ref is checked out once | Census freezes a validated commit SHA; the dependent full checkout must use that output | Preserve branch/SHA input support while preventing a branch advance between jobs from changing tested data. |
| Same test, public artifact contract | Full report contains exactly three safe files | Those same three files remain; a separate census artifact contains exactly two fixed metadata files | Keep all RAW/email/source-body controls and add exact census-file and failure-blocking negative controls. |
| Safe failed-result projection controls | Failed status/exit code published, arbitrary private error details omitted | Same status/exit/plan assertions plus allowlisted class, redacted first-line template and tracked relative code location | Owner-authorized diagnostic metadata; arbitrary error text, credentials, comparison values and private paths remain forbidden. |

The 70 changed factual verification expectations are all listed in the linked CSV. The `type()` equality implementation is unchanged; only six parser-return string boundaries are normalized. All whole-source-file byte/hash checks and semantic assertions remain unchanged.

## Current expectation-change summary

| Book | Node kind | Changed fingerprint expectations | Parser string boundaries |
| --- | --- | ---: | ---: |
| CSM | Weapon table `tr` | 70 | 6 |
| SM | 386 table rows + 1,336 other nodes | 0 | 0 |
| BA | 71 table rows + 230 other nodes | 0 | 0 |
| DA | 68 table rows + 252 other nodes | 0 | 0 |
| DG / AM / Tyranids / Tau / EC / glossary / Core | No changed expectation | 0 | 0 |

The SM-family rows above describe this patch, not an assumed Linux result. The preliminary measured census must pass before the full queue starts. No accepted hash is refreshed merely to make that census pass.
