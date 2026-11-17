# Roster cards: gained rules

**Review snapshot: the owner has authorized one final full pre-FF on the exact feature SHA below. This evidence is published before that run, as requested. Acceptance is pending; no final PASS is claimed.**

Feature: `codex/card-gained-rules-v1`, `9b99ade9975346afc3644ade7f69d01ed71cce31`.
Accepted source/base: `9a48765744f32f467f6e53c1f85e94921cbdd54b`.
This is a presentation change; the only approved generated exception is the CSM copy-tier metadata described below. No release/Pages/source fast-forward is authorized or performed.

## Player-facing result (requirements 1–10)

| # | Result |
|---|---|
| 1 | Roster cards show one actual instance price, with a separate `+ N pts · Enhancement` surcharge. Full Army Book keeps its complete price grid. The same selector uses typed model/copy bounds for all nine books and the physical roster order for repeated canonical datasheets. |
| 2 | Computed gains use one common gold accent plus an explicit `+`. Foreign sources use a compact touch/click/hover/keyboard tooltip with ARIA linkage and Escape dismissal. Own-source attribution is hidden; the gain itself remains. One legend explains the marker. |
| 3 | Weapon gains and critical thresholds are chips in the weapon keyword row. Retained typed proof nodes preserve existing test/consumer identities; duplicate visible service paragraphs are removed. |
| 4 | A single above-table summary appears only when the exact existing physical weapon occurrences are all covered. Individual weapon chips remain, and independent effects retain independent IDs and recipients. |
| 5 | Visible `Source:`/`Applies to:` service paragraphs are absent. Full exact attribution is retained in source-bound metadata. Partial recipients may have a short caption; complete-unit recipients do not get a redundant caption. Foreign source details remain in the tooltip and Gained rules. |
| 6 | Vector of Disease keeps SUSTAINED HITS 1 and LANCE as two distinct effects and chips. One physical source caption replaces repeated per-effect captions. See the nine-book sample census below. |
| 7 | Gained rules is the last card section. Groups are ordered leader/attached unit, enhancement, detachment. Detachment details start closed. Full canonical texts remain unchanged, source headings appear once. |
| 8 | Already-computed unit gains appear near the top, above profile stats. Lord of Contagion's existing Silent Bodyguard Feel No Pain 4+ is exposed there; Death Approaches remains prose. No battle event or new effect is automated. |
| 9 | Old alternating green/pink stripes came from `.ability:nth-child(even)` and encoded row position, not ownership. Roster styling now accents gains explicitly. Full Army Book snapshots remain unchanged. |
| 10 | Nonempty Gained rules has the exact in-card local-tab target. The 390px test clicks it and checks heading visibility. At 1440px the existing application policy hides this local navigation; that unchanged policy is asserted rather than forcing a hidden click. |

The DG owner v37.25 input remains byte-identical. The gallery explicitly records two derived normal-UI attachments: Lord of Contagion → Deathshroud; Biologus Putrifier → ten Plague Marines, because Foul Infusion's existing leading condition must be satisfied. No effect is invented for standalone Putrifier.

## Commits

1. `a60007d5` — typed CSM copy-tier bounds through its normal builder.
2. `b75732ee` — shared roster-only presentation.
3. `5b28b1d2` — new cross-book browser coverage, approved old-test location adaptations, queue entry and documentation.
4. `60ed8466` — remove the remaining own-native Source prefix and preserve original canonical ability navigation (old failing tests unchanged).
5. `9b99ade9` — all-scope F1 absence check and two explicit regression cases in the new test.

## Generated boundary

| File | Approved change | Exact check |
|---|---|---|
| books/chaos-space-marines/v2/generated/app-presentation.json | Add numeric minCopies/maxCopies to 56 existing MFM rows (112 properties); unbounded maxCopies is null | Removing just these new properties yields the entire accepted base JSON. Raw diff adds exactly 112 lines and removes zero. Prices, labels, source fields, rules/effects and all other existing properties are unchanged. |
| Every other generated file | None | Exact base comparison and the normal deterministic generated gate. |

