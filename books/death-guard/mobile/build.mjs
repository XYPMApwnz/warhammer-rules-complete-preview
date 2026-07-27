import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../reader.html', import.meta.url), 'utf8');
const glossary = JSON.parse(await readFile(new URL('../../../glossary/registry.en.json', import.meta.url), 'utf8')).terms;
const aliases = JSON.parse(await readFile(new URL('../../../glossary/aliases.en.json', import.meta.url), 'utf8')).aliases;

function extract(tag, id, html = source) {
  const opener = new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`, 'i').exec(html);
  if (!opener) throw new Error(`Missing ${tag}#${id}`);
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = opener.index;
  let depth = 0;
  for (let match; (match = tags.exec(html));) {
    depth += match[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(opener.index, tags.lastIndex);
  }
  throw new Error(`Unclosed ${tag}#${id}`);
}

const clean = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
const attribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function hydrateTerms(html) {
  return html.replace(/(<(?:button|a)\b[^>]*\bdata-term="([^"]+)"[^>]*)(>)/g, (match, start, id, end) => {
    const term = glossary[aliases[id] || id];
    if (!term) throw new Error(`Missing glossary term ${id}`);
    const title = term.title?.en || id;
    const summary = term.summary?.en || term.definition?.en || '';
    return `${start} data-term-title="${attribute(title)}" data-term-summary="${attribute(summary)}"${term.fullRulePath?` data-full-rule-path="${attribute(term.fullRulePath)}"`:''}${end}`;
  });
}
const detachments = [...source.matchAll(/<section class="content-group detachment" id="(detachment-[^"]+)"[^>]*>\s*<h3 class="category-title">([^<]+)<\/h3>/g)]
  .map(([, id, title]) => ({ id, title: clean(title), file: `${id.slice(11)}.html`, type: 'detachment' }));

const categories = [...source.matchAll(/<section class="content-group" id="(datasheets-[^"]+|pact-of-decay-datasheets)"[^>]*>\s*<h3 class="category-title">([^<]+)<\/h3>/g)]
  .map(([, id, title]) => {
    const section = extract('section', id);
    const units = [...section.matchAll(/<article\b[^>]*\bclass="[^"]*\bunit-card\b[^"]*"[^>]*\bid="(unit-[^"]+)"[^>]*>/g)]
      .map(([, unitId]) => {
        const article = extract('article', unitId, section);
        const unitTitle = /<h3 class="unit-name">([\s\S]*?)<\/h3>/.exec(article)?.[1];
        if (!unitTitle) throw new Error(`Missing title for ${unitId}`);
        const epicHero = article.includes('data-term="keyword-epic-hero"');
        return { id: unitId, title: clean(unitTitle), file: `${unitId.slice(5)}.html`, type: 'unit', category: id, enhancementsAllowed: !epicHero };
      });
    return { id, title: clean(title), units };
  });

const units = categories.flatMap(category => category.units);
if (detachments.length !== 9 || units.length !== 36) {
  throw new Error(`Expected 9 detachments and 36 datasheets, found ${detachments.length} and ${units.length}: ${categories.map(item => `${item.id}=${item.units.length}`).join(', ')}`);
}

const staticRoutes = [
  { file: 'index.html', id: 'start', title: 'Start', type: 'start' },
  { file: 'updates.html', id: 'updates', title: 'Updates', type: 'section' },
  { file: 'army-rules.html', id: 'core-rules', title: 'Army Rules', type: 'section' }
];
const routes = [...staticRoutes, ...detachments, ...units];

function relatedRules() {
  const core = `<section class="related-detachment related-core" data-detachment="core">
      <h2>Core Stratagems</h2>
      <div class="related-kind" data-related-kind="stratagems">${extract('section', 'core-stratagems')}</div>
    </section>`;
  return hydrateTerms(core + detachments.map(detachment => {
    const slug = detachment.id.slice(11);
    return `<section class="related-detachment" data-detachment="${slug}">
      <h2>${detachment.title}</h2>
      <div class="related-kind" data-related-kind="stratagems">${extract('section', `${slug}-stratagems`)}</div>
      <div class="related-kind" data-related-kind="enhancements" hidden>${extract('section', `${slug}-enhancements`)}</div>
    </section>`;
  }).join('\n'));
}

function link(route, active) {
  return `<a href="./${route.file}"${route.id === active ? ' aria-current="page"' : ''}>${route.title}</a>`;
}

function navigation(route) {
  const unitCategory = categories.find(category => category.id === route.category);
  return `${link(staticRoutes[0], route.id)}${link(staticRoutes[1], route.id)}${link(staticRoutes[2], route.id)}
    <details name="mobile-primary"${route.type === 'detachment' ? ' open' : ''}>
      <summary>Detachments <span>${detachments.length}</span></summary>
      <div class="mobile-nav-branch">${detachments.map(item => link(item, route.id)).join('')}</div>
    </details>
    <details name="mobile-primary"${route.type === 'unit' ? ' open' : ''}>
      <summary>Datasheets <span>${units.length}</span></summary>
      <div class="mobile-nav-branch mobile-unit-groups">${categories.map(category => `<details${category === unitCategory ? ' open' : ''}>
        <summary>${category.title} <span>${category.units.length}</span></summary>
        <div class="mobile-nav-branch">${category.units.map(item => link(item, route.id)).join('')}</div>
      </details>`).join('')}</div>
    </details>`;
}

