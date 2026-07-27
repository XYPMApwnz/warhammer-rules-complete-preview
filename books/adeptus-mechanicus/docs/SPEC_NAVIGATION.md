# Technical Specification: Adeptus Mechanicus Rules Navigation

This file is synchronized with the current Death Guard contract. Mechanicus retains the same behavior and constraints; faction data forms the `Datasheets → Faction Pack / Warhammer Legends → unit` tree, while source metadata is placed inside `Updates` instead of creating an additional top-level section.

## Specification Update Rule

- Any change to navigation, Journey/Back, scroll tracking, responsive behavior, focus, accessibility, or a related test must be reflected in this document at the same time.
- A change is not considered complete until the corresponding requirement and acceptance criterion are recorded in the specification.
- If a change affects both navigation and popups, it must be recorded in both specifications.
- New behavior must be accompanied by an automated check when it can be reproduced without a real browser, and by a manual acceptance scenario when visual geometry matters.
- Obsolete requirements must not remain beside new ones: the specification describes only the currently agreed behavior.

## Fixed v5 Parameters

- Desktop/mobile breakpoint: `800px`.
- The scroll-spy control line, programmatic destination, and CSS offsets applied to navigation targets use the single source `--navigation-gap: 18px`; separate `18px` and `20px` literals in JS/CSS are prohibited.
- For nested Glossary groups, both operations add the same actual sticky-search height; for the root Glossary, this addition is zero.
- Geometry comparison against the control line allows no more than `1px` for browser subpixel rounding; this epsilon is not treated as early activation.
- Successful completion of programmatic scrolling means either a deviation of less than `2px` from the reachable destination position or 6 stable animation frames already at the reachable destination position. The `2200ms` limit is an emergency boundary: it stops smooth scrolling, recalculates geometry, and performs final positioning with `behavior: auto`, but does not by itself count as successful completion.
- A Journey is created for popup actions and local datasheet buttons; an ordinary click in the global tree does not add a Back record.
- An action is identified by the stable key `level + ordinal number + type + target`; `type + target` is used only as a fallback.
- Back restores the saved absolute `scrollY`.
- If the mobile drawer and a popup are open at the same time, the first Escape closes the top popup; the next Escape closes the drawer.

## 1. Purpose

Navigation must allow quick movement between global rules sections, automatically show the reader's actual position in the document, and provide an exact return after transitions from popups and local datasheet elements.

## 2. Structure

- The global tree contains no more than three levels.
- First level: Start, Updates, Core Rules, Detachments, Datasheets, Glossary.
- Detachments use the structure `Detachment → Detachment name → Detachment Rule / Enhancement / Stratagems`.
- Within each Detachment, the third-level items `Detachment Rule`, `Enhancement`, and `Stratagems` are arranged as strictly sequential vertical blocks. Two navigation destinations cannot share one row or the same top coordinate.
- Every third-level item has a visible counterpart in the document body. For `Stratagems`, a separate `Stratagems` heading is required before the individual Stratagem cards; navigation and visual highlighting target that heading, not the first card in the section.
- Datasheets use the structure `Datasheets → category → unit`.
- In Glossary, the second level contains separate thematic groups.
- Local datasheet parts — Profile & Weapons, Abilities, Unit Composition, and Keywords — are not included in the global tree.
- Every global-tree item must have an existing section in the document body and its own `data-track` range.

### 2.1. Selecting Scroll and Highlight Targets

- A navigation destination consists of two separate references: `scrollTarget`, which determines the scroll position, and `highlightTarget`, which determines the visually highlighted element. For sections, both references point to the section's immediate visible heading.
- An item representing a section, category, or group always scrolls to its heading and highlights only that heading. The first card inside the group cannot be used as a fallback target.
- An item representing a specific entity highlights that entity's card, such as a specific datasheet, rule, Enhancement, Stratagem, or Glossary term.
- If a section has no visible heading of its own, this is a structure and QA error. The controller must not silently substitute the first card, nearest child element, or entire section container.
- Section highlighting applies only to the text of the immediate heading: a brief color change and glow without a border around the entire container. Highlighting a specific card uses a soft card border.
- Examples: `Stratagems → Stratagems heading`; `Enhancement → Enhancements heading`; `Datasheets → Datasheets heading`; `Epic Heroes → Epic Heroes heading`; `Mortarion → Mortarion card`; a specific Stratagem, if it is ever added as a separate tree item, → its card.
- After programmatic scrolling, highlighting starts only for the saved `highlightTarget`. Scroll-spy must not replace it with the first child that crosses the control line during the animation.

## 3. Branch Control

- The item label and arrow are separate buttons.
- Pressing the label expands its path and navigates to the section.
- Pressing the arrow only expands or collapses the branch without scrolling the article.
- Expanding a branch closes all sibling branches at the same level: multiple sibling sections cannot be expanded simultaneously.
- Manual expansion with the arrow may temporarily hide the path to the active item without changing the active item or scrolling the article.
- On the next manual article scroll, the tree expands the path to the actually active item again and closes its siblings.

