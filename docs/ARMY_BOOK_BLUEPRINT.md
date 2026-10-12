# Army Book Blueprint

This document is the product contract for adding and maintaining Warhammer 40,000
11th Edition Army Books. It defines what a book does without prescribing one
implementation.

- `PREVIEW` is the minimum gate for adding a useful book to the Library.
- `OPTIONAL` capabilities apply only when a book claims to support them.
- `FULL QA` is the separate source-verification and publication gate.

Death Guard, Adeptus Mechanicus, Tyranids, T'au Empire and Emperor's Children are
product and implementation references, not mandatory architectural templates. Use
the simplest existing pattern that satisfies this contract; do not add abstractions
solely to make books internally uniform.

## Starting a new Army Book

Before implementation, read this Blueprint, audit the available sources and
faction-specific content, and inspect working books only as references. Choose the
simplest suitable build pattern. Before reporting a Preview ready, return `PASS` or
`FAIL` for every applicable `PREVIEW` requirement; apply `OPTIONAL` requirements only
to supported capabilities.

**The Blueprint defines the product contract. Existing Army Books are references,
not mandatory architectural templates.**

# PREVIEW

## PREVIEW-001 - Faction identity and source honesty

- The book MUST identify the correct faction and use only Warhammer 40,000 11th
  Edition content. Rule-bearing claims MUST come from frozen repository evidence;
  secondary evidence and known gaps MUST remain honest and MUST NOT be invented.
- Local Datasheets MUST belong to the book, Codex or Faction Pack. Legends, external
  or retired supplements, foreign-faction Datasheets and allied dependencies MUST
  NOT appear as local content merely because roster rules can use them or they share
  a faction keyword. Explicit publication in the owning Codex or Faction Pack determines
  local Datasheet ownership and takes precedence over faction/subfaction keywords or roster/dependency semantics.
- Where source, New Recruit or BSData primary-category semantics are available,
  Datasheet grouping MUST preserve meaningful categories. `Other` is a fallback for
  absent or genuinely general classification, not a bucket for unrecognised types;
  display aliases MAY pluralise category names without changing unit identity.

## PREVIEW-002 - Required Army Book content

- The Library entry and reader MUST expose a Start view, available Army or Core
  Rules, Detachments with their applicable Rules, Stratagems and Enhancements,
  Datasheets, and Updates or source state.
- Faction-specific counts, names and inapplicable sections MUST NOT be standardised.
  Available canonical text and order MUST be preserved, and missing source content
  MUST remain visible as a source limitation rather than being reconstructed.

## PREVIEW-003 - Content presentation

- Core, shared and faction-wide abilities MUST be compact clickable terms whose full
  rules remain available through the popup or glossary. Datasheet-specific abilities
  MUST remain full cards.
- Source-confirmed equipment or upgrade rules MUST appear as full clickable cards in
  `Wargear Abilities`, preceded by the note “These abilities apply only while the
  corresponding wargear is equipped.” Empty Wargear sections MUST NOT be rendered.
  Weapon ability tags are not Wargear Abilities, and wording heuristics MUST NOT
  replace source ownership.
- The generic Leader rule MAY be compact, but actual attachment destinations MUST
  remain visible in a separate applicable Leader section.
- Weapons, atomic weapon-ability labels and other linked terms MUST preserve their
  complete visible meaning and access to the correct definition. Stratagem source
  labels, canonical type and turn timing MUST remain distinct; unavailable canonical
  type MUST NOT be guessed.

## PREVIEW-004 - Deterministic build

- Authoritative committed data, configuration and producers MUST reproduce tracked
  Desktop, Phone and route outputs through the normal build. A completed build and
  its existing freshness check MUST leave no stale generated output.
- Generated fixes MUST be made in the authoritative input or producer, not by editing
  output that the next build overwrites.
- Normal builds MUST use committed structured inputs. Refreshing or extracting from
  upstream sources is a separate source-maintenance workflow and MUST NOT be required
  to build an existing Preview.

## PREVIEW-005 - Reader, Library and navigation

- The user MUST be able to move from Library to the book entry and reader, choose a
  view manually when needed, use the entry without JavaScript as a fallback, and
  return to the Library.
- Primary navigation MUST reach the book's available major sections and reveal the
  branch containing the active rule, Detachment, category or Datasheet. Current state
  and target positioning MUST remain observable rather than depending on hover.
