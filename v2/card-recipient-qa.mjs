/** F2: exact physical carrier counts through the real import/attachment and
 * presentation path. Synthetic controls are physical records, not new effects. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createDGRosterRuntime} from '../books/death-guard/v2/roster-boot.mjs';
import {prepareRosterPresentationCards,projectFormedUnitCards} from '../books/shared/army-book-app-v2/personal.mjs';
import {countPhysicalCarriers,formatPhysicalCarriers,effectContributionKey} from '../books/shared/army-book-app-v2/effective-datasheet-presentation.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const book=read('books/death-guard/v2/generated/rule-contract-effective.json');
const payload=read('books/death-guard/v2/generated/app-presentation.json');
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
const checks=[],evidence={};
const check=(name,run)=>{run();checks.push(name);};
const text=file=>fs.readFileSync(path.join(root,file),'utf8');
function imported(file){const runtime=createDGRosterRuntime(book),result=runtime.import(text(file));
  assert.equal(result.status,'READY',JSON.stringify(result));return runtime;}
function component(runtime,id){
  const beforeState=runtime.snapshot(),beforeProjection=structuredClone(runtime.projection);
  const projected=projectFormedUnitCards(cards,runtime,id).components.find(component=>component.unit.instanceId===id);
  assert.deepEqual(runtime.snapshot(),beforeState,'Presentation mutated imported state');
  assert.deepEqual(runtime.projection,beforeProjection,'Presentation mutated effective effects');
  const records=[...projected.variants.values()].flat();
  return {unit:projected.unit,profiles:records.filter(record=>record.kind==='PROFILE'),weapons:records.filter(record=>record.kind==='WEAPON_PROFILE')};
}
const labels=(records,view,counter=countPhysicalCarriers)=>formatPhysicalCarriers(counter(records,view.profiles,{unit:view.unit}));
const vector='datasheet-lord-of-contagion:section:1';
const hasVector=record=>record.fields.some(field=>(field.weaponGrantSources||[]).some(source=>source.canonicalRuleId===vector));
const omega=imported('books/death-guard/v2/fixtures/omega-megaroster.txt');
const omegaLord=omega.state.units.filter(unit=>unit.canonicalUnitId==='unit-lord-of-contagion')[1];
const omegaBodyguard=omega.state.units.find(unit=>unit.canonicalUnitId==='unit-blightlord-terminators');
omega.attach(omegaLord.instanceId,omegaBodyguard.instanceId);
const omegaView=component(omega,omegaBodyguard.instanceId);
const bubotic=omegaView.weapons.filter(record=>record.id==='datasheet-blightlord-terminators:weapon:6'&&hasVector(record));
function verifyOmega(counter=countPhysicalCarriers){
  assert.equal(bubotic.reduce((sum,record)=>sum+record.rosterQuantity,0),4);
  assert.deepEqual(labels(bubotic,omegaView,counter),['Blightlord Champion · 1 model','Blightlord Terminator · 3 models']);
}
check('DG Omega: four Bubotic blades on Champion one + Terminators three',()=>verifyOmega());
evidence.omega={leader:omegaLord.instanceId,bodyguard:omegaBodyguard.instanceId,weaponCopies:4,
  carriers:countPhysicalCarriers(bubotic,omegaView.profiles,{unit:omegaView.unit}),labels:labels(bubotic,omegaView)};
check('DG Omega: effect on only one Terminator retains one carrier',()=>{
  const partial=bubotic.filter(record=>record.presentationScope.label==='Blightlord Terminator').slice(0,1);
  assert.deepEqual(labels(partial,omegaView),['Blightlord Terminator · 1 model']);
});
check('Duplicate source traces and repeated weapon selections do not multiply carriers',()=>{
  assert.deepEqual(labels([...bubotic,...bubotic],omegaView),labels(bubotic,omegaView));
});

const deathshroud=imported('v2/fixtures/f2-deathshroud-newrecruit.txt');
assert.deepEqual(deathshroud.state.units.map(unit=>unit.canonicalUnitId),['unit-lord-of-contagion','unit-deathshroud-terminators']);
assert.deepEqual(deathshroud.state.units[0].enhancementIds,['detachment-virulent-vectorium:enhancement:2']);
deathshroud.attach('parsed-unit-1','parsed-unit-2');
const shroudView=component(deathshroud,'parsed-unit-2');
const gauntlets=shroudView.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:1');
const manreaper=shroudView.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:2'&&hasVector(record));
check('Verbatim New Recruit v37.6: real import, real attachment, four gauntlets / three carriers',()=>{
  assert.equal(gauntlets.reduce((sum,record)=>sum+record.rosterQuantity,0),4);
  assert.deepEqual(labels(gauntlets,shroudView),['Deathshroud Terminator Champion · 1 model','Deathshroud Terminator · 2 models']);
  assert.equal(countPhysicalCarriers(gauntlets,shroudView.profiles,{unit:shroudView.unit}).reduce((sum,group)=>sum+group.quantity,0),3);
  assert.ok(gauntlets.every(record=>!hasVector(record)),'Do not invent a gauntlet effect to obtain a caption');
});
check('Verbatim export: actual Vector of Disease Manreaper contributions retain three carriers',()=>{
  assert.deepEqual(labels(manreaper,shroudView),['Deathshroud Terminator Champion · 1 model','Deathshroud Terminator · 2 models']);
  assert.ok(manreaper.every(record=>record.fields.some(field=>(field.weaponGrantSources||[]).some(source=>
    source.canonicalRuleId===vector&&source.clauseId==='source-clause-1'&&source.operation==='GRANT_WEAPON_ABILITY'))));
});
evidence.deathshroud={importStatus:'READY',attachments:deathshroud.state.attachments,
  weaponCopies:4,carrierCount:3,gauntletLabels:labels(gauntlets,shroudView),manreaperLabels:labels(manreaper,shroudView)};
check('Reload retains physical scopes and counts',()=>{
  deathshroud.load(JSON.parse(JSON.stringify(deathshroud.snapshot())));
  const after=component(deathshroud,'parsed-unit-2');
  assert.deepEqual(labels(after.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:1'),after),evidence.deathshroud.gauntletLabels);
});
check('Detach removes actual Vector grant; reattach restores it without changing carriers',()=>{
  deathshroud.detach('parsed-unit-1');const detached=component(deathshroud,'parsed-unit-2');
  assert.ok(detached.weapons.every(record=>!hasVector(record)));
  deathshroud.reattach('parsed-unit-1','parsed-unit-2');const attached=component(deathshroud,'parsed-unit-2');
  assert.deepEqual(labels(attached.weapons.filter(record=>record.id==='datasheet-deathshroud-terminators:weapon:2'&&hasVector(record)),attached),evidence.deathshroud.manreaperLabels);
});

const profile=(instanceId,scopeId,quantity,extra={})=>({id:'profile-shared',kind:'PROFILE',instanceId,scopeId,
  rosterQuantity:quantity,fields:[],presentationScope:{label:'Same named model',quantity},...extra});
check('Same datasheet/name in two physical UNIT instances remains separate',()=>{
  const counted=countPhysicalCarriers([profile('one','scope-one',2),profile('two','scope-two',3)]);
  assert.deepEqual(counted.map(group=>[group.instanceId,group.quantity]),[['one',2],['two',3]]);
});
check('Multiple weapon copies on one model count one physical carrier',()=>{
  assert.equal(labels(gauntlets.slice(0,1),shroudView)[0],'Deathshroud Terminator Champion · 1 model');
  assert.equal(gauntlets[0].rosterQuantity,2);
});
check('Explicit MODEL identity deduplicates a repeated physical address',()=>{
  const p=profile('one','scope-one',1,{modelInstanceId:'physical-model-one'});
  assert.equal(countPhysicalCarriers([p,{...p,scopeId:'scope-alias'}])[0].quantity,1);
});
check('Unknown scoped quantity remains unknown while the recipient stays visible',()=>{
  const counted=countPhysicalCarriers([profile('one','scope-one',undefined)]);
  assert.equal(counted.length,1);assert.equal(counted[0].quantity,null);
  assert.deepEqual(formatPhysicalCarriers(counted),['Same named model · model count unknown']);
});
check('No physical scope means no invented carrier count',()=>{
  assert.equal(countPhysicalCarriers([profile('one',null,2)])[0].quantity,null);
});
check('Ambiguous PROFILE address cannot establish carrier quantity',()=>{
  const counted=countPhysicalCarriers([gauntlets[0]],[...shroudView.profiles,shroudView.profiles[0]],{unit:shroudView.unit});
  assert.equal(counted[0].quantity,null);
});
check('Weapon count and missing distribution proof cannot invent model ownership',()=>{
  const aggregate=structuredClone(shroudView.unit);
  aggregate.modelRows[0].selections.find(selection=>selection.selectionKey===gauntlets[0].selectionKey).perModelQuantity=null;
  const counted=countPhysicalCarriers([gauntlets[0]],shroudView.profiles,{unit:aggregate});
  assert.equal(counted[0].quantity,null);assert.equal(counted.length,1);
});
check('Conflicting quantities on one physical address fail closed',()=>{
  const p=profile('one','scope-one',2);
  assert.equal(countPhysicalCarriers([p,{...p,rosterQuantity:3}])[0].quantity,null);
});
check('Independent clause/effect/operation/physical source contributions cannot merge',()=>{
  const trace={ruleId:'same-rule',clauseId:'clause-one',effectId:'effect-one',operation:'GRANT_WEAPON_ABILITY',
    sourceInstanceId:'source-one',sourceCompositionId:'model-one',targetInstanceId:'recipient-one'};
  for(const field of ['ruleId','clauseId','effectId','operation','sourceInstanceId','sourceCompositionId','sourceModelInstanceId','targetInstanceId']){
    assert.notEqual(effectContributionKey(trace),effectContributionKey({...trace,[field]:'another'}),field);
  }
  assert.equal(effectContributionKey(trace),effectContributionKey({...trace,targetCompositionId:'other-recipient-model'}),
    'One proven effect may count its separate physical carriers together');
});

// Run a mutant of this very production helper, not a separate test algorithm.
// Restoring caption deduplication must fail the fixed real-roster expectation.
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'wh-f2-carrier-qa-'));
const helper=path.join(root,'books/shared/army-book-app-v2/effective-datasheet-presentation.mjs');
const source=fs.readFileSync(helper,'utf8');
const target='else if(!duplicate&&group.quantity!==null)group.quantity+=quantity;';
assert.equal(source.split(target).length,2,'Production mutation target changed');
const mutant=path.join(directory,'caption-dedup-mutant.mjs');
fs.writeFileSync(mutant,source.replace(target,'else if(!duplicate&&group.quantity!==null&&group.quantity===0)group.quantity+=quantity;'));
const {countPhysicalCarriers:brokenCounter}=await import(pathToFileURL(mutant));
assert.throws(()=>verifyOmega(brokenCounter),assert.AssertionError,'Text-caption deduplication survived real Omega expectation');
evidence.mutations=[{id:'production-caption-dedup',result:'REJECTED'}];
fs.writeFileSync(path.join(directory,'RESULTS.json'),JSON.stringify({checks,evidence},null,2));
console.log('F2_CARD_RECIPIENT_QA '+JSON.stringify({status:'PASS',checks:checks.length,mutations:1,evidence:directory,omega:evidence.omega.labels,deathshroud:evidence.deathshroud}));
