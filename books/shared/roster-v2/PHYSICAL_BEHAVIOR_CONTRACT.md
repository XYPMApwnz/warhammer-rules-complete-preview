# Physical roster behavior

New Recruit owns army formation legality. These invariants concern preservation,
source ownership and effective presentation, not a second army builder.

| Boundary | Required behavior |
| --- | --- |
| INPUT | Preserve supported imported selections and quantities. |
| IDENTITY | Join existing canonical IDs within their actual factual owner. |
| QUANTITY | Render known UNIT quantities once, including alternate weapon profiles. |
| OWNER | An aggregate selection never manufactures a physical MODEL bearer. |
| RECIPIENT | UNIT effects can use a proven physical/formed UNIT. MODEL effects require their exact source-qualified bearer. |
| OPERATION | Use existing typed operations; an attack threshold is not BS, WS, Movement or a weapon ability. |
| PRESENTATION | Effective Datasheet and Personal Guide expose the current value, recipient and source. |
| ISOLATION | Same-datasheet instances and independently owned model rows remain separate. |
| RECOMPUTE | Detach, removal, reload and reimport rebuild from immutable source facts. |

`MODIFY_RULE_METRIC / criticalHitThreshold / SET` represents an unmodified Hit
roll threshold on the selected recipients' weapon profiles. Values are integers
2–6. The lowest applicable threshold wins; independent source contributions
remain traceable. Weapon selectors restrict melee/ranged applicability. It does
not roll dice, select targets or activate phase-dependent rules.

The presenter displays `Critical hits: N+` with canonical source links. It must
not merge different source/recipient annotations merely because numeric values
match. Missing execution provenance fails closed.

Evidence begins with accepted source text, then an independent expectation,
then import/executor and production presentation checks. Do not derive expected
values from production declarations. A book with no equivalent source rule is
N/A. Conditional battle rules remain conditional.

Regression entrypoint: `v2/source-effect-regression-qa.mjs`, including the shared
aggregate inventory contract and source-backed DG/CSM threshold controls.
`v2/source-completeness-qa.mjs` validates the reviewed requirement links. New
rules require source review and an independent expectation before changing
review metadata; historical coverage is not automatically a fresh PASS.
