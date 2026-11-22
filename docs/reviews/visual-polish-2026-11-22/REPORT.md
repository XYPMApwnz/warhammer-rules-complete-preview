# Visual polish v1 — 22 November 2026

READY_FOR_REVIEW. Feature `codex/visual-polish-v1`: `9e04d5d43240795979d0257a27ba4c35cd2259f6`, based on `f5d73d531edbea8f8c919265477404c9b1b0eec4`.
Source, release, main and Pages were not updated. The evidence branch is review-only.

## Visible changes

1. Three action levels use shared tokens in `army-book-app-v2/styles.css`: a single primary follows the visible import/Warlord workflow; secondary actions have quiet borders; navigation uses ghost links. Exact labels, action IDs, callbacks and data are retained. The import form and Attachment Setup each have exactly one primary in the browser evidence.
2. Rule/weapon/Core-ability dialogs have a quiet single boundary and solid surface, with the old gradient strips removed. Close controls are unboxed 44×44 icons with their existing accessible names. Related references are a vertical link list; Open in Army Book/Glossary are links. All six sampled popup close controls expose visible keyboard focus with a 2px outline.
3. Imported detachment rows and compatible-reference rows no longer place framed navigation inside framed rows. Logical form fieldsets, separate physical-unit cards and weapon table cells keep their meaningful boundaries; independent rules/effects were not combined.
4. Unsupported or policy-forbidden service workers show no optional offline indicator. This avoids a permanent warning promising a retry that cannot happen. A real current resumable worker retains preparation, retry timing/budget, reconnect/focus recovery and Ready. Denied startup while offline can recover online-only when connectivity returns, without retrying forbidden registration. No worker/cache policy changed.
5. On ≤760px roster cards, supporting art no longer reserves an extra hero row; header/price spacing is compact. The representative 390px header changed 190.34→169.38px; the unused context strip 16→0px; characteristics moved 536.53→499.56px, inside the first screen. Canonical option metadata remains in the DOM. Desktop header height remains 210px; removing the empty strip also benefits desktop.
6. Attachment Setup resets Models/Points definition-list margins, removes empty padded bodies and reduces excess spacing. It retains all model/points values and controls.

The rendered-pixel baseline found a genuine 4.33:1 cover-subtitle case that axe could not decide because of artwork/gradients. The common subtitle color was made readable; wording and artwork were retained.

## Before/after gallery and contrast

[Open the offline-readable gallery](GALLERY.html). It covers book Library, empty import, Attachment Setup, Models/Points rows, roster card, ability popup, weapon popup, Core ability with Related references, global glossary and Core reader. Each has before/after at390/1440: 40 screenshots in total.

Axe-core4.14.1 reports **0 contrast violations**. Its 9089 full-DOM gradient/offscreen incomplete nodes are explicitly not presented as proved accessible. A viewport rendered-pixel supplement compares nominal computed RGBA (including ancestor opacity) against actual background pixels beneath painted glyphs; temporary text-fill hiding is removed before every normal gallery screenshot and changes no app data. Core iframe text is included. Occluded text is excluded by hit-testing.

| Measure | Result |
| --- | --- |
| Painted viewport text runs measured | 652 |
| Minimum measured text contrast | 4.7467:1 |
| Minimum measured control contrast | 5.5859:1 |
| Measured text below4.5:1 / WCAG violations | 0 / 0 |
| Unmeasured runs, separately documented | 24 |
| Exact semantic/factual screen digests | 20/20 unchanged |

The initial baseline pixel observer also saw the imported-text summary behind a sticky header and reported a spurious1.18:1 witness. That text was occluded, not painted for the player at that position; the final observer adds hit-testing, retains the initial witness and excludes it explicitly. The real visible cover-subtitle4.33:1 witness was corrected in CSS.

The24 unmeasured runs are11 occluded and13 clipped/native/no-painted-glyph cases. Compact evidence lists their selectors/text and reasons. Disabled controls retain the WCAG exemption; no missing measurement is silently counted as PASS. These are representative screens, not an exhaustive audit of every paragraph in all nine books.

## Nested-boundary inventory (shared nine-book templates)

| Location | Result and reason |
| --- | --- |
| Imported detachments | List rows unframed, exact target links ghost; outer setup card remains |
| Compatible/related reference lists | Redundant row frame removed; applicability/counts unchanged |
| Related references in rule/Core popups | Vertical links, no per-link cards; quiet section divider retained |
| Selected gear/source navigation | Existing canonical links use ghost presentation inside one factual row |
| Popup shell and close | One quiet modal boundary, no gradient strips; no boxed close icon |
| Import clarification fieldsets | Retained: semantic choice/error grouping with legends |
| Physical-unit/profile cards | Retained: distinguish independent units or composed quantities |
| Weapon/reference table cells | Retained: meaningful statistical columns, not navigation cards |
| Compatible-rule dialog content | Retained: distinct full rules remain separate; no effect merging |

## Offline availability evidence

New pure availability guard: **12/12 PASS**, including missing/throwing API, policy denials, denied getRegistration, real worker retry/recovery, exhausted existing timer budget and offline-denial→online-only recovery. Existing ordering4/4 and minimal-PWA cache36/36 controls remain PASS unchanged.

