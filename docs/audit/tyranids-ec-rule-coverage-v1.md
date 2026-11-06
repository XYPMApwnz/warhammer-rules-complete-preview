# Tyranids and Emperor's Children reviewed text coverage

Baseline: `c0fab930a4f45ba05c33b66834fbf979518d91ef`.

The producer-only shared module consumes explicit, source-fingerprinted book
reviews. It adds non-executable clauses through the existing contract builder,
recipient declarations and finalizer. It does not infer recipients from prose.
No presentation, compatibility, condition evaluator or effect executor changes
are part of this task.

The owner explicitly approved new BATTLE_ONLY conditional rows and the resulting
UNKNOWN-to-MATCH/CONDITIONAL compatibility changes. Existing effects, source
identities, physical choices, import results and gameplay values remain protected.

## Existing test expectation changes

| File | Before | After | Reason and independent evidence |
| --- | --- | --- | --- |
| `books/tyranids/v2/app-qa.mjs` | 19 contract IDs and reported contracts | 176 | All source paragraphs now have contracts; the original 19 contracts remain byte-identical. The new coverage QA separately protects their reviewed SHA-256 fingerprints. |
| `v2/fixtures/new-recruit-plain-header.json`, Tyranids observation | `b197971cdf934bcf43eda055ffd2ad0d6b666a01ced8e0500eb80c53054bdd3b` | `d386779c13696c3e07b129267edc1477e79575adb49e9ad16f0454ed3bd99837` | Exactly six approved conditional rows: Resilient Organism and damaged profile for each of three Tyrannofex instances. Independent baseline comparison confirmed complete import, state, points and every other projection byte unchanged. Assertions and negative controls remain intact. |

## Source-review boundaries

The source typo `excluding MONSTERS models` on Regenerating Monstrosity remains
literal. Its carrier selector preserves the existing import producer's conservative
MONSTER exclusion. Its text recipient is not guessed. Other unresolved source
recipients remain unrecorded and are listed in the detailed review.

Surprise Assault retains its existing executable contract, including its original
paragraph boundary and deferred text. This task does not rewrite accepted
executable clauses to split additional sentences.

`text-rule-review.json` contains every exact paragraph, classification reason and
explicit Enhancement carrier restriction. `text-rule-baseline.json` protects the
accepted executable contracts and clauses. Both inputs are producer/test data;
neither introduces a second runtime or public execution mechanism.
