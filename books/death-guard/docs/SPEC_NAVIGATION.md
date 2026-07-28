# Technical specification: Death Guard Rules navigation

## Specification update rule

- Any change to navigation, Journey/Back, scroll tracking, responsive behavior, focus, accessibility, or a related test must be reflected in this document at the same time.
- A change is not complete until the corresponding requirement and acceptance criterion are reflected in the specification.
- If a change affects both navigation and popups, it must be recorded in both specifications.
- New behavior must be accompanied by an automated check when it can be reproduced without a real browser, and by a manual acceptance scenario when visual geometry matters.
- Obsolete requirements must not remain beside new ones: the specification describes only the current agreed behavior.

## Fixed v5 parameters

- Desktop/mobile breakpoint: `800px`.
- The scroll-spy reference line, programmatic destination, and CSS offsets applied to navigation targets use the single source `--navigation-gap: 18px`; separate `18px` and `20px` literals in JS/CSS are prohibited.
- For nested Glossary groups, both operations add the same actual sticky-search height; for the root Glossary this addition is zero.
- Geometry comparison with the reference line allows no more than `1px` for browser subpixel rounding; this epsilon does not count as early activation.
- Successful completion of programmatic scrolling means a deviation of less than `2px` from the reachable destination position, or 6 stable animation frames already at the reachable destination position. The `2200ms` limit is an emergency boundary: it stops smooth scrolling, recalculates geometry, and performs final positioning with `behavior: auto`, but does not itself count as successful completion.
- A Journey is created for popup actions and local datasheet buttons; an ordinary click in the global tree does not add a Back entry.
- An action is identified by the stable key `level + ordinal number + type + target`; `type + target` is used only as a fallback.
- Back restores the saved absolute `scrollY`.
- If the mobile drawer and a popup are open at the same time, the first Escape closes the top popup; the next Escape closes the drawer.

## 1. Purpose

Navigation must allow fast movement between global rules sections, automatically show the reader's actual position in the document, and provide an exact return after transitions from popups and local datasheet elements.

## 2. Structure

- The global tree contains no more than three levels.
- First level: Start, Updates, Core Rules, Detachments, Datasheets, Glossary.
- Detachments use the structure: `Detachment → Detachment name → Detachment Rule / Enhancement / Stratagems`.
- In the body of each Detachment, the third-level items `Detachment Rule`, `Enhancement`, and `Stratagems` are arranged as strictly sequential vertical blocks. Two navigation destinations cannot share one row or the same top coordinate.
- Every third-level item has a visible counterpart in the body. For `Stratagems`, a separate `Stratagems` heading is required before the individual Stratagem cards; navigation and visual highlighting apply to this heading, not to the first card in the section.
- Datasheets use the structure: `Datasheets → category → unit`.
- In Glossary, the second level contains separate thematic groups.
- Local datasheet parts — Profile & Weapons, Abilities, Unit Composition, and Keywords — are not included in the global tree.
- Every global-tree item must have an existing section in the document body and its own `data-track` range.

### 2.1. Selecting the scroll and highlight targets

- A navigation target consists of two separate references: `scrollTarget`, which defines the scroll position, and `highlightTarget`, which defines the visually highlighted element. For sections, both references point to the section's immediate visible heading.
- An item representing a section, category, or group always scrolls to its heading and highlights only that heading. The first card in the group cannot be used as a fallback target.
- An item representing a specific entity highlights that entity's card: for example, a specific datasheet, rule, Enhancement, Stratagem, or Glossary term.
- If a section has no visible heading of its own, this is a structure and QA error. The controller must not silently substitute the first card, the nearest child element, or the entire section container.
- Section highlighting applies only to the immediate heading text: a brief color change and glow without a border around the whole container. Highlighting a specific card uses a soft card border.
- Examples: `Stratagems → Stratagems heading`; `Enhancement → Enhancements heading`; `Datasheets → Datasheets heading`; `Epic Heroes → Epic Heroes heading`; `Mortarion → Mortarion card`; a specific Stratagem, if it ever appears as its own tree item, → its card.
- After programmatic scrolling, highlighting starts only for the saved `highlightTarget`. Scroll-spy must not replace it with the first child that reaches the reference line during the animation.

## 3. Branch control

- The item label and arrow are separate buttons.
- Pressing the label expands its path and navigates to the section.
- Pressing the arrow only expands or collapses the branch without scrolling the article.
- When a branch opens, all sibling branches at the same level close: sibling sections cannot be open simultaneously.
- Manual expansion with the arrow may temporarily hide the path to the active item without changing the active item or scrolling the article.
- On the next manual article scroll, the tree again expands the path to the actually active item and closes its siblings.

## 4. Active section

