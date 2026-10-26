import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCoreFactProjection} from '../content/core-fact-projection.mjs';
import {createAutolinkTerms} from '../reader/term-bindings.mjs';

const projection=createCoreFactProjection();
const terms=projection.terms.map(term=>({...term,title:{en:term.title}}));
const byCode=new Map(terms.filter(term=>term.code&&projection.catalog.getByCode(term.code)).map(term=>[term.code,term]));
const bindings=JSON.parse(fs.readFileSync(new URL('../reader/presentation-bindings.json',import.meta.url),'utf8'));
const index=createAutolinkTerms({terms,termByCode:byCode,referenceOnlyIds:bindings.referenceOnlyAutolinkIds});
for(const [code,label] of [['23.01','deployment'],['23.02','movement'],['23.03','shooting']]){
  assert.equal(index.get(label),undefined,`${label} must not infer Aircraft scope`);
  assert.equal(index.get(code)?.id,byCode.get(code).id,'explicit citation must remain available');
}
assert.equal(index.get('infiltrators')?.id,'core-infiltrators');
assert.equal(index.get('20.01')?.code,'20.01');
assert.throws(()=>createAutolinkTerms({terms,termByCode:byCode,referenceOnlyIds:['invented']}),/Unknown contextual/);
// Suppression must not turn an ambiguous heading into a different arbitrary owner.
const ambiguous=[{id:'scoped',title:{en:'Generic heading'}},{id:'other',title:{en:'Generic heading'}}];
assert.equal(createAutolinkTerms({terms:ambiguous,termByCode:new Map(),referenceOnlyIds:['scoped']}).get('generic heading'),undefined);

const reader=new URL('../reader/',import.meta.url);
let buttons=0,chapters=0;
for(const file of fs.readdirSync(reader).filter(file=>file.endsWith('.html'))){
  chapters++;
  const html=fs.readFileSync(new URL(file,reader),'utf8');
  for(const match of html.matchAll(/<button class="([^"]*\bterm\b[^"]*)"[^>]*data-term="([^"]+)"[^>]*>([^<]*)<\/button>/g)){
    buttons++;
    assert(projection.terms.some(term=>term.id===match[2]),`unknown button identity ${match[2]}`);
    assert(!bindings.referenceOnlyAutolinkIds.includes(match[2])||match[1].split(/\s+/).includes('rule-reference'),`unexpected naked scoped heading ${file}:${match[3]}`);
  }
}
const movement=fs.readFileSync(new URL('movement-phase.html',reader),'utf8');
assert.match(movement,/<a class="rule-reference" href="aircraft.html">Aircraft<\/a>/);
const movementRule=projection.catalog.getByCode('09.02');
assert(movementRule.sourceStructure.references.some(ref=>ref.label==='23.00'&&ref.target?.endsWith('#Aircraft')),'chapter destination must follow accepted source');
assert.equal(chapters,27); // 26 chapters and the reader landing/FAQ page.
assert.equal(buttons,852); // All 880 old bindings reviewed: 27 removed, one chapter link.
console.log(JSON.stringify({status:'PASS',chapters:26,buttons,reviewedOriginalButtons:880,incorrectBindingsRemoved:28,explicitCitations:'preserved',ambiguousFallback:'rejected'}));
