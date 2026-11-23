# Parser-independent builds: Part 1 review

**READY_FOR_REVIEW — PC validation, as explicitly requested by the owner after splitting the task.**

Code branch: `codex/gh-actions-parser-independent-v1`.

Code SHA: `6156836b7841d2c4f4c429834013598b3484058e`.

Base: `f657befb10f59001d806bdac82eae520d08230d9`.

The feature branch remains at the exact SHA used for the completed PC run. This evidence-only branch adds documentation and safe metadata; it must not be merged into source. No force push, merge commit, source/main/release movement, default-branch change or Pages action was performed.

## Review boundary and important limitation

Part 1 covers parser-independent node fingerprints, six parser string-boundary conversions, the four separately approved sourceRefs read adapters and the three separately approved implementation SHA values. No new public-progress implementation, per-job timeout, Linux hang fix or additional workflow run is included.

The PC results below are complete and passing. **This is not a claim that the full Linux queue or the full Linux generated-byte gate passed.** The owner cancelled the GitHub run and deferred its hang and three failures to a separate task after review. Both local lxml builds use libxml2 2.11.9; Linux's measured libxml2 is 2.14.6. These are recorded explicitly rather than treating lxml's package version as its underlying parser version.

## PC verification on the frozen code SHA

| Verification | Result | Time |
| --- | --- | --- |
| Full sequential pre-FF | **213/213 PASS**, zero failures | 81m 54.753s |
| Generated rebuild, lxml 5.4.0 / libxml2 2.11.9 | **148 outputs**, 68 producer steps, **0 byte differences** | 11m 10.656s |
| Generated rebuild, lxml 6.1.1 / libxml2 2.11.9 | **148 outputs**, 68 producer steps, **0 byte differences** | 11m 10.458s |

PC Python: 3.12.14. The two generated checks use the real producer graph and compare exact bytes, including all nine Army Books, Core, glossary and shared projections. The expected 148 generated Git objects are also identical to the accepted base. Original HTML snapshots and their whole-file SHA-256 checks are unchanged. The published runtime allowlist has zero intersection with changed files; runtime content SHA-256 remains `2b3643a912a65dcdf285d5a8de5647d8c0bf2f156f39d1db920f4d108cf4f1c0`.

[Full PC results](PC_RESULTS.json), [all 213 job times](PC_TIMINGS.csv), [exact job plan](JOB_PLAN.json), [lxml 5.4 rebuild](GENERATED_LXML54.json), [lxml 6.1.1 rebuild](GENERATED_LXML611.json), [change boundary](CHANGE_SCOPE.json).

No local full queue was repeated. The code HEAD and working tree remained unchanged/clean after the run.

## Original parser-output inventory

The native producer paths and other parser-dependent operations for all nine books and glossary are documented in the code branch's [inventory](../parser-output-inventory-2026-11-23.md). Source hashing is not inferred from filenames: native source enrollment, discovery, identity bindings, semantic fingerprints and downstream factory consumers were traced.

The dependency remains ordinary `lxml==6.1.1` in requirements-army-books.txt. The project does not pin an old libxml2 version. lxml 5.4 is only an isolated compatibility experiment, not the project dependency.

## Measured SM/BA/DA differences before migration

PC: lxml 6.1.1.0 / libxml2 2.11.9. Linux: lxml 6.1.1.0 / libxml2 2.14.6.

| Book | Original native pins | Actually different serializer hashes | Changed node kinds | Portable native differences |
| --- | ---: | ---: | --- | ---: |
| SM | 1,722 | 107 | tr 76; div 31 | 0 |
| BA | 301 | 18 | tr 14; div 4 | 0 |
| DA | 320 | 34 | tr 26; div 8 | 0 |
| Total | 2,343 | 159 | tr 116; div 43 | 0 |

Each book had a measured nonzero difference, so the whole affected book migrates under the owner's conditional authorization. The measurement preceded migration; the earlier diagnostic workflow skipped its full pre-FF queue.

The frozen final PC/Linux comparison covers all **2,343 native plus 176 unique QA guards: 2,519 matches, zero portable differences**. This native/QA census is separate from full Linux output certification. [Comparison CSV](PARSER_COMPARISON.csv), [versions and summary](PARSER_COMPARISON.json).

## Fingerprint changes and preserved guards