CSM publication grows by 2,772 bytes: 19,597,950 → 19,600,722. `CSM_GENERATED_EXCEPTION.json` contains all 56 rows and before/after SHA-256. No generated JSON was hand-edited. The builder still reads its historical `official-mfm-v1.5.json`, as explicitly required: all 126 rows match current v1.6 in value, labels and bounds (`CSM_LEGACY_MFM_DEBT.json`). Migrating that input remains debt.

Independent browser copy-tier checks: CSM Accursed Cultists 90 / 90 / 110 = 290; DG five-model Blightlord Terminators 185 / 185 / 215 = 585. The test derives expected prices from the current raw MFM captures, with explicit fixture/source identities and unique-match assertions. It does not freeze these values for future releases. The current-v1.6 oracle replay checks the original 28 cards with zero expectation changes; three added physical cards have explicit independent current-MFM bindings. The old Death Blow input still exports 170 points; current MFM prices its Terminators at 190, without changing that input or any old numeric assertion.

## Source duplication, text-only rules and stripes

The shared old renderer emitted a caption per granted ability field. Vector has two existing contributions, so each Manreaper mode received the same physical rule caption twice. Grouping uses canonical rule, physical source/model scope and provenance, while effect proofs remain separate.

`FINAL_SOURCE_COUNTS.md` records all nine books in the selected 15-scenario sample: four affected DG weapon rows/four excess blocks before, zero after; the other eight selected book scenarios had zero duplicate weapon captions on both trees. This is bounded fixture coverage, not a claim about every possible army. All nine selected books have zero final self captions and zero technical-label leaks.

Full prose without a computed contribution in the selected snapshots: DG Death Approaches and Icon of Despair; AM Battle Protocols; CSM Accursed Horde and Malign Sacrifice; SM/BA/DA Unyielding in the Face of the Foe and Strategic Acumen; Tau Suppression Volley, DS8 Support Turret and Exemplar of the Kauyon; Tyranids Vanguard Predator. EC has no ROLE-only item in this sample. Cacophonic Accompaniment and Volley Fire have ROSTER_EFFECT proof and are not mislabeled as intrinsically text-only. See `PRESENTATION_INVENTORY.md` for exact scope.

## Tests and negative controls

- New browser check: 446/446 PASS, all nine books, 15 scenarios, 390/1440, 74.770 seconds. Added once to sequential pre-FF and available as `npm run test:card-gained-rules`.
- Clean base: requirements a/b/c/d have real failures; e already passes there, as approved. Complete count table is in `BROWSER_EVIDENCE.md`.
- An injected visible internal ID fails the technical-text guard, exit 1. A temporary F1 copy injecting a visible Applies paragraph fails the final rendered-text helper, exit 1. Both mutations leave the repository untouched.
- Twelve old browser tests change only approved presentation lookup/opening. Full canonical text, source identities, physical recipient counts, MODEL/UNIT scope, restrictions, values and attach/detach controls remain. `TEST_CHANGES.md` gives every before/after row; `APPROVED_TESTS.patch` gives the full diff, including the test-only absence helper.
- The diagnostic full-run failures and their addressed proofs are recorded below; no acceptance PASS is claimed.

## Gallery and coverage limits

`GALLERY.html` opens locally without the internet: 64 before/after pairs (128 screenshots) plus an open tooltip. Camera-only styling hides external fixed shell chrome and makes in-card navigation static identically on both sides; no card content is hidden. Full Army Book has two exact equal snapshots and keeps all price tiers.

The browser also compares 30 full available runtime tuples before/after, with no differences, and checks that rendering itself changes none. AM and CSM do not expose a points property on either tree; no API or aggregate is invented to conceal that limit. The independent native 199-roster comparison supplements this evidence.

The representative inputs do not provide a positive mixed-unit case where an existing computed MODEL gain covers just one member of a multi-model profile. No gameplay effect was manufactured for such a screenshot; existing physical-recipient tests remain strict.

## Precache and preview

No startup module/resource or precache inventory entry is added. Only existing shared presenter/CSS files and the approved CSM data file change at runtime. The package/cache revision is produced by normal tooling, not manually stamped. The final normal package and preview result will be recorded below.

## Final verification and pending acceptance