function startPage() {
  return extract('section', 'start');
}

function content(route) {
  if (route.type === 'start') return startPage();
  if (route.type === 'section' || route.type === 'detachment') return extract('section', route.id);
  return extract('article', route.id);
}

function page(route) {
  const relatedSection = route.type === 'unit' ? `
  <section class="related-rules" id="relatedRules" aria-labelledby="relatedRulesTitle">
    <header class="related-rules-head"><div><span>Datasheet tools</span><h2>${route.enhancementsAllowed ? 'Stratagems &amp; Enhancements' : 'Stratagems'}</h2></div></header>
    <div class="related-controls">
      <label>Detachment<select id="relatedDetachment"><option value="all">All detachments</option>${detachments.map(item => `<option value="${item.id.slice(11)}">${item.title}</option>`).join('')}</select></label>
      ${route.enhancementsAllowed ? '<div class="related-tabs" role="group" aria-label="Rule type"><button type="button" data-related-tab="stratagems" aria-pressed="true">Stratagems</button><button type="button" data-related-tab="enhancements" aria-pressed="false">Enhancements</button></div>' : ''}
    </div>
    <div class="related-content" id="relatedRulesContent"><p class="related-status">Loading rules&hellip;</p></div>
  </section>` : '';
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#11170e">
  <title>${route.title} &mdash; Death Guard</title>
  <link rel="manifest" href="../../../manifest.webmanifest">
  <link rel="icon" href="../assets/icon-v4.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../styles/tokens.css?v=10">
  <link rel="stylesheet" href="../styles/layout.css?v=9">
  <link rel="stylesheet" href="../styles/navigation.css?v=11">
  <link rel="stylesheet" href="../styles/content.css?v=27">
  <link rel="stylesheet" href="../styles/popups.css?v=16">
  <link rel="stylesheet" href="../../shared/datasheet-system.css?v=4">
  <link rel="stylesheet" href="./mobile.css?v=7">
</head>
<body>
  <header class="app-header" id="appHeader">
    <button class="header-button nav-menu" id="navButton" aria-label="Open navigation" aria-controls="mobileNav" aria-expanded="false">&#9776;</button>
    <div class="app-brand"><strong>Death Guard Rules</strong><small>11E &middot; Mobile reference</small></div>
    <a class="library-link" href="../../../index.html" aria-label="Back to rulebook library"><span aria-hidden="true">&larr;</span><b>Library</b></a>
    <div class="header-spacer"></div>
  </header>
  <button class="toc-scrim" id="navScrim" aria-label="Close navigation" hidden></button>
  <nav class="toc-panel" id="mobileNav" aria-label="Death Guard navigation" aria-hidden="true">
    <h2 class="toc-heading">Contents</h2>
    <div class="phone-shortcuts">
      <a class="phone-glossary" href="../../../roster-guides/index.html" data-roster-guides-link hidden>&larr; Roster Guides</a>
      <a class="phone-glossary" href="../../../glossary/index.html">Mega Glossary &rarr;</a>
      <a class="phone-glossary phone-mode-switch" href="../reader.html#${route.id}" data-view-switch>Desktop / iPad view &rarr;</a>
    </div>
    <div class="phone-tree">${navigation(route)}</div>
  </nav>
  <main class="main mobile-main"><article class="document">${hydrateTerms(content(route))}${relatedSection}</article></main>
  <script src="../../shared/datasheet-layout.js?v=2"></script>
  <script src="../scripts/related-rules.js?v=6"></script>
  <dialog class="mobile-dialog" id="termDialog" aria-labelledby="termTitle">
    <form method="dialog" class="mobile-dialog-head"><span>Mega Glossary</span><button aria-label="Close popup">&times;</button></form>
    <h2 id="termTitle"></h2><p id="termSummary"></p>
    <a id="termRule" hidden>Open full rule &rarr;</a>
    <a id="termFull" href="../../../glossary/index.html">Glossary entry &rarr;</a>
  </dialog>
  <script src="../../../glossary-return.js?v=1"></script>
  <script src="../../shared/roster-parser.js?v=2"></script>
  <script src="../../../roster-guides/points-data.js?v=3"></script>
  <script src="../../shared/roster-enhancements.js?v=3"></script>
  <script src="./mobile.js?v=11"></script>
</body>
</html>`;
}

for (const route of routes) await writeFile(new URL(route.file, import.meta.url), page(route));
await writeFile(new URL('related-rules.inc', import.meta.url), relatedRules());
for (const route of routes.filter(route => route.type !== 'start')) {
  const html = await readFile(new URL(route.file, import.meta.url), 'utf8');
  if (!html.includes(`id="${route.id}"`)) throw new Error(`Incomplete route ${route.file}`);
}

console.log(`Mobile reference built: ${routes.length} pages, ${detachments.length} detachments, ${units.length} datasheets.`);
