/** Native source occurrences and existing numeric executor/presenter controls.
 * Override/suppression rules below are QA-only inputs, not EC gameplay facts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildECContracts} from './rule-contract-build.mjs';
import {buildECRosterAttachmentBook} from './roster-attachment-build.mjs';
import {createECBrowserRoster} from './roster-boot.mjs';
import {validateRoster} from '../../shared/roster-v2/context.mjs';
import {executeRosterEffects,validateRosterEffects} from '../../shared/roster-v2/effects.mjs';
import {collectAbilityReferences,projectAbilityPresentation,abilityPresentationLabel} from '../../shared/army-book-app-v2/ability-presentation.mjs';
import {projectFormedUnitCards,prepareRosterPresentationCards} from '../../shared/army-book-app-v2/personal.mjs';

const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const clone=structuredClone,{book,schema,contracts}=buildECRosterAttachmentBook();
const facts=read('./generated/effective.json'),payload=read('./generated/app-presentation.json');
const cards=prepareRosterPresentationCards(new Map(payload.cards.map(c=>[c.id,c])),payload.rosterPresentation);
const bindings=payload.datasheetPresentation.referenceBindings;
const text=read('./roster-import-fixtures.json').fixtures.find(f=>f.id==='native-fnp-physical-instances').text;
const expected=[['lucius-the-eternal','Lucius-the-Eternal.html','3C814B494C5360FDD58766FDE176EF601B70A13E8308FACD9CE93D8A1A9394CB'],
  ['chaos-spawn','Chaos-Spawn.html','83625E9D8CB7F3E643F3AEC0B44822500894C72170CAC124E5384D2C30E42CE0']];
const expectedId='datasheet-lucius-the-eternal:rule-reference:1';
let mutations=0;
for(const [slug,file,sha] of expected){
  const bytes=fs.readFileSync(new URL('../sources/waha-11e-current-2026-09-28/'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(),sha);
  assert.ok(/Feel No Pain\s*5\+/.test(bytes.toString('utf8').replace(/<[^>]*>/g,'').replaceAll('&nbsp;',' ')),file+' lost native source FNP');
  const ref=facts.entities.find(e=>e.id===`datasheet-${slug}:rule-reference:1`);
  assert.equal(ref.parentId,'unit-'+slug);assert.equal(ref.data.label,'Feel No Pain 5+');
  assert.deepEqual(book.rosterReferenceSemantics[ref.id],{abilities:[{name:'Feel No Pain',value:5}],
    sourceFields:[['label']],sourceId:ref.provenance.sourceId});
}
assert.deepEqual(Object.keys(book.rosterReferenceSemantics).sort(),expected.map(([slug])=>`datasheet-${slug}:rule-reference:1`).sort());
assert.deepEqual(read('./generated/roster-attachments.json').rosterReferenceSemantics,book.rosterReferenceSemantics);
assert.equal(contracts.length,26);
const service=createECBrowserRoster(book),imported=service.import(text);
assert.equal(imported.status,'READY');const raw=service.snapshot();
function input(id){
  const formed=projectFormedUnitCards(cards,service,id),component=formed.components.find(c=>c.unit.instanceId===id);
  const children=component.card.children.flatMap(id=>component.variants.get(id)||[cards.get(id)]);
  return {instanceId:id,profiles:children.filter(c=>c.kind==='PROFILE').map(c=>({id:c.id,scopeId:c.scopeId,
    quantity:c.rosterQuantity,abilities:c.effectiveAbilities||c.rosterAbilities||[],suppressedAbilityIds:c.suppressedAbilityIds||[]})),
    unitAbilities:component.card.rosterUnitAbilities||[],references:collectAbilityReferences(children.filter(c=>c.kind==='RULE_REFERENCE'),bindings),
    applied:service.effective(id).applied||[]};
}
const fnp=input=>{const p=projectAbilityPresentation(input);return [...p.core,...p.profiles.flatMap(p=>p.abilities)].filter(a=>a.canonicalId==='core-feel-no-pain');};
function verifyNative(){
  for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3']){
    const x=input(id),rows=fnp(x);assert.equal(rows.length,1);assert.equal(rows[0].subject,'MODEL');
    assert.equal(abilityPresentationLabel(rows[0]),'Feel No Pain 5+');
    assert.equal(rows[0].recipientScopes.length,x.profiles.filter(p=>p.quantity>0).length);
    assert.ok(x.profiles.every(p=>p.abilities.filter(a=>a.name==='Feel No Pain').length===1));
    assert.ok(x.references.some(r=>r.canonicalId==='core-feel-no-pain'&&r.legacyValue));
  }
  for(const id of ['parsed-unit-4','parsed-unit-5'])assert.deepEqual(fnp(input(id)),[]);
}
verifyNative();service.attach('parsed-unit-1','parsed-unit-4');verifyNative();
service.detach('parsed-unit-1');verifyNative();service.attach('parsed-unit-1','parsed-unit-4');verifyNative();
service.load(service.snapshot());verifyNative();assert.deepEqual(service.snapshot().units,raw.units);

// Exercise actual typed executor operations on a disposable source-unit rule.
// This cannot be a UI action: EC has no production FNP override rule/control.
const original=JSON.stringify(book),state=service.snapshot();
function modified(operation,value=4,unitId='unit-chaos-spawn'){
  const b=clone(book),sourceId='qa-only:numeric-fnp',ruleId='qa-only:fnp-control',quote='Synthetic executor control';
  const selector={predicate:'UNIT_ID',subject:'UNIT',contextLevel:'STATIC',arguments:{id:unitId},evidence:{field:['text'],quote}};
  const effect={id:ruleId+'/effect',operation,targetSubject:'MODEL',targetBinding:'SOURCE_UNIT_MODELS',
    ability:operation==='REMOVE_ABILITY'?{canonicalId:'core-feel-no-pain'}:{name:'Feel No Pain',value},
    conditions:[],evidence:{field:['text'],quote},sourceFields:[['text']],lifetime:'ROSTER'};
  b.rosterAbilityReferences['core-feel-no-pain']={id:'core-feel-no-pain',title:'Feel No Pain',parameters:{value:{type:'number'}}};
  b.entities.push({id:ruleId,parentId:'detachment-court-of-the-phoenician',kind:'ENHANCEMENT',provenance:{sourceId},data:{text:quote},
    ruleContract:{schema:'rule-contract/v2',ruleId,ownerId:'detachment-court-of-the-phoenician',sourceId,kind:'ENHANCEMENT',
      detachmentId:'detachment-court-of-the-phoenician',
      executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',
      roles:[{id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]}],
      assignment:{ownerRoleId:'owner',selector:clone(selector)},conditions:[],sourceFields:[['text']],
      clauses:[{id:'qa-only',roles:[],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]}});
  schema.validateContracts(b);validateRosterEffects(b,schema.validatePredicate,schema.evaluatePredicate);
  return b;
}
function execute(b,instanceId='parsed-unit-2'){
  const snapshot=clone(state);
  if(b.entities.some(e=>e.id==='qa-only:fnp-control'))snapshot.units.find(u=>u.instanceId===instanceId).enhancementIds.push('qa-only:fnp-control');
  return executeRosterEffects(b,validateRoster(b,snapshot,b.rosterAttachmentPolicies),schema);
}
function projected(result,id){
  const x=input(id),unit=result.units.find(u=>u.instanceId===id);
  x.profiles=x.profiles.map(p=>{const actual=unit.profiles.find(m=>m.canonicalProfileId===p.id&&m.scopeId===p.scopeId);
    assert.ok(actual);return {...p,abilities:actual.abilities,suppressedAbilityIds:actual.suppressedAbilityIds||[]};});
  x.applied=unit.applied;return fnp(x);
}
const baseline=execute(book),strong=execute(modified('GRANT_MODEL_ABILITY',4)),weak=execute(modified('GRANT_MODEL_ABILITY',5));
for(const id of ['parsed-unit-2','parsed-unit-3']){
  for(const [result,value]of [[strong,4],[weak,5],[execute(book),5]]){
    const expectedValue=id==='parsed-unit-2'?value:5,rows=projected(result,id);
    assert.equal(rows.length,1);assert.equal(rows[0].parameters.value,expectedValue);
    assert.equal(abilityPresentationLabel(rows[0]),`Feel No Pain ${expectedValue}+`);
  }
}
assert.equal(projected(strong,'parsed-unit-1')[0].parameters.value,5);
assert.deepEqual(projected(strong,'parsed-unit-4'),[]);
// Assignment belongs to one physical instance; the duplicate remains native.
const alpha=strong.units.find(u=>u.instanceId==='parsed-unit-2'),beta=strong.units.find(u=>u.instanceId==='parsed-unit-3');
assert.notEqual(alpha.profiles[0].scopeId,beta.profiles[0].scopeId);
assert.equal(beta.profiles[0].abilities.find(a=>a.name==='Feel No Pain').value,5);
const suppressed=execute(modified('REMOVE_ABILITY'));
assert.deepEqual(projected(suppressed,'parsed-unit-2'),[]);
assert.equal(projected(suppressed,'parsed-unit-3')[0].parameters.value,5);
assert.equal(projected(suppressed,'parsed-unit-1')[0].parameters.value,5);
assert.deepEqual(execute(book),baseline,'Recompute/removal must restore native bags without accumulation');
for(const value of [4,5]){
  const result=execute(modified('GRANT_MODEL_ABILITY',value,'unit-lucius-the-eternal'),'parsed-unit-1');
  const rows=projected(result,'parsed-unit-1');assert.equal(rows.length,1);assert.equal(rows[0].parameters.value,value);
  assert.deepEqual(projected(result,'parsed-unit-4'),[],'Override must not leak to attached Bodyguard');
  assert.equal(projected(result,'parsed-unit-2')[0].parameters.value,5);
}
const suppressedLucius=execute(modified('REMOVE_ABILITY',4,'unit-lucius-the-eternal'),'parsed-unit-1');
assert.deepEqual(projected(suppressedLucius,'parsed-unit-1'),[]);assert.deepEqual(projected(suppressedLucius,'parsed-unit-4'),[]);
assert.equal(projected(execute(book),'parsed-unit-1')[0].parameters.value,5);
for(const result of [strong,weak,suppressed])for(const unit of result.units){
  const native=baseline.units.find(u=>u.instanceId===unit.instanceId);
  assert.deepEqual(unit.profiles.map(p=>p.profile),native.profiles.map(p=>p.profile),'SV/INSV and other characteristics changed');
}
assert.equal(JSON.stringify(book),original);assert.deepEqual(service.snapshot(),state);
for(const mutate of [f=>f.entities.splice(f.entities.findIndex(e=>e.id===expectedId),1),
  f=>f.entities.find(e=>e.id===expectedId).parentId='unit-fulgrim',
  f=>f.entities.find(e=>e.id===expectedId).data.label='Feel No Pain 4+',
  f=>delete f.entities.find(e=>e.id===expectedId).provenance.sourceId,
  f=>f.entities.push(clone(f.entities.find(e=>e.id===expectedId)))]){
  const bad=clone(facts);mutate(bad);assert.throws(()=>buildECContracts({facts:bad}));mutations++;
}
function checkNative(candidate){for(const id of ['parsed-unit-1','parsed-unit-2','parsed-unit-3']){
  const u=candidate.units.find(u=>u.instanceId===id);assert.ok(u.profiles.every(p=>
    p.abilities.filter(a=>a.name==='Feel No Pain').length===1&&p.abilities.find(a=>a.name==='Feel No Pain').value===5));
}assert.ok(candidate.units.find(u=>u.instanceId==='parsed-unit-4').profiles.every(p=>!p.abilities.some(a=>a.name==='Feel No Pain')));}
checkNative(baseline);
for(const mutate of [p=>p.units[0].profiles[0].abilities=[],p=>p.units[0].profiles[0].abilities[0].value=4,
  p=>p.units[0].profiles[0].abilities.push({name:'Feel No Pain',value:5}),
  p=>p.units.find(u=>u.instanceId==='parsed-unit-4').profiles[0].abilities.push({name:'Feel No Pain',value:5})]){
  const bad=clone(baseline);mutate(bad);assert.throws(()=>checkNative(bad));mutations++;
}
for(const mutate of [effect=>effect.ability.value=7,effect=>effect.targetSubject='UNIT']){
  const bad=modified('GRANT_MODEL_ABILITY');mutate(bad.entities.at(-1).ruleContract.clauses[0].rosterEffects[0]);
  assert.throws(()=>validateRosterEffects(bad,schema.validatePredicate,schema.evaluatePredicate));mutations++;
}
const foreign=modified('GRANT_MODEL_ABILITY',4,'unit-lucius-the-eternal');
foreign.entities.at(-1).ruleContract.clauses[0].rosterEffects[0].targetBinding='SOURCE_FORMED_MODELS';
assert.throws(()=>assert.deepEqual(projected(execute(foreign,'parsed-unit-1'),'parsed-unit-4'),[]),'Comparator missed MODEL-to-Bodyguard leak');mutations++;
console.log(JSON.stringify({status:'PASS',nativeOccurrences:2,contracts:26,modelScope:true,numericOverrides:[4,5],
  suppression:true,recompute:true,saveUnchanged:true,mutations,browserOverride:'NOT_CLAIMED_NO_PRODUCTION_CONTROL'}));