The single authorized full pre-FF ran on `5b28b1d2be8fc6f146a664bfa009f61215b4167a`: **171/173 PASS, 2 FAIL, 109.18 minutes**, clean start/end. Both failures were real presentation/navigation defects; neither old test was weakened. Full diagnosis: [DIAGNOSTIC_PREFF.md](DIAGNOSTIC_PREFF.md).

| Check on corrected code | Result | Evidence |
|---|---|---|
| Old card-display-2, all cases / both widths | PASS, 86.827 s | correction-targets/RESULTS.json |
| Old fabius-safe-import, all 14 checks | PASS, 35.667 s | correction-targets/RESULTS.json |
| F1 with actual visible-absence check in every rows caller | PASS, 166.038 s | f1-all-scope-correction/RESULTS.json |
| New expanded gained-rule browser | 446/446 PASS | after-final-9b99-20261117/RESULTS.json |
| Clean accepted base | 446 checks, 174 expected failures; a–d reject the old view | before-final-9b99-20261117/RESULTS.json |
| Preexisting canonical Core/Librarian navigation | PASS on both clean base and corrected feature | BROWSER_EVIDENCE.md |
| Visible internal ID injected into a caption | Actual exit 1; only technical-text guard e fails | mutation-final-9b99-visible-id-20261117/RESULTS.json |
| Visible Applies paragraph injected into UNIT policy | Actual exit 1, offending caption reported | F1_UNIT_VISIBILITY_MUTATION.json |
| Final native A/B at `9b99ade9975346afc3644ade7f69d01ed71cce31` | 199 inputs / 507 states / nine books, 0 differences | native-ab-9b99/native-compare/RESULTS.json |
| Nine complete generated gameplay payloads | Byte-identical, no semantic filtering | native-ab-9b99/generated-gameplay-compare/RESULTS.json |
| Generated rebuild at diagnostic commit | 67 steps / 147 outputs PASS, 17.97 min | GENERATED_GATE.json |

Native capture outcomes are unchanged: 177 READY and 22 intentionally NEEDS_BINDINGS cases. The baseline capture is immutable `9a487657`; the fresh corrected capture names the final `9b99ade9` commit and checks the exact same fixture SHA. All source/runtime/points observations are compared without filtering.

The new Source-prefix regression is covered by the existing exact nine-book aggregate census: **10 own-native sections / 20 canonical links**, SM 4/8, BA 3/6, DA 3/6, other six books 0/0. The roster-only label is removed; native canonical links and complete prose remain. Full Army Book does not enter the changed path. `NATIVE_SOURCE_PREFIX_CENSUS.json`.

The F1 targeted test uses the exact file hash later committed at the final SHA; its source/recipient IDs, complete text, counts, MODEL/UNIT scopes and values are unchanged. The added common absence assertion covers every matching policy before reading retained attributes.

### Package boundary

Normal packaging after corrections: **449 files / 215 mandatory precache URLs**, the same path inventory as the accepted base. No new startup resource. Service worker bytes are unchanged. Runtime bytes 282,703,011 → 282,740,181 (+37,170). Normal cache revision `13d4ebbe7d86c54e` → `af10604b9a0b39e0`.

Only five packaged files differ: shared presenter JS/CSS; approved CSM presentation JSON; normal cache-revision and app-HTML stamps. `CORRECTED_RUNTIME_BOUNDARY.json`. The corrected package is not deployed.

### Publication before the authorized final run

On 2026-11-17 the owner explicitly authorized one final full qa:pre-ff on `9b99ade9975346afc3644ade7f69d01ed71cce31`. It has not started at the time of this review snapshot. The diagnostic run remains 171/173, and addressed tests are not mislabeled as a full-suite PASS. The final run will preserve its own metadata and logs separately. Any feature SHA change after the run requires STOP; no corrective commit or extra full run is silently authorized.

The owner requested both feature and evidence pushes before the final run. The feature is pinned to `9b99ade9975346afc3644ade7f69d01ed71cce31`; this evidence branch adds one documentation/screenshots commit on that feature and must not be merged. Remote SHAs are reported in the delivery message because a commit cannot embed its own final SHA. GitHub source was rechecked as `9a48765744f32f467f6e53c1f85e94921cbdd54b`; source/main/release/Pages and all fast-forwards remain out of scope.

