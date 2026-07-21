# Core Rules - Prototype v1

An interactive prototype of the Warhammer 40,000 Core Rules reader.

## Architecture

- `content/core-rules.source.en.js` - a deterministic snapshot extracted from all 88 pages of the local English PDF.
- `content/core-rules.en.js` - English document structure, component data and the connected term registry.
- `tools/extract_core_pdf.py` - reproducibly refreshes the source snapshot from the PDF.
- `scripts/renderer.js` - renders the document, hierarchical contents and glossary from one data source.
- `scripts/navigation-controller.js` - scroll spy, controlled navigation, desktop collapse and mobile drawer.
- `scripts/popup-controller.js` - connected term popup chains and contextual actions.
- `scripts/journey-controller.js` - internal Back journey with position, navigation and popup-chain restoration.
- `scripts/ui-controllers.js` - theme, search, glossary filtering and table accessibility.
- `styles/` - separate tokens, layout, navigation, content and popup layers.

## Prototype scope

The contents include all five parts and all 24 numbered sections from the Core Rules PDF. Key interface components are demonstrated for concepts, Datasheets, movement, attacks, phases, terrain, objectives and connected terms.

Every chapter includes its original extracted English source pages and direct links to the corresponding local PDF pages. Full-text search covers the English source snapshot.

The prototype opens directly from `index.html`; it does not require `fetch`, a build step or a local server.

## Decisions inherited from previous projects

- Square industrial geometry and visual tokens follow the Unified v2 contract and Adeptus Mechanicus Design Code.
- Navigation, popups, journey and UI remain independent controllers, following Death Guard v5 experience.
- Navigation and document content are rendered from one model to prevent ID and heading drift.
- PWA packaging and a full content build pipeline remain deferred until the reader structure is approved.
