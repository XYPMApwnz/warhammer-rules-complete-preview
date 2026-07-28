# Technical Specification: Death Guard Rules Term Popups

## Specification Update Rule

- Any change to popup levels, cycles, positioning, scrolling, animation, Journey/Back, focus, accessibility, or a related test must be reflected in this document at the same time.
- A change is not considered complete until the corresponding requirement and acceptance criterion are recorded in the specification.
- If a change affects both popups and navigation, it must be recorded in both specifications.
- New behavior must be accompanied by an automated check when it can be reproduced without a real browser, and by a manual acceptance scenario when visual geometry matters.
- Obsolete requirements do not accumulate: they are replaced with the current wording of the agreed behavior.

## 1. Purpose

A popup displays a brief explanation of a term, related terms, and only existing destinations in Glossary, rules, datasheets, or statlines. It must support sequential term expansion without losing context.

## 2. Data Source

- All popups are built exclusively from the shared `TERMS` registry.
- An unknown `data-term` opens nothing and produces no error.
- A card displays the title, summary, related terms, and available actions.
- An action is shown only when a real destination exists.
- A popup never creates a clickable link to its own current term.

## 3. Root Chain

- Clicking a term in the article, weapon table, Glossary, or other primary content opens a first-level popup.
- If a chain already exists, it closes completely and is replaced with the new root card.
- Clicking the same external term again when only one card is open does not create a duplicate and moves focus to the existing popup.

## 4. Nested Levels

- Clicking a related term inside a popup preserves the parent popup and opens the next card.
- Each subsequent internal term adds a new level.
- When a level is added, existing parent cards are neither removed nor recreated; only the new card is added to the DOM, so the chain must not flicker or disappear briefly.
- The close button on level N closes that level and every deeper level.
- After closing, focus returns to the parent-level term that opened the closed card.
- Technical labels such as “level 1”, “level 2”, and so on are not displayed in the interface.

## 5. Repeated Terms and Cycles

- The current top term does not open again.
- Special collapsing applies only to the adjacent loop `A → B → A`: card B closes and the previously opened A remains.
- A more distant repeat is allowed: `A → B → C → A` creates a new A level.
- The system does not perform a global duplicate search across the entire chain.

## 6. Positioning

### Desktop

- The first popup opens near the activated term.
- A nested popup is positioned near the term inside its parent card.
- Popups use document coordinates instead of a fixed viewport position: when the page scrolls, they move away with the term and do not follow the user's screen.
- Viewport-bound clamping applies during initial opening and resize only while the trigger is visible. If manual scrolling has already moved the trigger offscreen, resize does not force the popup back into the viewport.
- If there is insufficient space below, the card automatically opens above the trigger.
- A card does not extend beyond the left, right, top, or bottom edge of the viewport.
- Open cards recalculate their positions when the window is resized.

### Mobile

- Popups open from the bottom edge with `safe-area-inset-bottom` taken into account.
- Subsequent levels receive a small vertical offset relative to the last three visible cards so the chain order remains visible.
- Card height is limited by the dynamic viewport; internal content scrolls.
- The page does not acquire horizontal scrolling.

## 7. Closing and Focus

- Escape closes only the top popup.
- The close button closes the selected level and everything deeper.
- A click or tap outside every popup card, on a free area of the page or the dimmed background, closes the entire popup chain.
- Clicking inside a card, scrolling its content, and interacting with its links, terms, and action buttons are not considered outside clicks and do not close the popup.
- On mobile devices, an outside touch must close the chain with one ordinary tap, without requiring the background to be activated first.
- Closing the root popup returns focus to the originating term in the document.
- Clicking the already open top term again does not change the chain.
- The opening top card receives programmatic focus without scrolling the page.

## 8. Transitions from a Popup

- Available types: Glossary and rule destinations. A popup opened inside Related Rules also exposes Open datasheet.
- Before navigation, the complete term ID chain, external root term, level, and action-button data are saved.
- Before scrolling, the chain is temporarily hidden.
- A Glossary transition accounts for the heights of the fixed header and sticky search: the target card opens below both overlapping layers, including the `Assault → popup → Glossary` scenario.
- If the active Glossary filter hides the target card, the filter is cleared temporarily; its value and original results are restored on Back.
- On Back, the Glossary filter and complete popup chain are first restored synchronously, followed by position and navigation; this prevents the popup from disappearing briefly.
- After recreating the cards, the system finds the action button on the original level by target and type.
- The found button receives focus and a brief pink-and-bronze highlight.
- If the original button is unavailable, focus moves to the top restored popup.

## 9. Accessibility

- Every card has `role="dialog"`, `aria-modal="false"`, and `aria-labelledby`.
- Every card heading has a unique ID.
- The close button has a clear accessible name containing the term title.
- All functionality is keyboard-accessible.
- The top popup has a visible `:focus-visible` state.

## 10. Acceptance Criteria

- A new external term completely replaces the old chain.
- An internal term adds the next level without closing its parent.
- `A → B → A` returns to A without a duplicate.
- `A → B → C → A` creates a fourth level.
- A popup contains no active link to itself.
- The close button on level N closes N and everything deeper.
- Escape closes only the top level.
- Desktop cards are positioned near their triggers and remain within the viewport during placement.
- After manual scrolling, a desktop card may naturally move outside the viewport and does not jump back on resize when its trigger is also invisible.
- Mobile cards are positioned at the bottom and account for the safe area.
- On mobile, the visual offset is recalculated relative to the last three visible cards: they preserve the order `0 / 1 / 2`, while the depth of the hidden part of the chain does not increase the offset or push the top card outside the viewport.
- Back restores the complete chain and clearly highlights the exact action button that was activated.

## Term Registry and Datasheet Context

- The term registry is validated together with the document body: unknown `data-term` values, orphaned records, and missing `rule`, `glossary`, `datasheet`, `statline`, `related`, or `units` values are QA errors.
- Action buttons are created only for destinations that exist in the DOM.
- Datasheet shortcuts are hidden in ordinary popups. Inside Related Rules, `Open datasheet` uses the unit that opened the overlay.
- The contextual datasheet must be included in `term.units`; an arbitrary neighboring card cannot replace the destination.
- A transition to Glossary first reveals a card hidden by search. Back restores the original query, results, position, chain, and focus.
- Glossary stores the short summary in a separate highlighted paragraph. Full text is not duplicated when it matches the summary verbatim.
- A weapon profile in Glossary separates numeric characteristics from the `Abilities` row; ability text does not become an accidental seventh narrow column.
- Keyword text describes only explicit selectors and rules interactions and does not invent independent bonuses based solely on the presence of a keyword.
- `Assault → popup → Glossary` does not hide the Assault card heading beneath the sticky search panel.
