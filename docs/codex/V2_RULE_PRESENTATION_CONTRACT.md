# Unified V2 rule presentation contract

## Scope and authority

This records the user's product decisions of 2026-10-18 for the five-book Unified
V2 Recovery application: Death Guard, Adeptus Mechanicus, Chaos Space Marines,
Emperor's Children and Tyranids. Recording a requirement is not a claim that the
current UI meets it. Browser acceptance results belong to their recorded HEAD and
evidence, separately from this contract.

The working baseline for this decision is `recovery/v2-minimal` at
`40eefc6b24e76587b38c0d19485ef68897a9af1e`. Historical milestone statements in
[CURRENT_HANDOFF](../CURRENT_HANDOFF.md) remain historical, not certification of
this Recovery checkout.

Product decisions define the required presentation; they do not change gameplay
facts. Accepted book-owned Wahapedia sources and applicable accepted official
corrections determine exact wording, conditions, ownership, eligibility and scope,
under [PROJECT_SOURCE_OF_TRUTH](../PROJECT_SOURCE_OF_TRUTH.md). Canonical/effective
owners remain factual authority in production. UI, generated projections, tests
and this summary must not become a second factual owner or a manual rule catalog.

The product path is:

`New Recruit export -> physical UNIT/MODEL and exact wargear -> applicable rules -> Effective Datasheets -> Personal Guide`.

New Recruit owns roster formation legality. This contract introduces no army-level
legality assessor, wargear-legality validator, battle simulator or new effect engine.

## General requirements

### Characteristics, rolls and existing computations

- A direct MODEL or weapon characteristic change whose necessary conditions are
  known from the roster must be computed and shown in the Effective Datasheet.
  Preserve its original value and provenance, with exact physical recipients.
- Hit, Wound, Advance, Leadership, Battle-shock and similar roll modifiers may be
  represented by their full applicable rule text. A new computed modifier or
  automatic roll is not required solely to satisfy this contract.
- Never substitute BS, WS, Strength, Toughness, Leadership or Movement changes for
  roll modifiers. Incoming Damage rules must not change the bearer’s own weapons.
- Preserve existing working calculations and numeric presentation, including
  Charge +1 through `MODIFY_RULE_METRIC` / `Unit modifiers`, Critical Hits thresholds,
  Witherbone Pipes OC +1, native/granted abilities and other supported effects.
  Text-only acceptance for the rules below does not authorize removing computation.
- Preserve all conditions, exceptions, timing and restrictions in the full text.
  Unknown distance, target, phase, Battle-shocked state, roll or event is not TRUE.

### Physical owner and recipients

- A canonical UNIT/Datasheet type is distinct from each physical UNIT instance.
  A physical MODEL is distinct from its UNIT and from other models sharing a profile.
- A formed UNIT contains its current attached components. CHARACTER is a source
  eligibility/identity property, not a synonym for the whole formed UNIT.
- An Enhancement belongs to its selected physical bearer. Attachment does not
  transfer its ownership to the Bodyguard or to another Character.
- A leading ability keeps its full text in its source Character's datasheet and
  exposes the full applicable rule in the relevant formed UNIT Effective Datasheet
  and Personal Guide, with an identifiable source. Do not spread it to independent
  instances of the same Datasheet.
- After detach, a leading-dependent rule disappears from the former Bodyguard.
  The Character retains its original ability and conditions; this does not make a
  leading effect active while standalone. Reattach restores applicable presentation.
- An Enhancement's full applicable text must be readable directly in the bearer’s
  Effective Datasheet. For a source-defined UNIT effect, also show it in the relevant
  formed UNIT datasheet and Guide. A popup/source link alone is insufficient.
- A personal MODEL rule stays visibly bound to that MODEL, including inside a
  combined formed-group view. Its presence there must not imply protection or a
  bonus for every component. Removing an Enhancement removes its dependent rule;
  detach preserves ownership on the bearer and removes former Bodyguard benefits.
- A formed-group view may retain separate component cards. Record both component-
  local and whole-view observations: the required full inline text must be reachable
  directly in the relevant effective view with clear source and recipients. This
  contract does not require copying one canonical fact into every component card
  or changing its owner merely because its effect applies to the group. In
  particular, Electro-infusion remains Fulgurite-owned when displayed in a view
  opened from an attached Character.

## The 15 agreed presentation decisions

The audit IDs below are existing reviewed-inventory locators, not newly invented
gameplay identities. The full accepted text must come from its canonical owner;
the summaries below define acceptance, not replacement rule wording.