- Datasheet navigation MUST preserve source-driven category grouping. Local controls
  MUST open the correct Profile, Abilities, Wargear Abilities, Composition, Wargear
  Options, Leader, Keywords or other applicable section; absent sections MUST NOT
  create empty controls.
- Semantic identifiers, Desktop anchors and direct Phone routes MUST remain stable
  across ordinary rebuilds. Deep links MUST resolve to the intended reading target.
- Back, close and return actions MUST restore the previous meaningful reading context
  rather than blindly discard it. Popup and Mega Glossary round trips SHOULD preserve
  the originating Army Book, Datasheet and recoverable reference context.

## PREVIEW-006 - Desktop and Phone

- Desktop and Phone MUST expose equivalent Army Rule, Detachment, Datasheet,
  category, ability, Wargear Ability, Leader and Updates inventories, with the same
  rule-bearing meaning and order. Presentation MAY differ.
- Switching views SHOULD preserve the equivalent Start, rule, Detachment, Datasheet
  or semantic section when that target exists, rather than returning to Start without
  need.
- Phone navigation MUST be usable by touch, expose its current route and parent
  branch, open and close without hover dependence, and avoid horizontal overflow.
  Conditional sections MUST remain available in both views when applicable.
- When faction artwork exists, it MAY identify the Library card, book entry, Desktop
  Start and Phone Start. It SHOULD NOT become a repeated background for every rule,
  Datasheet, Detachment, popup, roster or Related Rules view.

## PREVIEW-007 - Runtime safety

- Clickable abilities, weapons, weapon tags and rule terms MUST open the correct
  definition over the current reading context. Closing MUST restore that context and
  focus; nested references MUST return through their meaningful popup stack.
- Navigation targets, public deep links and generated Phone routes MUST resolve and
  retain rule-bearing content. Dead or silently mismatched routes are failures.
- The Library, entry, Desktop reader, Phone routes and required assets MUST remain
  usable after supported offline or cold reloads once built and cached.
- Representative Library, reader, navigation, popup, Phone and offline use MUST NOT
  produce uncaught runtime or console errors.

# OPTIONAL

Optional capabilities do not block `PREVIEW` when they are absent or visibly
disabled.

## OPTIONAL-001 - Roster support, if supported

- Roster context MUST map the correct faction, Detachment and unit instance to the
  intended Datasheet and preserve a meaningful return path. Invalid or ambiguous
  input MUST fail closed without redirect loops, foreign results or saved-data loss.
- Roster-only filtering, loadout and ownership state MUST remain deterministic. The
  same reader MUST remain usable without roster context, and roster controls MUST NOT
  interfere with ordinary reading.

## OPTIONAL-002 - Compatible Rules, if supported

- Compatible or Related Rules MUST start from the current Datasheet, preserve its
  context, apply the selected Detachment, and switch Stratagem and Enhancement views
  without inventing applicability.
- Rule popups, close and return actions MUST restore the same Datasheet context in
  Desktop and Phone. Unresolved applicability MUST remain unresolved rather than
  being guessed.

# FULL QA

`FULL QA` is independent from ordinary Preview development and MUST NOT block the
next useful Preview Army Book.

Independent unified V2 certification of Core Rules, Death Guard, Adeptus Mechanicus
and Chaos Space Marines follows the [authoritative certification requirements](PROJECT_SOURCE_OF_TRUTH.md#independent-v2-certification-requirements)
for separate `CONTENT_CERTIFIED` and `USER_PATH_CERTIFIED` results. This does not
change Preview gates, optional capability boundaries or publication approval.

## FULL-QA-001 - Source parity and updates

Full QA MUST compare the complete rule-bearing inventory with available frozen
sources, account for applicable FAQ, errata and updates, and record unresolved
source-authority gaps without reconstructing missing rules.

## FULL-QA-002 - Extended product verification

Full QA MUST run the applicable extended browser, responsive, roster, Compatible
Rules, glossary and offline/PWA verification. Detailed source and investigation
checks MAY remain outside the normal Preview gate.

## FULL-QA-003 - Publication decision

`PUBLICATION-READY` requires authoritative source completeness, deterministic release
outputs and a recorded publication decision. A working public Preview or
`FUNCTIONAL` book MUST NOT be represented as publication-ready while source gaps
remain.
