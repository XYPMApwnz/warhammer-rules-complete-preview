# Targeted QA matrix

Run `npm run qa:help` for the command list. Begin with minimum QA, add dependent QA only when the stated boundary changes, and reserve `qa:release` for release work.

`npm run qa:quick -- --books=am,dg` runs diff hygiene, the selected native books,
shared effects/roster/integration and workflow checks. Without `--books`, only
the shared gates run. Accepted book keys are `am`, `ba`, `csm`, `da`, `dg`, `ec`,
`sm`, `tau`, `tyranids`, and the alias `tyr` for `tyranids`. Repeated keys and
aliases for the same book run that book once (`--books=tyr,tyranids` is equivalent
to `--books=tyranids`). Use `node tools/qa-queue.mjs --help` for queue options.
`npm run qa:pre-ff` runs all nine books, the shared gates,
the existing browser suite, runtime packaging/determinism and the three source
gates, plus keyword attribution and the full `glossary:check` producer gate.
`qa:glossary` starts with strict cross-owner admission and published-reference
negative controls before the other glossary checks.
Both queues run sequentially, deduplicate leaf
commands and retain every exit status and log even after a failure. The final
exit code remains nonzero if any check failed; historical failures are not PASS.
`test:pwa-update` includes both working-screen manual updates and the initial
bootstrap auto-update regression (`test:pwa-bootstrap`), with once-per-version
failure recovery, saved-state retention, prepared offline startup and offline reopening controls.
`test:startup-precache` parses the eager startup import/resource graph independently
and rejects missing mandatory resources, including a removed-file mutation control.
Use `--out=<external-directory>` to retain `RESULTS.json` and logs. Full A/B card
parity is a separate review tool and is not included in either queue.
`npm run test:sweep-polish` checks human-facing reference text, physical caption
ownership, shared rule prose and visible technical-label leaks. Its browser guard
covers all nine full libraries, the 20 common glossary searches and representative
imported model scopes at 390/1440 (about one minute). It runs in pre-FF against
the packaged runtime; its pure display controls also run in quick.
`npm run test:card-gained-rules` checks physical roster-card prices, separate
weapon-effect proofs, accessible source chips, ordered gained-rule groups and
visible technical-label leaks across all nine books at 390/1440. It also checks
three-copy MFM tiers in CSM and DG and preserves the Full Army Book price grid.
The same browser check runs sequentially in pre-FF.

Python-based tests resolve their interpreter through `tests/helpers/qa-python.cjs`:
an explicit CLI override, then `QA_PYTHON` (or a preserved caller-specific legacy
environment key), then the current user's Codex runtime, then `python` on PATH.
An invalid explicit override is not silently replaced. This is test infrastructure;
factual producers keep their existing interpreter configuration.

