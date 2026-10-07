import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createEffectiveCoreCatalog} from '../../core-rules/content/effective-core-catalog.mjs';
import {buildPresentationReferences,sourceReferenceTargets,REFERENCE_SCHEMA} from './presentation-reference-build.mjs';

const model=JSON.parse(fs.readFileSync(new URL('./generated/effective.json',import.meta.url),'utf8'));
const coreCatalog=createEffectiveCoreCatalog();
const cards=model.entities.map(entity=>({id:entity.id,kind:entity.kind,fields:
  entity.kind==='RULE_REFERENCE'?entity.data.groups.flatMap((group,g)=>group.entries.map((entry,e)=>{
    const path=`/groups/${g}/entries/${e}/label`;
    return {id:`${entity.id}::${path}`,value:entry.label,source:{entityId:entity.id,path}};
  })):[]}));
const input={model,cards,coreCatalog};
const before=JSON.stringify(input),result=buildPresentationReferences(input);
assert.equal(JSON.stringify(input),before,'Presentation reference binding mutated factual inputs');
assert.equal(result.referenceBindings.schema,REFERENCE_SCHEMA);
assert.equal(JSON.stringify(buildPresentationReferences(input)),JSON.stringify(result),'Nondeterministic reference build');
const coreById=new Map(coreCatalog.records.map(record=>[record.id,record]));
const allCards=new Map([...cards,...result.coreCards].map(card=>[card.id,card]));
const sourceRoot=new URL('../sources/waha-11e-current-2026-09-25/',import.meta.url);
const corpus=JSON.parse(fs.readFileSync(new URL('corpus.json',sourceRoot),'utf8'));
let checked=0;
for(const reference of model.entities.filter(entity=>entity.kind==='RULE_REFERENCE')) {
  const sourceIndex=reference.provenance.pointer.match(/^\/datasheets\/(\d+)\//)?.[1];
  assert.ok(sourceIndex!==undefined,'Reference has no accepted datasheet occurrence');
  const sourcePage=corpus.datasheets[Number(sourceIndex)];
  const filename=new URL(sourcePage.url).pathname.split('/').at(-1)+'.html';
  const html=fs.readFileSync(new URL(filename,sourceRoot),'utf8');
  reference.data.groups.forEach((group,g)=>group.entries.forEach((entry,e)=>{
    const fieldId=`${reference.id}::/groups/${g}/entries/${e}/label`;
    const binding=result.referenceBindings.fields[fieldId];
    assert.equal(binding.length,1);
    assert.deepEqual([binding[0].start,binding[0].end],[0,entry.label.length]);
    const target=allCards.get(binding[0].targetId);assert.ok(target);
    assert.deepEqual(result.referenceBindings.entries[entry.id],{fieldId,targetId:target.id});
    for(const tooltipId of entry.sourceTooltipIds) {
      const start=html.indexOf(`id="${tooltipId.slice(1)}"`);
      assert.ok(start>=0,'Canonical source reference lacks accepted HTML occurrence');
      const sourceHeader=html.slice(start,start+400);
      if(group.label==='CORE ABILITIES') {
        // This independent source-heading assertion verifies the declaration;
        // headings are not used to construct or resolve any factual identity.
        const sourceTitle=sourceHeader.match(/class="abName">([^<]+)</)?.[1];
        assert.equal(sourceTitle,coreById.get(target.id).title,'Source tooltip is bound to the wrong canonical Core definition');
      } else {
        const sourceTitle=sourceHeader.match(/class="tooltip_header">([^<]+)</)?.[1];
        assert.equal(sourceTitle,model.entities.find(entity=>entity.id===target.id).data.title,'Source army reference is bound to a different rule');
      }
      assert.equal(sourceReferenceTargets[tooltipId].targetId,target.id);
    }
    if(group.label==='CORE ABILITIES') {
      const definition=coreById.get(target.id);
      assert.equal(definition.state,'FULL_CONTENT');
      assert.deepEqual(target.provenance,definition.provenance);
      assert.equal(target.fields.find(field=>field.source.path==='/semanticContent')?.value,definition.semanticContent);
      assert.ok(!/RULE_REFERENCE/.test(target.kind),'Core popup incorrectly opens generic reference bucket');
    } else assert.equal(target.id,'army-rule-doctrina-imperatives');
    checked++;
  }));
}
// Exact existing definition identities, including Core reference variants.
for(const id of ['core-deep-strike','core-support','core-hover','core-scouts','core-feel-no-pain',
  'core-anti','core-heavy','core-assault','core-devastating-wounds','core-hazardous'])assert.ok(allCards.has(id));

let mutations=0;
const reject=change=>{const copy=JSON.parse(JSON.stringify(input));change(copy);assert.throws(()=>buildPresentationReferences(copy));mutations++;};
const referenceIndex=model.entities.findIndex(entity=>entity.kind==='RULE_REFERENCE');
reject(copy=>copy.model.entities[referenceIndex].data.groups[0].entries[0].sourceTooltipIds=['#unregistered']);
reject(copy=>copy.model.entities[referenceIndex].data.groups[0].label='ARMY RULES');
reject(copy=>copy.model.entities[referenceIndex].data.groups[0].entries[0].sourceTooltipIds=[]);
reject(copy=>copy.model.entities[referenceIndex].data.groups[0].entries.push(copy.model.entities[referenceIndex].data.groups[0].entries[0]));
reject(copy=>copy.cards.find(card=>card.id===copy.model.entities[referenceIndex].id).fields[0].value='poisoned label');
reject(copy=>copy.cards.push(copy.cards[0]));
reject(copy=>copy.coreCatalog.records=copy.coreCatalog.records.filter(record=>record.id!=='core-deadly-demise'));
reject(copy=>copy.cards=copy.cards.filter(card=>card.id!=='army-rule-doctrina-imperatives'));

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])console.log(JSON.stringify({
  referenceEntries:checked,sourceTooltipBindings:Object.keys(sourceReferenceTargets).length,
  corePopupDefinitions:result.coreCards.length,canonicalIdentity:'PASS',provenance:'PASS',
  immutableInputs:'PASS',deterministic:'PASS',mutationsDetected:mutations}));
