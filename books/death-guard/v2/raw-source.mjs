import assert from 'node:assert/strict';

export const decodeSourceText = value => String(value).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&(nbsp|amp|quot|apos|lt|gt);/g, (_, n) => ({nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'})[n]);
export const normalizeSourceText = value => decodeSourceText(value).replace(/\s+/g,' ').trim();

// Pinned HTML structural locators are evidence addresses, never gameplay joins.
export function parseSourceHtml(html) {
  const root={tag:'document',children:[],start:0,contentStart:0,end:html.length}, stack=[root];
  const tokens=/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  for (const match of html.matchAll(tokens)) {
    if (!match[2]) continue;
    const tag=match[2].toLowerCase();
    if (match[0].startsWith('</')) {
      const i=stack.findLastIndex(node=>node.tag===tag);
      if (i>0) for (const node of stack.splice(i)) node.end=match.index;
      continue;
    }
    const node={tag,children:[],parent:stack.at(-1),start:match.index,contentStart:match.index+match[0].length,end:html.length,
      attrs:Object.fromEntries([...match[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(x=>[x[1],decodeSourceText(x[2]??x[3])]))};
    node.parent.children.push(node);
    if (!/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag) && !match[0].endsWith('/>')) stack.push(node);
    else node.end=node.contentStart;
  }
  return root;
}

export function sourceNode(root,xpath) {
  let node=root;
  for (const part of xpath.split('/').filter(Boolean)) {
    const match=part.match(/^([\w:-]+)(?:\[(\d+)\])?$/);
    assert.ok(match,'Unsupported raw source locator: '+xpath);
    node=node.children.filter(child=>child.tag===match[1])[Number(match[2]||1)-1];
    assert.ok(node,'Unresolved raw source locator: '+xpath);
  }
  return node;
}

export function sourceNodeText(html,node) {
  let text=html.slice(node.contentStart,node.end).replace(/<!--[\s\S]*?-->/g,'').replace(/<br\b[^>]*>/gi,'\n');
  return decodeSourceText(text.replace(/<[^>]*>/g,''));
}
