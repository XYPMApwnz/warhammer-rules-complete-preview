# ArmyBookApp V2

One presentation runtime renders one supplied payload on desktop and phone.
`project.mjs` projects an effective entity graph with Rule Contract V2 semantics
and already-owned central MFM records. `runtime.mjs` only formats, searches and
navigates that projection. There are no book-specific gameplay branches,
runtime gameplay prose parsers, roster state or legacy Army Book/Glossary factual inputs.

Existing canonical entity IDs identify cards, children, references and routes.
Field IDs are source-field addresses within their existing owner, not new
gameplay identities. MFM unit-reference labels resolve through exact central
record and canonical entity bindings. Generated fields and the fact manifest
are disposable projections; neither can override the effective input.

## Presentation contract

Payload schema: `army-book-app-v2/presentation`. Cards contain an existing ID,
kind, title, parent/children, fields and explicit links. Each field carries its
raw value, canonical source owner/address and context ID. Optional display
formatting cannot change that raw value. A heading or caption may carry the
same source field directly, avoiding a duplicate body row. Tables use explicit
row/column coordinates; statistics and keyword chips are formatting choices.

Gameplay-bearing effective qualifications remain on their existing entity.
Official confirmation field lists and evidence IDs remain provenance metadata.
Base Army Book Leader eligibility evidence is labelled as historical evidence;
the already-resolved effective MFM relations are displayed as current facts.
The Reader does not calculate eligibility or form attachments.

## Navigation and popup contract

The canonical hash opens an entry. A fresh deep link or refresh opens its full
card. Explicit references can open a modal while retaining the selected card
as background. Browser history preserves the distinction between full entries
and dialogs, background identity and saved scroll positions. Escape, close and
backdrop dismiss a dialog through history. Unknown IDs show a book overview
warning; they never resolve by title or prose.

The phone drawer makes background content inert, traps keyboard focus and
closes on Escape or navigation. Desktop can collapse its sidebar. Search uses
only supplied titles and fields and returns existing canonical cards. The
same mount function, state and stylesheet serve both viewport sizes.

## Current scope

Death Guard is the first adapter at `books/death-guard/v2/app.html`. This route
is a local V2 development entry, separate from V1 publication and offline
inventory. No new public Library or service-worker integration is implied.
Related / Compatible Rules now consume an optional disposable compatibility
projection on that same payload. Glossary V2 uses the same canonical card map;
Roster migration is deferred. Current V1
features without equivalents are recorded in the DG application QA report.

## Related rules presentation

`payload.relatedRules` uses `army-book-related-rules/v2`. Each canonical
datasheet/rule row has a result with no selected Detachment and another with
the rule's explicitly selected canonical Detachment. The shared reader only
selects and displays those compiled results; it evaluates no gameplay prose,
creates no attachments and executes no effects. A selected filter excludes
other Detachments before using its scoped result. All Detachments preserves
unavailable Detachment context. Match and Conditional have labelled badges;
No Match results are hidden. Stratagems and Enhancements have separate lists.

Titles are display labels obtained from the same canonical cards. Rule links
use their existing canonical IDs and existing modal/history navigation. The
filter persists through in-page navigation and popup Back/Forward/close, and
datasheet dialogs share the same related-rules state. Desktop and phone use
the same renderer. Invalid, duplicate or unresolved projection identities
fail mounting; they never become Conditional.

## Glossary presentation

`glossary.mjs` builds a disposable `army-book-glossary/v2` index from effective
canonical rule identities and existing clean Core records. Each entry carries
only its canonical target ID, display labels and presentation aliases. There
are no gameplay definitions in this index. Named abilities embedded within a
canonical section become aliases bound to that section's exact source field
address; they do not create new rule owners. Core aliases use the existing Core
identity registry. Core definition cards project existing records into the same
card map. Derived concepts have a typed `sourceRuleId` relationship to their
existing definition owner rather than duplicating its definition.

