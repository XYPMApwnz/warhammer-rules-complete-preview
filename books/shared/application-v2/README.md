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

## V1 Home presentation

`home.mjs` preserves the Library/hero/shelf/card composition of the original
root `index.html`. Its scoped `home.css` reuses that page's typography,
background, cover proportions and horizontal scroll-snap behavior. The shared
primary header keeps its existing navigation and fixed geometry while using
the existing Warhammer/Games Workshop assets. No second header is mounted.

Book registrations may supply `home: {shelf: {id, title, subtitle, order},
cover, coverAlt, coverFit, accent, label, order}`. Only registered books create
shelves; a future category appears from this metadata without shell branches.
Books without metadata remain available in a generic Army Books shelf. The
Home presenter never loads a book's factual payload or roster service.

Rules & Tools links use the existing V2 routes. Mega Glossary uses the global
catalog integration described below. Core Rules remains reserved. Legacy status dates, verification
captions, service-worker controls and application links are not reused.

Run `qa:shared:v2:home` for V1 style comparisons, 390/800/801/1440px browser
checks, synthetic future categories and comparisons of book presentation
against the pre-port commit. `V2_HOME_SCREENSHOTS` selects an artifact directory
outside the repository for manual acceptance images.

## Global Mega Glossary

The shell mounts `?v2=GLOSSARY` using the unchanged enrolled
`glossary/v2/generated/index.en.json` corpus. `global-glossary.mjs` adapts its
qualified entries into the book reference contract; `global-glossary-content.mjs`
projects its existing structured display content, contextual overrides, Missions
and MFM annotations. Neither module resolves aliases, searches, or routes.

Book and global catalogs use `createGlossaryCatalog`; all articles/popups use
`createReferencePresenter` and `createReferenceContract`. Identity is owning
registry + canonical ID + qualified subentry path, including parent/type where
local canonical IDs collide. The global catalog is never roster restricted.
Its first 120 search matches are displayed progressively without changing
coverage. Search/category state belongs to the history entry.

Global articles use the existing GLOSSARY/REFERENCE route contract, without
book/roster membership. The shell owns history listeners and module destruction;
the Glossary owns its DOM, styles, input handlers and popup focus. Leaving the
catalog removes those resources. `/glossary/index.html` is a compatibility
redirect; old IDs/aliases are resolved by the same shared contract, failing
closed on ambiguity. Legacy viewer/resolver scripts are not loaded.

Run `qa:shared:v2:glossary` for corpus/namespace controls and desktop/390px
navigation, search, native new-tab, popup and lifecycle checks.
