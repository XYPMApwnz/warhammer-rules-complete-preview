import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../death-guard-clean-room-v2/index.html', import.meta.url);
const source = await readFile(sourceUrl, 'utf8');

function extractArticle(id) {
  const start = source.indexOf(`<article class="unit-card surface" id="${id}"`);
  if (start < 0) throw new Error(`Missing ${id}`);
  const tags = /<\/?article\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0;
  for (let match; (match = tags.exec(source));) {
    depth += match[0][1] === '/' ? -1 : 1;
    if (depth === 0) return source.slice(start, tags.lastIndex);
  }
  throw new Error(`Unclosed ${id}`);
}

function page({ id, name, peerHref, peerName, file }) {
  const article = extractArticle(id);
  const parts = [...article.matchAll(/<section class="unit-part"/g)];
  if (parts.length < 4) throw new Error(`Incomplete ${name} card`);

  return writeFile(new URL(file, import.meta.url), `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#11170e">
  <title>${name} — Death Guard Focus Mode</title>
  <link rel="icon" href="../../books/death-guard/assets/icon-v4.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../books/death-guard/styles/tokens.css?v=10">
  <link rel="stylesheet" href="../../books/death-guard/styles/content.css?v=18">
  <link rel="stylesheet" href="../../books/shared/datasheet-system.css?v=4">
  <link rel="stylesheet" href="./focus.css?v=1">
</head>
<body>
  <header class="focus-header">
    <a class="focus-brand" href="./index.html"><strong>Death Guard</strong><small>Focus Mode · v1</small></a>
    <nav class="unit-switch" aria-label="Datasheet switcher">
      <strong>${name}</strong><a href="${peerHref}">${peerName}</a>
    </nav>
    <a class="library-link" href="../../index.html">← Library</a>
  </header>
  <main class="focus-main">${article}</main>
  <script src="../../glossary/generated/glossary.en.js?v=2"></script>
  <script src="../../books/shared/datasheet-layout.js?v=2"></script>
  <dialog class="focus-dialog" id="termDialog" aria-labelledby="termTitle">
    <form method="dialog" class="focus-dialog-head"><span>Mega Glossary</span><button aria-label="Close popup">×</button></form>
    <h2 id="termTitle"></h2><p id="termSummary"></p>
    <a id="termFull" href="../../glossary/index.html">Open full article →</a>
  </dialog>
  <script src="./focus.js?v=1"></script>
</body>
</html>`);
}

await Promise.all([
  page({ id: 'unit-mortarion', name: 'Mortarion', peerHref: './defiler.html', peerName: 'Defiler', file: 'index.html' }),
  page({ id: 'unit-defiler', name: 'Defiler', peerHref: './index.html', peerName: 'Mortarion', file: 'defiler.html' })
]);

console.log('Focus Mode built: Mortarion + Defiler, one complete datasheet per page.');
