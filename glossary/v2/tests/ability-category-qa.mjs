/** Source-owner field/category reconciliation. No new canonical facts are authored. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {adaptGlobalGlossary} from '../../../books/shared/army-book-app-v2/global-glossary.mjs';
import {createReferenceContract} from '../../../books/shared/army-book-app-v2/reference-contract.mjs';
import {encodeRoute,decodeRoute} from '../../../books/shared/army-book-app-v2/route-context.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const books=['death-guard','adeptus-mechanicus','chaos-space-marines','emperors-children'];
const specialGroups=new Set(['datasheet-mortarion:section:1','datasheet-belisarius-cawl:section:4','datasheet-thulia-ghuld:section:4','datasheet-fulgrim:section:5']);
const selectionContexts={
  'datasheet-mortarion:section:1':{canonicalId:'datasheet-mortarion:section:3',path:'/blocks/0/text'},
  'datasheet-belisarius-cawl:section:4':{canonicalId:'datasheet-belisarius-cawl:section:1',path:'/blocks/0/text'},
  'datasheet-thulia-ghuld:section:4':{canonicalId:'datasheet-thulia-ghuld:section:1',path:'/blocks/0/text'},
  'datasheet-fulgrim:section:5':{canonicalId:'datasheet-fulgrim:section:2',path:'/blocks/1/text'}
};
const sourceModels=new Map(books.map(book=>[book,read('books/'+book+'/v2/generated/effective.json')]));
const publication=read('glossary/v2/generated/index.en.json');
const untouched=JSON.stringify(publication);
const publicationOwners=new Map(publication.entries.filter(entry=>entry.domain==='ARMY').map(entry=>[entry.sourceOwner.bookId+'\0'+entry.sourceOwner.canonicalId,entry]));
const expected=new Map(),aggregates=new Map(),excluded=[];
const add=(entry,category,{path=null,label,body,physicalOwner,unitOwner,provenance=entry.provenance,context}={})=>{
  const targetId=entry.id+(path?'::'+path:'');
  assert.ok(!expected.has(targetId),'Duplicate source-derived ability identity');
  expected.set(targetId,{targetId,category,book:entry.sourceOwner.bookId,canonicalId:entry.sourceOwner.canonicalId,path,label,body,physicalOwner,unitOwner,provenance,context});
};
for(const [book,model]of sourceModels){
  const committed=JSON.parse(execFileSync('git',['show','HEAD:books/'+book+'/v2/generated/effective.json'],{cwd:root,encoding:'utf8',maxBuffer:40*1024*1024}));
  assert.deepEqual(model,committed,'Army Book factual owner changed during presentation-only task '+book);
  const modelOwners=new Map(model.entities.map(entity=>[entity.id,entity]));
  const contextFor=identity=>{if(!identity)return undefined;const owner=modelOwners.get(identity.canonicalId);assert.ok(owner,'Missing reviewed governing ability owner');const body=identity.path?identity.path.slice(1).split('/').reduce((value,key)=>value[key],owner.data):owner.data.text;assert.equal(typeof body,'string');return{...identity,body};};
  for(const entity of model.entities){
    const entry=publicationOwners.get(book+'\0'+entity.id);if(!entry)continue;
    const physicalOwner=entity.parentId||entity.ownerId;
    let unitOwner=physicalOwner,ancestor=modelOwners.get(unitOwner);const visited=new Set();
    while(ancestor&&ancestor.kind!=='DATASHEET'){assert.ok(!visited.has(ancestor.id),'Cyclic canonical owner');visited.add(ancestor.id);unitOwner=ancestor.parentId||ancestor.ownerId;ancestor=modelOwners.get(unitOwner);}
    if(entity.kind==='DATASHEET_SECTION'&&(entity.data.title==='ABILITIES'||specialGroups.has(entity.id))){
      aggregates.set(entry.id,entity);
      entity.data.blocks.forEach((block,index)=>{
        const separator=block.text.indexOf(': ');assert.ok(separator>0,'Expected named source ability block '+entity.id);
        const fieldPath='/blocks/'+index+'/text';
        add(entry,block.wargearAbility?'WARGEAR_ABILITY':'ABILITY',{path:fieldPath,label:block.text.slice(0,separator),body:block.text,physicalOwner,unitOwner,provenance:entity.fieldProvenance?.[fieldPath.slice(1)]||entity.provenance,context:contextFor(selectionContexts[entity.id])});
      });
    }else if(book==='emperors-children'&&entity.id==='datasheet-lord-exultant:section:4'){
      add(entry,'ABILITY',{label:entity.data.title,body:entity.data.blocks[0].text,physicalOwner,unitOwner});
    }else if(entity.kind==='DATASHEET_ABILITY'||entity.kind==='NAMED_RULE_COMPONENT'){
      add(entry,'ABILITY',{label:entity.displayName||entity.data.title,body:entity.data.text,physicalOwner,unitOwner,context:entity.kind==='NAMED_RULE_COMPONENT'?contextFor({canonicalId:'datasheet-abaddon-the-despoiler:section:1:block:0:text'}):undefined});
    }else if(entity.kind==='EQUIPMENT_ABILITY'||entity.id==='datasheet-great-unclean-one:raw-dsAbility:1'){
      const label=entity.id==='datasheet-great-unclean-one:raw-dsAbility:1'?entity.data.text.slice(0,entity.data.text.indexOf(': ')):entity.displayName||entry.label;
      add(entry,'WARGEAR_ABILITY',{label,body:entity.data.text,physicalOwner,unitOwner});
    }else if(['DATASHEET_SECTION','SPECIAL_DATASHEET_RULE','UPGRADE_DECLARATION','UPGRADE_OPTION','UNIT_COMPOSITION','ATTACHMENT_DECLARATION','TRANSPORT_DECLARATION'].includes(entity.kind))excluded.push(entry.id);
  }
}

function reconcile(corpus){
  const projection=adaptGlobalGlossary(corpus),cards=new Map(projection.cards.map(card=>[card.id,card]));
  const contract=createReferenceContract({cards,index:projection.index});
  const classified=projection.index.entries.filter(entry=>['ABILITY','WARGEAR_ABILITY'].includes(entry.category)&&books.includes(cards.get(entry.targetId)?.identity?.registryId));
  assert.deepEqual(new Set(classified.map(entry=>entry.targetId)),new Set(expected.keys()),'Missing/extra/misclassified ability field inventory');
  for(const wanted of expected.values()){
    const card=cards.get(wanted.targetId),indexEntry=classified.find(entry=>entry.targetId===wanted.targetId);
    assert.equal(indexEntry.category,wanted.category,'Wrong source-backed category '+wanted.targetId);
    assert.deepEqual(card.provenance,wanted.provenance,'Lost source provenance '+wanted.targetId);
    assert.equal(card.identity.registryId,wanted.book);
    assert.equal(card.identity.canonicalId,wanted.canonicalId,'A presentation field acquired a new canonical owner');
    if(wanted.path){
      assert.equal(card.identity.fieldPath,wanted.path,'Lost canonical field focus');
      assert.equal(card.title,wanted.label,'Ability caption is not the exact source prefix');
      const field=card.fields.find(field=>field.id===wanted.canonicalId+'::'+wanted.path);
      assert.ok(field,'Stable canonical leaf fact identity missing '+wanted.targetId);
      assert.equal(field.source.entityId,wanted.canonicalId);
      assert.equal(field.source.path,wanted.path);
      assert.equal(field.value,wanted.body,'Source ability body changed');
    }else if(wanted.label)assert.equal(card.title,wanted.label);
    const resolved=contract.resolve(wanted.targetId);
    assert.equal(contract.resolve(card.identity)?.targetId,wanted.targetId,'Direct identity route cannot resolve');
    const route=decodeRoute(encodeRoute('https://example.invalid/v2/app.html',{destination:'GLOSSARY',...card.identity}));
    assert.equal(route.canonicalId,wanted.canonicalId);assert.equal(route.fieldPath,card.identity.fieldPath,'Qualified field URL lost its canonical focus');
    assert.ok(resolved.sections.flatMap(section=>section.fields).some(field=>field.value===wanted.body),'Ability body lost from reference popup');
    if(wanted.context){
      const governing=resolved.sections.find(section=>section.card.identity.canonicalId===wanted.context.canonicalId);
      assert.ok(governing?.fields.some(field=>field.value===wanted.context.body&&field.source.entityId===wanted.context.canonicalId&&(!wanted.context.path||field.source.path===wanted.context.path)),'Governing choice/timing/duration condition missing or wrong owner '+wanted.targetId);
    }
    assert.ok(card.contextParentIds?.includes(wanted.physicalOwner)||card.sourceParentId===wanted.physicalOwner,'Physical owner context missing '+wanted.targetId);
    assert.ok(resolved.references.some(reference=>cards.get(reference.targetId)?.identity?.canonicalId===wanted.physicalOwner),'Physical owner navigation missing '+wanted.targetId);
    const ownerTrail=new Set();let ancestor=card;
    while(ancestor&&ancestor.identity.canonicalId!==wanted.unitOwner){assert.ok(!ownerTrail.has(ancestor.id),'Cyclic presentation owner');ownerTrail.add(ancestor.id);const parent=publicationOwners.get(wanted.book+'\0'+ancestor.sourceParentId);ancestor=parent&&cards.get(parent.id);}
    assert.ok(ancestor,'Physical UNIT owner cannot be reached '+wanted.targetId);
    if(wanted.canonicalId==='datasheet-great-unclean-one:raw-dsAbility:1')assert.ok(resolved.references.some(reference=>cards.get(reference.targetId)?.identity?.canonicalId==='datasheet-great-unclean-one:weapon:6'),'Weapon-specific ability lost its Doomsday bell owner reference');
  }
  for(const [id]of aggregates){
    assert.ok(cards.has(id)&&contract.resolve(id),'Historical aggregate URL lost');
    const original=corpus.entries.find(entry=>entry.id===id),fieldPath='/glossary/'+id.replaceAll('~','~0').replaceAll('/','~1');
    assert.equal(contract.resolve({registryId:original.sourceOwner.bookId,canonicalId:original.sourceOwner.canonicalId,fieldPath})?.targetId,id,'Historical qualified aggregate URL changed');
    assert.equal(projection.index.entries.find(entry=>entry.targetId===id).category,'REFERENCE','Aggregate container duplicated its field abilities');
  }
  for(const id of excluded)assert.ok(!classified.some(entry=>entry.targetId===id),'Non-ability section was classified as Ability '+id);
  assert.deepEqual(new Set(cards.keys()),new Set([...corpus.entries.map(entry=>entry.id),...[...expected.values()].filter(entry=>entry.path).map(entry=>entry.targetId)]),'Original reference inventory changed outside the explicit field views');
  assert.equal(projection.cards.length,corpus.entries.length+[...expected.values()].filter(entry=>entry.path).length,'Original canonical articles were removed or duplicated');
  return {projection,contract};
}
const {projection}=reconcile(publication);
const counts=Object.fromEntries(books.map(book=>[book,{abilities:[...expected.values()].filter(entry=>entry.book===book&&entry.category==='ABILITY').length,wargearAbilities:[...expected.values()].filter(entry=>entry.book===book&&entry.category==='WARGEAR_ABILITY').length}]));
assert.deepEqual(counts,{'death-guard':{abilities:61,wargearAbilities:7},'adeptus-mechanicus':{abilities:60,wargearAbilities:12},'chaos-space-marines':{abilities:92,wargearAbilities:7},'emperors-children':{abilities:38,wargearAbilities:7}},'Reviewed source-block inventory changed');
assert.equal(aggregates.size,97);
assert.equal([...expected.values()].filter(entry=>entry.path).length,183);
const firstField=[...expected.values()].find(entry=>entry.path),firstEntryId=firstField.targetId.slice(0,-('::'+firstField.path).length);
const getEntry=corpus=>corpus.entries.find(entry=>entry.id===firstEntryId);
let mutations=0;
function detected(label,mutate){const changed=structuredClone(publication);mutate(changed);let error;try{reconcile(changed);}catch(cause){error=cause;}assert.ok(error,'Comparator missed '+label);mutations++;}
detected('missing ability field',corpus=>{getEntry(corpus).presentation.referenceFields.shift();});
detected('wrong ability category',corpus=>{getEntry(corpus).presentation.referenceFields[0].category='REFERENCE';});
detected('wrong ability caption',corpus=>{getEntry(corpus).presentation.referenceFields[0].label='Incorrect caption';});
detected('invalid canonical field path',corpus=>{getEntry(corpus).presentation.referenceFields[0].path='/blocks/999/text';});
detected('duplicate ability field',corpus=>{getEntry(corpus).presentation.referenceFields.push(structuredClone(getEntry(corpus).presentation.referenceFields[0]));});
detected('wrong physical owner',corpus=>{getEntry(corpus).parent.canonicalId='unit-chaos-lord';getEntry(corpus).contexts.forEach(context=>{context.parentUnitId='unit-chaos-lord';});});
detected('wrong provenance',corpus=>{getEntry(corpus).presentation.referenceFields[0].provenance={sourceId:'foreign-source'};});
detected('composition incorrectly classified as ability',corpus=>{corpus.entries.find(entry=>excluded.includes(entry.id)&&entry.recordType==='UNIT_COMPOSITION').presentation.referenceCategory='ABILITY';});
detected('source body mismatch',corpus=>{const entry=getEntry(corpus);entry.facts.blocks[0].text='Changed source body';entry.facts.canonicalData.blocks[0].text='Changed source body';});
const contextualField=[...expected.values()].find(entry=>entry.path&&entry.context);
detected('missing governing field condition',corpus=>{const originalId=contextualField.targetId.slice(0,-('::'+contextualField.path).length);delete corpus.entries.find(entry=>entry.id===originalId).presentation.referenceFields.find(field=>field.path===contextualField.path).referenceContext;});
const contextualLeaf=[...expected.values()].find(entry=>!entry.path&&entry.context);
detected('missing governing named-ability condition',corpus=>{delete corpus.entries.find(entry=>entry.id===contextualLeaf.targetId).presentation.referenceContext;});
detected('foreign governing context',corpus=>{const originalId=contextualField.targetId.slice(0,-('::'+contextualField.path).length);corpus.entries.find(entry=>entry.id===originalId).presentation.referenceFields.find(field=>field.path===contextualField.path).referenceContext={canonicalId:'datasheet-chaos-lord:section:1:block:0:text'};});
detected('wrong physical UNIT governing context',corpus=>{const originalId=contextualField.targetId.slice(0,-('::'+contextualField.path).length);corpus.entries.find(entry=>entry.id===originalId).presentation.referenceFields.find(field=>field.path===contextualField.path).referenceContext={canonicalId:'datasheet-biologus-putrifier:section:1',path:'/blocks/0/text'};});
assert.equal(JSON.stringify(publication),untouched,'Presentation projection mutated canonical publication');
console.log(JSON.stringify({status:'PASS',abilityCategories:counts,sourceOwnedFieldViews:183,originalAggregateURLs:aggregates.size,governingConditionControls:[...expected.values()].filter(entry=>entry.context).length,nonAbilityControls:excluded.length,mutationControls:mutations,canonicalDataUnchanged:true,totalViews:projection.cards.length}));
