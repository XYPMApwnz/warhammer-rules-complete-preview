# Technical specification: Death Guard Rules term popups

## Specification update rule

- Any change to popup levels, cycles, positioning, scrolling, animation, Journey/Back, focus, accessibility, or a related test must be reflected in this document at the same time.
- A change is not complete until the corresponding requirement and acceptance criterion are reflected in the specification.
- If a change affects both popups and navigation, it must be recorded in both specifications.
- New behavior must be accompanied by an automated check when it can be reproduced without a real browser, and by a manual acceptance scenario when visual geometry matters.
- Obsolete requirements do not accumulate: they are replaced by the current wording of the agreed behavior.

## 1. Purpose

A popup shows a brief explanation of a term, related terms, and only existing transitions to Glossary, a rule, a datasheet, or a statline. It must support sequential term expansion without losing context.

## 2. Data source

- All popups are built only from the single `TERMS` registry.
- An unknown `data-term` opens nothing and does not produce an error.
- A card displays its title, summary, related terms, and available actions.
- For unit terms with the standard `M / T / Sv / W / Ld / OC / Inv` row, characteristics are displayed in a separate compact grid rather than as one text line.
- A unit popup has the restrained utility label `Datasheet profile`; available action buttons form an even responsive grid.
- An action is shown only when a real target exists.
- A popup never creates a clickable link to its own current term.

## 3. Root chain

- Clicking a term in the article, weapon table, Glossary, or other main content opens a first-level popup.
- If a chain already exists, it is closed completely and replaced with the new root card.
- Clicking the same external term again while only one card is open does not create a duplicate and moves focus into the existing popup.

## 4. Nested levels

- Clicking a related term inside a popup keeps the parent popup and opens the next card.
- Every subsequent internal term adds a new level.
- When a level is added, existing parent cards are neither removed nor recreated; only one new card is added to the DOM, so the chain must not flicker or disappear briefly.
- The close button on level N closes that level and every deeper level.
- After closing, focus returns to the term on the parent level that opened the closed card.
- Technical labels such as “level 1”, “level 2”, and so on are not shown in the interface.

## 5. Repeated terms and cycles

- The current top term is not opened again.
- Special collapsing applies only to the adjacent loop `A → B → A`: card B closes and the previously open A remains.
- A more distant repeat is allowed: `A → B → C → A` creates a new A level.
- The system does not perform a global duplicate search across the entire chain.

## 6. Positioning

### Desktop

- The first popup opens near the clicked term.
- A nested popup is positioned near the term inside its parent card.
- Popups use document coordinates rather than a fixed viewport position: when the page scrolls, they move with the term and do not follow the user down the screen.
- Viewport boundary constraints are applied on initial opening and on resize only while the trigger is visible. If manual scrolling has already moved the trigger off screen, resize does not force the popup back into the viewport.
- If there is not enough room below, the card automatically opens above the trigger.
- The card does not extend beyond the left, right, top, or bottom viewport edge.
- Open cards recalculate their positions when the window size changes.

### Mobile

- Popups are centered in the available part of the dynamic viewport between the fixed header and the bottom safe inset.
- Subsequent levels receive a small vertical offset; the calculation is based on the last three visible cards.
- Card height is constrained by the dynamic viewport; internal content scrolls.
- The page does not gain horizontal scrolling.

## 7. Closing and focus

- Escape closes only the top popup.
- The close button closes the selected level and everything deeper.
- Clicking or tapping outside every popup card, in free page space, or on the dimmed background closes the entire popup chain.
- Clicking inside a card, scrolling its content, and interacting with its links, terms, and action buttons do not count as an outside click and do not close the popup.
- On mobile devices, an outside touch must close the chain with one ordinary tap, without first having to activate the background.
- Closing the root popup returns focus to the originating term in the document.
- Clicking the already open top term again does not change the chain.
- The newly opened top card receives programmatic focus without scrolling the page.

## 8. Transitions from a popup

- Available types: Glossary, To rule, Datasheet & Wargear, Statline.
- Before a transition, the complete term ID chain, external root term, level, and action-button data are saved.
- Before scrolling, the chain is temporarily hidden.
- A Glossary transition accounts for the fixed-header and sticky-search heights: the target card opens below both overlapping layers, including the `Assault → popup → Glossary` scenario.
- If the active Glossary filter hides the target card, the filter is cleared synchronously before the transition position is calculated.
- On Back, active navigation and the exact article position are restored first; after scrolling actually stops, the popup chain is restored without intermediate flicker.
- After recreating the cards, the system finds the action button on the original level by target and type.
- The found button receives focus and a brief pink-bronze highlight.
- If the original button is unavailable, focus moves to the top restored popup.

## 9. Accessibility

- Every card has `role="dialog"`, `aria-modal="false"`, and `aria-labelledby`.
- Every card heading has a unique ID.
- The close button has a clear accessible name containing the term name.
- All functionality is keyboard-accessible.
- The top popup has a visible `:focus-visible` state.

## 10. Acceptance criteria

- A new external term completely replaces the old chain.
- An internal term adds the next level without closing its parent.
- `A → B → A` returns to A without a duplicate.
- `A → B → C → A` creates a fourth level.
- A popup contains no active link to itself.
- The close button on level N closes N and everything deeper.
- Escape closes only the top level.
- Desktop cards are positioned near their triggers and remain within the viewport on opening.
- After manual scrolling, a desktop card may naturally leave the viewport and does not jump back on resize if its trigger is also invisible.
- Mobile cards are centered in the available viewport area and do not overlap the fixed header.
- A unit popup shows characteristics in separate even cells; on narrow mobile screens the grid wraps without horizontal scrolling and action buttons stack into one column.
- On mobile, the visual offset is recalculated from the last three visible cards: they preserve the `0 / 1 / 2` order, while the depth of the hidden part of the chain does not increase the offset and cannot push the top card outside the viewport.
- Back restores the complete chain and clearly highlights the exact action button that was pressed.
- `Assault → popup → Glossary` does not hide the Assault card heading beneath the sticky search panel.
