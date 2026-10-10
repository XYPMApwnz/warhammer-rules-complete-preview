# Chaos Space Marines V2 factual foundation

This is the source-first factual stage based on
`e77ea12d312f1bec6ea6632e102777792c06de38`. It is deliberately not wired into the
Army Book, roster, compatibility or effect runtime. No Rule Contracts, effects,
UI, shared primitives or changes to another book are included.

## Accepted inputs and denominators

`sources/enrollment.json` pins 66 local artifacts from the accepted September
29–30 capture: the official Faction Pack v1.2 PDF, current operational corpus
and its 55 HTML pages, capture/defect metadata, current official MFM captures,
and two allied **points-only** dependencies. Builds are network-free. Frozen
reproducibility does not assert that these captures remain current forever.

The original HTML capture hashes describe CRLF bytes. Enrollment separately pins
the repository's LF bytes and preserves the original capture hashes; source
files are unchanged. Historical MFM versions, BSData, legacy CSM content,
contracts, fixtures, compatibility tables and generated publications are not
inputs. The older manifest/publication remains untouched.

`sources/source-census.json` freezes **1,825 typed source entities**, not 1,825
atomic facts. The producer rebuilds their payloads from accepted sources, never
from a prior audit payload or PASS report. Parent source text, structured
children and repeated source occurrences are reconciled to canonical owners.
The preserved partitions include:

| Partition | Count |
|---|---:|
| Non-Legends datasheets / explicit model statlines | 54 / 60 |
| Composition members / composition rules | 78 / 54 |
| Weapon profiles | 315 |
| Ordinary datasheet ability occurrences / equipment abilities | 89 / 7 |
| Army Rules / Detachments / Detachment Rules | 2 / 17 / 17 |
| Enhancements / Stratagems | 62 / 93 |
| Attachment declarations / current in-scope directed relations | 21 / 58 |
| Wargear options / upgrade declarations | 87 / 3 |
| FAQ / secondary errata / official update blocks | 17 / 18 / 34 |

The 89 ordinary abilities are occurrences, not distinct titles; Warmaster's three
named components are separately preserved. Six literal “None” option records
are metadata outside the 87 substantive options. Attachment declarations retain
their exact source text, including references outside the current book scope;
no Legends datasheets or runtime relationships are fabricated. Two allied MFM
dependencies do not supply allied gameplay datasheets.

## Identity and ownership

`identity-bindings.json` assigns persistent canonical identities to source nodes.
The build rejects collisions or unbound parents rather than deriving identity
from a display name, source code, title or order. `capture-bindings.json` binds
source-addressed MFM occurrences and direct Army Rule memberships to explicit
identities. Source names are only checked as source grammar during validation;
they are not runtime gameplay joins.

Canonical records use `id`, `kind`, `ownerId`, `displayName`, `data`, and
`provenance`. `sourceAccounting` binds every source entity to its record and
factual owner. Structured tables own their rows; parent rules reference the
tables. Composition members own their quantities; composition rules reference
members and retain source-backed equipment/static text. Upgrade choices,
Warmaster components and repeated notes similarly retain one owner. The five
Marks options reference their owning selection rule. Three paid MFM options
have explicit weapon/option identity bindings.

`model-bindings.json` preserves 78 composition roles against 60 explicit
statlines. A shared statline does not widen a role-specific keyword: Mindwitch
and Garlon retain their exact PSYKER recipients. Invulnerable qualifiers and base
size exceptions are retained. No individual selected weapon ownership is
inferred. `model_sources.py` reconstructs and verifies these bindings from
accepted source structure, rejecting unsupported quantities, scopes or values.

`presentation-bindings.json` preserves source-backed profile-selection metadata
for 34 weapon groups on 24 datasheets. One instruction owner has 70 explicit
weapon occurrence bindings; responsive duplicates are source references. This
is factual/reference metadata, not a renderer or new presentation behavior.

## Effective corrections and FAQ

`official_sources.py` reads the enrolled PDF afresh. Explicit column spans and
source/target hashes bind 34 individual update blocks and 15 official FAQ.
Official precedence is the accepted source-defect policy, not source order.
`base.json` retains captured facts; `effective.json` applies five verified
PDF-sourced field corrections:

- Pactbound Character/EPIC HERO attachment restriction.
- Soulforged Unstoppable Rampage and Predatory Pursuit DAEMON prerequisite.
- Obliterators' current activation/attack wording.
- Screaming Descent's exact official “battle-shock roll” wording.

The other update targets are already effective in the accepted capture.
Correction records and provenance remain separate from gameplay text. Fifteen
secondary errata occurrences refer to the same official correction owners;
three additional already-effective annotations retain their secondary evidence
and official-page corroboration metadata. Raw editing instructions never replace
effective gameplay text. FAQ has 15 official owners plus two accepted
secondary-only questions (`faq-3`, `faq-8`); general Core FAQ appended by the
website are excluded. No FAQ creates an invented unique gameplay primary owner.

`future-capability-gaps.json` records three deferred source consumers only:
Wounds modification, canonical ability removal, and a specific ability's range
modification. It supplies no executable declarations.

## Build and verification

Use Python with `lxml` and `pdfplumber` (the bundled Codex Python has both).

```text
python -B books/chaos-space-marines/v2/build.py
python -B books/chaos-space-marines/v2/build.py --check
python -B books/chaos-space-marines/v2/factual-qa.py
python -B books/chaos-space-marines/v2/source-isolation-qa.py
```

The factual guard independently checks raw DOM statlines/weapons, captured
rules/options/composition, MFM values, PDF FAQ/update text, source enrollment,
canonical ownership and effective correction deltas. In-memory mutations prove
that missing records, wrong identities/owners, severed provenance, corrupted
characteristics and dropped update prerequisites fail.

The isolation guard rebuilds in a temporary tree containing only enrolled
sources and new foundation declarations/code: no legacy CSM, generated output,
DG, AdMech or prior audit artifacts. Output must equal the full-tree build.
Synthetic controls preserve distinct same-code/same-title source nodes and
reject canonical collisions, duplicate source nodes and absent owners. Model
binding mutations and altered source bytes also fail closed.

DG/AdMech focused factual, Rule Contract, effect and attachment regressions were
rerun. The additional DG `roster-multiple-detachments-qa.mjs` assertion at line
144 (`INVALID` versus `TRUE`) was independently reproduced from a clean
`git archive` of the base HEAD. It is unchanged baseline debt; it was not fixed
or silently counted as a passing test. DG's 22-clause runtime regression and
AdMech's 43-clause effective integration pass.

The older DG `datasheet-v1-qa.mjs` navigation snapshot assertion also differs
on the base HEAD; its navigation input is byte-identical here. The independent
canonical presentation oracle still confirms 3,654 facts. The optional DG
browser visible-effects guard timed out waiting for `ArmyBookAppV2.rosterPanel`
after launching the available Chromium binary; it is not reported as passing.
No browser/UI certification is claimed by this factual-foundation task.
