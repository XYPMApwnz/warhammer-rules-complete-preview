import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../../books/death-guard/index.html', import.meta.url), 'utf8');

function extract(tag, id) {
  const opener = new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`, 'i').exec(source);
  if (!opener) throw new Error(`Missing ${tag}#${id}`);
  const start = opener.index;
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = start;
  let depth = 0;
  for (let match; (match = tags.exec(source));) {
    depth += match[0][1] === '/' ? -1 : 1;
    if (depth === 0) return source.slice(start, tags.lastIndex);
  }
  throw new Error(`Unclosed ${tag}#${id}`);
}

const routes = [
  { file: 'index.html', key: 'start', title: 'Death Guard', type: 'start' },
  { file: 'army-rule.html', key: 'army', title: 'Nurgle’s Gift', tag: 'section', id: 'army-rule-nurgles-gift' },
  { file: 'virulent-vectorium.html', key: 'virulent', title: 'Virulent Vectorium', tag: 'section', id: 'detachment-virulent-vectorium' },
  { file: 'mortarions-hammer.html', key: 'hammer', title: 'Mortarion’s Hammer', tag: 'section', id: 'detachment-mortarions-hammer' },
  { file: 'mortarion.html', key: 'mortarion', title: 'Mortarion', tag: 'article', id: 'unit-mortarion' },
  { file: 'defiler.html', key: 'defiler', title: 'Defiler', tag: 'article', id: 'unit-defiler' }
];

const groups = [
  ['Book', [['start', 'Start', './index.html'], ['army', 'Army Rule', './army-rule.html']]],
  ['Detachments', [['virulent', 'Virulent Vectorium', './virulent-vectorium.html'], ['hammer', 'Mortarion’s Hammer', './mortarions-hammer.html']]],
  ['Datasheets', [['mortarion', 'Mortarion', './mortarion.html'], ['defiler', 'Defiler', './defiler.html']]]
];

function navigation(active) {
  return groups.map(([name, links]) => `<section class="route-nav-group"><h2>${name}</h2>${links.map(([key, label, href]) =>
    `<a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</section>`).join('');
}

function startPage() {
  return `<section class="route-home">
    <div class="eyebrow">Codex XIV · routed prototype</div>
    <h1>Death Guard Rules</h1>
    <p>One route loads one rules context. Nothing else is hidden behind the page.</p>
    <div class="route-cards">
      <a href="./army-rule.html"><small>Army Rule</small><strong>Nurgle’s Gift</strong><span>Plagues and Contagion Range →</span></a>
      <a href="./virulent-vectorium.html"><small>Detachment</small><strong>Virulent Vectorium</strong><span>Rule, Enhancements and Stratagems →</span></a>
      <a href="./mortarions-hammer.html"><small>Detachment</small><strong>Mortarion’s Hammer</strong><span>Rule, Enhancements and Stratagems →</span></a>
      <a href="./mortarion.html"><small>Datasheet</small><strong>Mortarion</strong><span>Complete unit reference →</span></a>
      <a href="./defiler.html"><small>Datasheet</small><strong>Defiler</strong><span>Complete unit reference →</span></a>
    </div>
  </section>`;
}

function shell(route) {
  const content = route.type === 'start' ? startPage() : extract(route.tag, route.id);
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#11170e">
  <title>${route.title} — Death Guard Routed v1</title>
  <link rel="icon" href="../../books/death-guard/assets/icon-v4.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../books/death-guard/styles/tokens.css?v=10">
  <link rel="stylesheet" href="../../books/death-guard/styles/content.css?v=18">
  <link rel="stylesheet" href="../../books/shared/datasheet-system.css?v=4">
  <link rel="stylesheet" href="./routed.css?v=1">
</head>
<body>
  <header class="route-header">
    <button class="route-menu" id="navButton" aria-label="Open navigation" aria-controls="routeNav" aria-expanded="false">☰</button>
    <a class="route-brand" href="./index.html"><strong>Death Guard Rules</strong><small>Routed prototype · v1</small></a>
    <span class="route-current">${route.title}</span>
    <a class="route-library" href="../../index.html">← Library</a>
  </header>
  <button class="route-scrim" id="navScrim" aria-label="Close navigation" hidden></button>
  <aside class="route-nav" id="routeNav" aria-label="Death Guard navigation">
    ${navigation(route.key)}
    <a class="route-glossary" href="../../glossary/index.html">Mega Glossary →</a>
    <a class="route-legacy" href="../../books/death-guard/index.html">Full reference</a>
  </aside>
  <main class="route-main">${content}</main>
  <script src="../../glossary/generated/glossary.en.js?v=2"></script>
  <script src="../../books/shared/datasheet-layout.js?v=2"></script>
  <dialog class="route-dialog" id="termDialog" aria-labelledby="termTitle">
    <form method="dialog" class="route-dialog-head"><span>Mega Glossary</span><button aria-label="Close popup">×</button></form>
    <h2 id="termTitle"></h2><p id="termSummary"></p>
    <a id="termFull" href="../../glossary/index.html">Open full article →</a>
  </dialog>
  <script src="./routed.js?v=1"></script>
</body>
</html>`;
}

for (const route of routes) await writeFile(new URL(route.file, import.meta.url), shell(route));

for (const route of routes.filter(route => route.id)) {
  const html = await readFile(new URL(route.file, import.meta.url), 'utf8');
  if (!html.includes(`id="${route.id}"`)) throw new Error(`Incomplete route ${route.file}`);
}

console.log(`Routed prototype built: ${routes.length} pages.`);
