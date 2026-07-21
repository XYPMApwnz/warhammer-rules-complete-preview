import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('content/core-rules.source.en.js'), context);
vm.runInNewContext(read('content/core-rules.en.js'), context);
const data = context.window.CORE_RULES;
const pdf = context.window.CORE_PDF_SOURCE;

assert(data, 'CORE_RULES data should load');
assert.equal(data.groups.length, 5, 'prototype should contain five main groups');

const sections = data.groups.flatMap((group) => group.sections);
const numbered = sections.filter((section) => /^\d+$/.test(section.number));
assert.equal(numbered.length, 24, 'prototype should contain all 24 numbered sections');
assert.equal(pdf.meta.pageCount, 88, 'source snapshot should contain all PDF pages');
assert.equal(Object.keys(pdf.pages).length, 88, 'source snapshot page map is incomplete');
assert.deepEqual([...pdf.sections.introduction], [4, 5], 'Introduction must map to PDF pages 4-5');
assert.equal(pdf.appendix.length, 9, 'Rules Appendix should expose nine source articles');
const visibleContent = JSON.stringify({
  title: data.meta.title,
  notice: data.meta.notice,
  groups: data.groups,
  terms: data.terms
});
assert(!/[А-Яа-яЁё]/u.test(visibleContent), 'active content model must remain English-only');

const ids = ['cover', ...data.groups.map((group) => group.id), ...sections.map((section) => section.id)];
assert.equal(new Set(ids).size, ids.length, 'all navigation targets must be unique');

const terms = data.terms;
for (const [id, term] of Object.entries(terms)) {
  assert(term.title && term.summary, `${id} must have title and summary`);
  if (term.rule) assert(ids.includes(term.rule), `${id} points to missing rule ${term.rule}`);
  for (const related of term.related || []) assert(terms[related], `${id} points to missing related term ${related}`);
}

for (const section of sections) {
  for (const block of section.blocks) {
    for (const termId of block.terms || []) assert(terms[termId], `${section.id} uses missing term ${termId}`);
  }
}

const html = read('index.html');
const requiredFiles = [
  'styles/tokens.css','styles/layout.css','styles/navigation.css','styles/content.css','styles/popups.css',
  'content/core-rules.source.en.js','content/core-rules.en.js','scripts/renderer.js','scripts/navigation-controller.js','scripts/popup-controller.js',
  'scripts/journey-controller.js','scripts/ui-controllers.js','scripts/app.js'
];
for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing ${file}`);
  assert(html.includes(file), `index.html does not load ${file}`);
}
assert(!fs.existsSync(path.join(root, 'content/core-rules.ru.js')), 'obsolete Russian content model must not remain active');
for (const file of ['index.html', ...requiredFiles.filter((item) => item.startsWith('scripts/'))]) {
  assert(!/[А-Яа-яЁё]/u.test(read(file)), `${file} contains non-English interface copy`);
}

const scriptOrder = requiredFiles.filter((file) => file.endsWith('.js')).map((file) => html.indexOf(file));
assert(scriptOrder.every((position, index) => index === 0 || position > scriptOrder[index - 1]), 'scripts must load in dependency order');
for (const section of numbered) assert(pdf.sections[section.id]?.length, `${section.id} has no PDF page mapping`);
const sourceRules = Object.values(pdf.rules).flat();
assert.equal(sourceRules.length, 146, 'unexpected source-rule extraction count');
assert.equal(Object.keys(terms).length + sourceRules.length + pdf.appendix.length, 167, 'unexpected Rules Glossary entry count');
assert(sourceRules.every((rule) => rule.title && rule.text && /^\d{2}\.\d{2}$/.test(rule.code)), 'source rules must have stable references, titles and text');
assert(!read('scripts/renderer.js').includes("navNode('cover'"), 'Cover must not appear in the PDF contents tree');
assert(!read('scripts/renderer.js').includes('section-number'), 'renderer must not expose chapter numbering');
assert(read('scripts/renderer.js').includes('sourceExcerpt'), 'source rule cards must sanitize multi-column PDF extraction');
assert(read('scripts/renderer.js').includes("navNode('glossary', 'Rules Glossary'"), 'Rules Glossary must be available from Reader Tools navigation');
assert(read('scripts/renderer.js').includes('source-glossary-card'), 'Rules Glossary must include PDF source rules');
assert(!/[\uFFFD]/u.test(requiredFiles.map(read).join('')), 'source files contain replacement characters');
console.log(`QA passed: ${data.groups.length} groups, ${numbered.length} numbered sections, ${Object.keys(terms).length} terms.`);
