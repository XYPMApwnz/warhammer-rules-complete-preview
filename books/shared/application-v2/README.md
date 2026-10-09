# Unified V2 application — Phase 2B

The canonical entry is `/v2/app.html`. `v2/boot.mjs` composes book-owned
registrations; the shared shell does not import any army registry or gameplay
data. To add a book, supply a registration and add it to the entry composition.

`createBookRegistry(entries)` validates stable identities, loaders, presentation
asset bases, optional roster factories, theme styles and legacy URL aliases.
Payloads and roster services are loaded only when their book is selected.

`createApplication(document, {registry, entryURL, root})` owns Home, primary
navigation, the content mount root and the active module. Its API has
`navigate(route)`, `ready`, `activeModule`, `activeBookId`, and idempotent
`destroy()`. A switch destroys the previous module before loading its successor.
Generation tokens suppress obsolete loads and loads that settle after destroy.

ArmyBookApp remains the sole owner of book Contents, rules, datasheets, import,
attachments, Personal Guide, effective instances, Related Rules and references.
The shell never reconstructs these surfaces or their state. It supplies
`assetBaseURL` so existing presentation assets resolve from the book's original
base without changing the document base or canonical facts.

## Routes

Bound routes use the existing `army-book-app-v2/route-context.mjs` contract.
For example:

- `?v2=HOME` — neutral Home
- `?v2=HOME&section=army-books` — book selector
- `?v2=ARMY_BOOK&book=<id>&registry=<id>#<canonical-target>`
- `?v2=ROSTER&book=<id>#view-roster`
- Personal Guide, physical-instance, profile, scope and reference URLs retain
  the same book/registry/roster/instance identity as the module contract.

`?v2=ROSTER` is a shell-only selection page, not a canonical roster entity. It
cannot carry roster/instance/profile identity. After choosing a book, its
existing bound roster route is used. Query-only book destinations receive the
existing hash aliases; legacy canonical hashes are left to the module's own
reference resolver.

`?v2=CORE_RULES&registry=core-rules` and bookless `?v2=GLOSSARY` are reserved
destinations with an honest integration notice. They do not create replacement
readers. Book-scoped Glossary and Core references remain module-owned.

Old book `app.html` files are generated compatibility redirects that preserve
the complete query and hash and add the book context when absent. Persistent
rosters stay in the same origin/book storage. Top-level navigation clears only
the new history entry's presentation background; Back/Forward retains previous
entries unchanged. The shell does not intercept native modified/new-tab clicks.

## Presentation and verification

Neutral primary navigation stays separate from book-local Contents. Shell CSS
offsets fixed book surfaces and mobile drawers by the primary bar height. Book
layout, faction CSS and factual presentation remain owned by ArmyBookApp.

Run `qa:shared:v2:shell` for independent synthetic registries, routing and load
races, and `qa:shared:v2:shell:browser` for real books on desktop and 390×844.
`V2_SHELL_SCREENSHOTS` optionally writes screenshots outside the repository.
Existing module browser suites retain their factual assertions; their test
servers explicitly allow the new compatibility-entry dependencies.
