# Diagnostic pre-FF — 2026-11-17

Commit: `5b28b1d2be8fc6f146a664bfa009f61215b4167a`. Clean start and end. Exactly one full pre-FF has run so far.

**171/173 jobs PASS; 2 jobs FAIL; 109.18 minutes (6,550,678 ms).** The run was allowed to finish; it is not reported as an acceptance pass. Original metadata/logs remain in `PREFF_RUN.json`, `PREFF_CONSOLE.log`, and `final-pre-ff/`.

| Job | Exact failure | Diagnosis | Correction / proof |
|---|---|---|---|
| 150: v2/card-display-2-browser-qa.mjs | `Visible legacy Source/Applies attribution: {"count":1,"first":[{"text":"Source:","tag":"P"}]}`; six SM/BA/DA cases across desktop/mobile | The new absence helper correctly caught the old `.ds-section-sources` label on own psychic rules. It fails at Librarian, before Guide. This is an actual remaining roster label, not a Full Army Book or dialog leak. The all-book existing census identifies 10 aggregate sections / 20 canonical links: SM 4/8, BA 3/6, DA 3/6; the other six books have none. | Roster-only removal of the leading text node, retaining both canonical links, IDs, source bindings and the entire aggregate prose. Full Army Book does not enter this presenter. Old test expectations unchanged. |
| 161: v2/fabius-safe-import-browser-qa.mjs:94 | `Scouts grant must be shown` | The existing runtime checks already find Scouts 6 and Infiltrators on the correct Lord Exultant MODEL. The new chip conversion discarded the previous canonical Core navigation anchor. | Preserve the original anchor: inside a self-source nonbutton chip, or in the exact foreign source group's rule-definition navigation. It is outside the source-proof node, preserving its exact source-anchor cardinality. No nested anchor/button is introduced. Old test expectations unchanged. |

Both production corrections are committed as `60ed8466b6f998c9d0c05534ef0e57652f3bd3d2`.

| Addressed test | Result | Time |
|---|---|---:|
| v2/card-display-2-browser-qa.mjs, all scenarios / both widths | PASS | 86.827 s |
| v2/fabius-safe-import-browser-qa.mjs, all 14 checks | PASS | 35.667 s |

Detailed target results: `correction-targets/RESULTS.json`. Neither old test was changed for these corrections.

## Positive evidence retained from the diagnostic commit

- Generated rebuild: **67 steps / 147 outputs, PASS**, 1,078,143 ms (17.97 minutes). `GENERATED_GATE.json`.
- Exact native A/B: **199 identical inputs / 507 states / nine books; 0 differences**. Full decoded runtime/projection/effective/import/points observations, without semantic filtering. `native-ab-final/native-compare/RESULTS.json`.
- Nine complete generated gameplay payloads byte-identical. `native-ab-final/generated-gameplay-compare/RESULTS.json`.
- New gained-rule browser test: **344/344 PASS** within the full run; bounded fixture coverage does not include the two newly found regressions, which are being added explicitly.
- The only tracked generated base delta remains CSM's approved 56 rows / 112 minCopies/maxCopies properties; all preexisting values unchanged. `CSM_GENERATED_EXCEPTION.json`.
- Package boundary: **449 files / 215 mandatory precache URLs**, no added startup files; service worker itself byte-identical. The normal package stamps a new cache revision. `RUNTIME_BOUNDARY.json`.

The F1 all-scope absence check is the already-authorized extension of the owner's condition; it does not alter any game expectation. A final full run after these application corrections requires additional owner authorization because the original prompt limits pre-FF to one run. No second full pre-FF, push, fast-forward, release or Pages update has been performed.
