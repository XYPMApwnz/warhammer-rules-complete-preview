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
| REIMPORT | The same import namespace and complete validated physical state preserve the current attachment graph, including an empty graph. Changed input requires explicit replacement confirmation before active or saved state changes. |

The runtime import handoff compares the complete ordered physical snapshot,
not a UNIT position, title or canonical Datasheet ID alone. Existing book-owned
source-choice preservation runs before this comparison. A retained attachment
graph passes the owner's normal full validation and effect recomputation before
commit, including roles, capacity and physical/source conditions. Computed
effects are never copied from the previous projection.

Fresh import-only snapshots remain attachment-free. Confirming a changed import
loads its new snapshot without old attachments; declining or rejecting it keeps
the previous active and browser-saved roster. Ordinary `load()` and explicit
detach keep their existing semantics: an empty graph never resurrects older
links. The shared runtime import result `REPLACEMENT_REQUIRED` is a pending UI
decision, not a New Recruit import error or a new physical schema. Callers
confirm an intentional replacement with the third import argument
`{replaceExisting:true}`. The common roster UI uses its existing inline controls.

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
Its `books/shared/roster-v2/reimport-attachments-qa.mjs` guard exercises all six
book adapters, pending/confirmed replacement, empty graphs and mutation controls.
`v2/source-completeness-qa.mjs` validates the reviewed requirement links. New
rules require source review and an independent expectation before changing
review metadata; historical coverage is not automatically a fresh PASS.
