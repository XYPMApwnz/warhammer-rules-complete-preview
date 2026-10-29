# Rule recipients

A non-Stratagem clause records recipients once. Shared execution, conditional presentation and
effect lifetimes refer to those declarations by `recipientId` or `recipientIds`.
An address is not an active effect: unknown battle conditions remain unknown.

```js
{
  recipientStatus: 'RECORDED', // or NOT_RECORDED / NOT_APPLICABLE
  recipients: [{
    id: 'clause-id::recipient/channel/1', // unique within the rule
    who: 'MODEL', // MODEL / UNIT / PLAYER / ROSTER
    side: 'FRIENDLY', // FRIENDLY / ENEMY, only when recorded
    from: 'SOURCE_FORMED_MODELS',
    how: 'ROSTER', // ROSTER / IN_BATTLE / AURA, only when proved
    selector: {/* unchanged existing selector */},
    evidence: {/* unchanged existing evidence */}
  }]
}
```

`from` preserves a recorded source relationship: `SOURCE_MODEL`, `SOURCE_UNIT`,
`SOURCE_UNIT_MODELS`, `SOURCE_FORMED_MODELS`, `LEADERS_OF_SOURCE`, `ROSTER_UNITS`
or `ROSTER_MODELS`. An unrecorded relationship stays absent. `scope` is permitted
only for UNIT recipients and distinguishes `PHYSICAL` from `FORMED`; absence is
preserved when the old declaration did not specify it. MODEL recipients never
inherit formed UNIT keywords as their own keywords.

`RECORDED` means a recipient declaration exists, not that every contextual
relationship or battle decision is known. `NOT_RECORDED` has an empty recipients
array and does not imply a bearer or source-unit default. `NOT_APPLICABLE` needs
an explicit non-recipient purpose; missing data alone is insufficient.

PLAYER is used for an explicitly recorded player benefit such as command points.
ROSTER preserves an already recorded army restriction; it is not converted into
a player benefit or an invented MODEL/UNIT address.

Stratagems are outside this migration. Their clauses, recipient fields and
duration bindings remain unchanged. Shared code retains the old address reads
needed for those records; this does not authorize legacy fallback for migrated
non-Stratagem clauses.

OWNER, ANCHOR and TRIGGER_ACTOR remain applicability participants. TARGET alone
does not declare a recipient. An explicit effect-to-role edge can establish that
a particular TARGET participant also receives that effect. Participant role IDs,
source-role links and prerequisites retain their separate meanings.

Simple keyword restrictions may use `unitKeywords` or `modelKeywords`. Complex
selector ASTs and their evidence are preserved. MODEL selection can additionally
retain `recipientSelectors` and `containingUnitScope` because its containing UNIT
and the physical MODEL can have independent selectors and scope. Existing
`binding`, `actorRoleId`, `sourceRoleId`, `anchorRoleId`, conditions and role
identity are retained where needed; no missing relationship is inferred from a
role name, prose, BATTLE_ONLY classification or a unique ANCHOR.

Standalone and attached effect branches keep distinct declarations when their
bindings differ. An effect or lifetime must retain its exact recipient set;
duration bindings remain clause-local, not a rule-wide union applied everywhere.
F1's admitted recipient subset remains distinct from other recipients of the
same clause. Typed policy evidence, provenance, unresolved aura behavior and
physical recipient instance/model IDs retain their existing strict checks.

Additional reference fields preserve distinctions already present in the inputs:

- `primaryRecipientId` preserves an explicitly recorded primary member of a
  multi-recipient set; it must belong to that set.
- `standaloneRecipientId` / `attachedRecipientId` preserve the two existing
  reference-grant branches. Both address UNITs; their PHYSICAL/FORMED scopes come
  from the existing grant consumer. `binding` retains its original source label
  where that label differs from the actual consumer subject.
- `f1RecipientIds` records only recipients admitted by the existing F1 proof.
  `textKind` preserves its existing conditional/selection presentation label.
- `roleId`, `purpose`, `required`, `optional`, `prerequisites` and
  `distinctFromRoleIds` preserve participant identity and obligations. An old
  `allegiance: ANY` is retained rather than guessing a friendly or enemy side.

The migration inventory and complete list of clauses with no recorded recipient
are in [recipient-translation-1.json](../audit/recipient-translation-1.json).
Regenerate it with `node tools/audit/recipient-translation-report.mjs --write`;
`--check` verifies the saved report and exact baseline translation, including
unchanged non-contract facts and excluded Stratagem serialization.

Accepted text, characteristics, conditions, equipment, attachments, ownership and
card wording are unchanged. New canonical consumers must not fall back to an old
address field or infer missing recipients from English text.