- During manual scrolling, the active item is determined from the real geometry of sections relative to the line below the fixed header.
- If a parent and nested section cross the line, the deepest one is selected.
- A nested item is not activated early because it is close to the reference line: its `rect.top` must actually cross the line, allowing a subpixel epsilon of no more than `1px`. In the gap before the child block, the parent crossing the line remains active.
- A group is active across the full range of its cards, not only near its heading.
- In the gap between any adjacent child sections, the last child item that crossed the line remains active; the parent item must not activate briefly between subsections. This rule applies equally to Core Rules, Detachments, Datasheets, and Glossary at every tree level.
- The active leaf item receives `aria-current="location"` and a distinct visual treatment.
- Parents of the active item receive a calmer ancestor state.
- The navigation panel scrolls itself to the active row; the article does not move.
- The panel has no horizontal scrolling: long names wrap within the available width. The vertical scrollbar is thin, square, and uses restrained green-bronze interface colors.
- Scroll tracking has one owner and one passive scroll handler.
- During manual scrolling, a new candidate becomes active only after remaining continuously at the reference line for at least 90 ms. One-frame intermediate parents and neighboring items must not change the active state.

## 5. Programmatic navigation

- During programmatic navigation, control temporarily belongs to NavigationController.
- The destination item is selected immediately; intermediate sections must not flash through active states in sequence.
- The destination position accounts for the actual fixed-header height and the single `--navigation-gap` used by scroll-spy to determine intersections. Header geometry is checked before every transition and updated when its size changes.
- Completion is determined by the actual position and scroll stabilization, not by a fixed elapsed time. The emergency limit starts final positioning rather than declaring an intermediate position complete.
- Control returns to reading mode only after the reachable destination position is confirmed, or after explicit manual cancellation by the user.

## 6. Journey and Back

Before a transition, the following are saved:

- exact vertical position;
- active global section;
- identifier of the pressed element;
- open popup chain;
- external term to which the chain is attached;
- level and data of the button that started the transition.

When Back is pressed, the system must:

1. Immediately restore the correct navigation path and active item.
2. Smoothly return to the saved exact position.
3. Wait for scrolling to actually finish.
4. Restore the popup chain if the transition originated from it.
5. Find the recreated button from which the transition was made.
6. Return keyboard focus to it and show a brief pink-bronze highlight.
7. Avoid selecting intermediate sections during the return.

Back maintains its own LIFO history and does not replace browser history.

### 6.1. Interaction between navigation and popups

- Ordinary opening of a term and adding a nested popup level do not start a global navigation transition.
- The active tree item, article position, and expanded branches do not change on such a click.
- During later manual scrolling, desktop popups move with the article in document coordinates; they are not fixed in the viewport and do not follow the user down the page.
- When a nested term opens, existing parent popups remain in the DOM; only one new card is added. Navigation must not cause the popup layer to be cleared, parent animations to restart, or the chain to disappear briefly.
- Clicking a term in the main document starts a new root popup chain but also does not change the active navigation section.
- NavigationController participates only when the user presses a rule transition or Open datasheet from a Related Rules popup.
- For an action transition to a card inside Glossary, the scroll position accounts for both the fixed header and the actual height of the sticky search panel; the target card heading cannot end up beneath the panel.
- Sticky compensation applies only to targets inside Glossary. Navigation to the root `Glossary` item does not subtract the height of its own search panel and must place the root section on the reference line.
- Scroll-spy measures nested Glossary groups against the line below sticky search, matching their destination; the previous group cannot remain active after a completed transition to the next group.
- After any transition started by a global-navigation click or action button, the exact target receives one brief bronze highlight. For large sections, only the immediate heading is highlighted with text color and glow, without a rectangular outline; for standalone cards, the card itself receives a soft border. A new transition removes the previous navigation highlight and cancels its timer; no more than one such highlight exists at a time. Separate handlers for particular sections are prohibited.
- Before an action transition, Journey saves the full popup chain, the external root term, the level, and the pressed action-button data.
- On Back, the active section and exact article position are restored first, followed by the popup chain without intermediate active states.
- After recreating the chain, the system finds the action button at the original level, returns focus to it, and starts a brief pink-bronze highlight.
- If the original action button is no longer available, focus moves to the top restored popup.

## 7. Desktop and mobile

- On desktop, the panel is permanently positioned on the left and can be collapsed.
- On mobile, the panel opens over the document as a drawer.
- Switching from desktop to mobile must not carry the collapsed state over and prevent the drawer from opening.
- The drawer closes through its button, another press of the menu button, a click on the scrim, or Escape.
- While the mobile drawer is open, the article does not scroll or change its active item; only the Contents panel scrolls. After closing, the article continues from its previous position.
- While the drawer is open, the main content is excluded from focus.
- When the panel is hidden, its elements are excluded from focus through `inert` and a tabindex fallback.
- After closing, focus returns to the open button; after desktop collapse, it returns to the expand button.

## 8. Accessibility

- Open and collapse buttons have `aria-controls="tocPanel"`.
- Drawer, collapse, and branch states are synchronized through `aria-expanded`.
- Hidden areas receive the correct `aria-hidden`.
- Every action is keyboard-accessible.
- `:focus-visible` remains visible; touch interaction does not leave a false focus outline.