Table rows hash complete ordered normalized cell text. Other nodes hash ordered tags, sorted class memberships, direct text, child tokens, comments and tails; they are not reduced to plain text. QA parser input domains retain their original bytes/Unicode choices (112/64 unique guards); there is no try-both fallback.

Original source/identity bindings and legacy serializer hashes remain unchanged as historical locator evidence. New sidecars join them exactly by stable source identity, document, selector and legacy hash. Only portable fingerprints are active validation inputs; retained serializer hashes are not a second acceptance path. Whole-source byte SHA, semantic data fingerprints, exact selector/cardinality, identity/owner, numeric profile and text assertions remain enforced.

| Scope | Native expectations changed | QA expectation fields changed | Node kinds |
| --- | ---: | ---: | --- |
| CSM | 70 | 0 | 70 weapon tr |
| SM | 1,722 | 47 fields / 45 unique guards | Native: tr 386, div 824, h2 22, li 201, span 232, td 57. QA: a 3, div 28, li 3, span 2, td 11. |
| BA | 301 | 131 | Native: tr 71, div 134, h2 3, li 40, span 45, td 8. QA: div 108, h2 7, li 8, td 8. |
| DA | 320 | 0 | tr 68, div 165, h2 3, li 33, span 43, td 8 |
| Total | 2,413 | 178 fields / 176 unique guards | **2,591 authored before/after fingerprint declarations** |

[Every fingerprint declaration before/after](FINGERPRINT_CHANGES.csv). Two original static-gameplay fields share one guard; the CSV retains both authored fields.

CSM converts six text_content parser results to native str at the parser boundary. Strict type equality for booleans, quantities and containers remains unchanged. The real build still rejects a wrong row fingerprint and a one-byte mutation of a copied original source file.

## Four separately approved read adapters

Generated bytes already use the accepted sourceRefs format, while these tests still read them as expanded legacy provenance; therefore their input adapters need decoding although generated files did not change.

| Test / accepted base line | Before | Approved read adaptation | Positive | Corrupt copied sourceRef |
| --- | --- | --- | --- | --- |
| BA foundation:423 | Published sourceRefs JSON compared to legacy producer objects | Existing generated_source_outputs before the same complete strict equality | PASS | FAIL as required |
| DA foundation:387 | Same representation mismatch | Same normalizer before the same complete strict equality | PASS | FAIL as required |
| BA reference:42-43 | Plain JSON reads for two published models | Thin Node bridge to existing parseProducerJSON; authored metadata reads unchanged | PASS | FAIL as required |
| SM named-recipient:36 | Plain JSON.parse for published facts | Existing parseProducerJSON; authored review read unchanged | PASS | FAIL as required |

All prior exact source, canonical identity, ownership, membership, recipient, MODEL/UNIT scope, rule text, numeric and refusal checks remain. No expected gameplay value is edited. The tests retain the original independent source fixtures and their hashes.

Each negative changes one sourceRef in an isolated ordinary file copy, with no hardlinks, rejects at the intended equality/decoder guard and restores scratch bytes. Original generated bytes remain unchanged. [Four positive and four negative controls](CODEC_CONTROLS.json).

[Minimal four-place approved read patch](CODEC_READ_ADAPTERS.patch).

Full changed-test diffs against the accepted base (zero unchanged context avoids copying source prose):

- [BA foundation](diffs/01-ba-foundation.patch)
- [DA foundation](diffs/02-da-foundation.patch)
- [BA reference](diffs/03-ba-reference.patch)
- [SM named-recipient](diffs/04-sm-named-recipient.patch)

The other fingerprint-only QA adaptations and all changed digests are included in the code diff and fingerprint CSV. They preserve the original factual/source/cardinality assertions.

## Exactly three implementation SHA values

The source-completeness review also authenticates the producer implementation file. The owner separately authorized exactly three SHA-field changes for the modified SM build.py:

| Review file | Entry | JSON field |
| --- | --- | --- |
| books/shared/roster-v2/source-completeness-review.json | SM | /books/space-marines/sourceReview/artifacts/1/sha256 |
| books/space-marines/v2/source-review.json | SM | /books/space-marines/sourceReview/artifacts/1/sha256 |
| books/space-marines/v2/source-review.json | Deathwatch | /books/deathwatch/sourceReview/artifacts/1/sha256 |