The accepted preview remains on `9a487657`: http://192.168.1.124:8765/ (HTTP 200), PID 27796, listening package under E:/Warhammer/qa-tmp/preview-v1/package-9a487657. It has not been switched to an unaccepted feature. TLS/firewall/server configuration is unchanged.

Temporary task files remain in E:/Warhammer/qa-tmp/card-gained-rules for pending validation; live preview and TLS files are outside that directory and protected. The two pushes happen before the authorized final run. Task cleanup and preview restart on the exact feature SHA remain after a final PASS; the preview must stay on the accepted base until then. This evidence commit is a pre-run snapshot, so the final result is delivered separately rather than rewriting the pushed history.

## Full approved test-change table

Base: `9a48765744f32f467f6e53c1f85e94921cbdd54b`. Full exact diff: `APPROVED_TESTS.patch` (twelve existing browser tests plus the new test-only visibility helper). No historical fixture or its SHA was repinned.

The owner approved the original seven tests, then the exact detachment source-link precondition, then the F1 recipient-caption patch with a visible-absence assertion. The general permission covers equivalent group/tooltip opening and retained-caption reads only. It does not authorize changing gameplay expectations.

| Test: original base lines | Before | After | Why / exact checks preserved |
|---|---|---|---|
| card-recipient-browser-qa.mjs:197–213,230–244 | Read visible Source/Applies paragraphs, including repeated per-effect source notes | Open the exact source group/tooltip; read the same retained captions and verify their physical ownership; explicitly reject visible legacy prefixes | Same rule ID, canonical anchor/text, provenance, source instance, MODEL/UNIT scope, recipient IDs/counts and unique IDs. Vector's SUSTAINED HITS 1 and LANCE remain two independently checked effects/chips on each melee weapon; repeated caption is rejected. |
| card-display-2-browser-qa.mjs:83–114,163,194 | Source caption expected immediately visible in the old section | Observe the exact retained source proof and its tooltip/group; self source remains hidden; same full text after opening the exact detachment group | Missing caption, wrong rule, foreign card/source, wrong provenance/model scope and nonunique IDs are still errors. All canonical text and gameplay projection comparisons remain. |
| cards-cosmetics-browser-qa.mjs:84,88,93–96 | Visible self keyword recipient caption and old enhancement/attached sections | Check the same hidden exact recipient metadata, new keyword chip, exact enhancement group and source heading; open Killing Blow's exact tooltip | CONTAGION ENGINE/FLY, source/target IDs, original full recipient string, complete GRAVIS-only restriction and Scouts body are unchanged. Hidden proof must actually be nonvisible. |
| detachment-card-text-browser-qa.mjs:50–51 | Full detachment fields visible immediately | Open only their exact enclosing detachment details before the same checks | Same rule/clause IDs, recipient subject/kind, complete canonical quote, source fields and physical card. |
| card-texts-browser-qa.mjs:80 | Source/owner label inside attached article | Exact typed source-group heading with the same physical source instance | Full canonical prose, exact recipient/source IDs, isolated-copy negative, detach and complete projection equality unchanged. |
| reviewed-text-coverage-browser-qa.mjs:46 | Source substring/owner inside article | Exact same owner in the article's source-group heading | Exact full body, parsed-unit-1 source, same physical recipient, detach/independent negatives unchanged. |
| wardens-source-binding-browser-qa.mjs:31 | Source: Wardens of Ultramar inside article | Exact From attached unit heading and same physical source instance | Same full body, SUPPORT role, six-model profile facts and attach/detach/independent controls. |
| detachment-recipient-browser-qa.mjs:90–109,123–131,159 | Read visible Applies caption and click immediately visible source anchor | Open only exact group/tooltip; read retained data-recipient-caption, asserting same physical card, rule ID and exact recipient/model arrays; reject any visible Source/Applies text | Same full recipient strings/counts, canonical rule/clause text, source link/dialog, INSV 4+, FNP 5+ and every old UNIT/MODEL assertion remain. |
| card-display-browser-qa.mjs:103–134 | Canonical metric fields immediately visible | Open only the exact fields' enclosing detachment group first | Same field IDs/full text, metric values, source visibility/provenance, caption-only mutation and full projection equality. |
| card-polish-2-browser-qa.mjs:61–97,169–184 | Death Blow/choice/source targets visible without opening a group | Open only exact group and source tooltip before the unchanged target/link checks | Same +1, source text references, one complete choice, three separate effects, full Numberless Horde table values and complete projection equality. |
| attached-rule-text-browser-qa.mjs:158–172 | Exact owner expected inside attached article | Read same owner from its exact ancestor source-group heading; assert one visible heading, typed source kind, exact source instance and same physical card | Full canonical rule/body, source paths, counts, unrelated-recipient negatives and detach cases unchanged. |
| dg-am-recipient-enrollment-browser-qa.mjs:101–122 | Exact owner expected inside attached article | Same ancestor-heading ownership check | Full canonical body/restriction, quantities, UNIT/MODEL scope, all negative/detach controls and Full Army Book checks unchanged. |