| No. / existing audit ID | Book and rule | Required owner/recipient presentation and transitions | Computation boundary |
| --- | --- | --- | --- |
| 01 / `death-guard:087` | The Destroyer Hive — Typhus | Full text at Typhus and the UNIT he leads; source identified. Detach removes it from former Bodyguard; reattach restores it. | No new incoming melee Hit −1 calculation. |
| 02 / `death-guard:141` | Witherbone Pipes — Noxious Blightbringer | Full text at the Character and corresponding Poxwalkers UNIT while leading. Keep actual source conditions and physical scope. | No new Battle-shock/Leadership test +1 calculation; preserve existing OC +1. |
| 03 / `adeptus-mechanicus:029` | Electro-infusion | Full text in the relevant effective view opened from the leading CHARACTER or Fulgurite Electro-Priests UNIT. The ability remains owned by Fulgurite Electro-Priests; present the leading condition and actual formed UNIT recipients without re-owning it. | No Toughness change or new incoming Wound modifier. |
| 04 / `adeptus-mechanicus:075` | Optimised Gait — Sicarian Ruststalkers | Full text in the Ruststalkers datasheet, including base Advance +1 and proximity condition. | Do not change Movement; preserve computed Charge +1. |
| 05 / `chaos-space-marines:111` | Daemonkin (Psychic) — Master of Possession | Full text at the Character and corresponding attached UNIT. Detach/reattach removes/restores dependent effects and presentation. | Preserve computed Charge +1; Advance +1 may remain text. |
| 06 / `chaos-space-marines:113` | Empyric Symbiote | Full Enhancement text directly at the physical bearer and corresponding formed UNIT. Detach leaves the Enhancement with the bearer; former Bodyguard loses provided effects. | Preserve computed Charge +1; Advance +1 may remain text. |
| 07 / `chaos-space-marines:120` | Dark Zealotry — Dark Apostle | Full text at Dark Apostle and his formed UNIT, with the leading condition and exact source preserved. | No Strength change or new melee Wound +1 calculation. |
| 08 / `chaos-space-marines:121` | Prescience (Psychic) — Sorcerer | Full text at Sorcerer and his formed UNIT, with correct source and leading dependency. | No BS/WS change or new incoming Hit −1 calculation. |
| 09 / `chaos-space-marines:130` | Voice of the Tyrant / Huron's Elite | Full Enhancement text at its bearer; full applicable granted ability at the relevant formed UNIT. Keep real grant conditions/scope and distinguish other Tyrannical Motivation paths. | No BS/WS change or new Hit +1 modifier. |
| 10 / `chaos-space-marines:142` | Formidably Resilient — Chaos Lord in Terminator Armour | Full text only as this Chaos Lord MODEL's personal ability. In a combined view it must remain owner-scoped; Terminators do not inherit it. | No incoming Damage HALF calculation. |
| 11 / `emperors-children:012` | Mesmerising Form — Keeper of Secrets | Full text at Keeper of Secrets, without granting it to other models. | No opponent BS/WS change or incoming Hit −1 calculation. |
| 12 / `emperors-children:064` | Stimulated by Pain — Daemon Prince of Slaanesh with Wings | Full text only at the corresponding Daemon Prince MODEL. | No own-weapon Damage change or incoming Damage −1 calculation. |
| 13 / `tyranids:101` | Node Lash (Psychic) — Neurotyrant | Full text at Neurotyrant and corresponding formed UNIT. Preserve both Hit +1 while leading and conditional Wound +1 against a Battle-shocked target. Detach removes it from former Bodyguard. | No BS/WS or Strength change. Do not treat unknown target state as satisfied. |
| 14 / `tyranids:237` | Synaptic Control | Full Enhancement text only for its exact SYNAPSE MODEL bearer. Combined views must not imply protection for other models. | No own-weapon Damage change or incoming Damage −1 calculation. |
| 15 / `tyranids:260` | Ocular Adaptation | Full text at the source-eligible Prime bearer and corresponding formed UNIT when leading. Detach removes it from former Bodyguard; bearer keeps the Enhancement. | No WS change or new melee Hit +1 calculation. |

## Acceptance and evidence

Use the main local Unified V2 shell, actual application bytes and normal UI controls
at desktop 1440x900 and mobile 390x844. Temporary constructed New Recruit-compatible
rosters may live outside the repository; do not describe them as real user exports.
Do not mutate DOM, CSS, application state or computed results to obtain acceptance.

For each rule, record original owner datasheet where applicable, bearer Effective
Datasheet, relevant formed UNIT Effective Datasheet, Personal Guide, full text,
source, physical owner/recipient and MODEL-versus-UNIT meaning. Check applicable
attach/detach/reattach or remove/reselect transitions, control instances without the
source, and preservation of already computed effects. A standalone Enhancement
has no original datasheet ability to invent; inspect its accepted Enhancement view
as well as its selected bearer. Personal rules require explicit isolation evidence.

`PASS` requires actual UI evidence for every applicable agreed condition. `FAIL`
means a reproduced mismatch and must name expected/actual, physical owner/recipient,
UI location, screenshot or reproducible evidence, and preliminary failure layer.
`NOT_PROVEN` means missing evidence; `N/A` means the specific check is inapplicable.
Source-popup-only text is not PASS where inline datasheet text is required.

Keep these claims distinct:

1. **Missing typed modifier:** an implementation channel does not exist.
2. **Correct textual presentation:** full rule, source and scope meet this contract;
   no calculation is thereby claimed.
3. **Missing/wrong presentation:** absent/truncated text, wrong ownership/recipient
   or incorrect transfer fails this presentation contract even when the source exists.
4. **Computed effective change:** the executor and real frontend expose the expected
   supported result; visible prose or a contract declaration alone does not prove it.

The 15 `CAPABILITY_MISSING` entries in
`books/shared/roster-v2/source-completeness-review.json` remain implementation-review
metadata. Do not relabel them PASS or automatically change their classifications
because text-only behavior is product-acceptable. This document does not add typed
operations, certify all historical requirements or prove semantic completeness.
See [V2_SOURCE_REVIEW](V2_SOURCE_REVIEW.md) and [QA_MATRIX](QA_MATRIX.md).

Selected-rule regressions run through `qa:shared:v2:enhancement-presentation` and
`qa:shared:v2:enhancement-presentation:browser`. The latter uses actual main-app
bytes and seven source-backed constructed rosters across all five books on both
viewports. It requires full inline canonical text, exact physical ownership,
current formed recipients, granted reference text, detach/remove/reimport and
reload behavior. It does not turn declarative rules into computed modifiers.

Existing Charge frontend evidence is a scoped baseline at
`E:/Warhammer/qa-artifacts/recovery-charge-frontend-review-20261018/`, not a new PASS
for all 15 rules. New observations for this contract belong outside the repository
at `E:/Warhammer/qa-artifacts/recovery-v2-15-rule-presentation-20261018/` and must record
the tested HEAD and distinguish historical controls from fresh UI results.