Old value: `f887c2e4f6d64e4543367159ce3e49aa1bf5ba3b065a39693662c3f2ba4c702e`.

Command, from the checkout root:

```powershell
(Get-FileHash -Algorithm SHA256 -LiteralPath 'books/space-marines/v2/build.py').Hash
```

Output:

```text
09FC3F8EA1317111DF0575F9D5FA0D0B86D20CF2DE4C79094EE36735B9F872D1
```

The new value equals both the current file and the committed Git blob. Structural comparison proves only those three scalar values changed in the two review files; all other decisions, artifact lists, canonical blocks and source fingerprints remain unchanged. [Exact three-value proof](IMPLEMENTATION_PINS.json).

Old/current SHA searches cover all 18 changed/new implementations across tracked text, complemented by independent review of 57 metadata registries and their active pin mechanisms. No additional active stale implementation pin was found for CSM build/model_sources, BA, DA or other changed code. Three historical audit reports retain the old SM hash as historical evidence. Existing SM foundation-QA pins remain valid because that file is unchanged. [Inventory and explicit paths](PIN_INVENTORY.json).

## Other targeted controls

- Shared structural/fail-closed fingerprint controls: 17 PASS.
- Census and privacy controls: 25 PASS.
- Real CSM/SM/BA/DA build, source byte integrity and retained strict type controls: 14 PASS, including the lxml 5.4 experiment.
- CI workflow/public-report controls: 45 PASS.
- Private input transport controls: 14 PASS.
- SM static-gameplay and source-review targeted suites: PASS.

No assertion is changed to contains, no source fixture is refreshed and no target is inferred by a display name.

## Cancelled GitHub run — separate deferred task

[Run 45125199666](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45125199666) was cancelled at the owner's explicit request. The always-export/upload steps ran, and the fixed safe three-file artifact was verified:

[GitHub safe report artifact](https://github.com/XYPMApwnz/warhammer-rules-complete-preview/actions/runs/45125199666/artifacts/14806939773).

| Result | Count |
| --- | ---: |
| Planned | 213 |
| Recorded complete | 204 |
| PASS | 201 |
| FAIL | 3 |
| Without result | 9 |

The failed rows are qa-temp-qa, book-update-command-qa and the generated-byte gate. The last persisted row is #204 import-notices-browser-qa PASS. #205 lazy-glossary-browser-qa is next in the plan, but its actual START/lifecycle phase is not proven by the old public report. On PC #205 passed in 110.826 seconds. The queue-step wall time was 222m28s; the last persisted result elapsed time was 90m11.329s. These are distinct measurements.

[Cancelled results](CANCELLED_GITHUB_RESULTS.json), [artifact/privacy verification](CANCELLED_GITHUB_ARTIFACT.json), [strictly evidenced completion/next-plan record](CANCELLED_GITHUB_DIAGNOSIS.json).

Linux preparation and native portable census passed (Python 3.12.16, lxml 6.1.1 / libxml2 2.14.6). **Full Linux 213/213 and full Linux 148-byte parity are not certified by this Part 1 review.** The owner explicitly deferred diagnosis/fixes of the hang and three Linux failures, public START/END progress and per-job timeouts. None of those new fixes is applied; no new workflow run was dispatched after cancellation.

## Publication and privacy

This evidence contains documentation, safe status/timing/hash metadata, CSV and test-code diffs only. No RAW Wahapedia, BSData content, source captures, private key, owner email, browser profile, DOM, trace, screenshot archive, raw assertion comparison or runner-local raw log is published. The code's existing full CI report allowlist is exactly REPORT.md, RESULTS.json and JOB_PLAN.json; census uses exactly two metadata files.

The private input remains the unchanged accepted fa30730fca11fbfe87be90684d481d50e0efaf66 verified-cache input. The read-only deploy secret is confined to its dedicated preparation step. No source/main/release/Pages/default reference is changed. This evidence-only branch is not a release candidate and must not be merged.

Temporary private work remains under E:/Warhammer/qa-tmp/gh-actions-pre-ff; it includes the verified input cache still referenced by the prepared checkout and private raw evidence. It is not uploaded or indiscriminately deleted.

STOP for Claude review of Part 1. GitHub reliability work is a separate task after that review.