`reference-contract.mjs` supplies one canonical resolver and presentation model
for catalog results, popups and full articles. Search ranks titles and aliases
before canonical definition text; its default order is alphabetical. Categories
have human semantic labels, never registry enums. Results contain
each canonical target once, including when several aliases match. The Glossary
view has a reserved presentation route `#view-glossary`, distinct from factual
IDs. Its query survives popup close, reload and Back/Forward through history
state, as does its category filter; a new Glossary visit starts unfiltered.
Close returns to the originating Reader card, physical instance or reference article. `reference-v1.mjs` renders the same
canonical fields in popup and standalone article shells, with book-owned colors.
Full articles do not use the generic full-record card renderer.

Personal book `allowedIds` still determines roster content. Reference scope is
separate: clean Core plus explicitly linked canonical references reachable from
that content. Links and reference fields extend this scope; parent/child inventory
membership does not. A source-owner definition retains its original field IDs,
values and provenance when displayed inside another reference entry.

Reference links keep the canonical hash and use `view=reference` only to select
the full-article shell on native/new-tab navigation. Bare Core hashes also open
that shell. History selects popup versus article, never canonical availability.
The same policy applies to clicks, direct URLs, reload and Back/Forward, including
Personal Guide references. Weapon/profile dialogs retain their effective physical
instance projection. `qa:shared:v2:references` runs independent synthetic guards;
`qa:shared:v2:references:browser` checks both books and both viewports.

The application adapter recomputes the index; a saved index cannot override
canonical facts. Validation rejects missing targets, duplicate identities,
copied factual definitions and aliases with unresolved field addresses.

## V1 datasheet presentation on V2 records

`datasheet-v1.mjs` is the single presentation adapter. It reads the existing
canonical/effective cards and their physical instance/scope IDs, preserving
every field's value, identity and provenance in the DOM. It does not execute
effects or resolve gameplay identities from titles. Weapon pills use explicit
Core ability IDs; source-reference pills open their existing canonical owner.
Numeric breakdowns format the runtime's applied before/after trace beneath
the supplied final value. Aggregate weapon ownership remains unit scoped.

`datasheet-v1.css` imports the actual shared V1 datasheet and artwork styles.
Its scoped prerequisites preserve the accepted V2 navigation and other card
types. `datasheet-v1-layout.mjs` adapts the V1 column balancing and phone profile
placement, moving the original fact/event nodes rather than reconstructing
them. Unit artwork is build-time presentation metadata from the existing
canonical-ID image mapping; no V1 target catalog is read.

The same native V2 detail/history resolver serves Reader, Related Rules and
Glossary. Effective weapon dialogs additionally retain physical composition
scope, so two rows of one profile do not open a flattened canonical answer.

Run `books/death-guard/v2/datasheet-v1-qa.mjs` and
`books/death-guard/v2/datasheet-v1-browser-qa.mjs` for the independent 3,654-field
census, frozen navigation, actual V1 shell and desktop/phone mega-case controls.
`roster-visible-effects-qa.mjs` retains the source-backed 22-clause end-to-end
checks and negative mutations.

## Book-owned visual identity

Shared V1 CSS accepts optional `--book-*` paint tokens. Background/panel/ink,
accent/signal/metal and their RGB channels cover gradients, borders, dialogs,
Glossary and roster chrome. Every fallback retains the original DG paint.
These tokens change no geometry or behavior and contain no gameplay data.

A book loads its own theme stylesheet alongside the shared styles and supplies
its existing cover via `bookPresentation.coverImage`. Emblem artwork is styled
in the book sheet so relative asset URLs stay book-owned. Unit artwork still
uses the canonical-ID presentation mapping. Do not import legacy book CSS or
create a separate presenter to apply a faction theme.

`npm run qa:am:v2:theme:browser` compares desktop/390×844 geometry and factual
DOM output against the pre-theme product, checks DG pixel parity, and saves
screenshots for manual review. Set `ARMY_APP_V2_SCREENSHOTS` to retain them in a
chosen directory. The AM library cover uses the existing shared cover layout.
