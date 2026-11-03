# Shared roster service lifecycle

`books/shared/roster-v2/runtime.mjs:createRosterService` owns the browser service
contract for all nine registered books. It composes existing native owners;
it does not parse New Recruit text, interpret rules, infer choices or own facts.

## Common operations

- Import admission -> `commitRosterImport` -> validated owner load -> publication.
- Replacement confirmation and retention of the current graph for the same
  complete physical import remain in the existing `commitRosterImport`.
- SM/BA/DA publish a fully prepared runtime through one shared runtime slot.
  Failed preparation never replaces the currently published runtime.
- Other owners retain their existing atomic load/context preparation. The shared
  service delegates to those owners without executing a second time.
- Catalog, state, projection, groups, snapshot, physical attachment operations,
  context, effective and related reads use the current runtime.
- `rosterImportBindings` converts explicit UI bearer choices to native binding
  inputs. `retainRosterBearerBindings` retries only the owner's existing proof
  of identical physical input; neither helper selects a bearer.

The required API is `catalog`, `state`, `projection`, `groups`, `draft`, `import`,
`load`, `snapshot`, `candidates`, `attach`, `detach`, `reattach`, `context`,
`effective` and `related`. Public attachment arguments are Leader first;
`candidates(leader)` returns candidate Bodyguards. CSM/EC adapters preserve their
native Bodyguard-first API behind that public boundary.

## Owner hooks and admission

Preparation hooks are synchronous. `prepareRuntime(snapshot)` returns an already
validated and calculated runtime; the shared publisher swaps its slot only after
the hook succeeds. `loadSnapshot` retains an existing owner-specific atomic load.

`importCandidate` returns the native import result. `prepareImport` may provide a
call-local validated runtime proof. SM/BA retain their private `runtimeProofs`:
only exact candidate bytes can reuse a proof, and retained attachments invalidate
that shortcut. Points validation still precedes publication. READY results do
not read/copy the previous roster solely to check a pending-bearer retry.

`rejectRosterImport` preserves existing native early INVALID/NEEDS_BINDINGS
responses, including their error boundary. READY cannot use this path: it must
pass the ordinary canonical commit. `decorateImport` and `importError` retain
native result metadata and the existing return-versus-throw behavior.

Owner `view` descriptors retain genuine optional capabilities and specialized
presentation. They cannot replace state/projection, draft/import/load or snapshot.
`isSharedRosterService` proves integration without adding snapshot or UI fields.

## Integration and retained ownership

| Book | Service integration | Native responsibilities retained |
| --- | --- | --- |
| Space Marines | `v2/roster-import.mjs` | Bearer admission, MFM preparation, paid options, points, runtime proofs |
| Blood Angels | `v2/roster-import.mjs` | Inherited facts, paid slots, physical context, points, runtime proofs |
| Dark Angels | `v2/roster-import.mjs` | Chapter admission/context, inherited eligibility and points |
| Adeptus Mechanicus | `v2/roster-runtime.mjs` | Equipment-caption bindings and narrowly permitted saved-reference restoration |
| Death Guard | `v2/roster-boot.mjs` | Canonical import bindings and Instrument admission |
| T'au Empire | `v2/roster-boot.mjs` | Physical source choices, qualified attachment candidates, setters and conditional related rows |
| Tyranids | `v2/roster-boot.mjs` | Source choices, dynamic schema/context, schema rollback and conditional related rows |
| Chaos Space Marines | `v2/roster-boot.mjs` | Native import/bearers, validation book, two-pass dependency execution and effective/related projection |
| Emperor's Children | `v2/roster-boot.mjs` | Weapon/bearer decisions, MFM attachment/history admission, adjudications, single-pass execution and conditional related rows |

Paths in the integration column are relative to `books/<book>/`.
AM/DG expose `groups` from their existing formed projection; this is a service
contract addition, not a new physical or gameplay fact. No optional capabilities
are synthesized: points remain SM/BA/DA-owned; chapter APIs are DA-owned;
source-choice APIs are Tau/Tyranids-owned; model scopes are CSM/EC/Tyranids-owned;
adjudications are EC-owned; recompute remains SM/BA/DA-owned.

The shared roster UI still owns localStorage and backup/restore controls. Snapshot
shapes, source references, initial/current attachment history and UNKNOWN semantics
are unchanged. Existing source-owned Stratagem rows in related results are retained.

## Verification

- `books/shared/roster-v2/service-qa.mjs` runs in `qa:roster`: publication rollback,
  replacement, explicit bindings, runtime proof reuse/invalidation, argument order,
  native rejection boundaries and protection against bypassing the lifecycle.
- `tests/roster-service-native-parity.mjs` independently loads public factories
  from `--root` with explicit `--fixtures`, `--books`, `--out` and optional
  `--compare` / `--require-shared`. It records complete source-qualified state,
  projection, contexts, effective/related, rejection rollback and N/A explanations.
- Existing CSM/EC native captures independently protect all executable clauses,
  weapon choices, physical recipients and history cases.
- `v2/source-refs-browser-parity.mjs --verify-service-storage` additionally tests
  actual backup export, file restoration, localStorage persistence and fresh-page
  restoration through the existing UI. Native and browser observations remain
  separate; a failed early assertion never certifies its unreached tail.
- Card comparisons wait for fonts and two quiet layout frames. The O-13 exception
  permits paragraph multisets only within corresponding blocks, preserving block
  order, exact text and duplicate counts; it never permits discarding game facts,
  physical recipients, source references or traces.
- The browser tool's explicit `--timing-only` scope measures real UI imports
  without card capture or backup work; it does not certify rendered cards.
  `--trace-service-calls` additionally records Chromium precise coverage to
  compare native construction/validation/execution counts. Instrumented timings
  are diagnostic only; normal latency uses separate uninstrumented repetitions.

Final local gate: `npm run qa:quick -- --books=sm,ba,da,am,dg,tau,tyranids,csm,ec`.
The full pre-FF queue remains a separate explicitly authorized review gate.
