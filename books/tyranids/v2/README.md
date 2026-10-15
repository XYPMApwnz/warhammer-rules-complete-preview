# Tyranids V2 factual foundation

This directory owns accepted Tyranids V2 facts. It does not register an Army
Book, import rosters, execute effects, simulate battle state or provide a UI.

The accepted Waha 11E capture is the base; confirmed Faction Pack v1.3
corrections produce the effective view. Historical sources remain unchanged.
Every source address has a persistent declaration in `identity-bindings.json`.
Raw completeness checks read the accepted HTML independently of the producer.
The source table presentation occurrences do not own duplicate rule values.

Central MFM v1.6 exclusively owns points, schedules, costs, Leader relations,
Detachment Points and Force Dispositions. `mfm-bindings.json` stores references,
not values. `mfm-boundary.mjs` validates these bridges and the 15 source-declared
Leader relations. It is a factual boundary, not an attachment runtime.

The 53 source statlines bind 57 physical composition declarations. Hyperadapted
Raveners retain separate Prime/Ravener profiles and Prime-only references.
Native FNP metadata explicitly binds Old One Eye and Psychophage MODELs through
the existing `rosterReferenceSemantics` representation for future consumers.

Foul Spores preserves contradictory official update/FAQ evidence as unresolved.
The claimed historical Regenerating Monstrosity grammar correction remains
unverified; its accepted wording is preserved. See `source-issues.json`.
Neither unresolved entry is executable. No content certification is claimed.

Offline commands from the repository root (Python requires lxml/pdfplumber):

```text
python -B books/tyranids/v2/build.py
python -B books/tyranids/v2/build.py --check
python -B books/tyranids/v2/raw-inventory-qa.py
python -B books/tyranids/v2/foundation-qa.py
node books/tyranids/v2/mfm-boundary-qa.mjs
```

Builds write only this directory's `generated` outputs; checks write nothing.
Source enrollment and reviewed identity/declaration ledgers are not regenerated
by a normal build. The official PDF source text is read from pinned page crops.