All current-card callers use the shared **test-only** `assertNoVisibleLegacyAttribution` helper. It inspects rendered text, including computed visibility, closed details and nonzero text rectangles; it does not mistake retained data attributes for visible text. Historical/negative observation modes retain their historical paths.

## Actual negative controls

- A deliberately visible `Applies to: synthetic visibility control` paragraph is injected into a temporary F1 test copy **after the existing exact MODEL/value checks**. The final helper rejects it, process exit 1, with the offending caption and bounded diagnostics (`F1_FINAL_VISIBILITY_MUTATION.log`). The repository is not mutated.
- New requirements a–d reject the clean accepted base. Requirement e already passes there, as explicitly accepted by the owner. Injecting `From datasheet-synthetic-internal-id-00001` into the rendered caption fails only e with process exit 1; the `From` wording isolates the ID guard from the new Source-prefix absence guard. No artificial failure is added to the clean base.

The new cross-book browser test independently reads the current raw MFM captures, by explicit fixture-to-source identities and exact unique matches. Its 28-price replay changes **zero** v1.6 expectations; it does not freeze future current prices or use the displayed value as its oracle.

## Completed all-scope F1 follow-up

The common `rows()` collector now checks actual rendered-label absence on the exact physical card for **every** matching policy, immediately after opening only that policy's exact source group. This covers UNIT and CSM paths as well as the existing AM MODEL assertion. All original collectors, IDs, strings, arrays, counts and numeric expectations remain unchanged. The final F1 file hash equals the passing targeted-run hash: `0e17b74fb6109e37db063ce67ef8154db881c92f96a535bbf29edf56a02dbbba`.

All 17 browser families at both widths pass (166.038 seconds). A separate actual UNIT-path mutation injects `Applies to: synthetic UNIT visibility control` outside the retained metadata and fails with process exit 1 at the common visible-text assertion (14.223 seconds); `F1_UNIT_VISIBILITY_MUTATION.json` / `.log`. This closes the uncovered UNIT/CSM absence-check path rather than relying on the previous AM-only call.

The subsequently diagnosed failures in `card-display-2` and `fabius-safe-import` were corrected in production presentation code. Their old expectations were **not** changed: the native Source prefix is gone and the original canonical ability links remain navigable. The expanded NEW test covers both regressions; its actual canonical navigation checks pass on the clean historical base as well as on the corrected feature.

## Review files

- [Before/after gallery](GALLERY.html): 64 pairs plus one tooltip image, all local relative assets.
- [Full existing-test diff and absence helper](APPROVED_TESTS.patch).
- [New browser test diff](NEW_BROWSER_TEST.patch).
- [Queue and QA documentation diff](TEST_QUEUE_CHANGES.patch).
- [Browser proof table](BROWSER_EVIDENCE.md).
- [First-run diagnosis](DIAGNOSTIC_PREFF.md) and [all 173 job timings](PREFF_TIMINGS.md).
- [Final native A/B](native-ab-9b99/native-compare/RESULTS.json), [generated gameplay A/B](native-ab-9b99/generated-gameplay-compare/RESULTS.json).

The final full-run result will be reported in the chat and the local task evidence. This single pushed evidence commit intentionally precedes execution and will not be amended or force-pushed.
