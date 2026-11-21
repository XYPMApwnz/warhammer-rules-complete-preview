# Rule conditions

The nine native books use the shared vocabulary in
[`conditions.mjs`](../../books/shared/rule-contract-v2/conditions.mjs).
Each definition records a key, ROSTER or BATTLE level, expected value type,
structured parameter names and an existing shared computer, when one exists.

```js
{
  predicate: 'FIELD',
  subject: 'MODEL',
  contextLevel: 'ROSTER',
  arguments: {
    key: 'enhancementAssigned',
    equals: true,
    ruleId: 'detachment-example:enhancement:1'
  },
  evidence: existingEvidence
}
```

Canonical identities belong in parameters, never inside the condition key.
`equals` is required and typed. Evidence, subject, level and condition placement
retain their original meanings. Different parameters identify different context
facts; opposite expected values compare the same fact.

`conditions-build.mjs` is the explicit producer boundary. It preserves unused
schema declarations as parameterized `conditionFields` and existing computer
bindings as `conditionComputations`. The temporary declaration inverse exists
for source validation, not as a runtime alias fallback. Accepted sources and
Stratagem contracts remain outside data migration.

ROSTER means the condition can concern roster state; it does not prove that a
computer or the required physical/historical evidence exists. Missing context
stays UNKNOWN. BATTLE conditions require supplied battle facts and do not acquire
new roster-derived values. `attached` and `LEADING` remain different predicates.

The shared context computers preserve physical MODEL ownership, attachment
membership, equipment quantity proof, validated player selections and dated
initial-attachment evidence. Existing CSM ability dependencies retain the first
pass without dependent grants and the second pass using its ability projection.

See the generated [audit](../audit/condition-translation-2.md) and
[machine-readable inventory](../audit/condition-translation-2.json) for the
complete dictionary, per-book old-to-new mapping, original schema declarations,
retained Stratagem fields, missing computers, byte growth and evidence limits.

The audit distinguishes static translation/inverse proofs from actual scenario
trace comparison. `--parity FILE` attaches the execution harness's stable counts,
coverage, hashes and explicit zero-difference result. Unattached execution evidence
is marked `NOT_MEASURED`; generation does not invent observations or rerun that
harness. `--check` can reuse saved external measurements while recomputing the
repository-derived inventory and static assertions.
