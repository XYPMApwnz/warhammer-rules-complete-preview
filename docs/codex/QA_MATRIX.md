# Targeted QA matrix

Run `npm run qa:help` for the command list. Begin with minimum QA, add dependent QA only when the stated boundary changes, and reserve `qa:release` for release work.

For independent unified V2 certification of Core, DG, AdMech and CSM, follow the [authoritative certification requirements](../PROJECT_SOURCE_OF_TRUTH.md#independent-v2-certification-requirements). The targeted suites below provide regression evidence; a green suite alone does not establish `CONTENT_CERTIFIED` or `USER_PATH_CERTIFIED`.

| Change area | Minimum QA | Dependent QA | Release-only QA |
| --- | --- | --- | --- |
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
| Glossary facts/editorial/build | `qa:glossary` | Affected `qa:<book>` for projection changes; `qa:integration` for viewer wiring | `qa:release` |
| Publication/mobile/offline inventory | `qa:publication` | `qa:integration`; targeted rendered/browser QA | `qa:release` |
| Source manifest/authentication | `qa:sources` | Affected `qa:<book>` and source-specific `--check` | `qa:release` |
| Architecture-sensitive ownership/identity | `qa:architecture` plus direct subsystem QA | Affected books and `qa:integration` | `qa:release` |
| General route/wiring change | `qa:integration` | `qa:publication` or targeted browser QA | `qa:release` |
| Documentation/QA aliases | `qa:workflow` | One representative changed alias | None unless preparing release |

## Expansion rules

- SM changes expand to DA/BA only when inherited facts, exclusions, overrides, relations, effects, points, or publication membership can change.
- Shared-code changes expand to the books that execute the changed path; do not run all books by reflex.
- Browser QA is required when the defect or change is observable only through the actual rendered/runtime consumer.
- `qa:architecture` is regression evidence for an architecture-sensitive change, not permission to start a new audit.
- `qa:release` intentionally aggregates targeted, publication, and source gates. No `qa:*` command invokes `test:full` or `test:release`.
