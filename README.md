# Warhammer Rules — Complete Preview

A standalone build for previewing the complete library. The source projects remain unchanged.

## Books

- `books/core-rules/` — Core Rules, 24 sections and the original rule cards.
- `books/death-guard/` — Death Guard, the complete reader from Unified Visual v2.
- `books/adeptus-mechanicus/` — a responsive Adeptus Mechanicus reference with 10 Detachments, 39 Datasheets, current official points and personal New Recruit roster guides.

All books share a common return path to the library, a shared manifest and a single root service worker.

## Verification

```powershell
npm test
```

For ordinary local viewing, open `index.html`. PWA installation and offline caching require the site to run over HTTP/HTTPS.
