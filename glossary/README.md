# Mega Glossary

This directory is the single source of truth for glossary content shared by every book.

## Data model

- `registry.en.json` contains canonical titles, definitions, summaries, structured profiles and provenance.
- `contexts/<book>.json` contains only book-local IDs and navigation targets.
- `aliases.en.json` maps legacy IDs to stable canonical IDs.
- `generated/glossary.en.js` is the browser runtime used by `file://`, HTTP and GitHub Pages.
- `generated/conflict-report.json` records every competing local definition seen during import.

Do not hand-edit files under `generated/`. Run:

```powershell
npm run glossary:build
npm run glossary:check
```

Canonical content and local navigation must never be stored in the same record. A book may choose where a popup button leads, but it cannot redefine the term.

