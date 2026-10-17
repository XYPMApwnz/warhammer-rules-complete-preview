# Unified V2 source-to-contract review gate

Run `npm run qa:unified:v2:ready` before treating a Unified V2 book or release as ready. It checks authoritative factual freshness, the source review inventory, and the existing independent source-effect runtime/presentation guard. It is also the first stage of `qa:release`. The normal V2 Army Book presentation builders and Glossary builder validate source review metadata before publishing generated outputs. Normal builds are offline and never accept a new review baseline automatically.

`v2/army-books.mjs` owns the registered book list used by both the browser shell and the readiness check. Registration alone does not constitute source review. A sixth book must have a reviewed source inventory before it can pass readiness.

## What is reviewed

`books/shared/roster-v2/source-completeness-review.json` stores the review metadata. Each reviewed source block is pinned to the complete canonical entity, including identity, owner, content, and provenance. Accepted source enrollment and the actual bytes of its local source/provenance artifacts are pinned as well. New identities and changes to an existing block or its accepted source require review. An English sentence is not automatically classified as an executable effect. A text change requires review even when the extractor does not expose individual new semantic clauses. Review only the changed blocks and source artifacts; unchanged block pins and classifications remain intact.

Each semantic clause has a stable identity and an explicit classification:

- `EXECUTABLE_REQUIRED`: roster-known semantics requiring a binding or supported native path, typed operation, recipient, independent expectation, executor check, and production presentation check.
- `BATTLE_DEPENDENT`: conditions depend on a battle event or state unavailable to the roster; explain the missing state and preserve the conditional rule.
- `CAPABILITY_MISSING`: document the precise unsupported typed operation and expected semantics.
- `SOURCE_AMBIGUOUS`: record the conflicting source evidence and unresolved question.
- `UNVERIFIED`: state what evidence remains missing. This is not a successful semantic verification.
- `NOT_AN_EFFECT`: explain why the block does not define an effect, for example a profile or composition declaration.

Owner, recipient, activation conditions, explanation, and the implementation link or justified absence remain explicit. A rule with a permanent modifier and a battle-triggered clause needs separate records.

## Adding or changing a rule

1. Use the accepted book-owned source enrollment and canonical producer. Preserve the raw accepted source and official precedence evidence.
2. Run the gate to identify the new or changed source block. Review that block; unchanged blocks retain their existing review.
3. Record its exact source/canonical identities, provenance, owner, each semantic clause, recipient, activation conditions, and classification. Do not create classifications from the current contract inventory.
4. For an executable clause, write an independent expected result from the accepted source before deriving production behavior. Bind the exact source owner through the existing book-specific pipeline. Add positive, absent-source, recipient/isolation, remove/recompute, executor, and production presentation checks to the existing source-effect guard.
5. Check that removal of the binding, incorrect values or recipients, incorrect activation, and loss of the presented result fail. Preserve reviewed expectations when changing production contracts.
6. Update only the reviewed metadata for the changed block and accepted source. Review the metadata diff separately from generated outputs. A normal build must not refresh these pins or accept all current contracts as reviewed.
7. Run `npm run qa:unified:v2:ready`, relevant targeted QA, and `git diff --check`. Report documented gaps and unverified cases with the result.

The review inventory is validation metadata. Canonical/effective Army Book owners remain the only owners of gameplay facts, and the shared executor/presenter remain the production path.

The normal Army Book writers check freshly produced effect declarations before writing outputs. The readiness command additionally uses the existing authoritative factual/Army Book parity producer and runs independent executor/presentation checks. Static build validation alone is not runtime proof. The accepted historical census is checked separately so deleting one sibling classification cannot be hidden by keeping another clause in its block.

## Existing five-book baseline and limits

The imported coverage audit contains 1,223 historical clauses and 397 historical executable requirements. The current 15 `EXECUTABLE_REQUIRED` obligations each need the independent runtime/presentation proof. The 361 historical `EXECUTABLE_PRESENT` observations are currently `UNVERIFIED`, with their original classification and required status preserved as historical evidence. Three historical required unverified cases remain unverified. These explicit grandfathered exceptions do not silently become current independent runtime/presentation PASS. Documented capability gaps, source ambiguities, battle-dependent clauses, and unverified source blocks remain explicit.

Structurally pinned source blocks not resolved by that historical audit are retained as `UNVERIFIED`, with the limitation recorded instead of invented semantic expectations. This includes the 3,189 legacy source blocks recorded at initial enrollment. Their presence and future changes can be checked; their semantic completeness has not thereby been proved.

The gate proves identity/content review coverage and the linked checks it actually executes. It does not prove that a human review split every sentence into all necessary semantic clauses, that every historical observation is freshly validated, or that arbitrary English has been understood. New or modified blocks cannot enter silently, but an incorrect human classification still requires independent review evidence and mutation-sensitive expectations to detect it. Do not report 100% semantic completeness or all 397 requirements PASS from this gate.
