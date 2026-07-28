# Warhammer Rules Library

A local-first Warhammer 40,000 rules reference with Core Rules, Army Books, Mega Glossary and roster-specific guides.

## Books

- Core Rules Reference
- Death Guard
- Adeptus Mechanicus
- Tyranids
- T'au Empire
- Chaos Space Marines
- Orks
- Emperor's Children
- Space Marines
- Dark Angels (with the Space Marines dependency)

Death Guard and Adeptus Mechanicus are the mature roster-aware books. The seven generated Army Books remain visibly gated as verification references until their Codex structure, official MFM points and wargear restrictions have been checked.

## Verification

```powershell
npm.cmd test
```

`npm test` verifies generated readers, source counts, pinned commits, semantic text integrity, explicit Related Rules eligibility and the shared integration contracts.

To verify the external source snapshots as well:

1. Install Node.js and Python 3.
2. Install `requirements-army-books.txt`.
3. Clone `https://github.com/BSData/wh40k-11e` at the commit recorded in each `bsdata-extract.config.json` into `tmp/bsdata-wh40k-11e`.
4. Run `npm.cmd run army-books:sources:check`.

The committed generated output does not require Python to view or test. Python is needed only to reproduce PDF extraction and the Space Marines merged BSData layer.

For ordinary local viewing, serve the repository over HTTP. PWA installation and offline caching do not work from `file://`.