## 9. Acceptance criteria

- Every tree item leads to an existing section.
- Maximum tree depth is three levels.
- Fast upward and downward scrolling does not leave the wrong item active.
- At the boundary between two nested sections, the deepest actually visible section becomes active.
- Clicking a first- or second-level parent item does not switch spontaneously to the nearest child while that child is still below the reference line.
- After clicking the root `Glossary`, `Glossary` remains active, not the previous section or `Core rules`.
- Every existing nested item in any group, including Glossary, receives its own `aria-current="location"` after being clicked and does not leave the previous sibling active. The rule does not depend on the number of items in a particular book.
- During manual scrolling between any adjacent subsections, the tree switches directly from the previous child item to the next without an intermediate highlight on their parent.
- An expanded deep Glossary branch does not create a horizontal scrollbar in the navigation panel; the vertical scrollbar remains visible and styled.
- Transitions to `Detachment Rule`, `Enhancement`, and `Stratagems` have distinct vertical destinations and do not compete for one active item.
- Clicking `Stratagems` shows a visible `Stratagems` heading at the top of the target block, not only the name of a specific Stratagem.
- Clicking any section or category item highlights its immediate heading; the first card in the section is not highlighted. Conversely, clicking an item for a specific entity highlights its card.
- Navigation through the label and expansion through the arrow perform different actions.
- No more than one branch is open at each tree level, including combinations of the active section and a manually expanded section.
- Desktop collapse does not break the subsequent mobile menu.
- Back restores the exact position, navigation, popups, focus, and highlight.
- The transition `term → popup → Glossary` leaves the target Glossary card heading fully visible below sticky search.
- Every click transition ends with one target highlight; a new transition immediately removes the previous highlight. Back highlights the originating element instead of the destination.
- A first-level section heading reached from navigation does not receive a border or outline around the block: only a brief text glow is used.
- The third-level `Enhancement` item leads to the shared block containing all Enhancements for the selected Detachment and highlights its direct heading. An individual Enhancement must not be shown incorrectly as the category's sole target.
- Adding a nested popup does not cause scrolling, an active-item change, or parent-card flicker.
- Hidden navigation cannot be reached with Tab.
- On desktop and with the mobile drawer closed, the panel and article scroll independently. With the mobile drawer open, article scrolling is locked while Contents retains its own vertical scrolling.
- A header-height change before or during a transition does not hide the target or give scroll-spy stale geometry.
- Expiration of the protective `2200ms` limit does not activate an intermediate section: the controller performs final positioning before returning control to scroll-spy.

### 9.1. Rapid switching between items

- A sequence of rapid clicks or touches on different Contents items is treated as one replaceable navigation operation: only the last selected target is current.
- `pointerdown`, `touchstart`, and `wheel` inside the Contents panel do not transfer control to scroll-spy between gesture start and click handling.
- A new transition atomically cancels the previous controlled scroll, its callback, timer, and any target navigation highlight already shown.
- Until the last controlled scroll completes or is cancelled by manual interaction with the document, `aria-current`, `is-current`, and the expanded path belong to the last selected item.
- Intermediate sections crossed during programmatic scrolling do not become active even for one frame.
- Automatic scrolling of the Contents panel to the selected row occurs without a separate smooth animation, so the tree does not create the appearance of selecting adjacent items in sequence.
- Manual scrolling or touching the main document cancels the controlled scroll, stops native smooth scrolling, and only then returns ownership to scroll-spy.
- The acceptance check must rapidly select at least three distant targets in succession; the tree must never show an active item other than the last selected target.

## 10. Complete content and a single tree source

- The tree and document body are generated by one build from `content/death-guard-rules.en.json`; manual duplication of the structure is prohibited.
- The number of global targets is not fixed in this specification and is determined by the data for the particular book. QA must derive the expected set from its structured data and confirm that every generated item appears exactly once in the tree and body.
- Every `data-nav-target` has exactly one matching `id` and `data-track`; completeness checking is a mandatory part of QA.
- Internal datasheet parts (Profile & Weapons, Abilities, Composition, Leader, Wargear, Damaged, Keywords, and other local blocks) are not added to the global tree.
- Every existing Detachment has three separate vertical targets. The tree uses the labels `Detachment Rule`, `Enhancement`, and `Stratagems`; `Enhancement` leads to the shared block with the visible heading `Enhancements`. The `Stratagems` heading must be visible in the body of every Detachment regardless of their number.
- Any later change to the section set is made in structured data and the generator, after which the body, navigation tree, and term registry are rebuilt together.
- Before a popup → Glossary transition, the active search filter is cleared synchronously, the hidden card is revealed, and only then is the scroll destination calculated.
- The builder calculates the PWA cache version from generated HTML/data and all runtime assets. `--check` must fail if artifacts or the cache key are stale.