## 4. Active Section

- During manual scrolling, the active item is determined from the actual geometry of sections relative to the line below the fixed header.
- If a parent and nested section both cross the line, the deepest one is selected.
- A nested item is not activated early based on proximity to the control line: its `rect.top` must actually cross the line within the allowed subpixel epsilon of no more than `1px`. In the gap before a child block, the parent crossing the line remains active.
- A group remains active throughout the full range of its cards, not only near its heading.
- In the gap between any adjacent child sections, the last crossed child item remains active; the parent item must not activate briefly between subsections. This rule applies equally to Core Rules, Detachments, Datasheets, and Glossary at every tree level.
- The active leaf item receives `aria-current="location"` and prominent visual emphasis.
- Parents of the active item receive a quieter ancestor state.
- The navigation panel scrolls itself to the active row; the article does not move.
- The panel has no horizontal scrolling: long names wrap within the available width. The vertical scrollbar is thin, square, and uses restrained green-and-bronze interface colors.
- Scroll tracking has one owner and one passive scroll handler.

## 5. Programmatic Navigation

- During programmatic navigation, control temporarily belongs to NavigationController.
- The destination item is highlighted immediately; intermediate sections must not flash through active states.
- The destination position accounts for the actual fixed-header height and the shared `--navigation-gap` used by scroll-spy to determine crossings. Header geometry is checked before every transition and updated when its size changes.
- Completion is determined by actual position and scroll stabilization, not by a fixed elapsed time. The emergency limit triggers final positioning instead of declaring an intermediate position complete.
- Control returns to reading mode only after confirmed arrival at the reachable destination position or after explicit manual cancellation by the user.

## 6. Journey and Back

Before navigation, the system saves:

- the exact vertical position;
- the active global section;
- the identifier of the activated element;
- the open popup chain;
- the outer term to which the chain is attached;
- the level and data of the button that initiated navigation.

When Back is pressed, the system must:

1. Immediately restore the correct navigation path and active item.
2. Smoothly return to the saved exact position.
3. Wait for scrolling to actually finish.
4. Restore the popup chain if navigation originated from it.
5. Find the recreated button that initiated navigation.
6. Return keyboard focus to it and show a brief pink-and-bronze highlight.
7. Avoid highlighting intermediate sections during the return.

Back maintains its own LIFO history and does not replace browser history.

### 6.1. Navigation Interaction with Popups

- Ordinarily opening a term or adding a nested popup level does not start global navigation.
- The active tree item, article position, and expanded branches do not change on such a click.
- During later manual scrolling, desktop popups move with the article in document coordinates; they are not fixed in the viewport and do not follow the user down the page.
- When a nested term opens, existing parent popups remain in the DOM and only a new card is added. Navigation must not clear the popup layer, replay parent animations, or make the chain disappear briefly.
- Clicking a term in the main document starts a new root popup chain but likewise does not change the active navigation section.
- NavigationController is engaged only when the user presses a popup action: Glossary, To rule, Datasheet & Wargear, or Statline.
- For an action transition to a card inside Glossary, the scroll position accounts for both the fixed header and the actual sticky-search panel height; the target card heading cannot end up beneath the panel.
- Sticky compensation applies only to targets inside Glossary. Navigating to the root `Glossary` item does not subtract the height of its own search panel and must place the root section on the control line.
- Scroll-spy measures nested Glossary groups against the line below sticky search, matching their destination; the previous group cannot remain active after a completed transition to the next one.
- After any transition started by a global-navigation click or an action button, the exact target receives one brief bronze highlight. Large sections highlight only the immediate heading with text color and glow, without a rectangular outline; standalone cards receive a soft border. A new transition removes the previous navigation highlight and cancels its timer; no more than one such highlight can exist at a time. Section-specific handlers are prohibited.
- Before an action transition, Journey saves the complete popup chain, outer root term, level, and data of the activated action button.
- On Back, the active section and exact article position are restored first, followed by the popup chain without intermediate active states.
- After recreating the chain, the system finds the action button on the original level, returns focus to it, and starts a brief pink-and-bronze highlight.
- If the original action button is no longer available, focus moves to the top restored popup.

## 7. Desktop and Mobile

- On desktop, the panel remains on the left and can be collapsed.
- On mobile, the panel opens over the document as a drawer.
- Switching from desktop to mobile must not carry over the collapsed state and block the drawer from opening.
- The drawer closes through its button, another press of the menu button, a click on the scrim, or Escape.
- While the mobile drawer is open, the article does not scroll or change its active item; only the Contents panel scrolls. After the drawer closes, the article continues from its previous position.
- When the drawer is open, the main content is removed from the focus order.
- When the panel is hidden, its elements are removed from focus through `inert` and a tabindex fallback.
- After closing, focus returns to the open button; after desktop collapse, it returns to the expand button.

## 8. Accessibility

- Open and collapse buttons have `aria-controls="tocPanel"`.
- Drawer, collapse, and branch states are synchronized through `aria-expanded`.
- Hidden areas receive the correct `aria-hidden`.
- Every action is keyboard-accessible.
- `:focus-visible` remains visible; touch interaction does not leave a false focus ring.

