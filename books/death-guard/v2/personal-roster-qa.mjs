import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildApp,readAppInputs} from './app-build.mjs';
import * as evaluator from './rule-contract-schema.mjs';
import {createRosterRuntime} from '../../shared/roster-v2/runtime.mjs';
import {projectPersonalBook,projectInstanceCards,instanceRoute} from '../../shared/army-book-app-v2/personal.mjs';

// Presentation expectations derive from imported physical selections and the
// existing canonical/effective service. This QA does not own gameplay facts.
const {model}=readAppInputs(),payload=buildApp(),cards=new Map(payload.cards.map(c=>[c.id,c]));
const parser={window:{}};vm.createContext(parser);
vm.runInContext(fs.readFileSync(new URL('../../shared/roster-parser.js',import.meta.url),'utf8'),parser);
const make=()=>createRosterRuntime(model,{...evaluator,parse:parser.window.WHRosterParser.parse});
const text=[
 '+ DETACHMENT: Flyblown Host','+ DETACHMENT: Paragons of Putrescence',
 '+ DETACHMENT: Contagion Engines','+ DETACHMENT: Virulent Vectorium (Worldblight)',
 '+ WARLORD: Char3: Biologus Putrifier',
 '+ ENHANCEMENT: Furnace of Plagues (on Char3: Biologus Putrifier)',
 'Char1: 5x Plague Marines (90 pts): 1x Meltagun, 4x Boltgun, 5x Plague knives, 1x Icon of Despair',
 'Char2: 10x Plague Marines (180 pts): 2x Blight launcher, 8x Boltgun, 10x Plague knives',
 'Char3: 1x Biologus Putrifier (50 pts): 1x Plague knives',
 'Char4: 1x Noxious Blightbringer (50 pts): 1x Plasma pistol, 1x Cursed plague bell',
 'Char5: 1x Lord of Contagion (100 pts): 1x Manreaper',
 '3x Deathshroud Terminators (140 pts): 3x Plaguespurt gauntlet, 3x Manreaper',
 '1x Chaos Rhino (80 pts): 1x Combi-bolter, 1x Armoured tracks'
].join('\n');
const service=make(),result=service.import(text);assert.equal(result.status,'READY',JSON.stringify(result));
const before=JSON.stringify(payload),canonicalBefore=JSON.stringify(model);
let controls=0;const check=fn=>{fn();controls++;};
const pmA='parsed-unit-1',pmB='parsed-unit-2',bio='parsed-unit-3',nox='parsed-unit-4',loc='parsed-unit-5',ds='parsed-unit-6';
const projected=id=>{const unit=service.state.units.find(u=>u.instanceId===id);return projectInstanceCards(cards,unit,service.effective(id));};
const value=(card,path)=>card.fields.find(f=>f.source.path===path)?.value;
const values=(card,key)=>card.fields.filter(f=>f.source.path.startsWith('/'+key+'/')).map(f=>f.value);
const PM='unit-plague-marines',MELTA='datasheet-plague-marines:weapon:4',BOLT='datasheet-plague-marines:weapon:2';
check(()=>{
 const personal=projectPersonalBook(payload,service.state),allowed=personal.allowedIds;
 assert.deepEqual(new Set(personal.groups.find(g=>g.id==='detachments').entries.map(e=>e.id)),new Set(service.state.detachmentIds));
 assert.deepEqual(personal.groups.find(g=>g.id==='enhancements').entries.map(e=>e.id),['detachment-virulent-vectorium:enhancement:2']);
 assert.equal(personal.instances.length,7);assert.equal(new Set(personal.instances.map(u=>u.route)).size,7);
 const duplicates=personal.instances.filter(u=>u.id===PM);assert.deepEqual(duplicates.map(u=>u.title),['Plague Marines #1','Plague Marines #2']);
 assert.deepEqual(duplicates.map(u=>u.route),[instanceRoute(pmA),instanceRoute(pmB)]);
 for(const c of payload.cards){
  if(c.kind==='DATASHEET')assert.equal(allowed.has(c.id),service.state.units.some(u=>u.canonicalUnitId===c.id));
  if(c.kind==='DETACHMENT')assert.equal(allowed.has(c.id),service.state.detachmentIds.includes(c.id));
  if(c.kind==='ENHANCEMENT')assert.equal(allowed.has(c.id),c.id==='detachment-virulent-vectorium:enhancement:2');
  if(['STRATAGEM','DETACHMENT_RULE'].includes(c.kind))assert.equal(allowed.has(c.id),service.state.detachmentIds.includes(c.parentId));
 }
});
check(()=>{
 const a=projected(pmA),b=projected(pmB);
 assert.equal(a.get(MELTA).length,1);assert.equal(b.get(MELTA).length,0);
 assert.equal(a.get(BOLT)[0].rosterQuantity,4);assert.equal(b.get(BOLT)[0].rosterQuantity,8);
 assert(a.get(PM)[0].children.includes('datasheet-plague-marines:wargear:8'));
 assert(!b.get(PM)[0].children.includes('datasheet-plague-marines:wargear:8'));
 const empty=projected('parsed-unit-7').get('datasheet-chaos-rhino:weapon:4')[0].fields.find(f=>f.source.path==='/abilities');
 assert(empty,'Known empty abilities must remain an explicit fact');assert.deepEqual(empty.value,[]);
});
check(()=>{
 const bBefore=projected(pmB);service.attach(bio,pmA);service.attach(nox,pmA);service.attach(loc,ds);
 assert.deepEqual(projected(pmB),bBefore);
 const a=projected(pmA),effective=service.effective(pmA);
 assert.deepEqual(new Set(values(a.get(PM)[0],'keywords')),new Set(effective.keywords));
 assert(values(a.get(MELTA)[0],'abilities').some(v=>v.toUpperCase()==='LETHAL HITS'));
 for(const p of effective.profiles){const card=a.get(p.id).find(c=>c.scopeId===p.scopeId);assert(card);assert.equal(value(card,'/M'),'6"');assert.equal(card.rosterQuantity,p.quantity);}
 const locEffective=service.effective(loc);assert(locEffective.profiles.every(p=>p.abilities.some(a=>a.name==='Feel No Pain'&&a.value===4)));
 const locCards=projected(loc);assert(locCards.get(locEffective.profiles[0].id)[0].rosterAbilities.some(a=>a.name==='Feel No Pain'&&a.value===4));
 const attached=projected(pmA);service.detach(bio);assert(!values(projected(pmA).get(MELTA)[0],'abilities').some(v=>v.toUpperCase()==='LETHAL HITS'));
 service.attach(bio,pmA);assert.deepEqual(projected(pmA),attached);
});
check(()=>{
 for(const unit of service.state.units){
  const variants=projected(unit.instanceId);
  for(const [id,records] of variants)for(const record of records){
   assert.equal(record.id,id);assert.equal(record.instanceId,unit.instanceId);
   for(const f of record.fields){assert(f.source?.entityId);assert(f.source.path.startsWith('/'));
    if(!f.runtimeDerived){const source=cards.get(id).fields.find(old=>old.id===f.id);assert(source,'Unchanged field must retain canonical address');assert.deepEqual(f,source);}
   }
  }
  for(const row of service.related(unit.instanceId)){assert(service.state.detachmentIds.includes(row.detachmentId));assert.notEqual(row.state,'INVALID');}
 }
});
check(()=>{
 const backup=JSON.parse(JSON.stringify(service.snapshot())),loaded=make();loaded.load(backup);
 assert.deepEqual(projectPersonalBook(payload,loaded.state),projectPersonalBook(payload,service.state));
 for(const unit of loaded.state.units)assert.deepEqual(projectInstanceCards(cards,unit,loaded.effective(unit.instanceId)),projected(unit.instanceId));
});
check(()=>{
 const option=service.state.units[0].selections.find(s=>s.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8'));
 assert.deepEqual(option.canonicalEquipmentIds,['datasheet-plague-marines:wargear:8']);
 assert.deepEqual(option.canonicalFieldPaths,{'datasheet-plague-marines:wargear:8':['/text']});
 assert.deepEqual(option.sourceReferences,[{entityId:'datasheet-plague-marines:section:1',path:'/blocks/1/text'}]);
 const explicit=make();assert.equal(explicit.import(text,{selections:{[option.selectionKey]:{
  canonicalEquipmentIds:option.canonicalEquipmentIds,canonicalFieldPaths:option.canonicalFieldPaths,
  sourceReferences:[{entityId:'unresolved-user-supplied-occurrence',path:'/blocks/0/text'}]
 }}}).status,'READY');
 assert.deepEqual(explicit.state.units[0].selections.find(s=>s.selectionKey===option.selectionKey).sourceReferences,option.sourceReferences,
  'Ancillary identity must derive from canonical import candidate, not user binding');
 const source=model.entities.find(e=>e.id==='datasheet-plague-marines:section:1');
 assert.equal(source.data.blocks[1].wargearAbility,true);assert(source.data.blocks[1].text.startsWith('Icon of Despair (Aura):'));
 const section=projected(pmA).get(source.id)?.[0];assert(section,'Selected optional ability requires an explicit scoped section');
 assert(section.fields.some(f=>f.source.path==='/blocks/1/text'));
 assert(!projected(pmB).get(source.id)?.[0].fields.some(f=>f.source.path==='/blocks/1/text'),'Unselected optional ability must not appear');
 const old=JSON.parse(JSON.stringify(service.snapshot()));for(const unit of old.units)for(const selection of unit.selections||[])delete selection.sourceReferences;
 const oldService=make();oldService.load(old);
 const oldUnit=oldService.state.units[0],oldCards=projectInstanceCards(cards,oldUnit,oldService.effective(oldUnit.instanceId));
 assert(!oldCards.get(source.id)?.[0].fields.some(f=>f.source.path==='/blocks/1/text'),'Absent canonical occurrence binding must not be inferred');
 for(const refs of [null,[{entityId:'datasheet-deathshroud-terminators:section:1',path:'/blocks/1/text'}],
  [{entityId:source.id,path:'/blocks/0/text'}],[{entityId:source.id,path:'/blocks/../text'}],
  [...option.sourceReferences,...option.sourceReferences]]){
  const poisoned=JSON.parse(JSON.stringify(service.snapshot()));
  poisoned.units[0].selections.find(s=>s.canonicalEquipmentIds.includes('datasheet-plague-marines:wargear:8')).sourceReferences=refs;
  assert.throws(()=>make().load(poisoned),/equipment source reference/);
 }
});
check(()=>{
 // One canonical profile/weapon can have several real imported composition
 // scopes. Keep all variants; canonical ID never becomes a scope identity.
 const detailed=make();assert.equal(detailed.import('+ DETACHMENT: Virulent Vectorium\n5x Plague Marines (90 pts)\n• 1x Plague Champion: 1x Boltgun, 1x Plague knives\n• 4x Plague Marines: 1x Boltgun, 1x Plague knives').status,'READY');
 const unit=detailed.state.units[0],effective=detailed.effective(unit.instanceId),v=projectInstanceCards(cards,unit,effective);
 assert.equal(effective.profiles.length,2);assert.equal(v.get(effective.profiles[0].id).length,2);
 assert.deepEqual(v.get(effective.profiles[0].id).map(c=>c.scopeId),effective.profiles.map(p=>p.scopeId));
 assert.deepEqual(v.get(BOLT).map(c=>c.rosterQuantity),[1,4]);
 const changed=structuredClone(effective);changed.profiles[1].fields.find(f=>f.label==='M').value='99"';
 const variants=projectInstanceCards(cards,unit,changed).get(effective.profiles[0].id);
 assert.equal(value(variants[0],'/M'),'5"');assert.equal(value(variants[1],'/M'),'99"');
});
check(()=>{
 const unit=service.state.units[0],wrong=service.effective(pmB);assert.throws(()=>projectInstanceCards(cards,unit,wrong),/Wrong physical/);
 const unresolved=structuredClone(service.state);unresolved.units[0].canonicalUnitId='unresolved-canonical-unit';
 assert.throws(()=>projectPersonalBook(payload,unresolved),/Unresolved/);
 const poisoned=structuredClone(payload);for(const c of poisoned.cards)c.title='Presentation title poison';
 const original=projectPersonalBook(payload,service.state),changed=projectPersonalBook(poisoned,service.state);
 assert.deepEqual(original.allowedIds,changed.allowedIds);assert.deepEqual(original.instances.map(u=>u.route),changed.instances.map(u=>u.route));
});
assert.equal(JSON.stringify(payload),before,'Canonical presentation mutated');assert.equal(JSON.stringify(model),canonicalBefore,'Canonical model mutated');
console.log(JSON.stringify({status:'PASS',controls,physicalInstances:7,selectedDetachments:4,importedEnhancements:1,unselectedDetachmentLeakage:0,unimportedEnhancements:0,unimportedDatasheets:0,duplicateIsolation:'PASS',compositionScopeVariants:'PASS',sourceAddresses:'PASS',emptyAbilitiesFact:'PASS',detachReattach:'PASS',roundtrip:'PASS',canonicalMutation:0}));
