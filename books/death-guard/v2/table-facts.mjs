import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const decode = value => value.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&(nbsp|amp|quot|apos|lt|gt);/g, (_, name) => ({nbsp:' ', amp:'&', quot:'"', apos:"'", lt:'<', gt:'>'})[name]);
const text = value => decode(value.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const attributes = value => Object.fromEntries([...value.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3])]));
const within = (node, owner) => node.start > owner.start && node.end <= owner.end;

// Walk source structure, retaining table ancestry. A layout cell containing a
// nested table is not itself an independent gameplay cell/semantic owner.
function sourceNodes(html) {
  const nodes = [], stack = [], tokens = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  for (const token of html.matchAll(tokens)) {
    if (!token[2]) continue;
    const tag = token[2].toLowerCase();
    if (token[0].startsWith('</')) {
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index < 0) continue;
      for (const node of stack.splice(index)) { node.end = token.index; node.closeEnd = token.index + token[0].length; }
      continue;
    }
    const node = {tag, start:token.index, contentStart:token.index + token[0].length, attrs:attributes(token[0]), parent:stack.at(-1), end:html.length, closeEnd:html.length};
    nodes.push(node);
    if (!/^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag) && !token[0].endsWith('/>')) stack.push(node);
  }
  return nodes;
}

/** Source structure supplies ownership; source IDs remain the accepted capture IDs.
 * Scope is joined by the publisher's explicit data-f identity and named anchors,
 * never by a rule title, gameplay prose or equality of table values.
 */
export function createSourceTableNormalizer(rawHubHtml, {sourcePath, sha256} = {}) {
  const bytes = Buffer.isBuffer(rawHubHtml) ? rawHubHtml : Buffer.from(rawHubHtml);
  assert.ok(sourcePath && /^[a-f\d]{64}$/i.test(sha256 || ''), 'Table facts require pinned raw provenance');
  assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(), sha256.toUpperCase(), 'Table facts require accepted raw byte identity');
  const html = bytes.toString('utf8'), nodes = sourceNodes(html);
  return detachment => {
    const anchors = new Set();
    for (const node of nodes.filter(node => node.tag === 'a' && /^#Detachment-Rule(?:-\d+)?$/.test(node.attrs.href || ''))) {
      let owner = node.parent;
      while (owner && owner.attrs['data-f'] === undefined) owner = owner.parent;
      if (owner?.attrs['data-f'] === detachment.filterId) anchors.add(node.attrs.href.slice(1));
    }
    assert.equal(anchors.size, 1, `${detachment.sourceId}: unique explicit raw Detachment Rule anchor required`);
    const headings = nodes.filter(node => node.tag === 'h2' && node.attrs.id === [...anchors][0]);
    assert.equal(headings.length, 1, `${detachment.sourceId}: raw rule heading must resolve uniquely`);
    const following = nodes.filter(node => node.start > headings[0].start && /^(?:h2|h3)$/.test(node.tag));
    assert.equal(following[0]?.tag, 'h3', `${detachment.sourceId}: raw rule owner requires its scoped h3`);
    const scope = following[0].parent;
    assert.equal(scope?.tag, 'div', `${detachment.sourceId}: raw rule container is unresolved`);
    const tables = nodes.filter(node => node.tag === 'table' && within(node, scope));
    assert.equal(tables.length, detachment.rule.tables.length, `${detachment.sourceId}: every captured table occurrence must bind to raw source structure`);
    const records = tables.map((node, index) => {
      const captured = detachment.rule.tables[index];
      assert.equal(captured.sourceId, `${detachment.rule.sourceId}:table:${index + 1}`, 'Accepted table source identity must be explicit and scoped');
      const descendants = tables.filter(child => within(child, node));
      const sourceRows = nodes.filter(row => row.tag === 'tr' && within(row, node)).map(row => nodes.filter(cell => /^(?:td|th)$/.test(cell.tag) && cell.parent === row).map(cell => text(html.slice(cell.contentStart, cell.end)))).filter(row => row.length);
      assert.deepEqual(sourceRows, captured.rows, `${captured.sourceId}: capture rows must match the same raw occurrence`);
      if (descendants.length) {
        let outsideNested = html.slice(node.contentStart, node.end);
        // Remove outermost nested subtrees once, leaving any independently owned
        // parent text/cells. Mixed semantic parent data is rejected, not discarded.
        for (const child of descendants.filter(child => !descendants.some(ancestor => within(child, ancestor))).sort((a, b) => b.start - a.start)) {
          const from = child.start - node.contentStart, to = child.closeEnd - node.contentStart;
          outsideNested = outsideNested.slice(0, from) + outsideNested.slice(to);
        }
        assert.equal(text(outsideNested), '', `${captured.sourceId}: mixed semantic data and nested tables require explicit ownership`);
        assert.equal(outsideNested.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?(?:tbody|thead|tfoot|tr|td|th|colgroup|col)\b[^>]*>/gi, '').trim(), '', `${captured.sourceId}: non-layout parent markup requires explicit ownership`);
      }
      return {node, captured, descendants};
    });
    if (!records.some(record => record.descendants.length)) return {tables:structuredClone(detachment.rule.tables)};
    const semantic = records.filter(record => !record.descendants.length);
    const tableSourceOccurrences = records.map(record => ({
      sourceRecordId:record.captured.sourceId,
      role:record.descendants.length ? 'LAYOUT_WRAPPER_REFERENCE' : 'FACT_SOURCE_REFERENCE',
      factTableIds:semantic.filter(owner => owner === record || within(owner.node, record.node)).map(owner => owner.captured.sourceId),
      sourcePath, sha256:sha256.toUpperCase(),
      rawLocator:{ruleAnchor:[...anchors][0], tableOccurrence:tables.indexOf(record.node) + 1, characterOffset:record.node.start}
    }));
    assert.ok(tableSourceOccurrences.every(reference => reference.factTableIds.length), 'Every layout occurrence must reference its semantic owner');
    return {tables:semantic.map(record => structuredClone(record.captured)), tableSourceOccurrences};
  };
}