## 9. Acceptance Criteria

- Every tree item leads to an existing section.
- Maximum tree depth is three levels.
- Fast upward and downward scrolling does not leave the wrong item active.
- At a boundary between two nested sections, the actually visible deep section becomes active.
- Clicking a first- or second-level parent does not switch spontaneously to the nearest child while that child remains below the control line.
- After clicking the root `Glossary`, `Glossary` remains active instead of the previous section or `Core rules`.
- Every existing nested item in any group, including Glossary, receives its own `aria-current="location"` after a click and does not leave the previous sibling active. The rule does not depend on the number of items in a particular book.
- During manual scrolling between any adjacent subsections, the tree switches directly from the previous child item to the next without intermediate parent highlighting.
- An expanded deep Glossary branch does not create a horizontal scrollbar in the navigation panel; the vertical scrollbar remains visible and styled.
- Transitions to `Detachment Rule`, `Enhancement`, and `Stratagems` have distinct vertical destinations and do not compete for one active item.
- Clicking `Stratagems` shows a visible `Stratagems` heading at the top of the destination block, not only the name of a specific Stratagem.
- Clicking any section or category item highlights its immediate heading; the first card in the section is not highlighted. Clicking a specific entity item instead highlights its card.
- Navigating through the label and expanding through the arrow perform different actions.
- No more than one branch is expanded at each tree level, including combinations of an active section and a manually expanded section.
- Desktop collapse does not break the subsequent mobile menu.
- Back restores the exact position, navigation, popups, focus, and highlight.
- The `term → popup → Glossary` transition leaves the target Glossary-card heading fully visible below sticky search.
- Every click transition ends with exactly one target highlight; a new transition immediately removes the previous highlight. Back highlights the original element that initiated the transition instead of the destination.
- A top-level section heading reached from navigation receives no border or outline around its block; only a brief text glow is used.
- The third-level `Enhancement` item leads to the common block of all Enhancements for the selected Detachment and highlights its direct heading. An individual Enhancement must not be presented incorrectly as the sole category target.
- Adding a nested popup does not cause scrolling, change the active item, or make parent cards flicker.
- Hidden navigation cannot be reached with Tab.
- On desktop and with the mobile drawer closed, the panel and article scroll independently. While the mobile drawer is open, article scrolling is locked and Contents retains its own vertical scroll.
- A change in header height before or during a transition does not hide the destination or give scroll-spy stale geometry.
- Expiration of the protective `2200ms` limit does not activate an intermediate section: the controller performs final positioning before returning control to scroll-spy.

### 9.1. Rapid Switching Between Items

- A series of rapid clicks or taps on different Contents items is treated as one replaceable navigation operation: only the last selected destination is current.
- `pointerdown`, `touchstart`, and `wheel` inside the Contents panel do not hand control to scroll-spy between the start of the gesture and click handling.
- A new transition atomically cancels the previous controlled scroll, its callback, timer, and any displayed navigation target highlight.
- Until the latest controlled scroll completes or is cancelled by manual interaction with the document, `aria-current`, `is-current`, and the expanded path belong to the last selected item.
- Intermediate sections crossed during programmatic scrolling do not become active even for one frame.
- Automatic scrolling of the Contents panel to the selected row uses no separate smooth animation, preventing the tree from appearing to select adjacent items in sequence.
- Manual scrolling or touching the main document cancels controlled scrolling, stops native smooth scrolling, and only then returns ownership to scroll-spy.
- The acceptance check must rapidly select at least three distant destinations in succession; the tree must never show an active item other than the last selected destination.

## 10. Complete Content and a Single Tree Source

- The tree and document body are generated in one build from `content/adeptus-mechanicus-rules.en.json` and `content/adeptus-mechanicus-codex-detachments.en.json`; manual duplication of the structure is prohibited.
- The number of global destinations is not fixed in this specification and is determined by the data for the particular book. QA must derive the expected set from its structured data and confirm that every generated item appears exactly once in the tree and body.
- Every `data-nav-target` has exactly one matching `id` and `data-track`; completeness verification is a mandatory part of QA.
- Internal datasheet parts (Profile & Weapons, Abilities, Composition, Leader, Wargear, Damaged, Keywords, and other local blocks) are not added to the global tree.
- Every existing Detachment has three separate vertical destinations. The tree uses the labels `Detachment Rule`, `Enhancement`, and `Stratagems`; `Enhancement` leads to the common block with the visible `Enhancements` heading. The `Stratagems` heading must be visible in every Detachment body regardless of the number of Stratagems.
- Any later change to the section set is made in structured data and the generator, after which the body, navigation tree, and term registry are rebuilt together.
- Before a popup → Glossary transition, the active search filter is cleared synchronously, the hidden card is revealed, and only then is the scroll destination calculated.
- The builder calculates the PWA cache version from generated HTML/data and all runtime assets. `--check` must fail if artifacts or the cache key are stale.
