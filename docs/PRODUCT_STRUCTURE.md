# Product structure

## Purpose

This project is one library of Warhammer 40,000 rules and tools. Its books may use different implementations, but the interface must present one coherent product.

## Product spaces

Primary spaces:

- **Library** — entry point, available books and saved roster guides.
- **Core Rules** — the rules of the game.
- **Army Books** — faction-specific rules, including Death Guard and Adeptus Mechanicus.
- **Roster Guides** — imported rosters and their reduced in-game guides.

Global services:

- **Search** — a product-wide capability. This stabilization pass implements it only for Core Rules Reference.
- **Mega Glossary** — the canonical shared terminology service used by every book.

Supporting information:

- **Sources** — provenance and source hierarchy.
- **Updates** — rule and content revisions.
- **About** — product context and limitations.

Supporting information must not compete visually with the primary spaces.

## Core Rules modes

- **Reference** — direct chapters, exact rule links and fast lookup during play.
- **Learn** — sequential study, progress, explanatory layouts and original pages.

`Quick Reader`, `Classic Reader`, `Clean Room`, prototype names and build names are implementation history, not user-facing mode names.

## Book header contract

Subject to available space, a book header provides:

- Library;
- the current book;
- the current chapter or section;
- Search when that book supports it;
- Mega Glossary;
- a mode switch when more than one mode exists.

Critical exits must remain available on phones and tablets.

## Source hierarchy

1. Official Games Workshop rules.
2. Official supplements, errata and updates.
3. Reproduced original pages.
4. Secondary references, including Wahapedia.

Secondary references may aid verification, but must not appear to be the primary or official source.

## Roster Guide contract

The current importer:

- reads New Recruit text exports;
- extracts faction, detachments, units, enhancements and declared points;
- sums the point values printed in the export;
- compares that sum with the export total.

It does **not** verify:

- current point values;
- roster legality or unit limits;
- wargear legality;
- enhancement eligibility;
- Detachment Points limits;
- faction compatibility beyond the explicitly supported reader.

The personalized Roster Guide currently supports **Death Guard only**. Unsupported and unknown factions must be rejected before saving or routing. Existing unsupported records are preserved but cannot be opened in the Death Guard reader.

The guide may claim that it is reduced to recognized selections. It must not claim to contain only applicable rules until semantic eligibility is complete.

## Logical structure is not file structure

Names of spaces and example routes describe the logical product structure. They do not require immediate file moves or changes to published URLs.

Existing links must remain functional. New routes are introduced only with backward compatibility, PWA cache updates and saved-data migration where required.

## URL compatibility

- Existing public URLs are not removed.
- Old routes remain as aliases or redirect to an equivalent screen when new routes are introduced.
- Rule, unit, detachment and glossary anchors are public contracts.
- Parameters such as `?roster=` and `?view=mobile` are not changed without a compatibility layer.
- Redirects must not create offline fallback loops.

## Local-data compatibility

- `wh40k-rosters-v1` remains readable.
- A new schema requires a new version and an explicit migration.
- A failed migration must not modify or delete the original record.
- Unknown fields are ignored safely.
- One malformed record must not break the saved-roster collection.

## PWA compatibility

- Route and asset changes require a cache revision.
- Previously saved links must still open after an update.
- Old cached pages must update predictably.
- Offline fallbacks must not redirect indefinitely.
- Heavy diagrams and original pages are not downloaded automatically without an explicit user action.
- Core Rules Reference may precache its lightweight HTML chapters and search index without precaching heavy images.

## Scope of the stabilization pass

Included:

- accurate roster and source messaging;
- Death Guard-only roster validation;
- local Core Rules Reference search;
- reduced Core Rules autolink noise;
- removal of obsolete library modal code and internal implementation names;
- compatibility and product-contract checks.

Excluded:

- physical directory moves or mass URL changes;
- a universal reader engine;
- new books or factions;
- a legality or current-points validator;
- global search across all books;
- redesigning the Library;
- moving Roster Guides to a new physical route;
- new roster features;
- more display modes;
- automatic download of all diagrams and original pages;
- favorites, recent rules and localization work.

Any task not required by the stabilization Definition of Done moves to the backlog and is not implemented on the stabilization branch.

## Definition of Done

The pass is complete when:

- this contract matches the user-facing interface;
- unsupported factions cannot be saved or opened in the Death Guard reader;
- arithmetic reconciliation is not described as legality or current-points validation;
- official sources have higher priority than Wahapedia;
- Core Rules Reference has local search by code, title, chapter and text;
- a rule code is a permalink and its heading does not open its own glossary entry;
- only the first meaningful use of a canonical external term is autolinked per rule card;
- basic words and repeated terms no longer create link noise;
- obsolete modal code and internal mode names are removed from the interface;
- existing URLs, anchors and `wh40k-rosters-v1` remain compatible;
- PWA updates without redirect loops or unintended heavy downloads;
- product, book and integration checks pass.

