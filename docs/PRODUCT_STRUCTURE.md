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

- **Search** — a local capability inside each product space that supports it. Global cross-book search is out of scope.
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

## Product shell contract

The shell contract defines capabilities, not a fixed row of buttons. Subject to available space, every book provides:

- Library;
- the current book;
- the current chapter or section;
- local Search when that book supports it;
- Mega Glossary;
- a mode switch when more than one mode exists.

The current context may be shown in the header, a breadcrumb, the page title or the navigation drawer. Critical exits must remain available on phones and tablets.

## Rule and glossary navigation

- Readable names are the user interface; technical rule codes remain internal metadata.
- A glossary record that represents a complete rule may provide one explicit `fullRulePath` relative to the published project root.
- `fullRulePath` never contains a domain, localhost address, leading slash or repository deployment prefix.
- Popups show **Open full rule** only when that target exists and has been validated during the build.
- Mega Glossary navigation remembers the originating popup for a short browser session. Its return action restores the source page, scroll position and popup when possible.
- Normal browser history remains the default navigation stack. No custom router or parallel history system is introduced.

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

Roster Guides recognise an explicit whitelist of factions. A recognised roster may be saved even when its personalised reader is not available yet. Currently:

- **Death Guard** rosters can be saved and opened in the personalised Death Guard reader;
- **Adeptus Mechanicus** rosters can be saved, but the interface must state that a personalised reader is not available yet;
- unknown factions are rejected before saving or routing.

Only factions with a real roster adapter may expose an **Open personal guide** action. An ordinary army book must never be presented as a personalised reader. Existing unsupported records are preserved and must never be routed into the Death Guard reader.

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

## Scope of the product-spine pass

Included, in order:

1. content and rendered-output lint;
2. this product shell contract;
3. Library information architecture;
4. a separate Roster Guides space;
5. the shell contract in existing books;
6. validated `fullRulePath` actions and popup return from Mega Glossary;
7. complete compatibility closeout.

Excluded:

- physical directory moves or mass URL changes;
- a universal reader engine;
- new books or factions;
- a legality or current-points validator;
- global search across all books;
- new roster features;
- more display modes;
- automatic download of all diagrams and original pages;
- favorites, recent rules and localization work.

Any task not required by the stabilization Definition of Done moves to the backlog and is not implemented on the stabilization branch.

## Delivery rules

- Each stage is one reviewable commit.
- Before a stage, its allowed files are fixed. Unrelated changes move to the backlog.
- Source generators and their deterministic generated output belong in the same commit.
- A large generated diff is accepted only when explained by a generator change.
- Existing path-resolution helpers are reused. If none fits, one minimal helper may be added without creating a router.
- After every stage, URL, anchor, roster-storage, PWA/offline, old-bookmark and mobile-navigation checks run again.

## Definition of Done

The pass is complete when:

- this contract matches the user-facing interface;
- unknown factions cannot be saved, and no faction without a real adapter can be opened in the Death Guard reader;
- arithmetic reconciliation is not described as legality or current-points validation;
- official sources have higher priority than Wahapedia;
- Core Rules Reference has local search by code, title, chapter and text;
- internal rule codes and anchors remain compatible without appearing in the interface;
- only the first meaningful use of a canonical external term is autolinked per rule card;
- basic words and repeated terms no longer create link noise;
- obsolete modal code and internal mode names are removed from the interface;
- existing URLs, anchors and `wh40k-rosters-v1` remain compatible;
- `/?roster=<id>` still opens that saved roster without creating or rewriting it;
- the Library clearly separates primary spaces, utilities and supporting information;
- Roster Guides are separate from the Library while retaining the existing storage and JSON format;
- every existing book exposes the product-shell capabilities it supports;
- a validated rule reference can open its full rule;
- Mega Glossary can return to the originating popup anywhere in the product;
- PWA updates without redirect loops or unintended heavy downloads;
- product, book and integration checks pass.
