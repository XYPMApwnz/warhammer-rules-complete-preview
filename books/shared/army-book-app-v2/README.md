# ArmyBookApp V2

One presentation runtime renders one supplied payload on desktop and phone.
`project.mjs` projects an effective entity graph with Rule Contract V2 semantics
and already-owned central MFM records. `runtime.mjs` only formats, searches and
navigates that projection. There are no book-specific gameplay branches, prose
parsers, glossary imports, roster state or legacy Army Book factual inputs.

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
Compatible Rules UI, Glossary and Roster migrations are deferred. Current V1
features without equivalents are recorded in the DG application QA report.
