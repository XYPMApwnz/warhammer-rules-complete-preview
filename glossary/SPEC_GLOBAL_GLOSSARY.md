# Specification: Global Warhammer 40,000 Glossary

## 1. Purpose

The global glossary is the single source of term names and definitions for the entire library. Books do not store their own versions of the definition of the same canonical term.

The number of terms is not fixed. The registry includes every concept found in connected books: core rules, game states, keywords, faction rules, detachments, enhancements, stratagems, abilities, datasheets, weapons and characteristics.

## 2. Primary Invariant

- A canonical ID has exactly one definition in each supported language.
- A book refers to a term by its canonical ID.
- A book may add only local navigation context; it cannot override the name or definition.
- A change to the canonical definition is applied automatically to every book after rebuilding.
- An unknown, conflicting or missing ID fails QA instead of silently creating a duplicate.

## 3. Canonical Term Structure

```json
{
  "id": "core-lethal-hits",
  "category": "core-rule",
  "title": { "en": "Lethal Hits" },
  "definition": { "en": "..." },
  "aliases": ["lethal-hits"],
  "related": ["core-critical-hit"],
  "canonicalSource": {
    "documentId": "core-rules",
    "revision": "11e",
    "locator": "...",
    "verifiedAt": "YYYY-MM-DD"
  },
  "status": "verified"
}
```

Required fields: `id`, `category`, `title`, `definition`, `canonicalSource`, `status`.

`status` accepts the following values:

- `verified` — checked against the selected current source;
- `provisional` — imported from a local book and awaiting verification;
- `deprecated` — retained as an alias for compatibility and not used as the primary entry.

## 4. Book-Local Context

Destinations depend on the structure of a particular book and are stored separately:

```json
{
  "bookId": "death-guard",
  "termId": "core-lethal-hits",
  "glossary": "glossary-core-lethal-hits",
  "rule": "attack-sequence",
  "datasheet": null,
  "statline": null,
  "units": []
}
```

The `glossary`, `rule`, `datasheet`, `statline` and `units` fields are never part of the canonical definition. A term may have different destinations in different books, but its popup text remains the same.

## 5. IDs and Aliases

- An ID is stable, written in kebab-case and represents meaning rather than a location in HTML.
- Shared rules use the `core-` namespace.
- Faction-specific entities use the faction namespace when names could collide.
- Automatic merging based only on an identical title is forbidden.
- Distinct legacy IDs are merged only through an explicit alias.
- An alias has no definition of its own and always resolves to one canonical ID.
- Alias chains and cycles are forbidden.

## 6. Sources and Priority

When sources conflict, the most authoritative current source is selected rather than the text from a book:

1. The current official Core Rules or an official document that changes a core rule.
2. The current official Codex/Faction Pack for a faction-specific rule.
3. An official FAQ, Balance Dataslate or errata if it explicitly replaces the previous wording.
4. A local transcription, only as `provisional` until the source is confirmed.

Publication date alone does not grant priority: the source must apply to the same edition and explicitly replace the current rule.

## 7. Conflict Resolution

- Identical IDs with identical normalized definitions are merged automatically; provenance from every book is retained.
- Identical IDs with different definitions produce a conflict report and stop the build.
- Resolving a conflict requires an explicit resolution record containing the selected source, the reason and the rejected alternatives.
- An identical title under different IDs produces an alias-candidate report but is not merged automatically.
- Differences limited to letter case, typographic quotation marks and whitespace are normalized for comparison, but the original canonical text is not rewritten.
- Book-local links are merged independently of the definition and are not considered a conflict.

## 8. Runtime and Build

- The editable source is stored in JSON.
- The builder creates a browser JS registry that works over `file://`, HTTP and GitHub Pages without a runtime fetch.
- The global runtime provides `forBook(bookId)`, which returns the compatible representation `{title, summary, related, glossary, rule, datasheet, statline, units}`.
- Each book loads the global runtime before its popup controller.
- Books do not include a copy of the global definition in their own runtime files.
- The root service worker caches the global registry and increments the revision whenever the glossary content hash changes.

## 9. Updating

1. Import new or changed entries from book sources.
2. Normalize IDs and resolve aliases.
3. Build conflict and alias-candidate reports.
4. Stop the build when a conflict remains unresolved.
5. Update the canonical source and `verifiedAt` only after verification.
6. Rebuild the browser registry and all book adapters.
7. Run shared QA and book-specific QA.

A weekly verification changes a term once in the global registry, after which every book receives the new version at the same time.

## 10. QA

- Every used `data-term` resolves to a canonical ID.
- Every related ID and alias resolves to an existing canonical ID.
- Each canonical ID has exactly one definition per language.
- A book contains no local `title`, `summary` or `definition` fields for a global term.
- All local targets exist in the DOM of the corresponding book.
- There are no alias cycles, alias chains or IDs without a source.
- Any mismatched definition under the same ID causes a build error.
- Generated artifacts match the content hash of the source JSON.
- Verification works for any number of books and terms without hard-coded counts.

## 11. Shared-Use Example

`core-lethal-hits` is defined once globally.

- Death Guard adds a destination to its glossary card and related rules.
- Adeptus Mechanicus adds a destination to its detachment or datasheet.
- Core Rules adds a destination to the source attack section.

All three popups display the same title and definition. Only the destination buttons within the current book differ.

## 12. Summary and Full Wording

Each term stores two different representations of the same rule:

- `summary` — concise practical wording of no more than 280 characters, used in popups, search results and compact cards;
- `definition` — the complete canonical wording, used on the Mega Glossary page and in the full rule view.

`summary` is not an alternative rule and cannot change the meaning of `definition`. For a long rule, an exact match between `summary` and `definition` is a build error. Weapons, datasheets and other structured entities display a characteristics profile instead of technical placeholders.

## 13. Keywords and Related Rules

A keyword is not considered a standalone rule by default. Its canonical entry must distinguish between:

- the keyword's meaning as a model or unit identifier;
- Core Rules that explicitly refer to this keyword;
- faction-specific rules, abilities, weapons and restrictions that explicitly refer to it;
- the unit type's own rule, if the Core Rules actually define one.

The builder creates `references.coreRules` and `references.factionTerms` from exact references to the keyword. The keyword card presents these rules as separate destinations. The presence of the same word only in another entity's title does not turn it into a standalone keyword effect.

Example: `BEAST` does not add a single universal effect by itself, but it links to `Terrain and Movement`, `Benefit of Cover`, `Hidden` and other Core Rules passages that explicitly name `BEASTS`. Singular and plural forms are treated as one keyword identity.

### Operational cross-references

If a canonical rule delegates its effect to another numbered rule, both `summary` and the full glossary view must state the resulting gameplay effect. A circular phrase such as "can use Assault Shooting" is insufficient on its own: the entry must also include the eligibility conditions, restrictions and after-effects defined by Assault Shooting. The source locator must cite every combined rule.
