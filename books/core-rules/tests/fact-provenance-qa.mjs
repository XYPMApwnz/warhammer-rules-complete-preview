import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog,validateEffectiveCoreCatalog} from '../content/effective-core-catalog.mjs';
import {bindFactSources,validateFactSources,factHash,factAt,hasFactSource} from '../content/fact-source-bindings.mjs';

// Independent synthetic sources: different supporting owners may cover the same fact.
const sources=[{sourceId:'accepted-table',sourceClass:'PRIMARY',authorityLevel:'PRIMARY',date:'2026-01-01',urlOrLocalArtifact:'table.json'}, {sourceId:'accepted-image',sourceClass:'PRIMARY',authorityLevel:'PRIMARY',date:'2026-01-01',urlOrLocalArtifact:'page.png'}];
const base=[{id:'synthetic-outcome',content:[{result:3,outcome:'SUCCESS'}],provenance:{base:{sourceId:'base-occurrence'}}}];
const declarations=sources.map(source=>({targetRuleId:base[0].id,target:{path:'/content/0'},valueHash:factHash(base[0].content[0]),source:{sourceId:source.sourceId,path:'/outcomes/0'}}));
const context={sources,resolveSource:()=>({result:3,outcome:'SUCCESS'})};
const effective=bindFactSources(base,declarations,context);
validateFactSources(effective,declarations,context);
assert.equal(effective[0].provenance.factSources.length,2);
assert.equal(base[0].provenance.factSources,undefined,'binding mutates canonical input');
assert(hasFactSource(effective[0],'/content/0/result'));
assert(!hasFactSource(effective[0],'/content/01/result'),'sibling path falsely covered');
assert.throws(()=>bindFactSources(base,[declarations[0],declarations[0]],context),/Duplicate/);
for(const mutate of [
  records=>{delete records[0].content[0].result;},
  records=>{records[0].content[0].result=6;},
  records=>{records[0].provenance.factSources.pop();},
  records=>{records[0].provenance.factSources[0].source.sourceId='base-occurrence';},
  records=>{records[0].provenance.factSources[0].source.sourceClass='SECONDARY';},
  records=>{records[0].provenance.factSources.push({...records[0].provenance.factSources[0],source:{sourceId:'invented'}});}
]){const records=structuredClone(effective);mutate(records);assert.throws(()=>validateFactSources(records,declarations,context));}
assert.throws(()=>bindFactSources(base,declarations,{...context,resolveSource:()=>({result:4,outcome:'SUCCESS'})}),/does not support/);

const catalog=createEffectiveCoreCatalog();
const bindingContext={sources:catalog.acceptedSourceRegistry.sources,resolveSource:catalog.resolveFactSource};
const bindings=catalog.contentBindings.factContributions;
const numericFacts=[['05.01','Unmodified 1\nFAILS',18],['05.01','Unmodified 6\nCRITICAL HIT',18],['05.04','Unmodified 1\nINFLICTS DAMAGE',19]];
for(const [code,text,page] of numericFacts){
  const rule=catalog.getByCode(code);
  const source=rule.provenance.factSources.find(entry=>entry.source.transcription===text);
  assert(source,`${code} numeric outcome missing its canonical/source owner`);
  assert.equal(factAt(rule,source.target),text);
  assert.equal(source.source.page,page);
  assert.equal(source.source.sourceId,'gw-core-original-2026-06-01');
  assert.equal(source.source.authorityLevel,'GLOBAL_OFFICIAL');
  const records=structuredClone(catalog.mainRules);
  const changed=records.find(record=>record.id===rule.id);
  changed.text=changed.text.replace(text,text.replace(/[16]/,value=>value==='1'?'6':'1'));
  assert.throws(()=>validateFactSources(records,bindings,bindingContext),/Changed source-bound fact/);
}
for(const [code,pointer] of [['02.02.01','/text'],['05.02','/content']]){
  const rule=catalog.getByCode(code),source=rule.provenance.factSources.find(entry=>entry.target.path===pointer);
  assert.equal(rule.provenance.base.sourceId,'waha-core-corpus-2026-09-25','base supporting occurrence lost');
  assert.equal(source.source.sourceId,'waha-digital-11e-snapshot');
  assert.equal(source.source.sourceClass,'WAHA_SECONDARY');
  assert.equal(source.source.authorityLevel,'SECONDARY');
  assert.deepEqual(factAt(rule,{path:pointer}),catalog.resolveFactSource(source.source),'fallback text/structure changed');
}

// Census numeric outcomes in every currently visible structured table.
let structuredNumericFacts=0;
for(const rule of catalog.mainRules)for(const [index,block] of (rule.content||[]).entries()){
  // The canonical list format also carries die-result outcomes outside tables.
  if(block.type==='list')for(const [item,text] of block.items.entries())if(/^Unmodified\s+\d+\s*:/.test(text)){
    structuredNumericFacts++;assert(hasFactSource(rule,`/content/${index}/items/${item}`),`Unowned numeric list outcome ${rule.id}`);
  }
  if(block.type==='matrix')for(const [row,value] of block.rows.entries())if(/^\d/.test(value.result)){
    structuredNumericFacts++;assert(hasFactSource(rule,`/content/${index}/rows/${row}/result`),`Unowned structured outcome ${rule.id}`);
  }
  if(block.type==='comparison-table')for(const [row,value] of block.rows.entries())for(const [cell,text] of value.cells.entries())if(/^\d+(?:\+)?$/.test(text)){
    structuredNumericFacts++;assert(hasFactSource(rule,`/content/${index}/rows/${row}/cells/${cell}`),`Unowned numeric table cell ${rule.id}`);
  }
}
assert.equal(structuredNumericFacts,15);
const wrongSource=structuredClone(catalog.contentBindings);
wrongSource.factContributions[0].source.sourceId='waha-digital-11e-snapshot';
assert.throws(()=>createEffectiveCoreCatalog({contentBindings:wrongSource}),/page-image source owner/);
const wrongPage=structuredClone(catalog.contentBindings);
wrongPage.factContributions[0].source.page=19;
assert.throws(()=>createEffectiveCoreCatalog({contentBindings:wrongPage}),/page-image source owner/);
const missingProvenance={...catalog,records:structuredClone(catalog.records)};
missingProvenance.mainRules=missingProvenance.records.filter(record=>record.recordType==='MAIN_RULE');
missingProvenance.mainRules.find(record=>record.code==='05.02').provenance.factSources=[];
assert.throws(()=>validateEffectiveCoreCatalog(missingProvenance),/contributing provenance/);

// Presentation is a projection: these exact factual strings exist only in canonical data.
const readerSource=fs.readFileSync(fileURLToPath(new URL('../reader/build.mjs',import.meta.url)),'utf8');
for(const [,text] of numericFacts)assert(!readerSource.includes(text)&&!readerSource.includes(text.replaceAll('\n','\\n')),'Reader-owned numeric outcome literal');
console.log(`PASS Core numeric facts 3/3; structured numeric ownership ${structuredNumericFacts}/${structuredNumericFacts}; fallback provenance 2/2; generic source/mutation guards.`);
