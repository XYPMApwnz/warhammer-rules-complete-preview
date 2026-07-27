# Adeptus Mechanicus Rules — Complete Codex Reference

Local interactive Adeptus Mechanicus reference: the Codex layer, the official `Faction Pack v1.0` for 11th Edition, and Warhammer Legends. The project retains the army's red-and-blue palette, the Doctrina console, and the Death Guard v5 navigation model.

## Contents

- complete updated Army Rule `Doctrina Imperatives` with a Protector / Conqueror toggle;
- 10 Detachments: 5 from the Codex and 5 from the Faction Pack, with all rules, Enhancements, and Stratagems;
- 39 Datasheets grouped into Epic Heroes, Characters, Battleline, Dedicated Transports, Other, and Warhammer Legends;
- Rules Updates and FAQ from pages 17–18;
- 226 terms, datasheet abilities, and weapon profiles in the searchable Glossary;
- embedded transcripts of all 26 pages and direct links to the local PDF;
- global search, Contents search, popup chains, and Journey/Back;
- responsive weapon tables and mobile navigation;
- PWA/offline cache, including the source PDF.

## Reproducible data layers

Official layer: `content/adeptus-mechanicus-rules.en.json`. Codex Detachments: `content/adeptus-mechanicus-codex-detachments.en.json`. Complete Datasheet set: `content/adeptus-mechanicus-codex-datasheets.en.json`.

It generates `index.html` and `scripts/data.js`. The root `service-worker.js` owns offline mode for the entire unified site.

Build:

```powershell
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tools\build-full-content.mjs
```

Verification:

```powershell
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tools\build-full-content.mjs --check
& 'C:\Users\denis\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' .\tests\qa.mjs
```

`tools/extract-faction-pack.py` reproducibly extracts PDF text into `content/adeptus-mechanicus-source.en.json`. `tools/extract-bsdata.py` normalizes the pinned `sources/bsdata-adeptus-mechanicus.cat` catalogue; the official Faction Pack then replaces the eight matching Datasheets.

## Official source

Local copy: `sources/adeptus-mechanicus-faction-pack-v1.0.pdf`.

- 26 pages;
- legal for matched play from 20 June 2026;
- SHA-256 `7F01DD2CE7E35C762B0AB625ADE779022275574CF2D01EE46EE16B2F5582341C`.

## Sources and reliability boundary

The project covers 10 Detachments and the complete available set of 39 Datasheets. The text and profiles of the eight Faction Pack/Legends sheets come from the local official PDF. The remaining Codex Datasheets are a pinned community transcription from BSData revision 106; each card displays a link to its source. They are not presented as an official Codex PDF. Values from the Faction Pack take precedence over the transcription.
