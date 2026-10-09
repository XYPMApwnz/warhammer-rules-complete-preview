# V2 route/context identity

Phase 1 defines URL identity and integrates it with existing ArmyBookApp mounts.
It does not implement Home, a common application shell, a Core reader, or a
merged Mega Glossary. Unsupported destinations must not masquerade as a book.

`route-context.mjs` exports `normalizeRoute`, `encodeRoute`, and `decodeRoute`.
The normalized immutable record has these fields:

| Field | URL | Meaning |
| --- | --- | --- |
| destination | v2 | HOME, CORE_RULES, ARMY_BOOK, ROSTER, PERSONAL_GUIDE, UNIT_INSTANCE, REFERENCE, GLOSSARY |
| bookId | book | The book context, including the owner of persistent roster state |
| registryId | registry | Owner of the canonical target; Core may differ from book context |
| canonicalId | hash | Existing canonical record identity, never a generated title/slug |
| rosterId | roster | Exact saved roster identity |
| instanceId | instance | Exact physical UNIT_INSTANCE |
| profileId | profile | Canonical MODEL profile where the selected scope requires it |
| scopeId | scope | Exact effective composition/loadout scope |
| fieldPath | field | Optional exact canonical field address, including glossary aliases |
| chapterId / sectionId | chapter / section | Reader hierarchy identifiers, reserved for Core integration |

Absent fields normalize to null. Effective recipients require book + roster +
instance; a profile/scope cannot substitute for a physical owner. Invalid,
ambiguous or conflicting URL identities fail closed. The encoder clears stale
identity parameters before writing the next entity and preserves unrelated
query parameters. Identifiers are encoded without interpreting their contents.

## Canonical namespace and references

`createReferenceContract({cards,index,registryId,coreRegistryId})` is still the
reference authority. Its `identityFor(id)` supplies `{registryId,canonicalId}`.
Its resolver accepts that identity and rejects a different registry even when
the local canonical ID exists. Core has its shared registry; book-local records
retain their book namespace. No merged global ID-to-card table is introduced.

`bookId` is context; `registryId` is identity. Personal Guide membership remains
separate from canonical reference availability. Existing reference closure and
Core availability are unchanged. An unavailable exact effective owner, profile,
scope or inventory item cannot fall back to canonical values or another copy.

## Browser contract

Native hrefs and ordinary click navigation use the same encoder. Effective
weapon/profile references serialize their exact physical scope in the URL.
Normal clicks may present a popup; native new tabs/direct URLs present the same
effective entity through the existing renderer. Both reconstruct from URL and
saved roster state, independently of the originating tab's history.

History may retain popup/background presentation, scroll, focus and search.
It cannot supply or override the selected entity's effective identity. URL
context wins over stale history. Roster restoration reruns route evaluation.

The current book mount rejects foreign namespaces/book contexts and destinations
whose UI is not implemented. It does not implement a book switcher.

## Backward-compatible aliases

Existing book paths and canonical hashes remain valid. `#view-roster`,
`?roster=…#view-roster-guide`, `?roster=…#roster-unit%2F…`, `#view-glossary`,
and `?view=reference#…` decode through explicit aliases. Legacy canonical IDs
derive their registry from the mounted reference contract. Old URLs which never
encoded an effective owner cannot recover that previously absent information;
new visible effective links always encode it.

## Guards

`route-context-qa.mjs` runs without army data. The synthetic browser guard uses
the actual shared app with duplicate physical instances and independently
modified profile scopes. `route-context-browser-qa.mjs` exercises both current
books on desktop and 390×844, including native Ctrl/middle-click, direct URL,
reload, Back/Forward, invalid context and existing aliases. Its `--baseline`
mode serves the original affected modules from Git in memory to reproduce the
lost-effective-context defect without changing the checkout.