For independent unified V2 certification of Core, DG, AdMech and CSM, follow the [authoritative certification requirements](../PROJECT_SOURCE_OF_TRUTH.md#independent-v2-certification-requirements). The targeted suites below provide regression evidence; a green suite alone does not establish `CONTENT_CERTIFIED` or `USER_PATH_CERTIFIED`.

| Change area | Minimum QA | Dependent QA | Release-only QA |
| --- | --- | --- | --- |
| Focused rule dialogs, selected equipment and exact prose links | `npm run test:rule-popups` (nine books, 390/1440; old-label mutation) | `test:sweep-polish`, affected canonical-reference browser tests; all three new module tests run in quick and the complete browser test runs in pre-ff | `qa:pre-ff` |
| Ambiguous named ability sections and weapon popup types | `npm run test:polish-5` (nine-book canonical-field census, actual named links at 390/1440, unknown-name fallback) | Existing exact-focus popup tests remain unchanged; the section census runs in quick and pre-ff, the browser census in pre-ff | `qa:pre-ff` |
| Space Marines local content/presentation | `qa:sm` | `qa:da`, `qa:ba` when inherited semantics or publication can change | `qa:release` |
| Dark Angels local overlay | `qa:da` | `qa:sm` only if the shared owner is changed; `qa:effects` or `qa:points` as applicable | `qa:release` |
| Blood Angels local overlay | `qa:ba` | `qa:sm` only if the shared owner is changed; `qa:effects` or `qa:points` as applicable | `qa:release` |
| Death Guard source/presentation | `qa:dg` | `qa:effects`, `qa:glossary`, or targeted browser QA when that consumer changes | `qa:release` |
| Adeptus Mechanicus source/presentation | `qa:am` | `qa:effects`, `qa:glossary`, or targeted browser QA when that consumer changes | `qa:release` |
| Tyranids local book | `qa:tyranids` | Relevant subsystem QA only | `qa:release` |
| T'au Empire local book | `qa:tau` | Relevant subsystem QA only | `qa:release` |
| Emperor's Children local book | `qa:ec` | Relevant subsystem QA only | `qa:release` |
| Chaos Space Marines local book | `qa:csm` | Relevant subsystem QA only | `qa:release` |
| Shared canonical/effective builder | Affected `qa:<book>` | `qa:architecture`, `qa:integration`; include dependency books | `qa:release` |
| Shared effect schema/interpreter/provider | `qa:effects` | Affected `qa:<book>`, `qa:roster`, targeted browser runtime | `qa:release` |
| Points source/projection | `qa:points` | Affected `qa:<book>`, `qa:roster` if assessment changes | `qa:release` |
| Roster parser/projection/runtime | `qa:roster` | Affected `qa:<book>`, `qa:integration`, targeted browser runtime | `qa:release` |
| V2 selected Enhancement / declarative grant presentation | `qa:shared:v2:enhancement-presentation` | `qa:shared:v2:enhancement-presentation:browser`, `qa:shared:v2:source-effects`, `qa:integration` | No new content certification |
| Roster navigation, lazy Stratagem references and existing saved snapshots | `node books/shared/army-book-app-v2/roster-navigation-qa.mjs` (quick/pre-ff) | `node v2/roster-navigation-browser-qa.mjs` (pre-ff, nine books at 390/1440); `--mutation=foreign-detachment --book=death-guard --widths=390` must fail the exact native-row guard | `generated:check`; exact native roster A/B before review |
| Glossary facts/editorial/build | `qa:glossary` | Affected `qa:<book>` for projection changes; `qa:integration` for viewer wiring | `qa:release` |
| V2 publication/offline inventory | `qa:publication` | `qa:integration`; targeted rendered/browser QA | `qa:release` |
| Source manifest/authentication | `qa:sources` | Affected `qa:<book>` and source-specific `--check` | `qa:release` |
| Architecture-sensitive ownership/identity | `qa:architecture` plus direct subsystem QA | Affected books and `qa:integration` | `qa:release` |
| General route/wiring change | `qa:integration` | `qa:publication` or targeted browser QA | `qa:release` |
| Documentation/QA aliases | `qa:workflow` | One representative changed alias | None unless preparing release |

## Expansion rules

- Import/Attachment Setup copy: `npm run test:import-messages` checks all nine books, exact native choice values, saved-state preservation and player-facing messages at 390/1440. The unit and browser checks also run sequentially in pre-FF. Browser negative controls: `node v2/import-messages-browser-qa.mjs --book=death-guard --widths=390 --mutation=label` (or `--mutation=option`) must fail the visible-copy guard.

- SM changes expand to DA/BA only when inherited facts, exclusions, overrides, relations, effects, points, or publication membership can change.
- Shared-code changes expand to the books that execute the changed path; do not run all books by reflex.
- Browser QA is required when the defect or change is observable only through the actual rendered/runtime consumer.
- `qa:architecture` is regression evidence for an architecture-sensitive change, not permission to start a new audit.
- `qa:release` intentionally aggregates targeted, publication, and source gates. No `qa:*` command invokes `test:full` or `test:release`.
