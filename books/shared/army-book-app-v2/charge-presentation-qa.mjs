/** Independent UNIT presentation expectations over the unchanged typed executor. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {validateRoster,withRosterDetachments,changeAttachment} from '../roster-v2/context.mjs';
import {validateRosterEffects,executeRosterEffects} from '../roster-v2/effects.mjs';
import {projectEffectiveInstance} from '../roster-v2/effective-instance.mjs';
import {projectInstanceCards,projectFormedUnitCards,prepareRosterPresentationCards} from './personal.mjs';
import {createSyntheticPersonalFixture} from './personal-datasheet-qa.mjs';
import {createECBrowserRoster} from '../../emperors-children/v2/roster-boot.mjs';

const clone=structuredClone,read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8'));
const api=withRosterDetachments(createRuleContractSchema({stateFields:{equipmentRequirementSatisfied:{contextLevel:'ROSTER',valueType:'boolean'}}}));
function fixture(){
  const f=createSyntheticPersonalFixture('unit-charge'),{id}=f,book=clone(f.model);
  for(const unit of book.entities.filter(e=>e.kind==='DATASHEET'))Object.assign(unit.data,{title:unit.data.name,
    keywords:['INFANTRY'],factionKeywords:['SYNTHETIC'],weaponIds:[],sectionIds:[],ruleReferenceIds:[],wargearOptionIds:[]});
  book.entities.push({id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic'}});
  const rule=book.entities.find(e=>e.id===id('equipment-rule')),evidence={field:['text'],quote:rule.data.text};
  rule.provenance={sourceId:id('accepted-source'),document:'synthetic-source',sha256:'synthetic-integrity'};
  const atom=(predicate,subject,args,level='STATIC')=>({predicate,subject,arguments:args,contextLevel:level,evidence:clone(evidence)});
  const owner={id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector:atom('UNIT_ID','UNIT',{id:id('unit')}),conditions:[]};
  const effect={id:id('effect'),operation:'MODIFY_RULE_METRIC',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',
    field:'chargeRoll',mode:'ADD',value:1,conditions:[{binding:'SOURCE',predicate:atom('FIELD','UNIT',{key:'equipmentRequirementSatisfied',equals:true},'ROSTER')}],
    equipmentRequirement:{kind:'EQUIPMENT_PRESENT',equipmentId:id('equipment'),sourceFieldPath:['text']},evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_EQUIPMENT_SELECTED'};
  rule.ruleContract={schema:'rule-contract/v2',ruleId:rule.id,ownerId:id('unit'),sourceId:id('accepted-source'),kind:'DATASHEET_ABILITY',
    executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[['text']],
    clauses:[{id:'charge',roles:[clone(owner)],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
  const leader={instanceId:id('leader'),canonicalUnitId:id('other-unit'),startingStrength:1,enhancementIds:[],warlord:false,
    equipmentContextKnown:true,selections:[],modelRows:[{rowId:'leader',canonicalProfileId:id('other-profile'),quantity:1,selections:[],loadouts:[]}]};
  const units=[clone(f.unit),clone(f.duplicate.unit),leader];
  for(const unit of units){unit.warlord=false;unit.equipmentContextKnown=true;}
  units[0].selections[0].canonicalFieldPaths={[id('equipment')]:['/text']};
  delete units[0].selections[0].sourceReferences;
  units[1].selections=[];
  book.rosterAttachmentPolicies=[{sourceId:id('other-unit'),targetId:id('unit'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}];
  const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),
    detachments:[{instanceId:'main',canonicalDetachmentId:id('detachment')}],units,attachments:[],warlordInstanceId:null};
  return {...f,book,state,effect};
}
function evaluate(f,state=f.state){
  api.validateContracts(f.book);validateRosterEffects(f.book,api.validatePredicate,api.evaluatePredicate);
  const validated=validateRoster(f.book,state,f.book.rosterAttachmentPolicies),projection=executeRosterEffects(f.book,validated,api);
  const service={state:validated,effective:id=>projectEffectiveInstance(f.book,projection,id)};
  const view=projectFormedUnitCards(f.cards,service,validated.units[0].instanceId);
  return {validated,projection,service,view,metrics:view.components.flatMap(component=>component.card.rosterUnitMetrics||[])};
}
let checks=0,mutations=0;const check=fn=>{fn();checks++;};
function expected(result,{value=1,count=1,scope='FORMED',recipients=[result.validated.units[0].instanceId]}={}){
  assert.equal(result.metrics.length,count,'Exactly one computed UNIT result, independent of MODEL count');
  if(count){assert.equal(result.metrics[0].value.modifier,value);assert.equal(result.metrics[0].displayValue,`+${value}`);
    assert.equal(result.metrics[0].label,'Charge-roll modifier');assert.equal(result.metrics[0].unitScope,scope);
    assert.deepEqual(result.metrics[0].recipientInstanceIds,recipients);
    assert.ok(result.metrics[0].sources.every(source=>source.operation==='MODIFY_RULE_METRIC'&&source.field==='chargeRoll'&&source.provenance.sourceId));}
  for(const component of result.view.components)for(const variants of component.variants.values())for(const card of variants)
    if(card.kind==='PROFILE'){assert.equal(card.rosterMetrics.chargeRoll,undefined);assert.ok(!card.fields.some(field=>field.source?.path==='/rosterMetrics/chargeRoll'));}
}
check(()=>{
  const f=fixture(),before=clone({book:f.book,state:f.state}),result=evaluate(f);expected(result);
  assert.deepEqual({book:f.book,state:f.state},before);
  assert.deepEqual(evaluate(f).view,result.view,'Recompute does not duplicate a UNIT annotation');
  const independent=projectFormedUnitCards(f.cards,result.service,f.state.units[1].instanceId);assert.equal(independent.components[0].card.rosterUnitMetrics.length,0);
  const off=clone(f.state);off.units[0].selections=[];expected(evaluate(f,off),{count:0});
  off.units[0].selections=clone(f.state.units[0].selections);assert.deepEqual(evaluate(f,off).view,result.view);
  assert.deepEqual(evaluate(f,JSON.parse(JSON.stringify(f.state))).view,result.view,'Saved/reloaded state preserves the same computed presentation');
  for(const unit of result.projection.units)for(const model of unit.profiles){
    assert.deepEqual(model.profile,f.book.entities.find(e=>e.id===model.canonicalProfileId).data,'Movement and every MODEL characteristic unchanged');
    assert.deepEqual(model.weapons,[],'No weapon profile mutation or invention');}
});
check(()=>{
  const f=fixture(),body=f.state.units[0].instanceId,leader=f.state.units[2].instanceId;
  let state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH',leader,body),result=evaluate(f,state);
  expected(result,{recipients:result.projection.formedUnits[0].memberInstanceIds});
  assert.equal(result.view.components[1].card.rosterUnitMetrics.length,0,'Shared FORMED UNIT value is not repeated on its Character');
  assert.equal(result.service.effective(leader).unitMetrics.chargeRoll.modifier,1,'Character physical view keeps the authoritative computed value');
  const fromLeader=projectFormedUnitCards(f.cards,result.service,leader);assert.deepEqual(fromLeader,result.view);
  const off=clone(state);off.units[0].selections=[];expected(evaluate(f,off),{count:0});
  state=changeAttachment(f.book,state,f.book.rosterAttachmentPolicies,'DETACH',leader);expected(evaluate(f,state));
  state=changeAttachment(f.book,state,f.book.rosterAttachmentPolicies,'REATTACH',leader,body);expected(evaluate(f,state),{recipients:result.projection.formedUnits[0].memberInstanceIds});
});
check(()=>{
  const f=fixture(),body=f.state.units[0].instanceId,leader=f.state.units[2].instanceId;f.effect.unitScope='PHYSICAL';
  const state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH',leader,body),result=evaluate(f,state);
  expected(result,{scope:'PHYSICAL'});assert.equal(result.service.effective(leader).unitMetrics,undefined);
  assert.equal(result.view.components[1].card.rosterUnitMetrics.length,0,'Physical effect never leaks into an attached component');
  // A second independent physical source can have the same final number; it
  // must remain a second annotation, never be merged merely by its value.
  const changed=clone(result.service.effective(leader)),source=clone(result.metrics[0].sources[0]);
  changed.unitMetrics={chargeRoll:{modifier:1}};source.targetInstanceId=leader;source.sourceInstanceId=leader;changed.unitMetricSources=[source];
  const isolated={state:result.validated,effective:id=>id===leader?changed:result.service.effective(id)};
  const view=projectFormedUnitCards(f.cards,isolated,body);assert.equal(view.components.flatMap(c=>c.card.rosterUnitMetrics).length,2);
});
check(()=>{
  const f=fixture(),result=evaluate(f),effective=result.service.effective(f.state.units[0].instanceId);
  const bad=clone(effective);bad.unitMetricSources=[];assert.throws(()=>projectInstanceCards(f.cards,f.state.units[0],bad),/sources/);
  const missing=clone(result.projection);missing.units[0].applied=[];assert.throws(()=>projectEffectiveInstance(f.book,missing,f.state.units[0].instanceId),/provenance/);
  const foreign=clone(result.projection);foreign.units[0].applied[0].effectId='foreign-effect';assert.throws(()=>projectEffectiveInstance(f.book,foreign,f.state.units[0].instanceId),/provenance/);
});
check(()=>{
  const f=fixture(),body=f.state.units[0].instanceId,leader=f.state.units[2].instanceId;
  const physical={...clone(f.effect),id:f.id('physical-effect'),unitScope:'PHYSICAL'};
  f.book.entities.find(e=>e.id===f.id('equipment-rule')).ruleContract.clauses[0].rosterEffects.push(physical);
  const state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH',leader,body),result=evaluate(f,state);
  assert.deepEqual(result.metrics.map(metric=>[metric.value.modifier,metric.unitScope,metric.recipientInstanceIds]),
    [[2,'PHYSICAL',[body]],[1,'PHYSICAL',[leader]]],'Mixed scopes show final physical totals without summing or repeating a formed bonus');
  assert.deepEqual(result.metrics[0].sources.map(source=>source.unitScope),['FORMED','PHYSICAL']);
  assert.deepEqual(result.metrics[1].sources.map(source=>source.unitScope),['FORMED']);
});
for(const alter of [f=>f.effect.value=2,f=>f.effect.conditions=[],f=>f.effect.targetBinding='ROSTER_UNITS']){
  const f=fixture();expected(evaluate(f));alter(f);
  if(!f.effect.conditions.length)f.state.units[0].selections=[];
  assert.throws(()=>{const result=evaluate(f);expected(result,{count:f.state.units[0].selections.length?1:0});
    assert.equal(result.service.effective(f.state.units[1].instanceId).unitMetrics,undefined);});mutations++;
}
check(()=>{
  const book=read('../../emperors-children/v2/generated/roster-attachments.json'),before=JSON.stringify(book),runtime=createECBrowserRoster(book);
  const payload=read('../../emperors-children/v2/generated/app-presentation.json');
  const cards=prepareRosterPresentationCards(new Map(payload.cards.map(card=>[card.id,card])),payload.rosterPresentation);
  const fixture=read('../../emperors-children/v2/roster-import-fixtures.json').fixtures.find(f=>f.id==='legions-physical-equipment');
  assert.equal(runtime.import(fixture.text).status,'READY');const state=runtime.snapshot();
  for(const id of ['unit-daemonettes','unit-seekers']){
    const unit=runtime.state.units.find(u=>u.canonicalUnitId===id),effective=runtime.effective(unit.instanceId);
    const card=projectInstanceCards(cards,unit,effective).get(id)[0];
    assert.equal(card.rosterUnitMetrics.length,1);assert.equal(card.rosterUnitMetrics[0].displayValue,'+1');
    assert.ok(effective.profiles.every(model=>!Object.hasOwn(model.metrics,'chargeRoll')));
    const off=clone(state),target=off.units.find(u=>u.instanceId===unit.instanceId),equipmentId='datasheet-'+id.slice(5)+':wargear:1';
    const remove=selections=>selections.filter(selection=>!selection.canonicalEquipmentIds?.includes(equipmentId));
    target.selections=remove(target.selections);for(const row of target.modelRows){row.selections=remove(row.selections);for(const loadout of row.loadouts)loadout.selections=remove(loadout.selections);}
    runtime.load(off);assert.equal(runtime.effective(unit.instanceId).unitMetrics,undefined);runtime.load(state);
    assert.deepEqual(projectInstanceCards(cards,unit,runtime.effective(unit.instanceId)).get(id)[0].rosterUnitMetrics,card.rosterUnitMetrics);
  }
  assert.equal(JSON.stringify(book),before,'Existing EC facts and contracts are unchanged');
});
console.log(JSON.stringify({status:'PASS',checks,mutations,unitMetricPresentation:true,physicalFormedScopes:true,existingECControls:2,sharedExecutorChanged:false,browserRun:false}));
