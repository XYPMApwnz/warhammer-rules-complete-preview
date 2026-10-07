# Adeptus Mechanicus V2 factual foundation

This directory owns the source-to-canonical factual build for Adeptus Mechanicus.
It is not wired into the published reader or the Death Guard platform. It contains
no Rule Contracts, applicability answers, attachment interpreter or effect runtime.

## Inputs and authority

`sources/enrollment.json` pins exact file bytes and the accepted scope. The
operational baseline is the current 11E source capture from 25 September 2026.
The official GW Faction Pack v1.3, dated 30 September 2026, is enrolled here as
stronger current update/FAQ evidence. Its non-Legends content agrees with the
accepted operational baseline; the current update checkpoints are independently
tested against the PDF. Legends, Boarding Actions and Crusade are excluded.

Existing raw HTML is unchanged. Its checked-in LF bytes differ from the historical
CRLF capture hashes. Enrollment records both representations, while the build
validates the actual bytes without rewriting or normalizing them. The historical
correspondence is a separate QA assertion.

The accepted source-defect ledger owns three literal editorial adjudications.
`source-adjudications.json` binds them to their actual source occurrences. For
Tribute of Empathic Veneration, the accepted Codex transcription is consumed for
one explicitly enrolled title field only. It is not first-party corroboration;
the official current pack does not reproduce that Stratagem. No eligibility,
effect, ownership or legacy contract field from that transcription is consumed.
The stale occurrence ID in the old defect ledger is recorded in the title evidence.

## Canonical ownership

`build.py` derives `generated/base.json` from accepted sources and the book-owned
identity declarations. It derives `generated/effective.json` by applying only the
three accepted source adjudications. Rebuild these projections; do not edit them.

Each entity has an explicit canonical ID and provenance: source ID/path plus a
JSON pointer, or a raw DOM XPath and SHA256, or an official PDF page. Reference
metadata links to existing owners and never supplies independent gameplay answers.
The raw source capture and enrollment remain available for field-level tracing.

- Ordinary characteristics belong to individual MODEL profiles. Servitor
  Battleclade preserves both profiles, their distinct W/Ld values, their Bases,
  and the Underseer-only TECH-PRIEST keyword scope. Its shared 6+ invulnerable
  save has one owner, explicitly referenced by both profiles.
  Base-size qualifiers remain separate source notes: Gun Servitors use 32mm,
  and Skitarii with a transuranic arquebus use 60 x 35mm. They are not flattened
  into the ordinary Base value or applied to unrelated models.
- The explicit UPGRADE label on Stealth-Screened Cybercanids is preserved from
  raw source with field provenance; it is not inferred from an old owner contract.
- Weapon profiles retain source IDs, modes, values and abilities. Seven source
  selection instructions reference eight distinct weapon groups; Thulia's ranged
  and melee groups remain separate. There are no title joins at runtime.
- Datasheet sections retain source-backed ability, wargear, composition, transport,
  damaged and attachment text. Leader/Support/receiver declarations reference
  canonical in-scope units by source links. Legends references are marked as
  excluded metadata. No attachment capacity, derived edge or execution semantics
  is invented.
- Individual Core/Army ability references preserve source labels and tooltip
  references. They do not copy Core definitions or combine several rules into a
  new definition. Canonical popup binding belongs to a later consumer stage.
- Nested layout-table occurrences reference the innermost semantic table. Its
  values have one canonical owner; the flattened duplicate is removed from the
  operative rule text. Source occurrences remain traceable.
- Official update references identify canonical targets and exact PDF pages.
  Operative facts remain owned by their rule/profile records. The separate
  update/FAQ directives remain preserved in source erratum records/PDF evidence.
- Prices and force-disposition assignments remain centralized MFM facts. Their
  captured copies are explicitly accounted as `MFM_OWNED`, not imported as a new
  points catalog. This foundation adds no new MFM consumer or prices.

## Census units and guards

The canonical corpus has 34 datasheets, 35 MODEL profiles, 139 weapon profiles
(138 datasheet profiles and one Enhancement weapon), one Army Rule with three
components, 10 Detachments/rules, 34 Enhancements and 51 Stratagems. The ability
count is 66 source `ABILITIES` blocks, including wargear abilities and preserving
compound blocks; it is not a claim of executable clause atomization. Core ability
memberships are inventoried separately. There are nine attachment declarations:
three Leader, three Support and three receiver declarations.

`generated/factual-census.json` reports independently compared source values.
Its scalar count includes source-backed presentation/reference metadata as well
as gameplay fields; it is not a count of gameplay clauses or an applicability
denominator. `factPartitions` names every comparison. Each capture scalar also
has an explicit disposition in `sourceLeafAccounting`: canonical fact, capture
occurrence/reference, source/reference metadata, or MFM-owned. Introduction
Crusade sentences are separately accounted as excluded scope. Additional raw
profile/keyword/Base/selection/qualifier/Introduction facts omitted by the old
structured capture are independently checked against raw DOM evidence.

`factual-qa.py` does not import the producer. It checks the complete identity
domain, raw profile/weapon/keyword/reference scopes, source fields, source leaf
dispositions, current official updates and effective deltas. Mutations poison
both base and effective projections, so the other snapshot cannot mask a weak
source comparison. `source-isolation-qa.py` rebuilds in a temporary tree that
contains only enrolled sources and this producer, without V1 generated facts,
adapters or effect contracts. Poisoned non-title legacy fields cannot change the
result; poisoned accepted title evidence fails closed.

Run with Python 3, `lxml` and `pdfplumber`:

```text
python -X utf8 books/adeptus-mechanicus/v2/build.py
python -X utf8 books/adeptus-mechanicus/v2/build.py --check
python -X utf8 books/adeptus-mechanicus/v2/factual-qa.py --write-census
python -X utf8 books/adeptus-mechanicus/v2/source-isolation-qa.py
```

Build/check is network-free. The current official PDF and its text extraction are
pinned artifacts. Existing DG source, contracts, runtime, presentation and shared
architecture are untouched.

Validation for this foundation also ran the existing local AM checks (215/215),
DG V2 fact parity (3654), DG roster runtime and the desktop/phone visible-effect
checks (22/22, mega-case and detach/re-attach). The repository-wide `qa:sources`
entrypoint remains blocked by an unchanged DG manifest omission:
`books/death-guard/sources/death-guard-wargear-option-contracts.v1.json`.
That global baseline issue is separate from the passing V2 source enrollment,
current-PDF parity and closed-input checks here.
