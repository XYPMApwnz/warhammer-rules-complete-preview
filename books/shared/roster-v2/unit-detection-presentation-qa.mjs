/** Explicit UNIT Detection projection over the existing typed operation.
 * Independent synthetic expectations; no Army Book facts or battle simulation. */
import assert from 'node:assert/strict';
import {createRuleContractSchema} from '../rule-contract-v2/schema.mjs';
import {validateRoster,withRosterDetachments,changeAttachment} from './context.mjs';
import {executeRosterEffects} from './effects.mjs';
import {projectEffectiveInstance as projectCanonicalEffectiveInstance} from './effective-instance.mjs';
import {projectInstanceCards,projectFormedUnitCards} from '../army-book-app-v2/personal.mjs';
import {createSyntheticPersonalFixture} from '../army-book-app-v2/personal-datasheet-qa.mjs';
import {compileRecipientFixture} from './recipient-fixture.mjs';
const clone=structuredClone,api=withRosterDetachments(createRuleContractSchema());
const projectEffectiveInstance=(book,...args)=>projectCanonicalEffectiveInstance(compileRecipientFixture(book,api),...args);
function fixture(){
 const f=createSyntheticPersonalFixture('scoped-detection'),{id}=f,book=clone(f.model);
 for(const unit of book.entities.filter(e=>e.kind==='DATASHEET'))Object.assign(unit.data,{title:unit.data.name,
  keywords:['INFANTRY'],factionKeywords:['SYNTHETIC'],weaponIds:[],sectionIds:[],ruleReferenceIds:[],wargearOptionIds:[]});
 book.entities.push({id:id('detachment'),kind:'DETACHMENT',data:{title:'Synthetic'}});
 const rule=book.entities.find(e=>e.id===id('equipment-rule'));
 rule.data.text='This unit has -3" detection range.';
 rule.provenance={sourceId:id('accepted-source'),document:'synthetic-source'};
 const evidence={field:['text'],quote:rule.data.text};
 const selector={predicate:'UNIT_ID',subject:'UNIT',arguments:{id:id('unit')},contextLevel:'STATIC',evidence:clone(evidence)};
 const owner={id:'owner',subject:'UNIT',purpose:'OWNER',allegiance:'FRIENDLY',selector,conditions:[]};
 const effect={id:id('effect'),operation:'MODIFY_RULE_METRIC',targetSubject:'UNIT',targetBinding:'SOURCE_UNIT',unitScope:'FORMED',
  field:'detectionRange',mode:'ADD',value:-3,conditions:[],evidence:clone(evidence),sourceFields:[['text']],lifetime:'WHILE_SOURCE_PRESENT'};
 rule.ruleContract={schema:'rule-contract/v2',ruleId:rule.id,ownerId:id('unit'),sourceId:id('accepted-source'),kind:'DATASHEET_ABILITY',
  executionMode:'DECLARATIVE_APPLICABILITY',contextLevel:'ROSTER',roles:[owner],conditions:[],sourceFields:[['text']],
  clauses:[{id:'detection',roles:[clone(owner)],conditions:[],sourceFields:[['text']],rosterClassification:'ROSTER_EXECUTABLE',rosterEffects:[effect]}]};
 const leader={instanceId:id('leader'),canonicalUnitId:id('other-unit'),startingStrength:1,enhancementIds:[],warlord:false,
  equipmentContextKnown:true,selections:[],modelRows:[{rowId:'leader',canonicalProfileId:id('other-profile'),quantity:1,selections:[],loadouts:[]}]};
 const units=[clone(f.unit),clone(f.duplicate.unit),leader];
 for(const unit of units){unit.warlord=false;unit.equipmentContextKnown=true;}
 units[0].selections[0].canonicalFieldPaths={[id('equipment')]:['/text']};delete units[0].selections[0].sourceReferences;
 units[1].selections=[];
 book.rosterAttachmentPolicies=[{sourceId:id('other-unit'),targetId:id('unit'),role:'LEADER',additionalLeaders:0,sourceIds:[id('relation')]}];
 const state={schema:'roster-v2/roster',bookId:book.bookId,rosterId:id('roster'),detachments:[{instanceId:'main',canonicalDetachmentId:id('detachment')}],
  units,attachments:[],warlordInstanceId:null};
 return {...f,book,state,effect,rule};
}
function run(f,state=f.state){
 const canonical=compileRecipientFixture(f.book,api);
 const validated=validateRoster(canonical,state,canonical.rosterAttachmentPolicies),projection=executeRosterEffects(canonical,validated,api);
 const service={state:validated,effective:id=>projectCanonicalEffectiveInstance(canonical,projection,id)};
 const view=projectFormedUnitCards(f.cards,service,validated.units[0].instanceId);
 return {validated,projection,service,view,rows:view.components.flatMap(component=>component.card.rosterUnitMetrics||[])};
}
function expected(result,{modifier=-3,count=1,sources=1,scope='FORMED'}={}){
 assert.equal(result.rows.length,count);
 if(count){const row=result.rows[0];assert.equal(row.key,'detectionRange');assert.equal(row.value.modifier,modifier);
  assert.equal(row.label,'Detection Range modifier');assert.equal(row.displayValue,`${modifier>=0?'+':''}${modifier}"`);
  assert.equal(row.sources.length,sources);assert.equal(row.unitScope,scope);
  assert.ok(row.sources.every(source=>source.provenance.sourceId&&source.ruleId&&source.effectId&&source.sourceInstanceId));}
}
let checks=0,mutations=0;const check=fn=>{fn();checks++;};
check(()=>{
 const f=fixture(),before=clone(f.book),result=run(f);expected(result);
 assert.equal(result.service.effective(f.state.units[1].instanceId).unitMetrics.detectionRange.modifier,-3,'Native ability belongs to both repeated source units');
 for(const unit of result.projection.units)for(const model of unit.profiles)assert.equal(model.metrics.detectionRange,undefined,'Explicit UNIT modifier became MODEL metric');
 assert.deepEqual(f.book,before);assert.deepEqual(run(f).view,result.view);assert.deepEqual(run(f,JSON.parse(JSON.stringify(f.state))).view,result.view);
 const card=projectInstanceCards(f.cards,result.validated.units[0],result.service.effective(f.state.units[0].instanceId)).get(f.id('unit'))[0];
 assert.deepEqual(card.rosterUnitMetrics,result.rows,'Effective and formed/Guide production projection disagree');
});
check(()=>{
 const f=fixture(),body=f.state.units[0].instanceId,leader=f.state.units[2].instanceId;
 let state=changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH',leader,body),result=run(f,state);expected(result);
 assert.deepEqual(result.rows[0].recipientInstanceIds,result.projection.formedUnits[0].memberInstanceIds);
 assert.equal(result.view.components[1].card.rosterUnitMetrics.length,0,'Formation result repeated on Character');
 assert.equal(result.service.effective(leader).unitMetrics.detectionRange.modifier,-3);
 state=changeAttachment(f.book,state,f.book.rosterAttachmentPolicies,'DETACH',leader);result=run(f,state);expected(result);
 assert.equal(result.service.effective(leader).unitMetrics,undefined);
 state=changeAttachment(f.book,state,f.book.rosterAttachmentPolicies,'REATTACH',leader,body);expected(run(f,state));
});
check(()=>{
 const f=fixture();f.effect.unitScope='PHYSICAL';const body=f.state.units[0].instanceId,leader=f.state.units[2].instanceId;
 const result=run(f,changeAttachment(f.book,f.state,f.book.rosterAttachmentPolicies,'ATTACH',leader,body));expected(result,{scope:'PHYSICAL'});
 assert.equal(result.service.effective(leader).unitMetrics,undefined);assert.deepEqual(result.rows[0].recipientInstanceIds,[body]);
});
check(()=>{
 const f=fixture(),legacy=clone(f.effect);legacy.id=f.id('legacy-effect');delete legacy.unitScope;
 f.rule.ruleContract.clauses[0].rosterEffects.push(legacy);
 const result=run(f);expected(result,{modifier:-6,sources:2});
 assert.ok(result.projection.units[0].profiles.every(model=>!model.metrics.detectionRange),'Mixed UNIT sources repeated as MODEL metrics');
 const intrinsic=clone(f.effect);intrinsic.id=f.id('model-effect');delete intrinsic.unitScope;intrinsic.targetSubject='MODEL';intrinsic.targetBinding='SOURCE_MODEL';intrinsic.value=-1;
 f.rule.ruleContract.clauses[0].rosterEffects.push(intrinsic);
 const mixed=run(f);expected(mixed,{modifier:-6,sources:2});
 assert.ok(mixed.projection.units[0].profiles.every(model=>model.metrics.detectionRange.modifier===-1),'True MODEL-specific metric lost or double counted');
 const lost=clone(mixed.projection);lost.units[0].applied=lost.units[0].applied.filter(row=>row.effectId!==f.effect.id);
 assert.throws(()=>projectEffectiveInstance(f.book,lost,f.state.units[0].instanceId),/provenance/,'Lost explicit source silently downgraded mixed result');
});
check(()=>{
 const f=fixture(),second=clone(f.rule);second.id=f.id('second-rule');second.data.title='Independent source';
 second.ruleContract.ruleId=second.id;second.ruleContract.clauses[0].rosterEffects[0].id=f.id('second-effect');
 f.book.entities.push(second);const result=run(f);expected(result,{modifier:-6,sources:2});
 assert.deepEqual(new Set(result.rows[0].sources.map(source=>source.ruleId)),new Set([f.rule.id,second.id]));
 f.book.entities.pop();expected(run(f));
});
check(()=>{
 const f=fixture(),legacy=clone(f.effect);legacy.id=f.id('a-legacy-effect');delete legacy.unitScope;
 f.effect.value=0;f.rule.ruleContract.clauses[0].rosterEffects.push(legacy);
 const result=run(f);expected(result,{modifier:-3,sources:2});
 assert.ok(result.projection.units[0].profiles.every(model=>!model.metrics.detectionRange));
});
check(()=>{
 const f=fixture();delete f.effect.unitScope;const result=run(f);expected(result,{count:0});
 assert.ok(result.projection.units[0].profiles.every(model=>model.metrics.detectionRange.modifier===-3),'Legacy MODEL mirror changed');
 const effective=result.service.effective(f.state.units[0].instanceId);assert.equal(effective.unitMetrics.detectionRange.modifier,-3);
 assert.ok(result.view.components[0].card.rosterUnitMetrics.length===0,'Legacy gained duplicate UNIT display');
});
check(()=>{
 const f=fixture(),result=run(f),id=f.state.units[0].instanceId;
 const missing=clone(result.projection);missing.units[0].applied=[];
 assert.throws(()=>projectEffectiveInstance(f.book,missing,id),/provenance/);
 const foreign=clone(result.projection);foreign.units[0].applied[0].effectId='foreign';
 assert.throws(()=>projectEffectiveInstance(f.book,foreign,id),/provenance/);
 const wrong=clone(result.projection);wrong.units[0].applied[0].targetInstanceId=f.state.units[1].instanceId;
 assert.throws(()=>projectEffectiveInstance(f.book,wrong,id),/provenance/);
 const badEffective=clone(result.service.effective(id));badEffective.unitMetricSources=[];
 assert.throws(()=>projectInstanceCards(f.cards,result.validated.units[0],badEffective),/sources/);
});
for(const alter of [f=>f.effect.value=-2,f=>f.effect.unitScope=undefined,f=>f.effect.targetBinding='ROSTER_UNITS']){
 const f=fixture();expected(run(f));alter(f);
 assert.throws(()=>{const result=run(f);expected(result);if(f.effect.targetBinding==='ROSTER_UNITS')assert.equal(result.service.effective(f.state.units[2].instanceId).unitMetrics,undefined);});mutations++;
}
for(const patch of [{unitScope:'ROSTER'},{unitScope:'FORMED',targetSubject:'MODEL',targetBinding:'SOURCE_MODEL'},{value:1.5},{weaponMode:'melee'},{max:12}]){
 const f=fixture();Object.assign(f.effect,patch);assert.throws(()=>run(f),/Detection|metric|operation/);mutations++;
}
console.log(JSON.stringify({status:'PASS',checks,mutations,explicitUnitDetection:true,mixedLegacySources:true,trueModelMetricsPreserved:true,
 effectiveAndGuideProductionProjection:true,rendererChanged:false,browserRun:false}));