Actual package browser coverage: **8/8 PASS** at390/1440: missing API, throwing getter, denied registration and a normal real worker. Each opens Home and DG online without blank Loading. Unsupported cases have no retry indicator or repeat forbidden registration after online/focus events. Normal workers reach Ready for the package's exact revision. Only optional browser capability was simulated; app responses, facts and stored state were not substituted.

## Data, tests and compatibility

| Check | Result |
| --- | --- |
| Full generated rebuild | PASS;148 exact outputs,68 producer steps |
| Accepted generated Git blobs | 148/148 identical to base |
| Published JSON/data-JS facts | 41 files / 232,985,525 bytes identical |
| Native A/B | 199 rosters /507 states,0 differences; complete bytes, no masking |
| Visual factual/semantic digests | 20/20 identical before/after |
| Existing DG popup controls | 28/28 PASS, unchanged |
| Markup census/owner-only gate | PASS in full pre-FF; registry unchanged |
| Syntax targets | Safari15 / Chrome100 / Firefox102 guard PASS; no JSON attributes |
| Full pre-FF | 213/213 PASS;79.93 minutes; one run |
| Existing test expectations modified | None |

The old-test before/after table has zero rows. `TESTS.patch` contains only the new availability guard. All previous212 pre-FF jobs keep their order/arguments; one new pure availability test gives213. No old assertions or historical fixtures were weakened. Static syntax and CSS support are separate from a physical Safari-device check; Chrome was used for390/1440 evidence.

## Clean-room publication

A fresh exact-SHA clone started without node_modules, followed by the four actual workflow commands: `npm ci --ignore-scripts`, package, package `--check`, package-QA. Node v24.18.0, npm 11.16.0, actual host Windows-11-10.0.26300-SP0; this is not labelled a Linux execution. The dependency tree is clone-local and package/lock/source remain clean. All four commands exit0; package-QA15/15PASS.

| Package | Value |
| --- | --- |
| Aggregate | `2b3643a912a65dcdf285d5a8de5647d8c0bf2f156f39d1db920f4d108cf4f1c0` |
| Revision | `946ff60a59dc4381` |
| Runtime inventory | 456 files /282,883,615 bytes |
| Exact clean-room vs local files | 457/457 identical |
| Precache |221URLs, same membership;7-key startup core unchanged |

There are no new runtime files or imports. Existing helper/CSS/presenter bytes and their normal publication/SRI/revision stamps changed; source data did not. `service-worker.js`, cache policy and the runtime allowlist are unchanged. External axe is a review tool, not a runtime or package dependency. Full command outputs are in `clean-room/`.

## Commits and scope

```text
12b61b67a92b034600aa35dd8abf978dc580d663 Quiet shared controls and dialogs and compact mobile roster layouts
8839d9c4d87d7f15326a90f2ef57a49191c5b59d Hide unavailable offline preparation and test real retry availability
a0ad3a4de80f3af327bea4ed6dd298048add1e42 Keep popup cascade quiet and improve cover subtitle contrast
9e04d5d43240795979d0257a27ba4c35cd2259f6 Recover online-only startup after policy denial while offline
```

Changed source paths:
- books/shared/army-book-app-v2/book-v1.css
- books/shared/army-book-app-v2/datasheet-v1.css
- books/shared/army-book-app-v2/datasheet-v1.mjs
- books/shared/army-book-app-v2/popup-v1.css
- books/shared/army-book-app-v2/reference-v1.css
- books/shared/army-book-app-v2/roster.mjs
- books/shared/army-book-app-v2/styles.css
- books/shared/offline-status.js
- books/shared/unit-art.css
- docs/codex/QA_MATRIX.md
- package.json
- tests/helper-offline-availability-qa.mjs
- tools/qa-queue.mjs

The feature and evidence branches are for review. No source FF or release is performed by this task.

## Preview and cleanup: operational limitation

All code checks above completed on `9e04d5d43240795979d0257a27ba4c35cd2259f6`. The reviewed package was copied and verified at `E:/Warhammer/qa-tmp/preview-v1/package-visual-polish-9e04d5d4`.

Automatic permission review rejected the preview restart before execution. The tool reported only `CreateProcess rejected: blocked by policy`, with no more specific reason. No preview stop, restart, TLS, firewall or network change occurred. The existing address `http://192.168.1.124:8765/` therefore still serves the previous `e08ec20d` preview, **not this feature**. Use the before/after gallery to review this feature now.

The prepared owner script [restart-reviewed-preview.ps1](recipes/restart-reviewed-preview.ps1) checks the successful final verification, exact package manifest and old process identity before switching the preview. It was not executed. It preserves existing TLS and network settings. The adjacent starter and runtime-server files are supplied for review.

Automatic permission review also rejected temporary cleanup before execution, with the same generic reason. Nothing was deleted, and no alternative deletion route was attempted. The retained task directory is `E:/Warhammer/qa-tmp/visual-polish`. The optional [cleanup-owned.ps1](recipes/cleanup-owned.ps1) is unexecuted; its guard requires the reviewed preview to be running first. The preview package outside that directory is retained. These are operational policy limitations, separate from the completed code checks.
