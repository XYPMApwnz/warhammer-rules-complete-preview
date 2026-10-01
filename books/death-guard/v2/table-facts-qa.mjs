import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildFactualV2} from './build.mjs';
import {createSourceTableNormalizer} from './table-facts.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const rawPath = 'books/death-guard/v2/sources/accepted-waha-pages/death-guard.html';
const corpusPath = 'books/death-guard/sources/waha-11e-current-2026-09-25/corpus.json';
const sha = value => createHash('sha256').update(value).digest('hex').toUpperCase();
const plain = value => value.replace(/<[^>]*>/g, '').replace(/&#x([a-f\d]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&(amp|quot|apos|nbsp|lt|gt);/g, (_, name) => ({amp:'&', quot:'"', apos:"'", nbsp:' ', lt:'<', gt:'>'})[name]).replace(/\s+/g, ' ').trim();
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Independent denominator: balance only raw table tags, then read cell markup
// from innermost tables. Does not call the production structural parser or use
// canonical tables/certification counts to decide how many facts should exist.
export function enumerateSourceTableFacts() {
  const corpus = JSON.parse(fs.readFileSync(path.join(repository, corpusPath), 'utf8'));
  const bytes = fs.readFileSync(path.join(repository, rawPath)), html = bytes.toString('utf8');
  const expectedHash = corpus.pages.find(page => page.file === 'death-guard.html').sha256;
  assert.equal(sha(bytes), expectedHash, 'Table census requires integrity-pinned raw HTML');
  const records = [];
  for (const detachment of corpus.detachments) {
    const links = [...html.matchAll(new RegExp('<div\\b[^>]*\\bdata-f=["\\\']' + escape(detachment.filterId) + '["\\\'][^>]*>\\s*<a\\b[^>]*href=["\\\'](#Detachment-Rule(?:-\\d+)?)["\\\']', 'gi'))];
    const anchors = [...new Set(links.map(match => match[1].slice(1)))];
    assert.equal(anchors.length, 1, detachment.sourceId + ': independent explicit publisher rule anchor');
    const heading = [...html.matchAll(new RegExp('<h2\\b[^>]*\\bid=["\\\']' + escape(anchors[0]) + '["\\\'][^>]*>[\\s\\S]*?<\\/h2>', 'gi'))];
    assert.equal(heading.length, 1, detachment.sourceId + ': independent raw heading scope');
    const after = heading[0].index + heading[0][0].length;
    const remaining = html.slice(after), nextH3 = remaining.search(/<h3\b/i), nextH2 = remaining.search(/<h2\b/i);
    assert.ok(nextH3 >= 0 && (nextH2 < 0 || nextH3 < nextH2), detachment.sourceId + ': scoped rule source exists');
    const start = after + nextH3, stop = nextH2 < 0 ? html.length : after + nextH2;
    const segment = html.slice(start, stop), occurrences = [], stack = [];
    for (const match of segment.matchAll(/<\/?table\b[^>]*>/gi)) {
      if (/^<\/table/i.test(match[0])) {
        const table = stack.pop();
        assert.ok(table, detachment.sourceId + ': balanced raw table closure');
        table.end = start + match.index;
        table.closeEnd = start + match.index + match[0].length;
      } else {
        const table = {start:start + match.index, contentStart:start + match.index + match[0].length, parent:stack.at(-1), occurrence:occurrences.length + 1};
        occurrences.push(table); stack.push(table);
      }
    }
    assert.equal(stack.length, 0, detachment.sourceId + ': all raw tables close inside rule');
    const semantic = occurrences.filter(table => !occurrences.some(child => child.parent === table));
    const tables = semantic.map(table => ({
      sourceId:detachment.rule.sourceId + ':table:' + table.occurrence,
      rows:[...html.slice(table.contentStart, table.end).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row => [...row[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map(cell => plain(cell[1]))).filter(row => row.length)
    }));
    const references = occurrences.map(table => ({
      sourceRecordId:detachment.rule.sourceId + ':table:' + table.occurrence,
      role:semantic.includes(table) ? 'FACT_SOURCE_REFERENCE' : 'LAYOUT_WRAPPER_REFERENCE',
      factTableIds:semantic.filter(owner => owner === table || owner.start > table.start && owner.end < table.end).map(owner => detachment.rule.sourceId + ':table:' + owner.occurrence),
      sourcePath:rawPath, sha256:expectedHash,
      rawLocator:{ruleAnchor:anchors[0], tableOccurrence:table.occurrence, characterOffset:table.start}
    }));
    records.push({entityId:detachment.rule.sourceId, tables, references:occurrences.length === semantic.length ? null : references, sourceText:detachment.rule.text});
  }
  return records;
}

export function assertSourceTableFacts(model, expected = enumerateSourceTableFacts()) {
  const byId = new Map(model.entities.map(entity => [entity.id, entity]));
  assert.equal(byId.size, model.entities.length, 'Source table scopes require unique canonical identities');
  const owners = model.entities.filter(entity => entity.kind === 'DETACHMENT_RULE');
  assert.deepEqual(owners.map(entity => entity.id).sort(), expected.map(record => record.entityId).sort(), 'Every source rule table scope is retained exactly once');
  for (const record of expected) {
    const entity = byId.get(record.entityId);
    assert.deepEqual(entity.data.tables, record.tables, record.entityId + ': one semantic owner per raw table and exact source cells');
    assert.equal(entity.data.text, record.sourceText, record.entityId + ': existing source-prose occurrence preserved');
    if (record.references) assert.deepEqual(entity.data.tableSourceOccurrences, record.references, record.entityId + ': presentation/source occurrences reference exact scoped owners');
    else assert.equal(Object.hasOwn(entity.data, 'tableSourceOccurrences'), false, record.entityId + ': ordinary tables receive no invented wrappers');
    for (const reference of entity.data.tableSourceOccurrences || []) {
      assert.equal(Object.hasOwn(reference, 'rows'), false, 'Source occurrence must not duplicate fact values');
      assert.ok(reference.factTableIds.every(id => entity.data.tables.some(table => table.sourceId === id)), 'Source occurrence may reference only this rule semantic owners');
    }
  }
  return {rules:expected.length, tables:expected.flatMap(record => record.tables).length, cells:expected.flatMap(record => record.tables).flatMap(table => table.rows.flat()).length, occurrences:expected.flatMap(record => record.references || []).length};
}

export function runTableFactMutations(model, expected = enumerateSourceTableFacts()) {
  const affected = expected.filter(record => record.references), mutations = [];
  const reject = (name, change) => {
    const mutant = structuredClone(model); change(mutant);
    assert.throws(() => assertSourceTableFacts(mutant, expected), name + ': source-backed guard must reject mutation');
    mutations.push(name);
  };
  for (const record of affected) {
    const target = mutant => mutant.entities.find(entity => entity.id === record.entityId);
    for (const [rowIndex, row] of record.tables[0].rows.entries()) for (const cellIndex of row.keys()) {
      reject(record.entityId + ':WRONG_CELL:' + rowIndex + ':' + cellIndex, mutant => { target(mutant).data.tables[0].rows[rowIndex][cellIndex] = 'incorrect-source-value'; });
      reject(record.entityId + ':MISSING_CELL:' + rowIndex + ':' + cellIndex, mutant => { target(mutant).data.tables[0].rows[rowIndex].splice(cellIndex, 1); });
    }
    reject(record.entityId + ':DUPLICATE_OWNER', mutant => { target(mutant).data.tables.push({...structuredClone(record.tables[0]), sourceId:record.references[0].sourceRecordId}); });
    reject(record.entityId + ':WRONG_IDENTITY', mutant => { target(mutant).data.tables[0].sourceId = record.references[0].sourceRecordId; });
    reject(record.entityId + ':WRAPPER_BECOMES_FACT', mutant => { target(mutant).data.tables[0].rows.unshift([record.tables[0].rows.flat().join('')]); });
    reject(record.entityId + ':MISSING_SOURCE_OCCURRENCE', mutant => { target(mutant).data.tableSourceOccurrences.shift(); });
    reject(record.entityId + ':WRONG_OCCURRENCE_ROLE', mutant => { target(mutant).data.tableSourceOccurrences[0].role = 'FACT_SOURCE_REFERENCE'; });
    reject(record.entityId + ':WRONG_SCOPED_REFERENCE', mutant => { target(mutant).data.tableSourceOccurrences[0].factTableIds = [affected.find(other => other !== record).tables[0].sourceId]; });
    reject(record.entityId + ':WRONG_RAW_SOURCE_BINDING', mutant => { target(mutant).data.tableSourceOccurrences[0].sha256 = '0'.repeat(64); });
    reject(record.entityId + ':WRONG_RAW_LOCATOR', mutant => { target(mutant).data.tableSourceOccurrences[0].rawLocator.characterOffset++; });
    reject(record.entityId + ':OCCURRENCE_OWNS_VALUES', mutant => { target(mutant).data.tableSourceOccurrences[0].rows = structuredClone(record.tables[0].rows); });
  }
  return mutations;
}

export function runSyntheticTableControls() {
  const ruleId = 'synthetic-independent-source:rule';
  const make = tableMarkup => '<div data-f="SOURCE:QA"><a href="#Detachment-Rule-99">rule</a></div><h2 id="Detachment-Rule-99">rule</h2><div><h3>identical presentation title</h3>' + tableMarkup + '</div><h2>next</h2>';
  const invoke = (markup, tables) => {
    const raw = Buffer.from(make(markup)), source = {sourceId:'synthetic-independent-source', filterId:'SOURCE:QA', rule:{sourceId:ruleId, title:'unrelated title does not join facts', tables}};
    return createSourceTableNormalizer(raw, {sourcePath:'synthetic.html', sha256:sha(raw)})(source);
  };
  const child = '<table><tr><td>Same</td><td>Value</td></tr></table>';
  const ordinary = [{sourceId:ruleId + ':table:1', rows:[['Same', 'Value']]}, {sourceId:ruleId + ':table:2', rows:[['Same', 'Value']]}];
  assert.deepEqual(invoke('', []), {tables:[]}, 'A source scope without tables gains none');
  assert.deepEqual(invoke(child, [ordinary[0]]), {tables:[ordinary[0]]}, 'Ordinary source tables retain their existing values and owner identities');
  assert.deepEqual(invoke(child + child, ordinary), {tables:ordinary}, 'Identical sibling tables have separate source owners; value equality may not merge them');
  const nested = [{sourceId:ruleId + ':table:1', rows:[['SameValue'], ['Same', 'Value']]}, {sourceId:ruleId + ':table:2', rows:[['Same', 'Value']]}];
  const normalized = invoke('<table><tr><td>' + child + '</td></tr></table>', nested);
  assert.deepEqual(normalized.tables, [nested[1]], 'Structural wrapper is a reference; inner accepted source identity survives');
  assert.equal(normalized.tableSourceOccurrences[0].role, 'LAYOUT_WRAPPER_REFERENCE');
  const mixed = structuredClone(nested); mixed[0].rows[0][0] = 'Parent factSameValue';
  assert.throws(() => invoke('<table><tr><td>Parent fact' + child + '</td></tr></table>', mixed), /mixed semantic data/, 'Parent-owned data must not disappear when tables nest');
  assert.throws(() => invoke(child, []), /every captured table occurrence/, 'Uncaptured raw table must fail closed');
  const poisoned = structuredClone(ordinary); poisoned[0].rows[0][0] = 'wrong';
  assert.throws(() => invoke(child + child, poisoned), /capture rows must match/, 'Changed source binding cannot pass using capture values as the oracle');
  const raw = Buffer.from(make(child));
  assert.throws(() => createSourceTableNormalizer(raw, {sourcePath:'synthetic.html', sha256:'0'.repeat(64)}), /accepted raw byte identity/, 'Unaccepted raw HTML may not supply ownership');
  return ['NO_TABLE_INVENTION', 'ORDINARY_TABLE_UNCHANGED', 'IDENTICAL_SIBLINGS_RETAINED', 'INNER_SOURCE_ID_PRESERVED', 'LAYOUT_OCCURRENCE_REFERENCE', 'NO_TITLE_JOIN', 'MIXED_NESTING_FAIL_CLOSED', 'MISSING_CAPTURE_FAIL_CLOSED', 'WRONG_CAPTURE_BINDING_FAIL_CLOSED', 'RAW_INTEGRITY_FAIL_CLOSED'];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const expected = enumerateSourceTableFacts(), {base, effective} = buildFactualV2();
  const summary = assertSourceTableFacts(base, expected);
  assert.deepEqual(assertSourceTableFacts(effective, expected), summary, 'Table fact ownership survives effective projection');
  const mutations = [...runTableFactMutations(base, expected), ...runTableFactMutations(effective, expected)];
  const synthetic = runSyntheticTableControls();
  console.log(JSON.stringify({result:'PASS', ...summary, mutations:mutations.length, detected:mutations.length, synthetic}, null, 2));
}
