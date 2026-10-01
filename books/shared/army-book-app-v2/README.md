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
card map and detail renderer. Derived concepts link their existing definition
owner rather than duplicating its definition.

Search matches titles/aliases as presentation text, then opens the existing
canonical target through the Reader's popup/history resolver. Results contain
each canonical target once, including when several aliases match. The Glossary
view has a reserved presentation route `#view-glossary`, distinct from factual
IDs. Its query survives popup close, reload and Back/Forward through history
state; a new Glossary visit starts with an empty query. Close returns to the
previous Reader card. Desktop and phone share this state and renderer, with
the existing stylesheet.

The application adapter recomputes the index; a saved index cannot override
canonical facts. Validation rejects missing targets, duplicate identities,
copied factual definitions and aliases with unresolved field addresses.
