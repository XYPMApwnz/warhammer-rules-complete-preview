# Death Guard Rules v4 — test report

Date: July 21, 2026.

## Automated verification

- Command: `node tests/qa.mjs`.
- Result: **48/48 checks passed**.
- The checks covered script syntax, ID uniqueness, 26 global-navigation items, tree depth, 20 terms, the popup state machine, the Journey/Back contract, CSS/JS separation, the service worker, and the v4 icon.

## Live browser verification

- The page opens over HTTP without runtime errors; the semantic tree contains every main section, two Detachments, and two datasheets.
- Clicking `ASSAULT` opens one `Assault` dialog.
- Clicking `Lethal Hits` inside it produces a two-card `Assault → Lethal Hits` chain.
- The `Assault → Lethal Hits → Assault` scenario collapses back to the existing `Assault` without a duplicate.
- The `Glossary` action closes the chain and moves to the article; `Back` restores the popup, focuses the originating button, and adds the `return-highlight` class.
- After manual scrolling, the popup's document-top position remains constant while the card naturally moves with the article relative to the viewport.
- A clean transition through the three-level tree to `Datasheets → Other → Defiler` ends with `aria-current="location"` on `Defiler`; its heading is positioned below the fixed header.
- Regression `Assault → popup → Glossary`: destination calculation subtracts the sticky-search height, so the Assault card heading remains fully visible.

## Review

A separate final review found and helped close two geometry regressions: preserving a desktop popup's position during an off-viewport resize and limiting the mobile offset to three visible cards. After the fixes, the complete automated suite passed again.
